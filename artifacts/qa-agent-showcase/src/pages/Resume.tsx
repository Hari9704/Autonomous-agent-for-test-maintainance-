import { motion } from 'framer-motion';
import { Download, MapPin, Briefcase, GraduationCap, Code2, Layers, Server, ExternalLink } from 'lucide-react';

const SKILLS: { category: string; tags: string[]; color: string }[] = [
  {
    category: 'Languages & Frameworks',
    color: 'bg-blue-500/10 text-blue-300 border-blue-500/20',
    tags: ['Java', 'Python', 'SQL', 'JavaScript', 'Spring Boot 3', 'Spring AI', 'Docker', 'AWS'],
  },
  {
    category: 'AI & Multi-Agent',
    color: 'bg-purple-500/10 text-purple-300 border-purple-500/20',
    tags: ['LangGraph', 'LangGraph4j', 'RAG', 'Multi-Agent Orchestration', 'MCP', 'Reflexion Loops', 'Prompt Engineering', 'LLM Orchestration', 'Google ADK', 'LangChain', 'Vector DBs', 'Agentic AI'],
  },
  {
    category: 'MCP & Cloud',
    color: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20',
    tags: ['Server-hosted MCP', 'IDE-hosted MCP', 'JIRA MCP', 'GitHub MCP', 'BrowserStack MCP', 'WindSurf Cascade', 'AWS Bedrock', 'AWS Lambda', 'EventBridge', 'DynamoDB', 'S3', 'ECR'],
  },
  {
    category: 'QA & Testing',
    color: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
    tags: ['Appium', 'Selenium', 'REST Assured', 'BrowserStack', 'CI/CD Automation', 'Rule Engines', 'JIRA', 'Zephyr'],
  },
];

const EXPERIENCE = [
  {
    role: 'Assistant System Engineer',
    company: 'Tata Consultancy Services (TCS)',
    period: '2024 – Present',
    highlights: [
      'Designed two separate agentic test-maintenance frameworks: Java/Spring Boot/LangGraph4j (server-hosted MCP) and Python LangGraph (IDE-hosted/local MCP via WindSurf Cascade).',
      '~80–87% reduction in nightly QE triage effort and ~50–70% LLM cost reduction delivered.',
      'Architected a supervisor-driven multi-agent workflow: Evidence, Triage, Fix, Bug Review, Test Writer, Escalation, and Feedback agents.',
      'Designed RAG using AWS Bedrock Knowledge Bases for execution history, functional docs, UI semantic knowledge, and JIRA history.',
      'Built automated BrowserStack MCP integration for screenshots, logs, videos, DOM snapshots.',
      'Integrated GitHub MCP for automated PR generation and JIRA MCP for defect creation + duplicate detection.',
      'Event-driven cloud architecture: AWS Lambda, EventBridge, S3, DynamoDB, Docker, AWS AgentCore, ECR, CloudWatch, Secrets Manager.',
      'Reusable Spring Boot automation components reduced project setup effort by 50%. Improved backend memory utilization by 60%.',
    ],
  },
];

