import React from 'react';
import { Text } from 'react-native';
import { accents } from '@/constants/colors';
import { Alert, CodeBlock, NodeBox, OldNew, OptCard, Row, SectionCard } from './Blocks';

export const ALL_SECTION_IDS = [
  'final',
  'problem',
  'journey',
  'architecture',
  'arch1',
  'arch2',
  'arch3',
  'arch4',
  'nodes',
  'nd1',
  'nd2',
  'nd3',
  'deployment',
  'dep1',
  'dep2',
  'dep3',
  'dep4',
  'optimizations',
  'multiagent_lg',
  'ml1',
  'ml2',
  'ml3',
  'memory_final',
  'mf1',
  'mf2',
  'newtech',
  'nt1',
  'nt2',
  'nt3',
  'metrics_final',
  'mt1',
  'roadmap',
];

type Props = {
  open: Set<string>;
  onToggle: (id: string) => void;
};

export default function ArchitectureContent({ open, onToggle }: Props) {
  return (
    <>
      <SectionCard
        id="final"
        title="0. The System in ONE sentence"
        icon="target"
        color={accents.amber}
        open={open}
        onToggle={onToggle}
      >
        <Alert color={accents.amber} icon="zap">
          A nightly CI/CD-triggered, cloud-native agentic pipeline — built in
          Java (Spring Boot + LangGraph4j) and Python (LangGraph), deployed as
          a Docker container on AWS AgentCore, using 6 specialized sub-agents
          coordinated by a supervisor graph — that autonomously ingests
          mobile test failures across 4 streams (7-Eleven/7-Nine ×
          iOS/Android), semantically classifies them using a 3-tier
          cost-disciplined classifier backed by 4 Bedrock Knowledge Bases,
          generates deep-verified fixes with a self-correcting Reflexion
          loop, auto-raises PRs and JIRA bugs, writes draft test cases for
          flow changes, and gets smarter every night through reinforcement
          feedback learning — reducing manual QA triage effort by 88-95% at
          a cost of ~$2.20/night across all 4 streams.
        </Alert>
      </SectionCard>

      <SectionCard
        id="problem"
        title="1. The Problem — why this system exists"
        icon="alert-triangle"
        color={accents.red}
        open={open}
        onToggle={onToggle}
      >
        <OldNew
          oldLabel="BEFORE — manual QA nightmare"
          oldText="500+ test failures every night across 4 streams. 1-2 engineer-days of pure mechanical triage: read stack traces, open BrowserStack, watch videos, inspect DOM, decide bug vs locator vs timing, write JIRA, fix scripts, raise PRs. $4,167/night in engineer time wasted on pattern-matching a human shouldn't do."
          newLabel="AFTER — engineer's dream morning"
          newText="Agent runs 2AM-3AM. Engineer arrives at 9AM: 5 draft PRs (low risk, 90s each to review), 3 JIRA bugs filed with full evidence, 8 escalations via Slack. Total review: 90 min. Agent cost: $2.20. Engineer does real engineering work the rest of the day."
        />
        <Alert color={accents.green} icon="zap">
          Like replacing a human who manually sorts 1450 letters every night
          into 4 piles (locator fixes, bugs, data issues, unknowns) with a
          robotic sorting machine that does it in 15 minutes. The human still
          reviews the sorted piles every morning — but sorting is never
          manual again.
        </Alert>
      </SectionCard>

      <SectionCard
        id="journey"
        title="2. The Design Journey"
        icon="map"
        color={accents.orange}
        open={open}
        onToggle={onToggle}
      >
        <Row icon="circle">Started with: 10-node single LangGraph pipeline → basic triage, local run, manual trigger</Row>
        <Row icon="circle">Added: 3-tier cost-disciplined classifier (regex → SHA-256 cache → LLM) → 50-70% LLM cost reduction</Row>
        <Row icon="circle">Added: Reflexion self-correction loop → classification accuracy 65% → 89%</Row>
        <Row icon="circle">Added: DOM capture strategy (only failing screens, not full app) → targeted, cheap</Row>
        <Row icon="circle">Added: Cluster representative pattern (300 same-bug tests → 1 representative) → 99.7% fewer API calls</Row>
        <Row icon="circle">Added: Functional RAG (KB_FUNCTIONAL_DOCS) → fixes grounded in requirements</Row>
        <Row icon="circle">Added: 4 Bedrock Knowledge Bases → semantic memory, UI history, JIRA dedup</Row>
        <Row icon="circle">Added: Smart re-run decision engine → flaky vs real bug, no blind reruns</Row>
        <Row icon="circle">Added: 4-stream architecture (iOS/Android x 7Nine/7Eleven) → shared KBs, cross-platform learning</Row>
        <Row icon="circle">Added: AgentCore deployment (Docker → ECR → AgentCore) → fully cloud, no local machine</Row>
        <Row icon="star">Now adding: multi-agent via LangGraph supervisor pattern → 6 specialists, parallel execution</Row>
      </SectionCard>

      <SectionCard
        id="architecture"
        title="3. Complete System Architecture v3.0"
        icon="git-branch"
        color={accents.green}
        open={open}
        onToggle={onToggle}
      >
        <SectionCard
          id="arch1"
          title="The trigger chain — from CI to agent"
          icon="link"
          color={accents.teal}
          open={open}
          onToggle={onToggle}
          depth={1}
        >
          <CodeBlock color={accents.teal}>{`STREAM: 7-Eleven Android (x4 streams run simultaneously!)

GitHub Actions finishes nightly Appium suite
   ↓
Generates enriched-report.xlsx (failures only)
   ↓ aws s3 cp
S3: s3://7eleven-qa/reports/build-20260704.xlsx
   ↓ PutObject event
EventBridge: rule matches reports/*.xlsx
   ↓ routes to
Lambda: TriggerAgentLambda (wakes up, runs 2 seconds)
   ↓ checks idempotency table
DynamoDB: idempotency_table (build already running? skip!)
   ↓ calls
AgentCore Runtime: starts microVM with your Docker image
   ↓ pulls
ECR: maintenance-agent:latest (your Spring Boot jar)
   ↓ fetches secrets
Secrets Manager: OPENAI_KEY, BS_KEY, JIRA_TOKEN, GITHUB_TOKEN
   ↓
LangGraph4j SUPERVISOR GRAPH starts running!`}</CodeBlock>
        </SectionCard>

        <SectionCard
          id="arch2"
          title="The 21-node multi-agent graph — full topology"
          icon="share-2"
          color={accents.orange}
          open={open}
          onToggle={onToggle}
          depth={1}
        >
          <CodeBlock color={accents.orange}>{`SUPERVISOR AGENT (coordinator, Haiku model)
  |
  |--[PARALLEL FAN-OUT]-----+
  |                          |
EVIDENCE_AGENT         TRIAGE_AGENT
(BrowserStack MCP,     (DOM_DIFF,
 video keyframes,       Tier-1 rules,
 failure DOM,           history cache,
 network logs)          KB_EXEC_MEMORY)
  |                          |
  +--[MERGE back to supervisor]--+
  |
  v
SUPERVISOR routes by classification:
  |
  +--LOCATOR_CHANGE/WAIT_SYNC---> FIX_AGENT
  |                               (deep verify,
  |                                DOM validate,
  |                                draft PR,
  |                                BS verify run)
  |
  +--APP_BUG-------------------> BUG_REVIEW_AGENT
  |                               (JIRA dedup search,
  |                                clone if regression,
  |                                attach screenshots,
  |                                file draft JIRA)
  |
  +--FUNC_CHANGED--------------> TEST_WRITER_AGENT
  |                               (query func docs KB,
  |                                read new DOM,
  |                                generate draft test,
  |                                draft PR for review)
  |
  +--FLAKY/INFRA/TEST_DATA-----> ESCALATION_AGENT
  |                               (smart rerun decision,
  |                                Slack alert routing,
  |                                testng-exclude.xml gen)
  |
  v
FEEDBACK_AGENT (runs after ALL specialists complete)
  → persists corrections to 4 Knowledge Bases
  → updates DynamoDB flakiness + execution state
  → generates Agent Action Contract JSON
  → triggers 8AM Slack digest via EventBridge
  → all logs → CloudWatch → Prometheus dashboard`}</CodeBlock>
        </SectionCard>

        <SectionCard
          id="arch3"
          title="The 4 Bedrock Knowledge Bases — the semantic brain"
          icon="database"
          color={accents.mint}
          open={open}
          onToggle={onToggle}
          depth={1}
        >
          <CodeBlock color={accents.mint}>{`KB_EXECUTION_MEMORY  (S3 Vectors, sub-100ms)
  Source: FeedbackAgent writes after every resolved cluster
  Stores: error signature + classification + fix + human correction
  Used by: TriageAgent for semantic past-run lookup
  Benefit: Run 1 pays LLM, Run 10 hits cache. Free!

KB_FUNCTIONAL_DOCS   (OpenSearch Serverless)
  Source: Product team uploads requirement PDFs to S3
  Stores: feature requirements, UI specs, user stories
  Used by: TriageAgent (is this FUNC_CHANGED?)
           TestWriterAgent (what should new test do?)
  Benefit: Fixes grounded in reality, not just DOM!

KB_SEMANTIC_UI       (S3 Vectors, per-stream)
  Source: DomCaptureAgent uploads per Firebase deploy
  Stores: semantic screen descriptions per build version
  Used by: TriageAgent for cross-build semantic diff
  ISOLATION: by stream_id (iOS != Android DOM!)
  Benefit: "Did CheckoutScreen change semantically?"

KB_JIRA_HISTORY      (OpenSearch Serverless)
  Source: JIRA webhook → Lambda → ingest on ticket create/close
  Stores: past bug titles, descriptions, resolutions
  Used by: BugReviewAgent for deduplication
  Benefit: Regression detection → clone instead of duplicate!`}</CodeBlock>
        </SectionCard>

        <SectionCard
          id="arch4"
          title="The 3 DynamoDB tables — the fast memory"
          icon="zap"
          color={accents.teal}
          open={open}
          onToggle={onToggle}
          depth={1}
        >
          <CodeBlock color={accents.teal}>{`classification_cache    (PK: SHA-256 signature + stream_id)
  → Tier-2 exact match, <5ms lookup, no LLM!

test_execution_state    (PK: test_id + stream_id)
  → attempt_count, fix_history, flakiness_score
  → "This test failed 3 times → raise JIRA now!" decision

idempotency_table       (PK: build_id + stream_id)
  → prevents duplicate agent runs for same build
  → build_id already RUNNING? Lambda skips!`}</CodeBlock>
        </SectionCard>
      </SectionCard>

      <SectionCard
        id="nodes"
        title="4. The 6 Specialist Agents"
        icon="cpu"
        color={accents.orange}
        open={open}
        onToggle={onToggle}
      >
        <SectionCard
          id="nd1"
          title="Existing agents (upgraded from nodes)"
          icon="check-circle"
          color={accents.green}
          open={open}
          onToggle={onToggle}
          depth={1}
        >
          <NodeBox
            name="TRIAGE AGENT (was: ClassifyNode + ValidateNode)"
            icon="search"
            color={accents.teal}
            model="Claude Haiku 4.5 ($0.25/1M — cheapest!)"
            tools="Tier-1 regex, DOM_DIFF context, KB_EXECUTION_MEMORY, DynamoDB cache, Reflexion loop (max 3 rounds)"
          />
          <NodeBox
            name="EVIDENCE AGENT (was: EvidenceNode)"
            icon="eye"
            color={accents.mint}
            model="Claude Haiku 4.5 + Vision (video keyframe analysis)"
            tools="BrowserStack MCP (session, video, logs, DOM), FFmpeg keyframe extract, S3 failure-DOM reader"
          />
          <NodeBox
            name="FIX AGENT (was: ActionNode + FixVerifyNode)"
            icon="tool"
            color={accents.green}
            model="Claude Sonnet 4.6 (complex code gen needs this!)"
            tools="GitHub MCP, deep-verify (file+anchor+DOM), BS targeted re-run, forbidden-path guardrail"
          />
          <NodeBox
            name="BUG REVIEW AGENT (was: JiraNode + DeduplicationNode)"
            icon="alert-circle"
            color={accents.red}
            model="Claude Haiku 4.5 (template filling = simple!)"
            tools="JIRA MCP, KB_JIRA_HISTORY semantic search, screenshot attacher, clone-vs-new decision"
          />
        </SectionCard>

        <SectionCard
          id="nd2"
          title="Brand new agents"
          icon="star"
          color={accents.amber}
          open={open}
          onToggle={onToggle}
          depth={1}
        >
          <NodeBox
            name="TEST WRITER AGENT — Phase P3 unlocked!"
            icon="edit-3"
            color={accents.amber}
            model="Claude Sonnet 4.6 (writing new tests = complex!)"
            tools="KB_FUNCTIONAL_DOCS, new DOM snapshot, existing test style reader, GitHub MCP (draft PR)"
            isNew
          />
          <Alert color={accents.amber} icon="alert-triangle">
            For FUNC_CHANGED failures: instead of just raising a JIRA saying
            "test needs rewriting", the Test Writer Agent actually drafts the
            new test. Reads what the feature should do (from KB), reads new
            DOM (new element IDs), generates a page-object-style Appium test.
            3 days of manual test rewriting → 3 hours of review.
          </Alert>
          <NodeBox
            name="ESCALATION AGENT — smart routing"
            icon="git-merge"
            color={accents.orange}
            model="Rule-based (no LLM needed!)"
            tools="Flakiness index lookup (DynamoDB), smart re-run policy engine, Slack MCP, testng-exclude.xml generator"
            isNew
          />
          <Alert color={accents.orange} icon="zap">
            Like a hospital triage nurse who instantly decides — this patient
            needs ICU (APP_BUG → BugReview), this one needs stitches
            (LOCATOR_CHANGE → Fix), this one just needs rest (INFRA → Slack
            alert + retry). No doctor consultation needed for routing.
          </Alert>
        </SectionCard>

        <SectionCard
          id="nd3"
          title="Smart re-run decision engine"
          icon="repeat"
          color={accents.orange}
          open={open}
          onToggle={onToggle}
          depth={1}
        >
          <CodeBlock color={accents.orange}>{`SMART RE-RUN POLICY (no blind reruns!):

FLAKY_INFRA   (Appium driver fail, login step OTP)  → RETRY 3x immediately
SPORADIC      (StaleElement, intermittent)           → RETRY 2x immediately
WAIT_SYNC     (timing/loading)                       → RETRY 1x, then fix
LOCATOR_CHANGE (element ID renamed)                  → FIX FIRST, verify once
APP_BUG       (the 300 checkout tests!)              → NO RERUN! Exclude all
TEST_DATA     (expired promo codes)                  → NO RERUN! Fix data first
FUNC_CHANGED  (address page redesign)                → NO RERUN! Draft new test

// 300 checkout bug tests → agent generates testng-exclude.xml
// CI skips ALL 300 tomorrow night automatically!
// When JIRA-456 is fixed + closed → webhook re-enables them!`}</CodeBlock>
        </SectionCard>
      </SectionCard>

      <SectionCard
        id="deployment"
        title="5. AWS Deployment — where AgentCore fits"
        icon="cloud"
        color={accents.orange}
        open={open}
        onToggle={onToggle}
      >
        <SectionCard
          id="dep1"
          title="The building analogy — where every AWS service lives"
          icon="home"
          color={accents.teal}
          open={open}
          onToggle={onToggle}
          depth={1}
        >
          <CodeBlock color={accents.teal}>{`THINK OF AWS AS A SMART OFFICE BUILDING:

S3          = Floor B1: The Filing Room (stores all documents)
DynamoDB    = Floor B2: The Fast-Access Locker Room (instant lookup)
Secrets Mgr = Floor B3: The Safe/Vault (API keys locked away)

Lambda      = Ground Floor Reception: "An event happened! Quick task!"
EventBridge = The Intercom System: "S3 got a file! Notify Lambda NOW!"

ECR         = Floor 1: Docker Image Warehouse (boxed-up apps)
ECS/Fargate = Floor 2: The actual offices where work happens
AgentCore   = Floor 3: THE PREMIUM AI SUITE
              (Fargate microVMs + MCP Gateway + Memory + Observability)
              Your LangGraph4j agent runs HERE!

Bedrock     = Floor 4: The AI Brain Center
              (LLM calls, Knowledge Bases, Guardrails)

CloudWatch  = Building Management: CCTV + Alarms everywhere
IAM         = Security Badges: who can enter which floor

YOUR AGENT LIVES ON FLOOR 3 (AgentCore)!
It calls Floor 4 (Bedrock) for AI.
It stores files in Floor B1 (S3).
It reads fast data from Floor B2 (DynamoDB).
Triggered by Lambda at Ground Floor!`}</CodeBlock>
        </SectionCard>

        <SectionCard
          id="dep2"
          title="How to deploy your agent to AgentCore — step by step"
          icon="upload-cloud"
          color={accents.green}
          open={open}
          onToggle={onToggle}
          depth={1}
        >
          <OldNew
            oldLabel="WHERE IT RUNS TODAY"
            oldText="Someone runs java -jar maintenance-agent.jar on their laptop. Laptop sleeps = agent crashes. Dev goes on leave = no triage. 'It works on my machine' problem. Not production!"
            newLabel="WHERE IT WILL RUN (AgentCore)"
            newText="Docker container runs in AWS cloud permanently. Nobody's laptop involved ever. Triggered automatically by EventBridge. Runs 2AM, done by 3AM, nobody woke up."
          />
          <CodeBlock color={accents.green}>{`# STEP 1: Build your Spring Boot app as Docker image
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY target/maintenance-agent.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]

# STEP 2: Push to ECR (AWS Docker warehouse)
docker build -t maintenance-agent .
docker tag maintenance-agent:latest 123456789.dkr.ecr.ap-south-1.amazonaws.com/maintenance-agent:latest
docker push 123456789.dkr.ecr.ap-south-1.amazonaws.com/maintenance-agent:latest

# STEP 3: Deploy to AgentCore (2026 CLI way!)
agentcore configure \\
  --image 123456789.dkr.ecr.ap-south-1.amazonaws.com/maintenance-agent:latest \\
  --region ap-south-1 \\
  --name "maintenance-agent-7eleven"

agentcore launch
# AgentCore: creates microVM runtime, sets up MCP Gateway,
# enables CloudWatch observability. Done!

# STEP 4: Lambda triggers it (auto, no manual!)
# S3 upload → EventBridge → Lambda → AgentCore HTTP call
# Your agent runs! Returns result! Lambda saves to S3!`}</CodeBlock>
        </SectionCard>

        <SectionCard
          id="dep3"
          title="AgentCore's 4 built-in superpowers"
          icon="award"
          color={accents.mint}
          open={open}
          onToggle={onToggle}
          depth={1}
        >
          <Row icon="git-pull-request">
            <Text style={{ color: accents.mint, fontFamily: 'Inter_600SemiBold' }}>MCP Gateway</Text>
            {' — BrowserStack MCP + JIRA MCP + GitHub MCP all registered once in AgentCore Gateway. Agents discover and call tools via standard MCP protocol. Like a power strip where you plug all your tools.'}
          </Row>
          <Row icon="lock">
            <Text style={{ color: accents.green, fontFamily: 'Inter_600SemiBold' }}>Session Isolation (microVMs)</Text>
            {' — each agent run gets its own isolated microVM. One run crashes? Others unaffected. Like hotel rooms — guest in room 301 doesn\u2019t affect guest in room 302.'}
          </Row>
          <Row icon="bar-chart-2">
            <Text style={{ color: accents.teal, fontFamily: 'Inter_600SemiBold' }}>Built-in Observability</Text>
            {' — every LLM call, tool call, agent decision automatically traced to CloudWatch. See exactly why the agent classified "checkout_error" as LOCATOR_CHANGE.'}
          </Row>
          <Row icon="database">
            <Text style={{ color: accents.orange, fontFamily: 'Inter_600SemiBold' }}>Long-lived Memory</Text>
            {' — built-in session and cross-session memory management. Alternative to DynamoDB for conversational state.'}
          </Row>
        </SectionCard>

        <SectionCard
          id="dep4"
          title="The complete AWS deployment cost"
          icon="dollar-sign"
          color={accents.amber}
          open={open}
          onToggle={onToggle}
          depth={1}
        >
          <CodeBlock color={accents.amber}>{`MONTHLY DEPLOYMENT COST (all 4 streams, 30 nights):

AgentCore Runtime (microVMs, 25min x 4 streams x 30):
  ~3,000 vCPU-minutes x $0.000016/sec = $2.88/month

ECR storage (Docker image ~500MB):
  $0.10/GB/month x 0.5GB = $0.05/month

Lambda (TriggerAgentLambda, 4 streams x 30):
  120 invocations x 2 seconds = FREE (Lambda free tier!)

EventBridge:
  120 events/month = FREE (first 1M events free!)

DynamoDB (3 tables, low read/write):
  ~$1.50/month

S3 (reports, snapshots, outputs):
  ~$2.00/month

CloudWatch (logs + metrics):
  ~$3.00/month

Secrets Manager (7 secrets):
  7 x $0.40 = $2.80/month

─────────────────────────────────────
TOTAL AWS INFRA COST: ~$12.33/month
+ LLM/BS/Bedrock costs: ~$66/month
GRAND TOTAL: ~$78/month all-in

vs MANUAL: $125,010/month (1450 failures x 20min x $25/hr x 30)
SAVING: $124,932/month = $1,499,184/year`}</CodeBlock>
        </SectionCard>
      </SectionCard>

      <SectionCard
        id="optimizations"
        title="6. The 7 Optimizations"
        icon="trending-up"
        color={accents.rust}
        open={open}
        onToggle={onToggle}
      >
        <OptCard
          number="1"
          title="Prompt Caching — static system prompt across batch calls"
          saving="↓ 59-90% LLM cost"
          effort="1 day"
          color={accents.green}
        >
          <Row icon="zap">Static rules/categories in system prompt (never changes). Dynamic cluster data in user message. Cache hit rate: 7% → 84%.</Row>
        </OptCard>
        <OptCard
          number="2"
          title="Cluster Representative — 300 same bugs = one video/DOM fetched"
          saving="↓ 99.7% API calls for clustered failures"
          effort="2 days"
          color={accents.teal}
        >
          <Row icon="zap">ClusterNode picks one representative per error signature. Evidence fetched for one. Classification done once. Fix mapped to all 300. Biggest cost saving in the whole system.</Row>
        </OptCard>
        <OptCard
          number="3"
          title="Semantic Response Cache — same question = zero LLM call"
          saving="↓ 40-80% LLM calls"
          effort="3 days"
          color={accents.mint}
        >
          <Row icon="zap">Embed query → vector search → if similarity greater than 0.90 with cached result → return cached answer instantly. Zero LLM tokens.</Row>
        </OptCard>
        <OptCard
          number="4"
          title="Output Token Trimming — JSON-only structured output"
          saving="↓ 92% output tokens"
          effort="0.5 days"
          color={accents.orange}
        >
          <Row icon="zap">Wrong: "Analyze and explain in detail..." → 2000 token essay. Right: "Respond only with JSON schema" → 150 tokens. Output tokens cost 3-5x more than input.</Row>
        </OptCard>
        <OptCard
          number="5"
          title="Parallel Node Execution — all 40 clusters simultaneously"
          saving="↓ 75% time (90min → 22min)"
          effort="2 days"
          color={accents.teal}
        >
          <Row icon="zap">CompletableFuture fan-out inside EvidenceAgent. 40 BrowserStack API calls fire simultaneously — 4-6 seconds instead of 160 seconds sequentially.</Row>
        </OptCard>
        <OptCard
          number="6"
          title="Smart Model Routing — Haiku for simple, Sonnet only for complex"
          saving="↓ 60% LLM cost"
          effort="1 day"
          color={accents.amber}
        >
          <Row icon="zap">Classification → Claude Haiku 4.5 ($0.25/1M). Fix generation → Claude Sonnet 4.6 ($3/1M) only when needed. A scooter for grocery runs, a Ferrari only for the highway.</Row>
        </OptCard>
        <OptCard
          number="7"
          title="Execution Memory Growth — Day 1 costs $8, Day 90 costs $1.20"
          saving="↓ 86% LLM cost by Day 90"
          effort="ongoing"
          color={accents.green}
        >
          <Row icon="zap">KB_EXECUTION_MEMORY compounds. Run 1: everything to LLM. Run 10: 35% to KB cache. Run 90: 85% to KB cache. Gets cheaper every night automatically.</Row>
        </OptCard>
        <Alert color={accents.rust} icon="zap">
          All 7 stacked together: Baseline $18.50/run → Final (Day 90):{' '}
          <Text style={{ color: accents.green, fontFamily: 'Inter_700Bold' }}>$2.20/run</Text>
          . That is an{' '}
          <Text style={{ color: accents.amber, fontFamily: 'Inter_700Bold' }}>88% total cost reduction</Text>
          .
        </Alert>
      </SectionCard>

      <SectionCard
        id="multiagent_lg"
        title="7. Multi-Agent in LangGraph — not CrewAI, not AutoGen"
        icon="git-branch"
        color={accents.mint}
        open={open}
        onToggle={onToggle}
      >
        <SectionCard
          id="ml1"
          title="Why LangGraph wins (2026 data)"
          icon="check-circle"
          color={accents.green}
          open={open}
          onToggle={onToggle}
          depth={1}
        >
          <Row icon="repeat">Only framework with native cycles — Reflexion loop cannot be expressed cleanly in CrewAI or AutoGen</Row>
          <Row icon="bar-chart-2">3x less token overhead than CrewAI on identical workflows (real benchmark)</Row>
          <Row icon="coffee">LangGraph4j is the only Java-native agentic graph framework — no alternative exists</Row>
          <Row icon="search">Typed state + time-travel debugging → audit trail for banking clients</Row>
          <Row icon="trending-up">Surpassed CrewAI in GitHub stars in early 2026 (enterprise adoption)</Row>
          <Row icon="alert-triangle">AutoGen → maintenance mode (April 2026). Google ADK → GCP/Python only. OpenAI SDK → vendor lock-in.</Row>
        </SectionCard>

        <SectionCard
          id="ml2"
          title="Latest LangGraph4j features to use (2026)"
          icon="star"
          color={accents.orange}
          open={open}
          onToggle={onToggle}
          depth={1}
        >
          <Row icon="star">
            <Text style={{ color: accents.orange, fontFamily: 'Inter_600SemiBold' }}>PostgresSaver checkpointer</Text>
            {' — persistent checkpoints in RDS instead of in-memory. Agent crashes mid-run? Resumes from the exact node where it stopped.'}
          </Row>
          <Row icon="star">
            <Text style={{ color: accents.teal, fontFamily: 'Inter_600SemiBold' }}>Per-node timeouts (Q2 2026)</Text>
            {' — each node has its own timeout. BrowserStack fetch: 30s. LLM classification: 60s. No single stuck node blocks the pipeline.'}
          </Row>
          <Row icon="star">
            <Text style={{ color: accents.green, fontFamily: 'Inter_600SemiBold' }}>DeltaChannel (Q2 2026)</Text>
            {' — only send the delta (changed parts) instead of full state to every node. Massive context window reduction.'}
          </Row>
          <Row icon="star">
            <Text style={{ color: accents.amber, fontFamily: 'Inter_600SemiBold' }}>v2 Streaming</Text>
            {' — real-time token streaming per node. Watch the Fix Agent generate code token-by-token in the dashboard.'}
          </Row>
          <Row icon="star">
            <Text style={{ color: accents.rust, fontFamily: 'Inter_600SemiBold' }}>Sub-graph invocation</Text>
            {' — 6 specialist agents implemented as sub-graphs inside the main supervisor graph, each with its own state schema.'}
          </Row>
        </SectionCard>

        <SectionCard
          id="ml3"
          title="The supervisor pattern code"
          icon="code"
          color={accents.teal}
          open={open}
          onToggle={onToggle}
          depth={1}
        >
          <CodeBlock color={accents.teal}>{`// Supervisor pattern in LangGraph4j
// Each specialist = a compiled sub-graph

CompiledGraph triageSubGraph = new StateGraph<>(TriageState.class)
    .addNode("tier1_rules", tier1Node)
    .addNode("kb_lookup", kbLookupNode)
    .addNode("llm_classify", llmClassifyNode)
    .addNode("reflexion", reflexionNode)
    .addConditionalEdge("reflexion", reflexionRouter)
    .compile();

CompiledGraph fixSubGraph = new StateGraph<>(FixState.class)
    .addNode("generate_fix", fixGenerateNode)
    .addNode("deep_verify", deepVerifyNode)
    .addNode("bs_verify", bsVerifyNode)
    .addNode("create_pr", prCreateNode)
    .addHumanApprovalCheckpoint("human_review")  // PAUSES HERE!
    .compile();

// Main supervisor graph invokes sub-graphs as nodes!
StateGraph<SupervisorState> supervisorGraph = new StateGraph<>()
    .addNode("triage", triageSubGraph::invoke)
    .addNode("evidence", evidenceSubGraph::invoke)
    .addNode("fix", fixSubGraph::invoke)
    .addNode("bug_review", bugReviewSubGraph::invoke)
    .addNode("test_writer", testWriterSubGraph::invoke)
    .addNode("escalation", escalationSubGraph::invoke)
    .addEdge(START, List.of("triage", "evidence"))  // PARALLEL!
    .addConditionalEdge("supervisor", routeByClassification)
    .compile(new PostgresSaverCheckpointer(dataSource));
             // ^ persistent! survives crashes!`}</CodeBlock>
        </SectionCard>
      </SectionCard>

      <SectionCard
        id="memory_final"
        title="8. Complete Memory Architecture — 4 tiers"
        icon="database"
        color={accents.green}
        open={open}
        onToggle={onToggle}
      >
        <SectionCard
          id="mf1"
          title="Embeddings, explained simply"
          icon="grid"
          color={accents.green}
          open={open}
          onToggle={onToggle}
          depth={1}
        >
          <OldNew
            oldLabel="EXACT matching (SHA-256 — Tier-2)"
            oldText="Hash of 'btn_checkout not found' = ABC123. Hash of 'checkout button missing' = XYZ789. Different hashes = cache miss, even though they mean the same thing. Exact match is too rigid for natural language."
            newLabel="SEMANTIC matching via embeddings (KB)"
            newText="Both texts converted to 1536 numbers (their meaning coordinates). Similar numbers = cache hit. Semantic search beats exact match."
          />
          <CodeBlock color={accents.green}>{`// Real-life analogy for embeddings:
// GPS coordinates for MEANING instead of physical location!

Text: "checkout button not found"
Embedding: [0.82, -0.13, 0.45, ... 1536 numbers]

Text: "pay button missing from checkout"
Embedding: [0.79, -0.11, 0.47, ... 1536 numbers]
           (very close to the first one in meaning-space!)

Text: "login failed wrong password"
Embedding: [0.12, 0.67, -0.33, ... completely different numbers]
           (far away in meaning-space, different concept!)

// Cosine similarity between first two: 0.95 (close = same concept!)
// Cosine similarity between first and third: 0.21 (far = different!)

// KB uses Amazon Titan Embed Text v2 to create these numbers
// Stored in S3 Vectors (2026 service, sub-100ms queries!)
// Cost: $0.00002 per 1K tokens = basically free!`}</CodeBlock>
        </SectionCard>

        <SectionCard
          id="mf2"
          title="4-tier memory — which stores what"
          icon="layers"
          color={accents.teal}
          open={open}
          onToggle={onToggle}
          depth={1}
        >
          <CodeBlock color={accents.teal}>{`TIER 1 — FASTEST (in-memory, within a single run):
  LangGraph AgentState (typed, shared across all nodes)
  Cost: FREE | Speed: instant | Persists: NO (run only)

TIER 2 — FAST (DynamoDB, cross-run, exact match):
  classification_cache, test_execution_state, idempotency
  Cost: fractions of a cent | Speed: <5ms | Persists: YES

TIER 3 — SMART (Bedrock KB, cross-run, semantic match):
  KB_EXECUTION_MEMORY, KB_FUNCTIONAL_DOCS, KB_SEMANTIC_UI, KB_JIRA
  Cost: ~$0.001/query | Speed: ~100ms | Persists: YES + learns!

TIER 4 — DURABLE (PostgresSaver, crash-recovery):
  LangGraph checkpoint at every node boundary!
  Cost: ~$10/month RDS | Speed: ~50ms write | Persists: YES
  Agent crashes at node 11? Resumes from node 11!

// Analogy:
// Tier 1 = your working memory (what you are thinking right now)
// Tier 2 = your notebook (quick lookup of written notes)
// Tier 3 = your long-term memory (semantic associations)
// Tier 4 = your diary (permanent record, survives sleep!)`}</CodeBlock>
        </SectionCard>
      </SectionCard>

      <SectionCard
        id="newtech"
        title="9. New Tech to Add"
        icon="star"
        color={accents.amber}
        open={open}
        onToggle={onToggle}
      >
        <SectionCard
          id="nt1"
          title="LangSmith — observability for LangGraph"
          icon="eye"
          color={accents.teal}
          open={open}
          onToggle={onToggle}
          depth={1}
        >
          <OldNew
            oldLabel="WITHOUT LangSmith"
            oldText="Agent makes wrong classification. CloudWatch logs just say 'ClassifyNode completed. Category: LOCATOR_CHANGE.' No idea why. Debugging = guesswork."
            newLabel="WITH LangSmith"
            newText="LangSmith shows the full prompt, token counts, latency per node, the reasoning chain, which KB documents were retrieved, and the Reflexion critique. See exactly why the agent decided what it decided."
          />
          <Row icon="dollar-sign">Free tier: 5,000 traces/month. This system: ~120 traces/month (4 streams x 30 days). Completely free.</Row>
        </SectionCard>

        <SectionCard
          id="nt2"
          title="S3 Vectors — cheaper vector storage than OpenSearch"
          icon="dollar-sign"
          color={accents.green}
          open={open}
          onToggle={onToggle}
          depth={1}
        >
          <OldNew
            oldLabel="OpenSearch Serverless for KB"
            oldText="OpenSearch Serverless minimum: ~$700/month for an active collection. The agent queries vectors only 5 minutes per day at 2AM — 99.6% of the time it's idle."
            newLabel="S3 Vectors (2026 new service!)"
            newText="Native vector storage in S3. Pay only for storage + queries, not idle capacity. For a nightly agent: ~$5-15/month total — 98% cost reduction vs OpenSearch, sub-100ms warm query latency."
          />
        </SectionCard>

        <SectionCard
          id="nt3"
          title="Anthropic Message Batches API — 50% off for non-real-time calls"
          icon="clock"
          color={accents.orange}
          open={open}
          onToggle={onToggle}
          depth={1}
        >
          <OldNew
            oldLabel="Real-time LLM calls for everything"
            oldText="Every classification call is a synchronous real-time API request at full price. But the agent runs at 2AM — nobody is waiting for real-time responses."
            newLabel="Message Batches API for classification"
            newText="Submit all 40 classification calls as one batch. Processed within an hour, results by 3AM. Cost: 50% of standard pricing. Classification: $0.16 → $0.08."
          />
        </SectionCard>
      </SectionCard>

      <SectionCard
        id="metrics_final"
        title="10. The Final Numbers — before vs after"
        icon="bar-chart-2"
        color={accents.teal}
        open={open}
        onToggle={onToggle}
      >
        <SectionCard
          id="mt1"
          title="The complete comparison table"
          icon="award"
          color={accents.teal}
          open={open}
          onToggle={onToggle}
          depth={1}
        >
          <CodeBlock color={accents.teal}>{`METRIC                    BEFORE          AFTER (Day 90)    SAVING
─────────────────────────────────────────────────────────────────
Nightly triage time       1-2 days        25 min agent run  ↓ 97%
Human review time         1-2 days        90 min review     ↓ 88%
Per-failure triage         15-25 min       1-2 min review    ↓ 92%
Locator fix                20-40 min       2 min PR review   ↓ 93%
JIRA bug creation          15 min          1 min confirm     ↓ 93%
Test rewriting              3 days          3 hrs review     ↓ 90%

Agent cost per night       $0              $2.20 (Day 90)    -
Manual cost per night      $4,167          $0                ↓ 100%
LLM cost (Day 1)           -               $8.50             -
LLM cost (Day 90)          -               $1.20             ↓ 86%
Total annual cost           $1.52M manual   $803 agent        ↓ 99.9%

Classification accuracy    manual 100%*    agent 95% (D90)   -3%
(*human makes mistakes!)

False positive rate         ~5% human        ~3% agent         ↑ better
Escape rate (missed)        ~3%              ~3%               same

Streams covered              1 manual        4 streams         4x coverage
Time to first PR             ~4 hours        ~25 minutes       ↓ 90%`}</CodeBlock>
          <Alert color={accents.green} icon="award">
            The metric that matters most:{' '}
            <Text style={{ color: accents.amber, fontFamily: 'Inter_700Bold' }}>engineer happiness.</Text>
            {' '}Converting mechanical triage time into creative engineering time is what makes great engineers stay. This system doesn't just save money — it makes the QA team's work meaningful.
          </Alert>
        </SectionCard>
      </SectionCard>

      <SectionCard
        id="roadmap"
        title="11. Implementation Roadmap"
        icon="calendar"
        color={accents.orange}
        open={open}
        onToggle={onToggle}
      >
        <CodeBlock color={accents.orange}>{`PHASE 1 — Cloud Deployment (Week 1-2)
  → Dockerize Spring Boot LangGraph4j app
  → Push to ECR, deploy to AgentCore
  → Wire GitHub Actions → S3 → EventBridge → Lambda → AgentCore
  → Add Secrets Manager for all API keys
  → RESULT: Same agent, now cloud-hosted! No laptop needed!

PHASE 2 — Parallel Execution (Week 3)
  → CompletableFuture fan-out inside EvidenceAgent
  → Parallel cluster processing inside TriageAgent
  → Add PostgresSaver checkpointer (crash recovery!)
  → RESULT: 90min → 40min. Zero architecture change!

PHASE 3 — Knowledge Bases + Semantic Memory (Week 4-5)
  → Create 4 Bedrock KBs (using S3 Vectors where possible)
  → Update FeedbackAgent to write to KB_EXECUTION_MEMORY
  → Update TriageAgent to query KB before LLM
  → Add semantic response cache
  → RESULT: Day 1→Day 30 cost drops 60%!

PHASE 4 — Multi-Agent Refactor (Week 6-8)
  → Extract FIX_AGENT as sub-graph
  → Extract EVIDENCE_AGENT as parallel sub-graph
  → Add TEST_WRITER_AGENT (Phase P3 unlocked!)
  → Add ESCALATION_AGENT with smart re-run engine
  → RESULT: 40min → 15min. New capability: auto test rewriting!

PHASE 5 — Full Autonomy (Month 3+)
  → Enable AGENT_AUTOPR_ENABLED=true
  → Enable JIRA_DIRECT_EXECUTION=true
  → 4-phase trust rollout (reporting → assisted → controlled → full)
  → Target: <3% escape rate before full autonomy
  → RESULT: Engineer reviews PRs over morning chai only!

PHASE 6 — Intelligence Maturity (Month 6)
  → KB_EXECUTION_MEMORY has 3000+ documents
  → LLM cost: $1.20/run (86% cheaper than Day 1)
  → Accuracy: 95%+ (human-correction feedback compounded)
  → System is a domain expert for your specific app!`}</CodeBlock>
        <Alert color={accents.teal} icon="target">
          The final architectural decision:{'\n\n'}
          Framework: LangGraph4j (Java) + LangGraph (Python) — not CrewAI, not AutoGen, not ADK{'\n'}
          Multi-agent: Supervisor pattern inside LangGraph — 6 specialist sub-graphs{'\n'}
          Deployment: Docker → ECR → AgentCore Runtime (the AI floor of the AWS building!){'\n'}
          Memory: 4-tier (AgentState + DynamoDB + Bedrock KB + PostgresSaver){'\n'}
          Optimizations: all 7 stacked — $18.50 → $2.20/run final cost{'\n'}
          New services: S3 Vectors + Message Batches API + LangSmith + PostgresSaver{'\n'}
          Result: the only system combining all these pieces — genuinely novel.
        </Alert>
      </SectionCard>
    </>
  );
}
