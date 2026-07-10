"""Bug Review Agent node -- for APP_BUG classifications, checks
KB_JIRA_HISTORY for a duplicate/regression, then files (or skips) a ticket."""

from __future__ import annotations

import logging

from app.cost.optimizer import enforce_json_only
from app.graph.state import ClusterState
from app.integrations.jira_tool import get_jira_adapter
from app.llm import LLMRouter
from app.memory.knowledge_bases import KB_JIRA_HISTORY, get_kb_store
from app.models import BugTicket
from app.prompts.library import BUG_TICKET_SYSTEM_PROMPT, bug_ticket_user_prompt

logger = logging.getLogger("qa_agent.graph.bug_review")

_llm = LLMRouter()

_DUPLICATE_SIMILARITY_THRESHOLD = 0.92


def bug_review_node(state: ClusterState) -> dict:
    cluster = state["cluster"]
    tracker = state["cost_tracker"]

    kb = get_kb_store()
    similar = kb.query(KB_JIRA_HISTORY, cluster.representative.error_message, top_k=3)

    exact_duplicate = next((h for h in similar if h["similarity"] >= _DUPLICATE_SIMILARITY_THRESHOLD), None)
    if exact_duplicate:
        logger.info("[bug_review] cluster=%s duplicate of %s -- skipping new ticket", cluster.signature[:8], exact_duplicate["metadata"].get("issue_key"))
        tracker.record_free_hit()
        return {
            "bug_ticket": BugTicket(
                filed=False,
                is_duplicate_of=exact_duplicate["metadata"].get("issue_key"),
                is_regression_clone=False,
                summary=f"Duplicate of existing ticket {exact_duplicate['metadata'].get('issue_key')}",
                simulated=False,
            )
        }

    similar_texts = [f"{h['metadata'].get('issue_key', '?')}: {h['text']}" for h in similar]
    payload, llm_resp = _llm.complete_json(
        tier="cheap",
        system_prompt=BUG_TICKET_SYSTEM_PROMPT + "\n" + enforce_json_only('{"summary": str, "description": str, "is_regression_clone": bool}'),
        user_prompt=bug_ticket_user_prompt(cluster, similar_texts),
    )
    tracker.record("cheap", llm_resp)

    summary = payload.get("summary") or f"Failure in {cluster.representative.test_name}"
    description = payload.get("description", cluster.representative.error_message)
    is_regression = bool(payload.get("is_regression_clone", False))

    jira = get_jira_adapter()
    result = jira.create_issue(
        summary=summary,
        description=f"{description}\n\nAffected tests: {cluster.size}\nSample stack trace:\n{cluster.representative.stack_trace[:1500]}",
        labels=["agentic-qa", "regression"] if is_regression else ["agentic-qa"],
    )

    kb.add_document(
        KB_JIRA_HISTORY,
        text=f"{summary}. {description}",
        metadata={"issue_key": result.get("issue_key"), "stream": state["stream"]},
    )

    bug_ticket = BugTicket(
        filed=True,
        issue_key=result.get("issue_key"),
        issue_url=result.get("issue_url"),
        is_regression_clone=is_regression,
        summary=summary,
        simulated=result.get("simulated", True),
    )
    logger.info("[bug_review] cluster=%s filed=%s simulated=%s", cluster.signature[:8], bug_ticket.issue_key, bug_ticket.simulated)
    return {"bug_ticket": bug_ticket}