function SkillBadge({ label, color }: { label: string; color: string }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-mono border ${color} whitespace-nowrap`}>
      {label}
    </span>
  );
}

function TimelineDot({ color }: { color: string }) {
  return (
    <div className="relative flex-shrink-0 w-4">
      <div className={`w-3 h-3 rounded-full border-2 ${color} bg-background absolute top-1 left-0.5`} />
      <div className="absolute top-4 left-[7px] bottom-0 w-px bg-border" />
    </div>
  );
}

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-30px' },
  transition: { delay, duration: 0.45 },
});

export default function Resume() {
  const resumeUrl = `${import.meta.env.BASE_URL}resume/Hari_Prasad_AI_Engineer_Resume.pdf`;

  return (
    <div className="max-w-4xl mx-auto space-y-14 pb-16">

      {/* Header */}
      <motion.div {...fadeUp()} className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border pb-8">
        <div>
          <h1 className="text-4xl font-bold font-mono tracking-tight text-foreground mb-2">
            Nunnagoppala Hari Prasad
          </h1>
          <div className="flex flex-wrap items-center gap-3 text-sm font-mono text-muted-foreground">
            <span className="flex items-center gap-1"><MapPin className="w-4 h-4 text-primary" /> Vijayawada, India</span>
            <span className="text-primary/50">•</span>
            <span className="text-primary">AI Engineer</span>
            <span className="text-primary/50">•</span>
            <span>2+ yrs production AI</span>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Open to opportunities
            </span>
          </div>
        </div>
        <a
          href={resumeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center h-10 px-5 font-mono text-sm font-bold text-primary border border-primary/50 hover:bg-primary/10 transition-colors rounded-md gap-2 flex-shrink-0"
        >
          <Download className="w-4 h-4" /> Download PDF
        </a>
      </motion.div>

      {/* Summary */}
      <motion.div {...fadeUp(0.05)} className="space-y-3">
        <h2 className="text-2xl font-bold font-mono flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-primary" /> Professional Summary
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          AI Engineer with 2+ years building production-grade agentic AI systems in Java and Python. Designed and shipped a
          dual-implementation (Spring Boot + LangGraph4j, and Python + LangGraph) agentic test-maintenance engine that autonomously
          triages and self-heals nightly mobile-web test failures, cutting manual QA triage effort by <strong className="text-foreground">~80–87%</strong> and
          LLM inference cost by <strong className="text-foreground">50–70%</strong> through a 3-tier cost-disciplined classification architecture.
          Strong foundation in RAG, multi-agent orchestration, CI/CD integration, and AWS.
        </p>
      </motion.div>

      {/* Skills */}
      <motion.div {...fadeUp(0.1)} className="space-y-6">
        <h2 className="text-2xl font-bold font-mono flex items-center gap-2">
          <Code2 className="w-5 h-5 text-primary" /> Technical Skills
        </h2>
        <div className="space-y-5">
          {SKILLS.map(({ category, tags, color }) => (
            <div key={category} className="p-5 bg-card border border-border rounded-xl space-y-3 hover:border-primary/20 transition-colors">
              <h3 className="font-mono text-xs uppercase tracking-wider text-muted-foreground">{category}</h3>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => <SkillBadge key={tag} label={tag} color={color} />)}
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Experience */}
      <motion.div {...fadeUp(0.12)} className="space-y-6">
        <h2 className="text-2xl font-bold font-mono flex items-center gap-2">
          <Layers className="w-5 h-5 text-primary" /> Professional Experience
        </h2>
        {EXPERIENCE.map(({ role, company, period, highlights }) => (
          <div key={role} className="flex gap-4">
            <TimelineDot color="border-primary" />
            <div className="pb-8 flex-1">
              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 mb-1">
                <h3 className="text-lg font-bold text-foreground">{role}</h3>
                <span className="font-mono text-sm text-primary flex-shrink-0">{period}</span>
              </div>
              <p className="text-sm font-mono text-muted-foreground mb-4">{company}</p>
              <ul className="space-y-2">
                {highlights.map((h, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.04 }}
                    className="flex gap-2 text-sm text-muted-foreground leading-relaxed"
                  >
                    <span className="text-primary/50 flex-shrink-0 mt-0.5">▸</span>
                    <span>{h}</span>
                  </motion.li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Project */}
      <motion.div {...fadeUp(0.14)} className="space-y-4">
        <h2 className="text-2xl font-bold font-mono flex items-center gap-2">
          <Server className="w-5 h-5 text-primary" /> Flagship Project
        </h2>
        <div className="border border-primary/20 bg-primary/5 rounded-xl p-6 space-y-5">
          <div className="flex flex-col md:flex-row md:items-baseline justify-between gap-2">
            <h3 className="text-lg font-bold text-foreground">Agentic Test-Maintenance Engine</h3>
            <span className="font-mono text-sm text-primary flex-shrink-0">2024–2025</span>
          </div>
          <p className="text-sm font-mono text-muted-foreground">Java (Spring Boot + LangGraph4j) & Python (LangGraph)</p>

          <div className="flex flex-wrap gap-2">
            {[
              'Per-failure triage: 15–25 min → 1–2 min (~90%)',
              'Locator/wait fix: 20–40 min → 3–5 min (~85%)',
              'Bug filed w/ evidence: 15 min → 1 min (~93%)',
            ].map((t) => (
              <span key={t} className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full font-mono text-xs">{t}</span>
            ))}
          </div>

          <ul className="space-y-2">
            {[
              'Architected end-to-end across a 10-node stateful LangGraph pipeline with a Reflexion self-correction loop and checkpointing for durable, resumable runs.',
              'Engineered a 3-tier failure classifier (deterministic rules → cross-run history cache → LLM only on the ambiguous remainder), plus per-task model routing, SHA-256 response caching, and a budget kill-switch.',
              'Automated locator/wait-sync remediation: BrowserStack MCP evidence gathering, deep DOM verification, draft PRs via GitHub MCP — with forbidden-path guardrails blocking CI/session edits.',
              'Built two MCP architectures — server-hosted (JIRA/GitHub/BrowserStack) for Java enabling unattended CI, and IDE-hosted via WindSurf Cascade for Python dev-time orchestration — unified by a JSON Agent Action Contract.',
            ].map((h, i) => (
              <li key={i} className="flex gap-2 text-sm text-muted-foreground leading-relaxed">
                <span className="text-primary/50 flex-shrink-0 mt-0.5">▸</span>
                <span>{h}</span>
              </li>
            ))}
          </ul>

          <div className="pt-2">
            <a
              href="https://github.com/Hari9704/Autonomous-agent-for-test-maintainance-"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 font-mono text-sm text-primary hover:underline"
            >
              <ExternalLink className="w-3.5 h-3.5" /> View on GitHub
            </a>
          </div>
        </div>
      </motion.div>

      {/* Education */}
      <motion.div {...fadeUp(0.16)} className="space-y-4">
        <h2 className="text-2xl font-bold font-mono flex items-center gap-2">
          <GraduationCap className="w-5 h-5 text-primary" /> Education
        </h2>
        <div className="flex gap-4">
          <TimelineDot color="border-muted-foreground" />
          <div className="bg-card border border-border rounded-xl p-5 flex-1">
            <h3 className="font-bold text-foreground">B.Tech in Computer Science & Engineering</h3>
            <p className="text-muted-foreground text-sm mt-1">2023 · CGPA: 7.9 / 10</p>
            <div className="mt-3 flex flex-wrap gap-3 text-sm text-muted-foreground font-mono">
              <span className="px-2 py-0.5 bg-muted/30 rounded border border-border text-xs">12th Grade: 98.2%</span>
              <span className="px-2 py-0.5 bg-muted/30 rounded border border-border text-xs">10th Grade: 100%</span>
            </div>
          </div>
        </div>
      </motion.div>

    </div>
  );
}
