---
name: Orval + Zod v3 codegen quirks in this project
description: Two gotchas when editing openapi.yaml and consuming the generated output in this pinned-zod-v3 monorepo
---

## Gotcha 1 — No `format: email` (or other zod-v4-only formats)

Orval maps certain OpenAPI formats to zod v4 top-level functions (e.g. `zod.email()`). This project pins `zod` v3, which doesn't have those functions. The generated file compiles but the post-codegen `typecheck:libs` step fails.

**Rule:** Use `type: string` with `minLength`/`pattern` constraints instead of `format: email`.

**Why:** Discovered when `/access/purchase` input originally used `format: email` for the purchaser's email field.

## Gotcha 2 — Validator names follow operationId, not `$ref` component names

Orval generates runtime Zod validators named after the **operationId**, not the OpenAPI component name you `$ref`. Example:
- OpenAPI component: `AccessPurchaseInput` → only exists as a TS `interface` in `generated/types.ts`
- Runtime validator to import: `PurchaseAccessBody` (from operationId `purchaseAccess`)
- Response validator: `PurchaseAccessResponse`

**How to apply:** After any codegen run, grep `generated/zod/` for the actual exported const names before importing them in route handlers or tests.
