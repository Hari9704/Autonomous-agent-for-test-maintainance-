import { motion } from 'framer-motion';

type Token = { text: string; type: 'keyword' | 'string' | 'comment' | 'number' | 'def' | 'builtin' | 'plain' };

const KEYWORDS = new Set(['def', 'for', 'in', 'if', 'else', 'return', 'while', 'and', 'not', 'None', 'True', 'False', 'class', 'from', 'import', 'with', 'as', 'break', 'continue', 'pass', 'yield', 'lambda', 'raise', 'try', 'except', 'finally', 'async', 'await', 'or', 'is']);
const BUILTINS = new Set(['list', 'dict', 'set', 'str', 'int', 'float', 'bool', 'len', 'range', 'print', 'min', 'max', 'round', 'abs', 'enumerate', 'zip', 'map', 'filter', 'type', 'isinstance', 'getattr', 'setattr', 'hasattr']);

function tokenizeLine(line: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  while (i < line.length) {
    // Comment
    if (line[i] === '#') {
      tokens.push({ text: line.slice(i), type: 'comment' });
      break;
    }
    // String
    if (line[i] === '"' || line[i] === "'") {
      const q = line[i];
      const triple = line.slice(i, i + 3) === q.repeat(3);
      const end = triple ? line.indexOf(q.repeat(3), i + 3) : line.indexOf(q, i + 1);
      const len = end === -1 ? line.length - i : (triple ? end + 3 : end + 1) - i;
      tokens.push({ text: line.slice(i, i + len), type: 'string' });
      i += len;
      continue;
    }
    // Number
    if (/\d/.test(line[i]) && (i === 0 || /\W/.test(line[i - 1]))) {
      let j = i;
      while (j < line.length && /[\d._]/.test(line[j])) j++;
      tokens.push({ text: line.slice(i, j), type: 'number' });
      i = j;
      continue;
    }
    // Word token
    if (/[a-zA-Z_]/.test(line[i])) {
      let j = i;
      while (j < line.length && /[a-zA-Z0-9_]/.test(line[j])) j++;
      const word = line.slice(i, j);
      const isDef = tokens.length > 0 && tokens[tokens.length - 1].text === 'def';
      tokens.push({ text: word, type: isDef ? 'def' : KEYWORDS.has(word) ? 'keyword' : BUILTINS.has(word) ? 'builtin' : 'plain' });
      i = j;
      continue;
    }
    // Accumulate plain chars
    const last = tokens[tokens.length - 1];
    if (last?.type === 'plain') last.text += line[i];
    else tokens.push({ text: line[i], type: 'plain' });
    i++;
  }
  return tokens;
}

const TOKEN_COLORS: Record<Token['type'], string> = {
  keyword: 'text-[#ff7b72]',
  string:  'text-[#a5d6ff]',
  comment: 'text-[#8b949e] italic',
  number:  'text-[#79c0ff]',
  def:     'text-[#d2a8ff]',
  builtin: 'text-[#ffa657]',
  plain:   'text-[#c9d1d9]',
};

function SyntaxLine({ line, num }: { line: string; num: number }) {
  const tokens = tokenizeLine(line);
  return (
    <div className="table-row">
      <span className="table-cell text-right pr-5 text-[#484f58] select-none w-8">{num}</span>
      <span className="table-cell whitespace-pre">
        {tokens.map((tok, i) => (
          <span key={i} className={TOKEN_COLORS[tok.type]}>{tok.text}</span>
        ))}
      </span>
    </div>
  );
}

function CodeBlock({ code, filename = 'python' }: { code: string; filename?: string }) {
  const lines = code.split('\n');
  return (
    <div className="rounded-xl overflow-hidden border border-border bg-[#0d1117] shadow-lg">
      <div className="flex items-center gap-2 px-4 py-2.5 bg-[#161b22] border-b border-border">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500/80" />
          <div className="w-3 h-3 rounded-full bg-amber-500/80" />
          <div className="w-3 h-3 rounded-full bg-green-500/80" />
        </div>
        <span className="ml-3 text-xs font-mono text-muted-foreground">{filename}</span>
      </div>
      <pre className="p-4 overflow-x-auto text-sm font-mono leading-6">
        <code>
          {lines.map((line, i) => <SyntaxLine key={i} line={line} num={i + 1} />)}
        </code>
      </pre>
    </div>
  );
}

type ConceptProps = { title: string; why: string; code: string; filename?: string };

function Concept({ title, why, code, filename }: ConceptProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.45 }}
      className="mb-14"
    >
      <h2 className="text-xl font-bold font-mono text-primary mb-3">{title}</h2>
      <p className="text-foreground/80 leading-relaxed max-w-3xl mb-5 text-sm">
        <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground mr-2">Why it exists:</span>
        {why}
      </p>
      <CodeBlock code={code} filename={filename} />
    </motion.div>
  );
}

