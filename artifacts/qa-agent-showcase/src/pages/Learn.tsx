import React from 'react';
import { motion } from 'framer-motion';

type ConceptProps = {
  title: string;
  why: string;
  code: string;
};

const Concept = ({ title, why, code }: ConceptProps) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="mb-12"
    >
      <h2 className="text-xl font-bold font-mono text-primary mb-4 border-b border-border pb-2 inline-block">
        {title}
      </h2>
      <div className="mb-4 text-foreground/80 leading-relaxed max-w-3xl">
        <strong className="font-mono text-sm uppercase tracking-wider text-muted-foreground mr-2">Why it exists:</strong>
        {why}
      </div>
      <div className="rounded-lg overflow-hidden border border-border bg-[#0d1117] relative">
        <div className="absolute top-0 w-full h-8 bg-[#161b22] border-b border-border flex items-center px-4">
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
            <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
            <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
          </div>
          <div className="ml-4 text-xs font-mono text-muted-foreground">python</div>
        </div>
        <pre className="p-4 pt-12 overflow-x-auto text-sm font-mono leading-relaxed text-[#c9d1d9]">
          <code>
            {code.split('\n').map((line, i) => (
              <div key={i} className="table-row">
                <span className="table-cell text-right pr-4 text-[#484f58] select-none">{i + 1}</span>
                <span className="table-cell whitespace-pre">{line}</span>
              </div>
            ))}
          </code>
        </pre>
      </div>
    </motion.div>
  );
};

export default function Learn() {
  return (
    <div className="max-w-4xl mx-auto pb-16">
      <div className="mb-12">
        <h1 className="text-3xl font-bold font-mono tracking-tight mb-4">Architecture Concepts</h1>
        <p className="text-muted-foreground text-lg">
          Core patterns and implementations that power the autonomous test-maintenance agent.
        </p>
      </div>

      <Concept
        title="3-tier cost-disciplined classification"
        why="Most failures are cheap to classify without ever calling an LLM; only ambiguous ones should cost money."
        code={`_TIER1_RULES: list[tuple[re.Pattern, ClassificationCategory, float]] = [
    (re.compile(r"no such element|element not found|unable to locate element", re.I),
     ClassificationCategory.LOCATOR_CHANGE, 0.9),
    (re.compile(r"timeout|timed out waiting|element not visible in time", re.I),
     ClassificationCategory.WAIT_SYNC, 0.85),
    (re.compile(r"\\b5\\d\\d\\b.*(error|exception)|internal server error|nullpointerexception", re.I),
     ClassificationCategory.APP_BUG, 0.9),
]

def _tier1_classify(error_message: str) -> Classification | None:
    for pattern, category, confidence in _TIER1_RULES:
        if pattern.search(error_message):
            return Classification(category=category, confidence=confidence,
                                   tier=ClassificationTier.TIER1_RULE,
                                   reasoning=f"Matched rule pattern: {pattern.pattern}")
    return None`}
      />

      <Concept
        title="Bounded Reflexion self-critique loop"
        why="LLMs sometimes give a low-confidence first answer; instead of trusting it blindly or looping forever, the system asks the model to critique its own reasoning up to a fixed number of times, then commits."
        code={`while confidence < settings.llm.reflexion_confidence_threshold and rounds < settings.llm.max_reflexion_rounds:
    rounds += 1
    critique_payload, critique_resp = _llm.complete_json(
        tier="cheap",
        system_prompt=REFLEXION_CRITIQUE_SYSTEM_PROMPT,
        user_prompt=reflexion_user_prompt(cluster, category.value, reasoning),
    )
    if critique_payload.get("should_revise") and critique_payload.get("revised_category"):
        category = _coerce_category(critique_payload["revised_category"])
        reasoning = critique_payload.get("critique", reasoning)
        confidence = min(1.0, confidence + 0.15)
    else:
        confidence = min(1.0, confidence + 0.1)
        break`}
      />

      <Concept
        title="Supervisor / graph routing (LangGraph)"
        why="Once a failure is classified, exactly one specialist should handle it -- a typed graph makes that routing explicit, auditable, and resumable instead of an if/else chain buried in application code."
        code={`_ROUTE_TABLE: dict[ClassificationCategory, str] = {
    ClassificationCategory.LOCATOR_CHANGE: "fix",
    ClassificationCategory.WAIT_SYNC: "fix",
    ClassificationCategory.APP_BUG: "bug_review",
    ClassificationCategory.FUNC_CHANGED: "test_writer",
    ClassificationCategory.FLAKY_INFRA: "escalation",
    ClassificationCategory.SPORADIC: "escalation",
    ClassificationCategory.TEST_DATA: "escalation",
    ClassificationCategory.UNKNOWN: "escalation",
}

graph.add_edge(START, "evidence")
graph.add_edge(START, "triage")               # parallel fan-out
graph.add_conditional_edges("triage", _route_by_classification, {
    "fix": "fix", "bug_review": "bug_review",
    "test_writer": "test_writer", "escalation": "escalation",
})
for specialist in ("fix", "bug_review", "test_writer", "escalation"):
    graph.add_edge(specialist, "feedback")     # every path converges before END`}
      />

      <Concept
        title="Output token trimming (structured JSON only)"
        why="Output tokens cost 3-5x more than input tokens; asking a model to 'explain in detail' produces an expensive essay when a 150-token JSON object is all that's needed downstream."
        code={`def enforce_json_only(schema_hint: str) -> str:
    """Always ask for structured JSON, never free-form prose, to keep
    output tokens (which cost 3-5x input tokens) minimal."""
    return f"Respond with a single JSON object matching this shape: {schema_hint}. No prose, no markdown fences."`}
      />

      <Concept
        title="Execution memory that compounds"
        why="Every resolved cluster is written back to long-term memory, so future runs increasingly hit free cache tiers instead of paying for an LLM call -- the system's own history becomes its cheapest knowledge base."
        code={`def record_free_hit(self, *, semantic: bool = False) -> None:
    """Tier-1 rule match, Tier-2 exact cache hit, or a rule-based escalation
    lookup -- zero LLM spend either way."""
    self.cost.cache_hits += 1
    if semantic:
        self.cost.semantic_cache_hits += 1`}
      />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mb-12"
      >
        <h2 className="text-xl font-bold font-mono text-primary mb-4 border-b border-border pb-2 inline-block">
          Adapters with simulated fallback
        </h2>
        <div className="text-foreground/80 leading-relaxed max-w-3xl mb-6">
          <strong className="font-mono text-sm uppercase tracking-wider text-muted-foreground mr-2">Why it exists:</strong>
          The whole pipeline (GitHub, Jira, Slack, BrowserStack, the LLM itself) must run end-to-end with zero credentials configured, so every integration point calls the real API when credentials exist and otherwise returns a clearly-labeled simulated response with the identical shape. Same code path either way, nothing to rewrite when real credentials are added later.
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="p-6 border border-primary/20 bg-primary/5 rounded-xl"
      >
        <h3 className="text-lg font-bold font-mono mb-2 flex items-center gap-2">
          Why LangGraph?
        </h3>
        <p className="text-foreground/80 leading-relaxed">
          It is the only major agent framework with native support for cycles (needed for the Reflexion loop) and typed, resumable state (a crashed run resumes from the exact step it stopped at, not from scratch).
        </p>
      </motion.div>

    </div>
  );
}
