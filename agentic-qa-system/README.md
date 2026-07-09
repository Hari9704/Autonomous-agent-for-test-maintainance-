# Agentic QA Test-Maintenance System

A production-shaped (but explicitly **proof-of-concept**) implementation of
the autonomous mobile-QA test-maintenance architecture: a LangGraph
multi-agent pipeline that ingests nightly failure reports, clusters them,
triages each cluster through a 3-tier classifier, and routes to one of four
specialist agents -- Fix, Bug Review, Test Writer, or Escalation -- before
writing the outcome back into semantic memory.

This is the real implementation behind the interactive architecture diagram
shown in the mobile app's "Agentic QA Architecture" reference tab. That
mobile artifact documents the *idea*; this directory is the *code*.

## Why everything runs out of the box with zero credentials

No third-party accounts are wired up yet -- no LLM API key, no GitHub/Jira/
Slack tokens, no BrowserStack credentials, no managed vector DB. Every
external dependency sits behind a small adapter interface
(`app/integrations/base.py`, `app/llm.py`) that:

1. Calls the **real** API if credentials are present in the environment.
2. Otherwise falls back to a clearly-labeled **simulated** response with the
   exact same shape, so the graph, cost tracking, and API responses all
   exercise identical code paths either way.

Add real credentials later (`.env.example` lists every variable) and the
same code starts making live calls -- no code changes required.

The two "AWS-managed" pieces from the original architecture doc (4 Bedrock
Knowledge Bases, 3 DynamoDB tables) are reimplemented locally so the whole
system runs inside this Repl:

| Architecture doc concept | This implementation |
|---|---|
| 4 Bedrock Knowledge Bases | 4 local Chroma collections (`app/memory/knowledge_bases.py`), on-disk under `data/chroma/` |
| 3 DynamoDB tables | SQLite (`app/memory/state_store.py`), on-disk at `data/state_store.db` |
| Bedrock/Claude models | `app/llm.py` `LLMRouter` -- Anthropic or OpenAI, your own key |

## Architecture

```
Failure report (JSON/XLSX)
        │
        ▼
  Ingestion + Clustering  (app/ingestion/)
        │  one representative failure per cluster (cost optimization #2)
        ▼
┌───────────────────────── LangGraph cluster graph (app/graph/) ─────────────────────────┐
│                         START                                                          │
│                    ╱          ╲                                                        │
│              evidence        triage  (3-tier classifier + bounded Reflexion loop)      │
│           (BrowserStack)          │                                                    │
│                                    ▼                                                    │
│                    supervisor routes by classification category                        │
│           ╱             │              │                 ╲                            │
│         fix        bug_review     test_writer          escalation                      │
│    (GitHub PR)    (Jira, dedup)   (GitHub PR)      (rule-based re-run policy, Slack)    │
│           ╲             │              │                 ╱                             │
│                              feedback                                                  │
│                    (writes outcome to KB_EXECUTION_MEMORY)                             │
│                                  │                                                      │
│                                 END                                                     │
└──────────────────────────────────────────────────────────────────────────────────────┘
        │
        ▼
  RunReport + Agent Action Contract  (app/pipeline.py, served via FastAPI)
```

Classification categories and their routing/re-run policy
(`app/graph/escalation.py`):

| Category | Routed to | Re-run policy |
|---|---|---|
| `LOCATOR_CHANGE` | Fix Agent | Fix first, verify once |
| `WAIT_SYNC` | Fix Agent | Retry once, then fix |
| `APP_BUG` | Bug Review Agent | No re-run, exclude from CI |
| `FUNC_CHANGED` | Test Writer Agent | No re-run, draft new test |
| `FLAKY_INFRA` | Escalation Agent | Retry immediately, 3x |
| `SPORADIC` | Escalation Agent | Retry immediately, 2x |
| `TEST_DATA` | Escalation Agent | No re-run, fix test data |
| `UNKNOWN` | Escalation Agent | No re-run, exclude + alert |

## Cost optimizations implemented

1. **Prompt caching** -- static system prompts sent with Anthropic
   `cache_control: ephemeral` (`app/llm.py`).
2. **Cluster representative** -- evidence + classification run once per
   cluster, broadcast to every member (`app/ingestion/clustering.py`).
