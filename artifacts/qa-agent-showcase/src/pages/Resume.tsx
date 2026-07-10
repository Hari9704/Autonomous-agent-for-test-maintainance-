import React from 'react';
import { Download, MapPin, Briefcase, GraduationCap, Code2, Layers, Server } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Resume() {
  const resumeUrl = `${import.meta.env.BASE_URL}resume/Hari_Prasad_AI_Engineer_Resume.pdf`;

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-16">
      
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border pb-8">
        <div>
          <h1 className="text-4xl font-bold font-mono tracking-tight text-foreground mb-2">
            Nunnagoppala Hari Prasad
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-muted-foreground font-mono text-sm">
            <span className="flex items-center gap-1">
              <MapPin className="w-4 h-4 text-primary" />
              Vijayawada, India
            </span>
            <span className="text-primary">•</span>
            <span>AI Engineer</span>
          </div>
        </div>
        <a 
          href={resumeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center h-10 px-4 font-mono text-sm font-bold text-primary border border-primary/50 hover:bg-primary/10 transition-colors rounded-md gap-2"
        >
          <Download className="w-4 h-4" />
          Download PDF
        </a>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <h2 className="text-2xl font-bold font-mono flex items-center gap-2 text-foreground">
          <Briefcase className="w-5 h-5 text-primary" />
          Professional Summary
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          AI Engineer with 2+ years of experience building production-grade agentic AI systems in both Java and Python. Designed and shipped a dual-implementation (Spring Boot + LangGraph4j, and Python + LangGraph) agentic test-maintenance engine that autonomously triages and self-heals nightly mobile-web test failures, cutting manual QA triage effort by ~80-87% and LLM inference cost by 50-70% through a 3-tier cost-disciplined classification architecture. Strong foundation in RAG, multi-agent orchestration, CI/CD integration, and AWS.
        </p>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-4"
      >
        <h2 className="text-2xl font-bold font-mono flex items-center gap-2 text-foreground">
          <Code2 className="w-5 h-5 text-primary" />
          Technical Skills
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2 bg-card border border-border rounded-lg p-5">
            <h3 className="font-bold font-mono text-sm uppercase text-primary">Languages & Frameworks</h3>
            <p className="text-muted-foreground text-sm">Java, Python, SQL, JavaScript</p>
            <p className="text-muted-foreground text-sm">Spring AI, Spring Boot 3, Docker, AWS, Generative AI</p>
          </div>
          <div className="space-y-2 bg-card border border-border rounded-lg p-5">
            <h3 className="font-bold font-mono text-sm uppercase text-primary">AI & Multi-Agent</h3>
            <p className="text-muted-foreground text-sm">Agentic AI, LangGraph, LangGraph4j, RAG, Multi-Agent Orchestration, Model Context Protocol (MCP), Reflexion (Self-Correction Loops), Prompt Engineering, LLM Orchestration, Google ADK, LangChain, Vector Databases</p>
          </div>
          <div className="space-y-2 bg-card border border-border rounded-lg p-5">
            <h3 className="font-bold font-mono text-sm uppercase text-primary">MCP & Cloud</h3>
            <p className="text-muted-foreground text-sm">Server-hosted MCP (JIRA, GitHub, BrowserStack), IDE-hosted/Local MCP (WindSurf Cascade)</p>
          </div>
          <div className="space-y-2 bg-card border border-border rounded-lg p-5">
            <h3 className="font-bold font-mono text-sm uppercase text-primary">QA Automation & Tools</h3>
            <p className="text-muted-foreground text-sm">Appium, Selenium, REST Assured, BrowserStack, CI/CD Automation, Rule Engines, Git, GitLab, JIRA, Zephyr, GitHub</p>
          </div>
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-8"
      >
        <h2 className="text-2xl font-bold font-mono flex items-center gap-2 text-foreground">
          <Layers className="w-5 h-5 text-primary" />
          Professional Experience
        </h2>
        
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between">
            <h3 className="text-lg font-bold text-foreground">Assistant System Engineer</h3>
            <span className="font-mono text-sm text-primary">2024 - Present</span>
          </div>
          <p className="text-sm font-mono text-muted-foreground">Tata Consultancy Services (TCS)</p>
          <ul className="list-disc list-outside pl-5 space-y-2 text-muted-foreground text-sm leading-relaxed marker:text-primary/50">
            <li>Designed and built two separate agentic test-maintenance frameworks: Java/Spring Boot/LangGraph4j (server-hosted MCP) and Python LangGraph (IDE-hosted/local MCP via WindSurf Cascade).</li>
            <li>Delivered ~80-87% reduction in nightly QE triage effort and ~50-70% LLM cost reduction.</li>
            <li>Contributed to Algolia search implementation and MongoDB query optimization on a separate client-facing application.</li>
            <li>Architected a supervisor-driven multi-agent workflow consisting of Evidence, Triage, Fix, Bug Review, Test Writer, Escalation, and Feedback agents.</li>
            <li>Built the orchestration layer using LangGraph4j (Java) and LangGraph (Python).</li>
            <li>Designed Retrieval-Augmented Generation (RAG) using AWS Bedrock Knowledge Bases for execution history, functional documentation, UI semantic knowledge, and JIRA history.</li>
            <li>Implemented semantic search and vector retrieval to improve AI decision-making accuracy.</li>
            <li>Built automated BrowserStack MCP integration to collect screenshots, logs, videos, and DOM snapshots.</li>
            <li>Integrated GitHub MCP for automated Pull Request generation, and JIRA MCP for automated defect creation and duplicate detection.</li>
            <li>Designed event-driven cloud architecture using AWS Lambda, EventBridge, Amazon S3, DynamoDB, Docker, AWS AgentCore, ECR, CloudWatch, and Secrets Manager.</li>
            <li>Implemented intelligent failure classification using rule-based filtering, semantic retrieval, and LLM reasoning.</li>
            <li>Designed Reflexion-based self-correction workflows to improve autonomous decision accuracy.</li>
            <li>Applied cost optimization techniques including semantic caching, prompt caching, model routing, parallel execution, and cluster-based failure analysis.</li>
            <li>Reduced manual regression maintenance effort by approximately 90% while significantly lowering AI inference costs.</li>
            <li>Designed reusable Spring Boot automation components for enterprise applications; reduced project setup effort by 50%.</li>
            <li>Improved backend memory utilization by 60% using optimized application architecture.</li>
            <li>Integrated automated CI/CD pipelines for build, testing, and deployment; designed backend indexing workflows using Spring Batch and Spring MVC.</li>
            <li>Developed optimized MongoDB queries for large-scale search indexing; built data transformation pipelines for Algolia indexing.</li>
          </ul>
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="space-y-6"
      >
        <h2 className="text-2xl font-bold font-mono flex items-center gap-2 text-foreground">
          <Server className="w-5 h-5 text-primary" />
          Project Experience
        </h2>
        
        <div className="border border-border bg-card/50 rounded-xl p-6 space-y-4">
          <div className="flex flex-col md:flex-row md:items-baseline justify-between mb-4">
            <h3 className="text-lg font-bold text-foreground">Agentic Test-Maintenance Engine</h3>
            <span className="font-mono text-sm text-primary">2024-2025</span>
          </div>
          <p className="text-sm font-mono text-muted-foreground mb-4">Java (Spring Boot + LangGraph4j) & Python (LangGraph)</p>
          
          <div className="flex flex-wrap gap-3 mb-6">
            <span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded font-mono text-xs">Per-failure triage: 15-25 min → 1-2 min (~90%)</span>
            <span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded font-mono text-xs">Locator/wait fix: 20-40 min → 3-5 min (~85%)</span>
            <span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded font-mono text-xs">Bug filed w/ evidence: 15 min → 1 min (~93%)</span>
          </div>

          <ul className="list-disc list-outside pl-5 space-y-2 text-muted-foreground text-sm leading-relaxed marker:text-primary/50">
            <li>Architected an end-to-end agentic system across a 10-node stateful LangGraph pipeline (ingest, cluster, evidence-gathering, classify, validate, action, report) with a Reflexion self-correction loop and checkpointing for durable, resumable runs.</li>
            <li>Engineered a 3-tier failure classifier (deterministic rules → cross-run history cache → LLM only on the ambiguous remainder), plus per-task model routing, SHA-256 response caching, and a budget kill-switch for cost discipline.</li>
            <li>Automated locator/wait-sync remediation: gathering DOM/screenshots/BrowserStack evidence via BrowserStack MCP, deep-verifying fixes against the captured DOM, and opening draft PRs via GitHub MCP — with forbidden-path guardrails blocking edits to CI config, hooks, or driver/session code.</li>
            <li>Built two distinct MCP architectures — server-hosted (JIRA/GitHub/BrowserStack MCP) for Java/LangGraph4j enabling unattended CI, and IDE-hosted/local via WindSurf Cascade for Python/LangGraph enabling secure dev-time orchestration — unified by a JSON Agent Action Contract; every PR and JIRA/Zephyr draft requires human approval, neither agent ever auto-merges.</li>
          </ul>
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="space-y-4"
      >
        <h2 className="text-2xl font-bold font-mono flex items-center gap-2 text-foreground">
          <GraduationCap className="w-5 h-5 text-primary" />
          Education
        </h2>
        <div className="bg-card border border-border rounded-lg p-5">
          <h3 className="font-bold text-foreground">Bachelor of Technology in Computer Science & Engineering</h3>
          <p className="text-muted-foreground text-sm mt-1">2023 • CGPA: 7.9/10</p>
          <div className="mt-3 flex gap-4 text-sm text-muted-foreground font-mono">
            <span>12th Grade: 98.2%</span>
            <span className="text-primary">•</span>
            <span>10th Grade: 100%</span>
          </div>
        </div>
      </motion.div>

    </div>
  );
}