import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Database, Network, Search, Wrench, Bug, FileCode, AlertTriangle, CheckCircle, BrainCircuit, Activity, Cpu } from 'lucide-react';

type StageType = {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  details: string;
  inputs?: string[];
  outputs?: string[];
  color: string;
};

const stages: StageType[] = [
  {
    id: "ingestion",
    title: "Ingestion & Clustering",
    description: "Parses nightly failures and groups identical signatures.",
    icon: Database,
    details: "A nightly failure report (JSON/XLSX) is parsed. Failures are grouped into clusters by matching error signature. One representative failure is picked per cluster. Cost optimization: classify once, apply to all members.",
    inputs: ["Nightly JSON Report", "1,000+ Raw Failures"],
    outputs: ["Grouped Error Clusters", "Representative Samples"],
    color: "text-blue-400"
  },
  {
    id: "fanout",
    title: "Parallel Fan-Out",
    description: "Evidence gathering and multi-tier triage run simultaneously.",
    icon: Network,
    details: "LangGraph graph spawns one sub-run per cluster. Evidence and Triage happen simultaneously to reduce wall-clock time.",
    inputs: ["Representative Failure"],
    outputs: ["Simulated BrowserStack Context", "Classification Label"],
    color: "text-indigo-400"
  },
  {
    id: "evidence",
    title: "Evidence Gathering",
    description: "Collects execution context (video/DOM/network).",
    icon: Search,
    details: "Gathers context for the representative failure (simulated BrowserStack session data -- video/DOM/network log summary). Uses an adapter pattern for seamless future credentials integration.",
    inputs: ["Test Run ID"],
    outputs: ["DOM Snapshot", "Network Log Summary"],
    color: "text-purple-400"
  },
  {
    id: "triage",
    title: "3-Tier Triage",
    description: "Rule-based -> Cache -> Reflexion LLM loop.",
    icon: BrainCircuit,
    details: "Tier 1: Fast regex rules catch obvious cases (LOCATOR_CHANGE, WAIT_SYNC, APP_BUG). Tier 2: Exact-match cache (SQLite, sub-5ms). Tier 3a: Semantic cache. Tier 3b: Real LLM classification with a bounded self-critique (Reflexion) loop for low confidence.",
    inputs: ["Error Stack Trace"],
    outputs: ["Categorization (e.g. LOCATOR_CHANGE)", "Confidence Score"],
    color: "text-cyan-400"
  },
  {
    id: "supervisor",
    title: "Supervisor Routing",
    description: "Typed routing to specialized agent capabilities.",
    icon: Activity,
    details: "Routes based on the classification category to exactly one specialist. Ensures typed, explicit routing instead of nested if/else statements.",
    inputs: ["Classification Label"],
    outputs: ["Target Node"],
    color: "text-teal-400"
  },
  {
    id: "fix",
    title: "Fix Agent",
    description: "Drafts code fix for locator or wait issues.",
    icon: Wrench,
    details: "Triggered for LOCATOR_CHANGE or WAIT_SYNC. Drafts a code fix, verifies it against the DOM snapshot, and opens a draft PR.",
    inputs: ["DOM Snapshot", "Failed Locator"],
    outputs: ["Draft PR URL"],
    color: "text-emerald-400"
  },
  {
    id: "bug_review",
    title: "Bug Review Agent",
    description: "Files bug tickets for application crashes.",
    icon: Bug,
    details: "Triggered for APP_BUG. Searches history for duplicates, files a draft bug ticket with all gathered evidence attached.",
    inputs: ["Error Stack Trace", "Network Log Summary"],
    outputs: ["Draft Jira Ticket"],
    color: "text-amber-400"
  },
  {
    id: "test_writer",
    title: "Test Writer Agent",
    description: "Rewrites tests for functional changes.",
    icon: FileCode,
    details: "Triggered for FUNC_CHANGED. Reads the updated feature specification or DOM, drafts a brand-new test to match the new behavior.",
    inputs: ["DOM Snapshot", "Previous Test Code"],
    outputs: ["New Test Code"],
    color: "text-pink-400"
  },
  {
    id: "escalation",
    title: "Escalation Agent",
    description: "Rule-based fallback for unknown or flaky issues.",
    icon: AlertTriangle,
    details: "Triggered for FLAKY_INFRA, SPORADIC, TEST_DATA, or UNKNOWN. Rule-based, no LLM needed. Decides retry policy or routes to a human via Slack alert.",
    inputs: ["Classification Label"],
    outputs: ["Slack Alert", "Retry Policy"],
    color: "text-red-400"
  },
  {
    id: "feedback",
    title: "Semantic Memory",
    description: "Writes outcome to cache for future runs.",
    icon: Cpu,
    details: "Every completed cluster's outcome (classification + fix + human correction) is written back into long-term semantic memory. The system gets smarter and cheaper every night.",
    inputs: ["Final Resolution"],
    outputs: ["Updated Vector Cache"],
    color: "text-primary"
  },
  {
    id: "output",
    title: "Action Contract",
    description: "Presents structured report to engineering.",
    icon: CheckCircle,
    details: "Output: a structured run report + an 'Agent Action Contract' detailing exactly what changed autonomously and what needs human review.",
    inputs: ["All Run Metadata"],
    outputs: ["Action Contract UI", "Metrics Payload"],
    color: "text-green-400"
  }
];

