import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { classifyFailure } from "../lib/classifier";

const PIPELINE_STAGES = [
  {
    id: "ingestion",
    name: "Ingestion & Clustering",
    detail:
      "Parses the nightly failure report (JSON/XLSX) and groups failures into clusters by matching error signature. One representative failure is classified per cluster; the verdict is applied to every member.",
  },
  {
    id: "parallel_fan_out",
    name: "Parallel Fan-Out",
    detail:
      "For each cluster, Evidence gathering and Triage classification run concurrently in a LangGraph graph.",
  },
  {
    id: "evidence",
    name: "Evidence Gathering",
    detail:
      "Collects context for the representative failure (BrowserStack video/DOM/network log summary via BrowserStack MCP, simulated until credentials are supplied).",
  },
  {
    id: "triage",
    name: "3-Tier Triage",
    detail:
      "Tier 1 regex rules (instant, free) -> Tier 2 exact-match cache (SQLite, free) -> Tier 3 semantic cache / bounded-Reflexion LLM call for the remaining ambiguous cases.",
  },
  {
    id: "routing",
    name: "Supervisor Routing",
    detail:
      "Routes each classified cluster to exactly one specialist: Fix Agent, Bug Review Agent, Test Writer Agent, or Escalation Agent.",
  },
  {
    id: "feedback",
    name: "Feedback / Memory Write-Back",
    detail:
      "Every completed cluster's outcome (classification, fix, any human correction) is written back into long-term memory so future runs get faster and cheaper.",
  },
];

const METRICS = {
  nightlyTriageTime: { before: "1-2 engineer-days", after: "~25 minute agent run", reduction: "~97%" },
  humanReviewTime: { before: "1-2 days", after: "~90 minutes", reduction: "~88%" },
  perFailureTriage: { before: "15-25 min", after: "1-2 min review", reduction: "~92%" },
  locatorFix: { before: "20-40 min", after: "2 min PR review", reduction: "~93%" },
  bugTicketCreation: { before: "15 min", after: "1 min confirm", reduction: "~93%" },
  testRewriting: { before: "3 days", after: "~3 hours review", reduction: "~90%" },
  costPerRun: { day1: "$8.50", day90: "$1.20", reduction: "~86%" },
  classificationAccuracyByDay90: "~95%",
  streamsCovered: "1 manual vs 4 automated in parallel",
};

/**
 * Builds a fresh McpServer instance. A new instance is created per HTTP
 * request (stateless mode) so concurrent MCP clients never share request
 * state — see the official SDK guidance for stateless Streamable HTTP
 * servers.
 */
export function createMcpServer(): McpServer {
  const server = new McpServer({
    name: "autonomous-qa-agent",
    version: "1.0.0",
  });

  server.registerTool(
    "get_architecture_overview",
    {
      title: "Get architecture overview",
      description:
        "Returns the ordered pipeline stages of the autonomous QA test-maintenance agent, from nightly report ingestion to memory write-back.",
      inputSchema: {},
    },
    async () => ({
      content: [
        {
          type: "text",
          text: JSON.stringify({ stages: PIPELINE_STAGES }, null, 2),
        },
      ],
    }),
  );

  server.registerTool(
    "classify_test_failure",
    {
      title: "Classify a test failure",
      description:
        "Runs the live tier-1 regex classifier against a raw test-failure error message and returns its category, tier, and confidence.",
      inputSchema: {
        errorMessage: z.string().min(1).describe("Raw error message or stack trace excerpt from a failed test"),
      },
    },
    async ({ errorMessage }: { errorMessage: string }) => {
      const result = classifyFailure(errorMessage);
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    },
  );

  server.registerTool(
    "get_cost_metrics",
    {
      title: "Get business impact metrics",
      description:
        "Returns the documented before/after time and cost metrics for the autonomous QA agent architecture.",
      inputSchema: {},
    },
    async () => ({
      content: [{ type: "text", text: JSON.stringify(METRICS, null, 2) }],
    }),
  );

  return server;
}
