---
name: Python embeddings dependency pitfall
description: sentence-transformers broke uv dependency resolution when building a local Chroma-backed semantic memory system; use Chroma's built-in embedding function instead.
---

When a project needs local vector embeddings (e.g. Chroma-backed knowledge
bases with no external embedding API key), do not reach for
`sentence-transformers` as a dependency in this environment — installing it
alongside `chromadb` broke `uv`'s dependency resolution (large, slow, and
prone to conflicting transitive pins pulled in via `torch`/`transformers`).

**Why:** `sentence-transformers` pulls a heavy, conflict-prone dependency
tree that isn't needed just to get local embeddings working.

**How to apply:** Use Chroma's default bundled local embedding function
(no API key, no extra heavy deps) via `chromadb.utils.embedding_functions`
or simply omitting a custom embedding function when creating a
`PersistentClient` collection — it works out of the box for POC/demo-scale
semantic search. Only reach for `sentence-transformers` (or a hosted
embeddings API) if embedding quality actually becomes a bottleneck.
