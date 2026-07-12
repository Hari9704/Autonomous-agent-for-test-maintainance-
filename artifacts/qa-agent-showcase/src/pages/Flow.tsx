import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Database, Network, Search, Wrench, Bug, FileCode, AlertTriangle, CheckCircle, BrainCircuit, Activity, Cpu, Play, Pause, SkipForward } from 'lucide-react';

type StageType = {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  details: string;
  inputs?: string[];
  outputs?: string[];
  color: string;
  stepNum: number;
};

const stages: StageType[] = [
  { id: "ingestion",   stepNum: 1,  title: "Ingestion & Clustering",  description: "Parses nightly failures and groups identical signatures.", icon: Database,    details: "A nightly failure report (JSON/XLSX) is parsed. Failures are grouped into clusters by matching error signature. One representative failure is picked per cluster. Cost optimization: classify once, apply to all members.", inputs: ["Nightly JSON Report", "1,000+ Raw Failures"], outputs: ["Grouped Error Clusters", "Representative Samples"], color: "text-blue-400" },
  { id: "fanout",      stepNum: 2,  title: "Parallel Fan-Out",         description: "Evidence gathering and multi-tier triage run simultaneously.", icon: Network,     details: "LangGraph graph spawns one sub-run per cluster. Evidence and Triage happen simultaneously to reduce wall-clock time. This is the key architectural move that cuts wall-clock time by ~4× vs sequential.", inputs: ["Representative Failure"], outputs: ["Parallel Sub-Runs"], color: "text-indigo-400" },
  { id: "evidence",    stepNum: 3,  title: "Evidence Gathering",       description: "Collects execution context (video/DOM/network).", icon: Search,       details: "Gathers context for the representative failure (simulated BrowserStack session data — video/DOM/network log summary). Uses an adapter pattern for seamless future credentials integration.", inputs: ["Test Run ID"], outputs: ["DOM Snapshot", "Network Log Summary"], color: "text-purple-400" },
  { id: "triage",      stepNum: 4,  title: "3-Tier Triage",            description: "Rule-based → Cache → Reflexion LLM loop.", icon: BrainCircuit, details: "Tier 1: Fast regex rules catch obvious cases (LOCATOR_CHANGE, WAIT_SYNC, APP_BUG). Tier 2: Exact-match cache (SQLite, sub-5ms). Tier 3a: Semantic cache. Tier 3b: Real LLM classification with a bounded self-critique (Reflexion) loop for low confidence.", inputs: ["Error Stack Trace"], outputs: ["Category (e.g. LOCATOR_CHANGE)", "Confidence Score"], color: "text-cyan-400" },
  { id: "supervisor",  stepNum: 5,  title: "Supervisor Routing",       description: "Typed routing to specialized agent capabilities.", icon: Activity,     details: "Routes based on the classification category to exactly one specialist. Ensures typed, explicit routing instead of nested if/else statements. Every route is auditable and resumable.", inputs: ["Classification Label"], outputs: ["Target Specialist Node"], color: "text-teal-400" },
  { id: "fix",         stepNum: 6,  title: "Fix Agent",                description: "Drafts code fix for locator or wait issues.", icon: Wrench,       details: "Triggered for LOCATOR_CHANGE or WAIT_SYNC. Drafts a code fix, verifies it against the DOM snapshot, and opens a draft PR via GitHub MCP. Forbidden-path guardrails prevent edits to CI config, hooks, or driver/session code.", inputs: ["DOM Snapshot", "Failed Locator"], outputs: ["Draft PR URL"], color: "text-emerald-400" },
  { id: "bug_review",  stepNum: 6,  title: "Bug Review Agent",         description: "Files bug tickets for application crashes.", icon: Bug,          details: "Triggered for APP_BUG. Searches history for duplicates, files a draft bug ticket with all gathered evidence attached via JIRA MCP.", inputs: ["Error Stack Trace", "Network Log Summary"], outputs: ["Draft Jira Ticket"], color: "text-amber-400" },
  { id: "test_writer", stepNum: 6,  title: "Test Writer Agent",        description: "Rewrites tests for functional changes.", icon: FileCode,     details: "Triggered for FUNC_CHANGED. Reads the updated feature spec or DOM, drafts a brand-new test to match the new behavior.", inputs: ["DOM Snapshot", "Previous Test Code"], outputs: ["New Test Code"], color: "text-pink-400" },
  { id: "escalation",  stepNum: 6,  title: "Escalation Agent",         description: "Rule-based fallback for unknown or flaky issues.", icon: AlertTriangle,details: "Triggered for FLAKY_INFRA, SPORADIC, TEST_DATA, or UNKNOWN. Rule-based, no LLM needed. Decides retry policy or routes to a human via Slack alert.", inputs: ["Classification Label"], outputs: ["Slack Alert", "Retry Policy"], color: "text-red-400" },
  { id: "feedback",    stepNum: 7,  title: "Semantic Memory",          description: "Writes outcome to cache for future runs.", icon: Cpu,          details: "Every completed cluster's outcome (classification + fix + human correction) is written back into long-term semantic memory. The system gets smarter and cheaper every night.", inputs: ["Final Resolution"], outputs: ["Updated Vector Cache"], color: "text-primary" },
  { id: "output",      stepNum: 8,  title: "Action Contract",          description: "Presents structured report to engineering.", icon: CheckCircle,  details: "Output: a structured run report + an 'Agent Action Contract' detailing exactly what changed autonomously and what needs human review. No auto-merge, ever.", inputs: ["All Run Metadata"], outputs: ["Action Contract UI", "Metrics Payload"], color: "text-green-400" },
];

