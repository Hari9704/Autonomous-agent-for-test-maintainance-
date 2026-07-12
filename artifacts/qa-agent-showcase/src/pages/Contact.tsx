import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Github, Linkedin, MessageSquare, ExternalLink, Clock } from 'lucide-react';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-20px' },
  transition: { delay, duration: 0.45 },
});

export default function Contact() {
  return (
    <div className="max-w-3xl mx-auto space-y-12 pb-16 pt-4">

      <motion.div {...fadeUp()} className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          Open to opportunities
        </div>
        <h1 className="text-4xl font-bold font-mono tracking-tight">Get in Touch</h1>
        <p className="text-lg text-muted-foreground max-w-lg mx-auto">
          Interested in bringing agentic QA infrastructure to your engineering team, or collaborating on
          multi-agent AI systems? I'm open to conversations.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">

        {/* Main card */}
        <motion.div
          {...fadeUp(0.08)}
          className="md:col-span-3 bg-card border border-border rounded-xl p-8 shadow-sm relative overflow-hidden"
        >
          <div className="absolute -top-10 -right-10 opacity-[0.03]">
            <MessageSquare className="w-56 h-56" />
          </div>

          <div className="relative z-10 space-y-7">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-1">Nunnagoppala Hari Prasad</h2>
              <p className="text-primary font-mono text-sm">AI Engineer · Agentic Systems</p>
            </div>

            <div className="space-y-5">
              <a
                href="mailto:hariprasad97048@gmail.com"
                className="flex items-center gap-4 group"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20 group-hover:bg-primary/20 group-hover:border-primary/40 transition-colors flex-shrink-0">
                  <Mail className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-0.5">Email</p>
                  <p className="text-foreground font-medium group-hover:text-primary transition-colors text-sm">
                    hariprasad97048@gmail.com
                  </p>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-muted-foreground/50 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
              </a>

              <a
                href="tel:+919704813856"
                className="flex items-center gap-4 group"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20 group-hover:bg-primary/20 group-hover:border-primary/40 transition-colors flex-shrink-0">
                  <Phone className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-0.5">Phone</p>
                  <p className="text-foreground font-medium group-hover:text-primary transition-colors text-sm">
                    +91 97048 13856
                  </p>
                </div>
              </a>

              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-muted/50 flex items-center justify-center border border-border flex-shrink-0">
                  <MapPin className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-0.5">Location</p>
                  <p className="text-foreground font-medium text-sm">Vijayawada, India</p>
                </div>
              </div>
            </div>

            <div className="pt-5 border-t border-border flex gap-3">
              <a
                href="https://github.com/Hari9704"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/40 border border-border text-muted-foreground hover:text-foreground hover:border-primary/30 hover:bg-muted/70 transition-all text-sm font-mono"
              >
                <Github className="w-4 h-4" /> GitHub
                <ExternalLink className="w-3 h-3 opacity-50" />
              </a>
              <a
                href="https://linkedin.com/in/hari-prasad-nunnagoppala"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/40 border border-border text-muted-foreground hover:text-foreground hover:border-primary/30 hover:bg-muted/70 transition-all text-sm font-mono"
              >
                <Linkedin className="w-4 h-4" /> LinkedIn
                <ExternalLink className="w-3 h-3 opacity-50" />
              </a>
            </div>
          </div>
        </motion.div>

        {/* Side cards */}
        <div className="md:col-span-2 flex flex-col gap-5">
          <motion.div
            {...fadeUp(0.12)}
            className="bg-card border border-border rounded-xl p-6 space-y-3"
          >
            <div className="flex items-center gap-2 font-mono text-sm text-muted-foreground uppercase tracking-wider">
              <Clock className="w-4 h-4" /> Response Time
            </div>
            <p className="text-2xl font-bold font-mono text-foreground">
              &lt; 24h
            </p>
            <p className="text-sm text-muted-foreground">
              Typically respond to emails within a business day.
            </p>
          </motion.div>

          <motion.div
            {...fadeUp(0.16)}
            className="bg-card border border-border rounded-xl p-6 space-y-3"
          >
            <p className="font-mono text-sm text-muted-foreground uppercase tracking-wider">Best for</p>
            <ul className="space-y-2 text-sm text-foreground/80">
              {[
                'Agentic QA infrastructure',
                'Multi-agent AI systems',
                'LangGraph / LLM architecture',
                'MCP server integration',
                'Full-time roles & contracts',
              ].map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <span className="text-primary/60 text-xs">▸</span> {item}
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            {...fadeUp(0.2)}
            className="bg-primary/5 border border-primary/20 rounded-xl p-5"
          >
            <p className="text-sm text-muted-foreground leading-relaxed">
              Working on a QA or AI agent project?{' '}
              <a href="mailto:hariprasad97048@gmail.com" className="text-primary font-medium hover:underline">
                Drop me an email
              </a>{' '}
              with a brief description — happy to talk through architectures.
            </p>
          </motion.div>
        </div>
      </div>

    </div>
  );
}
