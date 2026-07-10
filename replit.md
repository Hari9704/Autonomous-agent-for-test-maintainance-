# Autonomous QA Agent Showcase

A client-facing product site for an autonomous multi-agent test-maintenance system: it explains the architecture, shows real business-impact metrics, and sells paid API/MCP access to the underlying classification agent.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (mounted at `/api`)
- `pnpm --filter @workspace/qa-agent-showcase run dev` — run the marketing/product site (mounted at `/`)
- `pnpm run typecheck` — full typecheck across all packages (use this to verify `qa-agent-showcase`/`api-server`; its Vite `build` requires `PORT`/`BASE_PATH` env and will fail from a bare shell by design)
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec after editing `lib/api-spec/openapi.yaml`
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5, `@modelcontextprotocol/sdk` (MCP server)
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4` in shared libs; `api-server` also depends on plain `zod` for MCP tool schemas), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Frontend: React + Vite, wouter routing, framer-motion, recharts, shadcn/ui, Tailwind v4
- Build: esbuild (CJS bundle)

## Where things live

- `agentic-qa-system/` — reference Python/LangGraph implementation the site's content (pipeline stages, classifier rules, metrics) is sourced from. Not installed/runnable in this workspace; it exists as source-of-truth content, not a live service.
- `artifacts/qa-agent-showcase/` — the product site. Pages: `/` (home/landing), `/flow` (pipeline diagram), `/learn`, `/metrics`, `/get-mcp` (pricing + mock checkout + API key issuance), `/resume`, `/contact`.
- `artifacts/api-server/` — Express API. `src/routes/access.ts` (mock purchase + gated classify endpoint), `src/routes/mcp.ts` + `src/mcp/server.ts` (MCP server, stateless per-request), `src/lib/classifier.ts` (real tier-1 regex classifier), `src/lib/apiKeys.ts` (key issuance/lookup).
- `lib/db/src/schema/apiKeys.ts` — `api_keys` table backing both the REST gate and the MCP gate.
- `lib/api-spec/openapi.yaml` — source of truth for `/healthz` and the `/access/*` endpoints; run codegen after editing.

## Architecture decisions

- **MCP access is a real, working MCP server** at `POST /api/mcp` (Streamable HTTP, stateless — a fresh `McpServer` + transport per request), not a stub. It exposes `get_architecture_overview`, `classify_test_failure`, `get_cost_metrics`, gated by an `x-api-key` header checked against `api_keys`.
- **"Buying access" is an explicitly mocked $5 checkout** — no payment processor is integrated. `POST /access/purchase` instantly issues an API key. The `/get-mcp` page copy says this plainly so visitors aren't misled.
- **Orval + zod v3 constraint**: do not use `format: email` (or other formats orval maps to zod v4 top-level validators like `zod.email()`) in `openapi.yaml` — this project pins `zod` v3, which doesn't have those functions, and codegen's post-build `typecheck:libs` step will fail. Use plain `type: string` with `minLength`/pattern instead.
- **Zod schema names in `@workspace/api-zod` are operation-based, not the referenced component name** — e.g. a request body `$ref: AccessPurchaseInput` generates the runtime validator `PurchaseAccessBody`, not `AccessPurchaseInput` (that name only exists as a TS `interface` in `generated/types`). Import the `<operationId>Body`/`<operationId>Response` names for runtime validation.

## Product

- Explains the autonomous QA agent's pipeline (ingestion → parallel evidence/triage → 3-tier classification → supervisor routing → memory write-back) with real architecture content and business-impact metrics (97% nightly time reduction, 86% cost drop, etc.).
- Sells paid access ($5, mocked) to a live classification agent via both a REST endpoint and an MCP server, so buyers can wire the same tier-1 classifier into their own tools or MCP-compatible clients.
- Showcases the builder's resume and contact details as a hiring/collaboration surface.

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- The Python `agentic-qa-system/` directory has no installed dependencies in this workspace (e.g. no `chromadb`) — it's reference content only. Don't assume it can be run or tested here.
- Cross-artifact API calls from `qa-agent-showcase` to `api-server` use plain relative `/api/...` paths (no `BASE_URL` prefixing) — the shared proxy routes `/api` to the API server regardless of which artifact's page made the request.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
