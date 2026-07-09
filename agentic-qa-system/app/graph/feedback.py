"""
Feedback Agent node -- the terminal step every path funnels through.
Writes the classification + outcome into KB_EXECUTION_MEMORY (optimization
#7: execution memory growth -- every run makes the next run's Tier-3
semantic cache and Tier-2 exact cache more likely to hit, driving cost
down over time) and assembles the cluster-level result contract.
"""

from __future__ import annotations

import logging

from app.graph.state import ClusterState
from app.memory.knowledge_bases import KB_EXECUTION_MEMORY, get_kb_store

logger = logging.getLogger("qa_agent.graph.feedback")


def feedback_node(state: ClusterState) -> dict:
    cluster = state["cluster"]
    classification = state["classification"]
    stream = state["stream"]

    outcome_bits = []
    if state.get("fix_result"):
        outcome_bits.append(f"fix_pr={state['fix_result'].pr_url}")
    if state.get("bug_ticket"):
        outcome_bits.append(f"bug={state['bug_ticket'].issue_key or 'duplicate'}")
    if state.get("test_draft"):
        outcome_bits.append(f"test_draft_pr={state['test_draft'].pr_url}")
    if state.get("escalation"):
        outcome_bits.append(f"escalation_policy={state['escalation'].policy.value}")

    memory_text = (
        f"Test '{cluster.representative.test_name}' failed with: {cluster.representative.error_message}. "
        f"Classified as {classification.category.value} (confidence={classification.confidence:.2f}, "
        f"tier={classification.tier.value}). Outcome: {', '.join(outcome_bits) or 'none'}."
    )

    kb = get_kb_store()
    kb.add_document(
        KB_EXECUTION_MEMORY,
        text=memory_text,
        metadata={
            "stream": stream,
            "category": classification.category.value,
            "test_id": cluster.representative.test_id,
            "cluster_signature": cluster.signature,
        },
    )
    logger.info("[feedback] cluster=%s written to KB_EXECUTION_MEMORY", cluster.signature[:8])
    return {}
