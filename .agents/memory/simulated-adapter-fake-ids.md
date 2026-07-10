---
name: Simulated third-party adapter fake IDs
description: fake PR numbers / ticket IDs generated for simulated (no-credentials) integration adapters must be collision-resistant under concurrent execution.
---

When building an adapter that simulates a third-party API response (e.g. a
"fake" GitHub PR number or Jira ticket ID used when no real API credentials
are configured), do not derive the fake ID from `time.time()` truncated to
a small range (e.g. `int(time.time()) % 10000`).

**Why:** any pipeline that fans work out concurrently (e.g. asyncio.gather
across parallel work items) can trigger many simulated calls within the
same wall-clock second. Truncating a timestamp collapses all of them to the
same fake ID, producing misleading duplicate PR/ticket numbers in
downstream reports even though each call was logically independent.

**How to apply:** Use `uuid.uuid4()`-derived values (or another
collision-resistant source) for simulated IDs, never a coarse timestamp,
whenever the simulated path is exercised by concurrent/parallel callers.
