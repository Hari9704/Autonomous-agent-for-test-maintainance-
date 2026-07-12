import { useEffect, useState, useRef } from 'react';
import { Link } from 'wouter';
import { motion, useInView } from 'framer-motion';
import { ArrowRight, Terminal, Zap, Banknote, Clock, Database, BrainCircuit, GitPullRequest, CheckCircle2 } from 'lucide-react';

const TYPED_LINES = [
  '> ingesting 1,247 nightly failures...',
  '> clustering by error signature: 84 unique clusters',
  '> tier-1 rules matched: 61 clusters (72%) — free',
  '> semantic cache hits: 14 clusters — $0.002',
  '> LLM inference: 9 clusters — $0.18',
  '> 3 draft PRs opened, 6 tickets filed',
  '> run complete in 23m 41s  [cost: $0.21]',
  '> humans: review 9 items. everything else: handled.',
];

function TypewriterTerminal() {
  const [lines, setLines] = useState<string[]>([]);
  const [current, setCurrent] = useState('');
  const [lineIdx, setLineIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [done, setDone] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (done) return;
    if (lineIdx >= TYPED_LINES.length) { setDone(true); return; }
    const target = TYPED_LINES[lineIdx];
    if (charIdx < target.length) {
      const t = setTimeout(() => {
        setCurrent((p) => p + target[charIdx]);
        setCharIdx((p) => p + 1);
      }, 22);
      return () => clearTimeout(t);
    } else {
      const t = setTimeout(() => {
        setLines((p) => [...p, target]);
        setCurrent('');
        setCharIdx(0);
        setLineIdx((p) => p + 1);
      }, 180);
      return () => clearTimeout(t);
    }
  }, [lineIdx, charIdx, done]);

  useEffect(() => {
    containerRef.current?.scrollTo({ top: 9999, behavior: 'smooth' });
  }, [lines, current]);

  const lineColor = (line: string) => {
    if (line.includes('free') || line.includes('handled')) return 'text-emerald-400';
    if (line.includes('complete') || line.includes('review')) return 'text-primary';
    if (line.includes('LLM')) return 'text-amber-400';
    return 'text-[#c9d1d9]';
  };

  return (
    <div className="w-full max-w-2xl mx-auto rounded-xl border border-border bg-[#0d1117] overflow-hidden shadow-[0_0_40px_rgba(0,229,255,0.06)]">
      <div className="flex items-center gap-2 px-4 py-3 bg-[#161b22] border-b border-border">
        <div className="w-3 h-3 rounded-full bg-red-500/70" />
        <div className="w-3 h-3 rounded-full bg-amber-500/70" />
        <div className="w-3 h-3 rounded-full bg-green-500/70" />
        <span className="ml-3 text-xs font-mono text-muted-foreground">autonomous_qa_agent — nightly run</span>
      </div>
      <div ref={containerRef} className="p-5 h-52 overflow-y-auto font-mono text-sm space-y-1 scrollbar-thin">
        {lines.map((line, i) => (
          <div key={i} className={lineColor(line)}>{line}</div>
        ))}
        {!done && (
          <div className="text-[#c9d1d9]">
            {current}<span className="animate-pulse">▋</span>
          </div>
        )}
        {done && <div className="text-primary/50 mt-2">{'>'} _</div>}
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, value, label, color, delay }: {
  icon: React.ElementType; value: string; label: string; color: string; delay: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-30px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay, duration: 0.5 }}
      className="flex flex-col items-center p-6 border border-border/50 bg-card/30 rounded-xl hover:border-primary/30 hover:bg-card/60 transition-all group"
    >
      <Icon className={`w-6 h-6 ${color} mb-3 group-hover:scale-110 transition-transform`} />
      <div className="text-4xl font-bold font-mono text-foreground mb-1">{value}</div>
      <div className="text-sm text-muted-foreground text-center">{label}</div>
    </motion.div>
  );
}

