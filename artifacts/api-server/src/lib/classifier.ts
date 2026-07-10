// Mirrors the tier-1 deterministic rule set from the Python reference
// implementation (agentic-qa-system/app/graph/triage.py). This is real
// classification logic, not a mock — it is the same regex-first, cost-free
// pass the production pipeline runs before ever touching an LLM.

export type ClassificationCategory =
  | "LOCATOR_CHANGE"
  | "WAIT_SYNC"
  | "APP_BUG"
  | "FUNC_CHANGED"
  | "FLAKY_INFRA"
  | "SPORADIC"
  | "TEST_DATA"
  | "UNKNOWN";

export interface ClassificationResult {
  category: ClassificationCategory;
  tier: string;
  confidence: number;
  reasoning: string;
}

const TIER1_RULES: Array<{
  pattern: RegExp;
  category: ClassificationCategory;
  confidence: number;
}> = [
  {
    pattern: /no such element|element not found|unable to locate element/i,
    category: "LOCATOR_CHANGE",
    confidence: 0.9,
  },
  {
    pattern: /timeout|timed out waiting|element not visible in time/i,
    category: "WAIT_SYNC",
    confidence: 0.85,
  },
  {
    pattern: /\b5\d\d\b.*(error|exception)|internal server error|nullpointerexception/i,
    category: "APP_BUG",
    confidence: 0.9,
  },
  {
    pattern: /network (error|unreachable)|connection reset|dns/i,
    category: "FLAKY_INFRA",
    confidence: 0.7,
  },
  {
    pattern: /stale element|intermittent|flaky/i,
    category: "SPORADIC",
    confidence: 0.6,
  },
  {
    pattern: /no data found|fixture missing|seed data|test data/i,
    category: "TEST_DATA",
    confidence: 0.65,
  },
];

export function classifyFailure(errorMessage: string): ClassificationResult {
  for (const rule of TIER1_RULES) {
    if (rule.pattern.test(errorMessage)) {
      return {
        category: rule.category,
        tier: "tier1_rule",
        confidence: rule.confidence,
        reasoning: `Matched rule pattern: ${rule.pattern.source}`,
      };
    }
  }

  // In production this falls through to a tier-2 exact/semantic cache and
  // then a bounded-Reflexion LLM call. This sandbox has no LLM credentials
  // configured, so it reports the tier honestly instead of faking an answer.
  return {
    category: "UNKNOWN",
    tier: "tier3_llm_unavailable",
    confidence: 0.3,
    reasoning:
      "No tier-1 rule matched. The production pipeline would escalate this to the semantic cache and then a bounded-Reflexion LLM call; no LLM credentials are configured in this sandbox, so classification stops here.",
  };
}
