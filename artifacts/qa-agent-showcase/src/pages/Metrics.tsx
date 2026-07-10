import React from 'react';
import { motion } from 'framer-motion';
import { TrendingDown, Clock, Banknote, Zap, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from 'recharts';

const costData = [
  { day: 'Day 1', cost: 8.50 },
  { day: 'Day 15', cost: 6.20 },
  { day: 'Day 30', cost: 4.80 },
  { day: 'Day 45', cost: 3.50 },
  { day: 'Day 60', cost: 2.30 },
  { day: 'Day 75', cost: 1.60 },
  { day: 'Day 90', cost: 1.20 },
];

export default function Metrics() {
  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      
      <div>
        <h1 className="text-3xl font-bold font-mono tracking-tight mb-2">Business Impact</h1>
        <p className="text-muted-foreground">Measured performance after 90 days of autonomous triage.</p>
      </div>

      {/* Top Level KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { 
            title: "Cost Per Run Drop", 
            value: "86%", 
            sub: "$8.50 to $1.20",
            icon: TrendingDown,
            color: "text-emerald-400"
          },
          { 
            title: "Manual Cost Avoided", 
            value: "~$4.1k", 
            sub: "per night vs $2.20 agent cost",
            icon: Banknote,
            color: "text-emerald-400"
          },
          { 
            title: "Time Saved (Nightly)", 
            value: "97%", 
            sub: "1-2 days to ~25 mins",
            icon: Clock,
            color: "text-blue-400"
          },
          { 
            title: "Streams Covered", 
            value: "4x", 
            sub: "1 manual vs 4 parallel",
            icon: Zap,
            color: "text-purple-400"
          }
        ].map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className="p-6 border border-border bg-card rounded-xl relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-100 transition-opacity">
              <stat.icon className={`h-8 w-8 ${stat.color}`} />
            </div>
            <h3 className="font-mono text-sm uppercase tracking-wider text-muted-foreground mb-2">
              {stat.title}
            </h3>
            <div className="text-4xl font-bold font-mono mb-1">{stat.value}</div>
            <div className="text-sm text-muted-foreground">{stat.sub}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Comparison Table */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="border border-border bg-card rounded-xl overflow-hidden flex flex-col"
        >
          <div className="p-4 border-b border-border bg-muted/30">
            <h3 className="font-mono font-bold text-lg">Process Time Comparison</h3>
          </div>
          <div className="p-0 flex-1 overflow-x-auto">
            <table className="w-full text-sm text-left font-mono">
              <thead className="text-xs uppercase bg-muted/50 text-muted-foreground border-b border-border">
                <tr>
                  <th className="px-6 py-4">Task</th>
                  <th className="px-6 py-4">Manual</th>
                  <th className="px-6 py-4">Agentic</th>
                  <th className="px-6 py-4 text-emerald-400">Reduction</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {[
                  ["Human Review (Morning)", "1-2 days", "~90 mins", "88%"],
                  ["Per-failure Triage", "15-25 min", "1-2 min (review)", "92%"],
                  ["Locator Fix", "20-40 min", "2 min (PR review)", "93%"],
                  ["Bug Ticket Creation", "15 min", "1 min (confirm)", "93%"],
                  ["Test Rewriting", "3 days", "~3 hours (review)", "90%"]
                ].map((row, i) => (
                  <tr key={i} className="hover:bg-muted/20 transition-colors">
                    <td className="px-6 py-4 font-medium">{row[0]}</td>
                    <td className="px-6 py-4 text-muted-foreground">{row[1]}</td>
                    <td className="px-6 py-4 text-primary">{row[2]}</td>
                    <td className="px-6 py-4 text-emerald-400 font-bold">{row[3]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Cost Chart */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="border border-border bg-card rounded-xl p-6 flex flex-col"
        >
          <div className="mb-6">
            <h3 className="font-mono font-bold text-lg flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-emerald-400" />
              Cost Per Run (Compounding Memory Effect)
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Purely driven by the memory/cache system compounding over 90 days.
            </p>
          </div>
          <div className="h-64 w-full flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={costData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false}
                  tickFormatter={(val) => `$${val}`}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                  itemStyle={{ color: 'hsl(var(--primary))' }}
                  labelStyle={{ color: 'hsl(var(--muted-foreground))', marginBottom: '4px' }}
                  formatter={(value: number) => [`$${value.toFixed(2)}`, 'Cost']}
                />
                <Area 
                  type="monotone" 
                  dataKey="cost" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorCost)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

      </div>

      {/* Nuance & Conclusion */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="border border-amber-900/30 bg-amber-900/10 rounded-xl p-6 relative overflow-hidden"
        >
          <ShieldCheck className="absolute top-6 right-6 h-16 w-16 text-amber-500/10" />
          <h3 className="font-mono font-bold text-amber-500 mb-3 text-lg flex items-center gap-2">
            The Accuracy Tradeoff
          </h3>
          <p className="text-foreground/80 leading-relaxed text-sm">
            Classification accuracy stabilizes at <strong>~95% by day 90</strong> vs effectively 100% for a human. This is an intentional tradeoff: accepting a 5% misclassification rate (which humans catch during PR/Ticket review) in exchange for reducing manual triage time by 97%. Humans still make mistakes, but the agent makes them consistently and visibly.
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="border border-primary/30 bg-primary/5 rounded-xl p-6 relative overflow-hidden"
        >
          <CheckCircle2 className="absolute top-6 right-6 h-16 w-16 text-primary/10" />
          <h3 className="font-mono font-bold text-primary mb-3 text-lg flex items-center gap-2">
            The Qualitative Win
          </h3>
          <p className="text-foreground/80 leading-relaxed text-sm">
            The real ROI isn't just cost savings—it's <strong>engineer morale and focus</strong>. By automating the mechanical, repetitive work of test triage, engineers are freed to focus on actual feature development and complex infrastructure problems, transforming QA from a bottleneck into a silent, self-healing system.
          </p>
        </motion.div>
      </div>

    </div>
  );
}
