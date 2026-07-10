"""
System/user prompt templates for every LLM-backed agent node.

Each system prompt embeds an `[[INTENT:...]]` marker. Real providers ignore
it (it's just text), but `SimulatedLLM` (see `app/llm.py`) reads it to
decide which shape of stub response to return when no API key is
configured -- keeping the simulated and live code paths perfectly aligned
on schema.

Every system prompt is static text sent as-is on every call within a run,
which is what makes Anthropic prompt caching (optimization #1) effective:
the same string is cached and reused across every cluster in the batch.
"""

from __future__ import annotations

from app.models import FailureCluster

CLASSIFY_SYSTEM_PROMPT = """[[INTENT:CLASSIFY]]
You are the Triage Agent in an autonomous mobile QA test-maintenance system.
Classify a failing test into exactly one category:

- LOCATOR_CHANGE: an element ID/locator was renamed or restructured
- WAIT_SYNC: a timing/loading race condition, not a real bug
- APP_BUG: a genuine application defect (crash, 5xx, incorrect behavior)
- FUNC_CHANGED: the underlying feature/flow was intentionally redesigned
- FLAKY_INFRA: infrastructure flakiness (driver, network, OTP timeout)
- SPORADIC: intermittent, no clear pattern (StaleElementReference, etc.)
- TEST_DATA: expired/invalid test fixtures (promo codes, test accounts)
- UNKNOWN: insufficient evidence to decide confidently

Respond as JSON: {"category": "...", "confidence": 0.0-1.0, "reasoning": "..."}
"""

REFLEXION_CRITIQUE_SYSTEM_PROMPT = """[[INTENT:REFLEXION_CRITIQUE]]
You are reviewing your own prior classification of a test failure for the
autonomous QA agent. Given the original evidence and your classification,
decide whether to revise it. Be skeptical of low-confidence calls.

Respond as JSON:
{"should_revise": true/false, "revised_category": "..."|null, "critique": "..."}
"""

FIX_SYNTHESIS_SYSTEM_PROMPT = """[[INTENT:FIX_SYNTHESIS]]
You are the Fix Agent. Given a LOCATOR_CHANGE or WAIT_SYNC failure with DOM
evidence, propose a minimal, safe code change to the test's locator/wait
strategy. Ground the fix in the provided DOM snapshot and functional docs
context if present. Never touch application source code, only test code.

Respond as JSON:
{"file_path": "...", "diff_summary": "...", "confidence": 0.0-1.0}
"""

BUG_TICKET_SYSTEM_PROMPT = """[[INTENT:BUG_TICKET]]
You are the Bug Review Agent. Given an APP_BUG failure and any similar past
Jira tickets, write a concise, evidence-grounded bug summary and decide if
this looks like a regression of a previously-closed ticket.

Respond as JSON:
{"summary": "...", "description": "...", "is_regression_clone": true/false}
"""

TEST_DRAFT_SYSTEM_PROMPT = """[[INTENT:TEST_DRAFT]]
You are the Test Writer Agent. Given a FUNC_CHANGED failure, the new DOM
snapshot, and relevant functional requirements, draft a new Appium-style
test skeleton that exercises the redesigned flow.

Respond as JSON:
{"file_path": "...", "test_code": "..."}
"""


def classify_user_prompt(cluster: FailureCluster, kb_context: list[str]) -> str:
    rep = cluster.representative
    context = "\n".join(f"- {c}" for c in kb_context) or "(no similar past cases found)"
    return f"""Test: {rep.test_name}
Screen: {rep.screen_name}
Error message: {rep.error_message}
Stack trace (truncated): {rep.stack_trace[:800]}
DOM snapshot (truncated): {rep.dom_snippet[:800]}
Cluster size: {cluster.size} failing test(s) share this signature.

Similar past classifications from execution memory:
{context}
"""


def reflexion_user_prompt(cluster: FailureCluster, prior_category: str, prior_reasoning: str) -> str:
    return f"""Original evidence:
Error message: {cluster.representative.error_message}
DOM snapshot (truncated): {cluster.representative.dom_snippet[:600]}

Your prior classification: {prior_category}
Your prior reasoning: {prior_reasoning}

Reconsider given the evidence above."""


def fix_user_prompt(cluster: FailureCluster, functional_docs_context: list[str]) -> str:
    context = "\n".join(f"- {c}" for c in functional_docs_context) or "(no functional docs matched)"
    return f"""Failing test: {cluster.representative.test_name}
DOM snapshot: {cluster.representative.dom_snippet[:1200]}
Error: {cluster.representative.error_message}

Relevant functional documentation:
{context}
"""


def bug_ticket_user_prompt(cluster: FailureCluster, similar_tickets: list[str]) -> str:
    similar = "\n".join(f"- {t}" for t in similar_tickets) or "(no similar past tickets found)"
    return f"""Failing test: {cluster.representative.test_name}
Error: {cluster.representative.error_message}
Stack trace (truncated): {cluster.representative.stack_trace[:1000]}
Affected test count in this cluster: {cluster.size}

Similar past Jira tickets:
{similar}
"""


def test_draft_user_prompt(cluster: FailureCluster, functional_docs_context: list[str]) -> str:
    context = "\n".join(f"- {c}" for c in functional_docs_context) or "(no functional docs matched)"
    return f"""Test that now fails due to an intentional flow change: {cluster.representative.test_name}
New DOM snapshot: {cluster.representative.dom_snippet[:1200]}

Relevant functional documentation describing the new flow:
{context}
"""
