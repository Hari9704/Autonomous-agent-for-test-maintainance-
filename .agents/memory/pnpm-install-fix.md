---
name: pnpm monorepo package install fix
description: How to add packages to a specific workspace artifact without hitting ERR_PNPM_ADDING_TO_ROOT
---

The `installLanguagePackages` tool fails in this monorepo with `ERR_PNPM_ADDING_TO_ROOT` because it tries to add to the workspace root.

**Rule:** Install into a specific package by running:
```
pnpm add <package> --filter @workspace/<artifact-name>
```
from the repo root. This scopes the install correctly and updates the right `package.json`.

**Why:** The `installLanguagePackages` tool doesn't understand pnpm workspace filtering — it falls back to root-level install which pnpm rejects.

**How to apply:** Any time a new npm dependency is needed for `artifacts/api-server` or any other artifact, use the `--filter` flag pattern above.