// Layout mapping
const pipeline = [
  [{ id: "ingestion" }],
  [{ id: "fanout" }],
  [{ id: "evidence" }, { id: "triage" }],
  [{ id: "supervisor" }],
  [{ id: "fix" }, { id: "bug_review" }, { id: "test_writer" }, { id: "escalation" }],
  [{ id: "feedback" }],
  [{ id: "output" }]
];

export default function Flow() {
  const [activeStage, setActiveStage] = useState<StageType | null>(stages[0]);

  return (
    <div className="flex flex-col lg:flex-row gap-8 min-h-[calc(100vh-6rem)]">
      {/* Diagram Side */}
      <div className="lg:w-2/3 bg-card border border-border rounded-xl p-8 overflow-x-auto">
        <div className="min-w-[600px] flex flex-col items-center">
          <div className="w-full flex flex-col items-center gap-6">
            {pipeline.map((row, rowIndex) => (
              <React.Fragment key={`row-${rowIndex}`}>
                <div className="flex justify-center gap-8 w-full">
                  {row.map((node) => {
                    const stage = stages.find((s) => s.id === node.id)!;
                    const isActive = activeStage?.id === stage.id;
                    const Icon = stage.icon;
                    return (
                      <motion.div
                        key={stage.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: rowIndex * 0.15, duration: 0.5 }}
                        className={`relative group cursor-pointer w-48 rounded-lg border p-4 text-center transition-all ${
                          isActive 
                            ? 'border-primary bg-primary/10 shadow-[0_0_15px_rgba(0,229,255,0.2)]' 
                            : 'border-border bg-card/50 hover:border-primary/50'
                        }`}
                        onClick={() => setActiveStage(stage)}
                        onMouseEnter={() => setActiveStage(stage)}
                      >
                        <div className={`mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-background border border-border ${stage.color}`}>
                          <Icon className="h-6 w-6" />
                        </div>
                        <h3 className="font-mono text-sm font-semibold mb-1 text-foreground">
                          {stage.title}
                        </h3>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {stage.description}
                        </p>
                      </motion.div>
                    );
                  })}
                </div>
                {/* Connecting Lines */}
                {rowIndex < pipeline.length - 1 && (
                  <div className="h-8 border-l-2 border-dashed border-border w-0" />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* Details Panel */}
      <div className="lg:w-1/3 flex flex-col">
        <div className="sticky top-20 bg-card border border-border rounded-xl overflow-hidden h-full">
          <div className="p-4 border-b border-border bg-muted/50">
            <h2 className="font-mono text-sm uppercase tracking-wider text-muted-foreground">
              Node_Inspection_Data
            </h2>
          </div>
          <AnimatePresence mode="wait">
            {activeStage && (
              <motion.div
                key={activeStage.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="p-6 space-y-6"
              >
                <div className="flex items-center gap-4">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-lg bg-background border border-border ${activeStage.color}`}>
                    <activeStage.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold font-mono tracking-tight">{activeStage.title}</h3>
                </div>

                <div className="space-y-2 text-sm leading-relaxed text-foreground/80">
                  {activeStage.details}
                </div>

                {activeStage.inputs && activeStage.inputs.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Inputs</h4>
                    <ul className="space-y-2">
                      {activeStage.inputs.map((input, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm font-mono text-primary/90 bg-primary/10 px-3 py-1.5 rounded-md border border-primary/20">
                          <span className="opacity-50">{">"}</span> {input}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {activeStage.outputs && activeStage.outputs.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Outputs</h4>
                    <ul className="space-y-2">
                      {activeStage.outputs.map((output, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm font-mono text-emerald-400 bg-emerald-400/10 px-3 py-1.5 rounded-md border border-emerald-400/20">
                          <span className="opacity-50">{"<"}</span> {output}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