const HOW_IT_WORKS = [
  { icon: Database, color: 'text-blue-400', title: 'Ingest & Cluster', desc: '1,000+ raw failures grouped by error signature. Classify once per cluster — not once per failure.' },
  { icon: BrainCircuit, color: 'text-cyan-400', title: '3-Tier Classify', desc: 'Rules → Cache → LLM. 70%+ of failures resolved by the free tier before a single token is spent.' },
  { icon: GitPullRequest, color: 'text-emerald-400', title: 'Autonomous Action', desc: 'Draft PRs for locator fixes, Jira tickets for bugs, new tests for functional changes — all awaiting human review.' },
  { icon: CheckCircle2, color: 'text-primary', title: 'Memory Compounds', desc: 'Every resolved cluster feeds back into semantic memory. The system gets cheaper and faster every night.' },
];

export default function Home() {
  return (
    <div className="flex flex-col items-center text-center max-w-5xl mx-auto space-y-20 py-12">

      {/* Hero */}
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary font-mono text-sm">
          <Terminal className="w-4 h-4" />
          <span>v2.0_LIVE</span>
        </div>
        <h1 className="text-5xl md:text-7xl font-bold font-mono tracking-tighter text-foreground">
          Autonomous QA<br />
          <span className="text-primary">Test-Maintenance</span> Agent
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          An autonomous multi-agent system that triages and self-heals nightly mobile and web test failures.
          Reduce manual QA effort by <span className="text-foreground font-semibold">~87%</span> through a
          3-tier cost-disciplined classification architecture.
        </p>
      </motion.div>

      {/* CTAs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.12 }}
        className="flex flex-col sm:flex-row gap-4"
      >
        <Link href="/get-mcp" className="inline-flex items-center justify-center h-12 px-8 font-mono font-bold text-primary-foreground bg-primary hover:bg-primary/90 transition-all rounded-md gap-2 shadow-[0_0_20px_rgba(0,229,255,0.2)] hover:shadow-[0_0_30px_rgba(0,229,255,0.35)]">
          Get API/MCP Access <ArrowRight className="w-4 h-4" />
        </Link>
        <Link href="/flow" className="inline-flex items-center justify-center h-12 px-8 font-mono font-medium text-foreground border border-border hover:bg-muted/50 hover:border-primary/40 transition-all rounded-md gap-2">
          See How It Works
        </Link>
      </motion.div>

      {/* Terminal */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="w-full"
      >
        <TypewriterTerminal />
      </motion.div>

      {/* Stats */}
      <div className="w-full space-y-6">
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-border/50" />
          <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Business Impact</p>
          <div className="flex-1 h-px bg-border/50" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <StatCard icon={Clock}    value="97%" label="Nightly Triage Time Saved"  color="text-blue-400"   delay={0}    />
          <StatCard icon={Banknote} value="86%" label="Cost Drop Per Run"          color="text-emerald-400" delay={0.1} />
          <StatCard icon={Zap}      value="4x"  label="Parallel Streams Covered"   color="text-purple-400"  delay={0.2} />
        </div>
      </div>

      {/* How it works */}
      <div className="w-full space-y-8">
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-border/50" />
          <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">How It Works</p>
          <div className="flex-1 h-px bg-border/50" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 text-left">
          {HOW_IT_WORKS.map(({ icon: Icon, color, title, desc }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ delay: i * 0.08 }}
              className="p-5 border border-border/50 bg-card/30 rounded-xl hover:border-primary/30 hover:bg-card/60 transition-all group"
            >
              <div className={`w-10 h-10 rounded-lg bg-background border border-border flex items-center justify-center mb-4 group-hover:border-primary/40 transition-colors ${color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="font-mono font-bold text-sm text-foreground mb-2">
                <span className="text-primary/50 mr-1">{String(i + 1).padStart(2, '0')}.</span> {title}
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Bottom CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="w-full p-8 border border-primary/20 bg-primary/5 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6"
      >
        <div className="text-left">
          <p className="font-mono font-bold text-lg text-foreground mb-1">Ready to wire it into your stack?</p>
          <p className="text-muted-foreground text-sm">Get an API key and start classifying failures in under 60 seconds.</p>
        </div>
        <Link href="/get-mcp" className="flex-shrink-0 inline-flex items-center justify-center h-11 px-7 font-mono font-bold text-primary-foreground bg-primary hover:bg-primary/90 transition-colors rounded-md gap-2 whitespace-nowrap">
          Get Access — $5 <ArrowRight className="w-4 h-4" />
        </Link>
      </motion.div>

    </div>
  );
}