const PLAY_ORDER = ["ingestion","fanout","evidence","triage","supervisor","fix","feedback","output"];

const pipeline = [
  [{ id: "ingestion" }],
  [{ id: "fanout" }],
  [{ id: "evidence" }, { id: "triage" }],
  [{ id: "supervisor" }],
  [{ id: "fix" }, { id: "bug_review" }, { id: "test_writer" }, { id: "escalation" }],
  [{ id: "feedback" }],
  [{ id: "output" }],
];

export default function Flow() {
  const [activeStage, setActiveStage] = useState<StageType>(stages[0]);
  const [playing, setPlaying] = useState(false);
  const [playIdx, setPlayIdx] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startPlay = () => {
    setPlaying(true);
    setPlayIdx(0);
    setActiveStage(stages.find(s => s.id === PLAY_ORDER[0])!);
  };

  const stopPlay = () => {
    setPlaying(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const stepForward = () => {
    const next = (playIdx + 1) % PLAY_ORDER.length;
    setPlayIdx(next);
    setActiveStage(stages.find(s => s.id === PLAY_ORDER[next])!);
  };

  useEffect(() => {
    if (!playing) return;
    intervalRef.current = setInterval(() => {
      setPlayIdx((prev) => {
        const next = prev + 1;
        if (next >= PLAY_ORDER.length) {
          setPlaying(false);
          return prev;
        }
        setActiveStage(stages.find(s => s.id === PLAY_ORDER[next])!);
        return next;
      });
    }, 1800);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [playing]);

  return (
    <div className="flex flex-col lg:flex-row gap-6 min-h-[calc(100vh-6rem)]">

      {/* Diagram */}
      <div className="lg:w-2/3 bg-card border border-border rounded-xl p-6 overflow-x-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-mono font-bold text-lg text-foreground">Pipeline Architecture</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Click any node to inspect · or use auto-play</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={playing ? stopPlay : startPlay}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono font-medium transition-all ${
                playing
                  ? 'bg-primary/20 text-primary border border-primary/40'
                  : 'bg-muted/50 text-muted-foreground border border-border hover:border-primary/30 hover:text-primary'
              }`}
              aria-label={playing ? 'Pause walkthrough' : 'Play walkthrough'}
            >
              {playing ? <><Pause className="w-3 h-3" /> Pause</> : <><Play className="w-3 h-3" /> Walk-through</>}
            </button>
            <button
              onClick={stepForward}
              className="p-1.5 rounded-md bg-muted/50 border border-border text-muted-foreground hover:text-primary hover:border-primary/30 transition-colors"
              aria-label="Step forward"
            >
              <SkipForward className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Progress bar during play */}
        {playing && (
          <div className="mb-4 h-1 bg-muted/40 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-primary rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${((playIdx + 1) / PLAY_ORDER.length) * 100}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
        )}

        <div className="min-w-[560px] flex flex-col items-center gap-5">
          {pipeline.map((row, rowIndex) => (
            <React.Fragment key={`row-${rowIndex}`}>
              <div className="flex justify-center gap-5 w-full">
                {row.map((node) => {
                  const stage = stages.find(s => s.id === node.id)!;
                  const isActive = activeStage?.id === stage.id;
                  const isPlaying = playing && PLAY_ORDER.includes(stage.id) && PLAY_ORDER[playIdx] === stage.id;
                  const Icon = stage.icon;
                  return (
                    <motion.div
                      key={stage.id}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: rowIndex * 0.1 }}
                      className={`relative cursor-pointer w-44 rounded-xl border p-4 text-center transition-all select-none ${
                        isActive
                          ? 'border-primary bg-primary/10 shadow-[0_0_20px_rgba(0,229,255,0.15)]'
                          : 'border-border bg-card/50 hover:border-primary/40 hover:bg-card/80'
                      }`}
                      onClick={() => { stopPlay(); setActiveStage(stage); }}
                    >
                      {isPlaying && (
                        <span className="absolute -top-1.5 -right-1.5 flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-primary" />
                        </span>
                      )}
                      <div className={`mx-auto mb-2.5 flex h-10 w-10 items-center justify-center rounded-full bg-background border border-border ${stage.color}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <h3 className="font-mono text-xs font-semibold mb-1 text-foreground leading-tight">{stage.title}</h3>
                      <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">{stage.description}</p>
                    </motion.div>
                  );
                })}
              </div>
              {rowIndex < pipeline.length - 1 && (
                <div className="flex flex-col items-center">
                  <motion.div
                    className="w-px bg-gradient-to-b from-border to-primary/30"
                    initial={{ height: 0 }}
                    animate={{ height: 28 }}
                    transition={{ delay: rowIndex * 0.1 + 0.2, duration: 0.3 }}
                  />
                  <div className="w-1.5 h-1.5 rounded-full bg-primary/40" />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Details panel */}
      <div className="lg:w-1/3 flex flex-col">
        <div className="sticky top-20 bg-card border border-border rounded-xl overflow-hidden">
          <div className="p-3 border-b border-border bg-muted/30 flex items-center justify-between">
            <h2 className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Node Inspector</h2>
            <span className="font-mono text-xs text-primary/60">Step {activeStage.stepNum} / 8</span>
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeStage.id}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.18 }}
              className="p-5 space-y-5"
            >
              <div className="flex items-center gap-3">
                <div className={`flex h-11 w-11 items-center justify-center rounded-lg bg-background border border-border ${activeStage.color}`}>
                  <activeStage.icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold font-mono leading-tight">{activeStage.title}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{activeStage.description}</p>
                </div>
              </div>

              <p className="text-sm leading-relaxed text-foreground/80">{activeStage.details}</p>

              {activeStage.inputs && activeStage.inputs.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Inputs</h4>
                  <ul className="space-y-1.5">
                    {activeStage.inputs.map((input, i) => (
                      <li key={i} className="flex items-center gap-2 text-xs font-mono text-primary/90 bg-primary/8 px-3 py-1.5 rounded-md border border-primary/15">
                        <span className="opacity-40 text-primary">▶</span> {input}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {activeStage.outputs && activeStage.outputs.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Outputs</h4>
                  <ul className="space-y-1.5">
                    {activeStage.outputs.map((output, i) => (
                      <li key={i} className="flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-400/8 px-3 py-1.5 rounded-md border border-emerald-400/15">
                        <span className="opacity-40">◀</span> {output}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