3. **Semantic response cache** -- Chroma-backed near-duplicate query cache,
   independent of the exact-match SQLite cache (`app/memory/semantic_cache.py`).
4. **Output token trimming** -- every LLM call demands JSON-only responses
   against an explicit schema (`app/cost/optimizer.py::enforce_json_only`).
5. **Parallel cluster execution** -- clusters are processed concurrently via
   `asyncio.gather` with a bounded semaphore (`app/pipeline.py`).
6. **Smart model routing** -- cheap tier (classification, ticket text) vs.
   deep tier (code/test generation) (`app/llm.py::LLMRouter.model_for`).
7. **Execution memory growth** -- every completed cluster is written back to
   `KB_EXECUTION_MEMORY`, making Tier-2/Tier-3 cache hits more likely (and
   LLM spend lower) on every subsequent run (`app/graph/feedback.py`).

## Running it

The FastAPI service runs as the `Agentic QA Service` Replit workflow. Once
it's up:

```bash
# Interactive API docs (trigger + inspect runs from the browser):
open $REPLIT_DEV_DOMAIN/docs   # or the equivalent Repl preview URL

# Or from the shell:
curl -X POST http://localhost:$PORT/knowledge-bases/seed
curl -X POST http://localhost:$PORT/runs -H 'Content-Type: application/json' \
  -d '{"stream": "7eleven-android"}'
curl http://localhost:$PORT/runs/<run_id>
```

Or run the whole pipeline once from the CLI, no server needed:

```bash
python -m scripts.run_pipeline --stream 7eleven-android
```

Run the test suite:

```bash
python -m pytest
```

## Adding real credentials

Copy the variables you want from `.env.example` into Replit Secrets (never
commit real credentials). Nothing needs to be re-deployed or re-coded --
each adapter checks for its credentials at call time and switches from
simulated to live automatically. Recommended order if you want to make
this real:

1. `ANTHROPIC_API_KEY` or `OPENAI_API_KEY` -- unlocks real classification,
   fix synthesis, bug summaries, and test drafting.
2. `GITHUB_TOKEN` + `QA_AGENT_GITHUB_REPO` -- real draft PRs instead of
   simulated URLs.
3. `JIRA_BASE_URL` / `JIRA_EMAIL` / `JIRA_API_TOKEN` -- real bug tickets.
4. `SLACK_BOT_TOKEN` -- real escalation alerts.
5. `BROWSERSTACK_USERNAME` / `BROWSERSTACK_ACCESS_KEY` -- real session
   video/log evidence instead of a simulated summary.

## Directory layout

```
agentic-qa-system/
  app/
    config.py            settings (env-var driven, safe defaults)
    models.py             Pydantic schemas shared by every layer
    llm.py                 provider-agnostic LLM client + simulated fallback
    pipeline.py            top-level run orchestration
    main.py                 FastAPI app
    memory/                Chroma knowledge bases, SQLite state store, semantic cache
    integrations/           BrowserStack / GitHub / Jira / Slack adapters
    ingestion/               report parsing + clustering
    cost/                    cost tracking + optimization helpers
    graph/                   LangGraph nodes + compiled supervisor graph
    prompts/                  prompt templates
  data/
    sample_reports/           demo failure data (POC has no live failure feed yet)
    chroma/, runs/, state_store.db   gitignored runtime state
  scripts/
    run_pipeline.py            CLI demo runner
    seed_knowledge_bases.py    seeds demo KB documents
  tests/                        pytest suite (clustering, tier-1 rules, full graph smoke test)
```

## Known POC limitations

- No real failure feed yet -- `data/sample_reports/` is hand-written sample
  data standing in for a nightly Appium/BrowserStack export.
- No LLM key configured by default -- classification, fix synthesis, bug
  summaries, and test drafts run through `SimulatedLLM` until you add one.
- Runs are held in memory + a JSON file per run under `data/runs/`; there is
  no multi-worker/production job queue.
- `QA_AGENT_AUTOPR_ENABLED` and `QA_AGENT_JIRA_DIRECT_EXECUTION` default to
  `False` intentionally -- even once real GitHub/Jira credentials are added,
  everything opens as a **draft** PR / ticket for human review rather than
  auto-merging.
