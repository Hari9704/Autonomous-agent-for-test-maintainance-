import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { TrendingDown, Clock, Banknote, Zap, ShieldCheck, CheckCircle2 } from 'lucide-react';
import {
  Area, AreaChart, Bar, BarChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, Cell
} from 'recharts';
import { useCountUp } from '@/hooks/useCountUp';

const costData = [
  { day: 'Day 1',  cost: 8.50 },
  { day: 'Day 15', cost: 6.20 },
  { day: 'Day 30', cost: 4.80 },
  { day: 'Day 45', cost: 3.50 },
  { day: 'Day 60', cost: 2.30 },
  { day: 'Day 75', cost: 1.60 },
  { day: 'Day 90', cost: 1.20 },
];

const tierData = [
  { name: 'Tier 1\nRules',   pct: 72, color: '#10b981', label: '72% free' },
  { name: 'Tier 2\nCache',   pct: 15, color: '#00e5ff', label: '15% ~$0' },
  { name: 'Tier 3\nLLM',     pct: 13, color: '#a855f7', label: '13% paid' },
];

function AnimatedKPI({ value, suffix = '', title, sub, icon: Icon, color, delay }: {
  value: number; suffix?: string; title: string; sub: string;
  icon: React.ElementType; color: string; delay: number;
}) {
  const { count, ref } = useCountUp(value, 1400);
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ delay }}
      className="p-6 border border-border bg-card rounded-xl relative overflow-hidden group"
    >
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-30 transition-opacity">
        <Icon className={`h-16 w-16 ${color}`} />
      </div>
      <h3 className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-3">{title}</h3>
      <div ref={ref} className="text-4xl font-bold font-mono mb-1">
        {count}{suffix}
      </div>
      <div className="text-sm text-muted-foreground">{sub}</div>
    </motion.div>
  );
}

function SectionHeader({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-30px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 16 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.4 }}
    >
      {children}
    </motion.div>
  );
}

