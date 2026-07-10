# Agentic QA Architecture

An exploration of an autonomous, agentic test-maintenance system for mobile QA: when nightly test failures come in, LLM agents cluster, classify, and route each failure to a fix, a bug ticket, a new test draft, or a smart re-run/escalation policy — instead of a human triaging every failure by hand.

The project has two parts:
- **`artifacts/mobile`** — an interactive mobile showcase of the architecture (idea/reference only; do not treat as the implementation).
- **`agentic-qa-system/`** — the real, runnable Python + LangGraph implementation of the same system (POC-quality, structured like production code). See `agentic-qa-system/README.md` for its architecture, cost optimizations, and directory layout.

## Run & Operate

- `agentic-qa-system` runs as the `Agentic QA Service` workflow (FastAPI + uvicorn on `$PORT`). Visit `/docs` for interactive API docs.
- `cd agentic-qa-system && python -m scripts.run_pipeline --stream 7eleven-android` — run the pipeline once from the CLI, no server needed.
- `cd agentic-qa-system && python -m pytest` — run the Python test suite (clustering, tier-1 rule classification, full LangGraph smoke test).
- `pnpm --filter @workspace/api-server run dev` — run the Node API server (port 5000), used by other artifacts.
- `pnpm run typecheck` / `pnpm run build` — full typecheck / build across all TS packages.

## Stack

- **`agentic-qa-system/`**: Python 3.12, LangGraph + LangChain-core, FastAPI/uvicorn, Pydantic, Chroma (local persistent client, on-disk vector store), SQLite (local relational state), Anthropic/OpenAI (optional — see below).
- **`artifacts/mobile`**: Expo / React Native.
- Rest of the monorepo: pnpm workspaces, Node.js 24, TypeScript 5.9, Express 5, PostgreSQL + Drizzle ORM. See the `pnpm-workspace` skill.

## Where things live

- `agentic-qa-system/app/graph/` — LangGraph nodes (evidence, triage, fix, bug_review, test_writer, escalation, feedback) and the compiled supervisor graph (`supervisor.py`).
- `agentic-qa-system/app/memory/` — the 4 semantic knowledge bases (Chroma) and the 3 state-tracking tables (SQLite), standing in for the original design's Bedrock KBs / DynamoDB tables.
- `agentic-qa-system/app/integrations/` — GitHub / Jira / Slack / BrowserStack adapters, each with a real-API path and a simulated fallback.
- `agentic-qa-system/app/pipeline.py` — top-level run orchestration (parse → cluster → run graph per cluster → aggregate report).
- `agentic-qa-system/data/sample_reports/` — hand-written sample failure data (no live failure feed yet).

## Architecture decisions

- No real third-party integrations are wired up by default. Every external call (LLM, GitHub, Jira, Slack, BrowserStack) goes through an adapter that uses the real API when credentials are present and otherwise returns a clearly-labeled simulated response with the same shape — the graph runs identically either way. Add credentials later (see `agentic-qa-system/.env.example`) with no code changes.
- Bedrock Knowledge Bases → local Chroma collections; DynamoDB tables → local SQLite. Both are on-disk under `agentic-qa-system/data/` and gitignored (runtime state, not source).
- Even once real GitHub/Jira credentials are added, everything opens as a draft PR / ticket for human review — no auto-merge, no direct-execution mode, by design.

## Product

Given a nightly failure report (JSON/XLSX), the system clusters similar failures, classifies each cluster's root cause through a 3-tier classifier (rules → cached exact match → LLM with a bounded self-correction loop), and produces: fix PRs for locator/wait issues, deduped Jira bugs for app bugs, draft test PRs for legitimate functional changes, and a rule-based re-run/escalation policy (with Slack alerts) for flaky/sporadic/data-related failures. Outcomes feed back into semantic memory so future runs get cheaper and more accurate.

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- `artifacts/mobile` is the architecture showcase — don't modify it when working on `agentic-qa-system/`, and vice versa; they are intentionally decoupled (diagram vs. implementation).
- The `Agentic QA Service` workflow is a manually configured Python workflow (not an artifact — no native Python artifact type exists yet), so it won't show up in `listArtifacts()`.
- After code changes to `agentic-qa-system/`, restart the `Agentic QA Service` workflow before testing via curl/`/docs`.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
- See `agentic-qa-system/README.md` for the Python system's architecture diagram, cost-optimization list, and how to add real credentials.
