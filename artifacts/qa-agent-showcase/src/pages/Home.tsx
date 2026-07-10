import React from 'react';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { ArrowRight, Terminal, Zap, Banknote, Clock } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] text-center max-w-4xl mx-auto space-y-16 py-12">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary font-mono text-sm mb-4">
          <Terminal className="w-4 h-4" />
          <span>v2.0_LIVE</span>
        </div>
        <h1 className="text-5xl md:text-7xl font-bold font-mono tracking-tighter text-foreground">
          Autonomous QA <br/>
          <span className="text-primary">Test-Maintenance</span> Agent
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          An autonomous multi-agent system that triages and self-heals nightly mobile and web test failures. Reduce manual QA triage effort by ~87% and optimize LLM inference cost through a 3-tier cost-disciplined classification architecture.
        </p>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col sm:flex-row gap-4"
      >
        <Link href="/get-mcp" className="inline-flex items-center justify-center h-12 px-8 font-mono font-bold text-primary-foreground bg-primary hover:bg-primary/90 transition-colors rounded-md gap-2">
          Get API/MCP Access <ArrowRight className="w-4 h-4" />
        </Link>
        <Link href="/flow" className="inline-flex items-center justify-center h-12 px-8 font-mono font-medium text-foreground border border-border hover:bg-muted/50 transition-colors rounded-md gap-2">
          See How It Works
        </Link>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="w-full pt-8 border-t border-border/50"
      >
        <p className="font-mono text-sm uppercase tracking-wider text-muted-foreground mb-6">Business Impact</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex flex-col items-center p-6 border border-border/50 bg-card/30 rounded-lg">
            <Clock className="w-6 h-6 text-blue-400 mb-3" />
            <div className="text-3xl font-bold font-mono text-foreground mb-1">97%</div>
            <div className="text-sm text-muted-foreground">Nightly Time Saved</div>
          </div>
          <div className="flex flex-col items-center p-6 border border-border/50 bg-card/30 rounded-lg">
            <Banknote className="w-6 h-6 text-emerald-400 mb-3" />
            <div className="text-3xl font-bold font-mono text-foreground mb-1">86%</div>
            <div className="text-sm text-muted-foreground">Cost Drop Per Run</div>
          </div>
          <div className="flex flex-col items-center p-6 border border-border/50 bg-card/30 rounded-lg">
            <Zap className="w-6 h-6 text-purple-400 mb-3" />
            <div className="text-3xl font-bold font-mono text-foreground mb-1">4x</div>
            <div className="text-sm text-muted-foreground">Parallel Streams</div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}