export default function Metrics() {
  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-16">

      <SectionHeader>
        <h1 className="text-3xl font-bold font-mono tracking-tight mb-2">Business Impact</h1>
        <p className="text-muted-foreground">Measured performance after 90 days of autonomous triage.</p>
      </SectionHeader>

      {/* KPI cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <AnimatedKPI value={86} suffix="%" title="Cost Per Run Drop"      sub="$8.50 → $1.20"              icon={TrendingDown} color="text-emerald-400" delay={0}   />
        <AnimatedKPI value={4100} suffix=""  title="Manual Cost Avoided"  sub="per night vs $2.20 agent"  icon={Banknote}     color="text-emerald-400" delay={0.08} />
        <AnimatedKPI value={97} suffix="%" title="Time Saved (Nightly)"   sub="1–2 days → ~25 mins"       icon={Clock}        color="text-blue-400"   delay={0.16} />
        <AnimatedKPI value={4}  suffix="x"  title="Streams Covered"       sub="1 manual → 4 parallel"     icon={Zap}          color="text-purple-400" delay={0.24} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* Comparison Table */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ delay: 0.05 }}
          className="border border-border bg-card rounded-xl overflow-hidden flex flex-col"
        >
          <div className="p-4 border-b border-border bg-muted/30">
            <h3 className="font-mono font-bold text-lg">Process Time Comparison</h3>
          </div>
          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-sm text-left font-mono">
              <thead className="text-xs uppercase bg-muted/50 text-muted-foreground border-b border-border">
                <tr>
                  <th className="px-5 py-3">Task</th>
                  <th className="px-5 py-3">Manual</th>
                  <th className="px-5 py-3 text-primary">Agentic</th>
                  <th className="px-5 py-3 text-emerald-400">Δ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {[
                  ['Human Review', '1–2 days', '~90 mins', '88%'],
                  ['Per-failure Triage', '15–25 min', '1–2 min', '92%'],
                  ['Locator Fix', '20–40 min', '2 min', '93%'],
                  ['Bug Ticket', '15 min', '1 min', '93%'],
                  ['Test Rewriting', '3 days', '~3 hrs', '90%'],
                ].map((row, i) => (
                  <motion.tr
                    key={i}
                    initial={{ opacity: 0, x: -12 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.06 + i * 0.06 }}
                    className="hover:bg-muted/20 transition-colors"
                  >
                    <td className="px-5 py-3 font-medium text-foreground">{row[0]}</td>
                    <td className="px-5 py-3 text-muted-foreground">{row[1]}</td>
                    <td className="px-5 py-3 text-primary">{row[2]}</td>
                    <td className="px-5 py-3 text-emerald-400 font-bold">{row[3]}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Cost chart */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ delay: 0.1 }}
          className="border border-border bg-card rounded-xl p-6 flex flex-col"
        >
          <div className="mb-4">
            <h3 className="font-mono font-bold text-lg flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-emerald-400" />
              Cost Per Run — 90 Day Curve
            </h3>
            <p className="text-xs text-muted-foreground mt-1">Compounding cache effect; no code changes required.</p>
          </div>
          <div className="h-56 w-full flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={costData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="costGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="hsl(var(--primary))" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px', fontSize: 12 }}
                  itemStyle={{ color: 'hsl(var(--primary))' }}
                  labelStyle={{ color: 'hsl(var(--muted-foreground))', marginBottom: 4 }}
                  formatter={(v: number) => [`$${v.toFixed(2)}`, 'Cost']}
                />
                <Area type="monotone" dataKey="cost" stroke="hsl(var(--primary))" strokeWidth={2.5} fillOpacity={1} fill="url(#costGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

      </div>

      {/* Tier distribution */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-40px' }}
        className="border border-border bg-card rounded-xl p-6"
      >
        <h3 className="font-mono font-bold text-lg mb-1">Classification Tier Distribution</h3>
        <p className="text-xs text-muted-foreground mb-6">% of clusters resolved at each tier per typical nightly run.</p>
        <div className="flex flex-col md:flex-row gap-8 items-center">
          <div className="h-52 w-full md:w-1/2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={tierData} margin={{ top: 4, right: 4, left: -28, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal vertical={false} />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}%`} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px', fontSize: 12 }}
                  formatter={(v: number) => [`${v}%`, 'Share']}
                />
                <Bar dataKey="pct" radius={[6, 6, 0, 0]}>
                  {tierData.map((entry, i) => <Cell key={i} fill={entry.color} fillOpacity={0.85} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-col gap-4 md:w-1/2">
            {tierData.map(({ name, pct, color, label }) => (
              <div key={name} className="space-y-1">
                <div className="flex justify-between font-mono text-sm">
                  <span style={{ color }}>{name.replace('\n', ' ')}</span>
                  <span className="text-muted-foreground">{label}</span>
                </div>
                <div className="h-2 bg-muted/40 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${pct}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: color }}
                  />
                </div>
              </div>
            ))}
            <p className="text-xs text-muted-foreground pt-2">
              87% of clusters never reach a paid LLM call. Cost curves down as the cache fills.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Nuance cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.05 }}
          className="border border-amber-900/30 bg-amber-900/10 rounded-xl p-6 relative overflow-hidden"
        >
          <ShieldCheck className="absolute top-4 right-4 h-14 w-14 text-amber-500/10" />
          <h3 className="font-mono font-bold text-amber-500 mb-3 text-lg">The Accuracy Tradeoff</h3>
          <p className="text-foreground/80 leading-relaxed text-sm">
            Classification accuracy stabilizes at <strong>~95% by day 90</strong> vs ~100% human. An intentional tradeoff:
            accept 5% misclassification (caught during PR/ticket review) to cut manual triage by 97%.
            Humans still review — they just review far fewer things.
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="border border-primary/20 bg-primary/5 rounded-xl p-6 relative overflow-hidden"
        >
          <CheckCircle2 className="absolute top-4 right-4 h-14 w-14 text-primary/10" />
          <h3 className="font-mono font-bold text-primary mb-3 text-lg">The Qualitative Win</h3>
          <p className="text-foreground/80 leading-relaxed text-sm">
            The real ROI isn't just cost savings — it's <strong>engineer morale</strong>. Automating the mechanical,
            repetitive triage work frees engineers to focus on features and complex infrastructure problems.
            QA becomes a silent, self-healing background process.
          </p>
        </motion.div>
      </div>

    </div>
  );
}