export default function Learn() {
  return (
    <div className="max-w-4xl mx-auto pb-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-14"
      >
        <h1 className="text-3xl font-bold font-mono tracking-tight mb-3">Architecture Concepts</h1>
        <p className="text-muted-foreground text-lg">
          Core patterns that power the autonomous test-maintenance agent — with real source code.
        </p>
      </motion.div>

      <Concept
        title="3-Tier Cost-Disciplined Classification"
        filename="app/triage/classifier.py"
        why="Most failures are cheap to classify without ever calling an LLM; only ambiguous ones should cost money."
        code={`_TIER1_RULES: list[tuple[re.Pattern, ClassificationCategory, float]] = [
    (re.compile(r"no such element|element not found|unable to locate element", re.I),
     ClassificationCategory.LOCATOR_CHANGE, 0.9),
    (re.compile(r"timeout|timed out waiting|element not visible in time", re.I),
     ClassificationCategory.WAIT_SYNC, 0.85),
    (re.compile(r"\\b5\\d\\d\\b.*(error|exception)|internal server error", re.I),
     ClassificationCategory.APP_BUG, 0.9),
]

def _tier1_classify(error_message: str) -> Classification | None:
    for pattern, category, confidence in _TIER1_RULES:
        if pattern.search(error_message):
            return Classification(
                category=category, confidence=confidence,
                tier=ClassificationTier.TIER1_RULE,
                reasoning=f"Matched rule pattern: {pattern.pattern}"
            )
    return None  # fall through to Tier 2 cache`}
      />

      <Concept
        title="Bounded Reflexion Self-Critique Loop"
        filename="app/triage/llm_tier.py"
        why="LLMs sometimes give low-confidence first answers; instead of trusting blindly or looping forever, the system asks the model to critique its own reasoning up to a fixed number of times, then commits."
        code={`while confidence < settings.llm.reflexion_confidence_threshold and rounds < settings.llm.max_reflexion_rounds:
    rounds += 1
    critique_payload, _ = _llm.complete_json(
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
        break  # model agrees with itself — commit`}
      />

      <Concept
        title="Supervisor / Graph Routing (LangGraph)"
        filename="app/graph/supervisor.py"
        why="Once a failure is classified, exactly one specialist should handle it — a typed graph makes routing explicit, auditable, and resumable instead of an if/else chain buried in application code."
        code={`_ROUTE_TABLE: dict[ClassificationCategory, str] = {
    ClassificationCategory.LOCATOR_CHANGE: "fix",
    ClassificationCategory.WAIT_SYNC:      "fix",
    ClassificationCategory.APP_BUG:        "bug_review",
    ClassificationCategory.FUNC_CHANGED:   "test_writer",
    ClassificationCategory.FLAKY_INFRA:    "escalation",
    ClassificationCategory.SPORADIC:       "escalation",
    ClassificationCategory.TEST_DATA:      "escalation",
    ClassificationCategory.UNKNOWN:        "escalation",
}

graph.add_edge(START, "evidence")
graph.add_edge(START, "triage")                 # parallel fan-out
graph.add_conditional_edges("triage", _route_by_classification, {
    "fix": "fix", "bug_review": "bug_review",
    "test_writer": "test_writer", "escalation": "escalation",
})
for specialist in ("fix", "bug_review", "test_writer", "escalation"):
    graph.add_edge(specialist, "feedback")      # every path converges before END`}
      />

      <Concept
        title="Output Token Trimming (Structured JSON Only)"
        filename="app/triage/prompts.py"
        why="Output tokens cost 3–5× more than input tokens; asking a model to 'explain in detail' produces an expensive essay when a 150-token JSON object is all that's needed downstream."
        code={`def enforce_json_only(schema_hint: str) -> str:
    """Always request structured JSON, never free-form prose.
    Output tokens cost 3-5x input tokens — keep responses minimal."""
    return (
        f"Respond with a single JSON object matching this shape: {schema_hint}. "
        "No prose, no markdown fences, no explanation. JSON only."
    )`}
      />

      <Concept
        title="Execution Memory That Compounds"
        filename="app/memory/state_store.py"
        why="Every resolved cluster is written back to long-term memory, so future runs increasingly hit free cache tiers instead of paying for an LLM call — the system's own history becomes its cheapest knowledge base."
        code={`def record_free_hit(self, *, semantic: bool = False) -> None:
    """Track a Tier-1 rule match, Tier-2 exact cache hit, or rule-based
    escalation lookup — zero LLM spend any of these paths."""
    self.cost.cache_hits += 1
    if semantic:
        self.cost.semantic_cache_hits += 1

def record_llm_call(self, input_tokens: int, output_tokens: int, tier: str) -> None:
    """Track an actual LLM invocation for cost accounting."""
    self.cost.llm_calls += 1
    self.cost.input_tokens  += input_tokens
    self.cost.output_tokens += output_tokens
    self.cost.tier_breakdown[tier] = self.cost.tier_breakdown.get(tier, 0) + 1`}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mt-4 p-6 border border-primary/20 bg-primary/5 rounded-xl"
      >
        <h3 className="text-base font-bold font-mono mb-2 text-foreground">Adapters with Simulated Fallback</h3>
        <p className="text-foreground/80 leading-relaxed text-sm">
          Every integration (GitHub, Jira, Slack, BrowserStack, the LLM itself) calls the real API when credentials exist and
          otherwise returns a clearly-labeled simulated response with the identical shape. The whole pipeline runs end-to-end
          with zero credentials configured — nothing to rewrite when real credentials are added later.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mt-6 p-6 border border-border bg-card rounded-xl"
      >
        <h3 className="text-base font-bold font-mono mb-2 text-foreground flex items-center gap-2">
          <span className="text-primary">?</span> Why LangGraph?
        </h3>
        <p className="text-foreground/80 leading-relaxed text-sm">
          It is the only major agent framework with native support for <strong>cycles</strong> (needed for the Reflexion loop)
          and <strong>typed, resumable state</strong> (a crashed run resumes from the exact step it stopped at, not from scratch).
          Both properties are non-negotiable for a nightly pipeline that must be auditable, cost-bounded, and resilient.
        </p>
      </motion.div>
    </div>
  );
}
