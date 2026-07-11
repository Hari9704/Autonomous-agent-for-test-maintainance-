---
name: Verify subagent and explorer findings against actual code
description: Explorer/architect subagents can produce false positives — always check their claims in the real files before acting
---

**Rule:** Treat subagent findings as hypotheses, not facts. Before making any code change based on a subagent report, grep or read the referenced file/function to confirm the issue exists in the current code.

**Why:** During a code-review pass on the Python `agentic-qa-system`, an explorer reported N+1 DB/Chroma connections (claiming `get_state_store`/`get_kb_store` create new connections on every call). Inspection showed the functions already use a thread-safe `.instance()` singleton — the reported bug had either already been fixed or never existed.

**How to apply:** For any finding that says "function X does Y every call" or "file Z is missing W" — grep for the function name and read a few lines of context before writing a fix. A false fix is harder to undo than the cost of a quick check.
