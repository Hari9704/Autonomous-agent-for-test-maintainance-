"""
Escalation Agent node -- the rule-based Smart Re-run / Escalation policy
engine from the architecture doc. No LLM call here on purpose: this is a
deterministic lookup table, which is exactly why it's free and instant.
"""

from __future__ import annotations

import logging

from app.graph.state import ClusterState
from app.integrations.slack_tool import get_slack_adapter
from app.memory.state_store import get_state_store
from app.models import ClassificationCategory, EscalationDecision, RerunPolicy

logger = logging.getLogger("qa_agent.graph.escalation")

_POLICY_TABLE: dict[ClassificationCategory, RerunPolicy] = {
    ClassificationCategory.FLAKY_INFRA: RerunPolicy.RETRY_IMMEDIATE_3X,
    ClassificationCategory.SPORADIC: RerunPolicy.RETRY_IMMEDIATE_2X,
    ClassificationCategory.WAIT_SYNC: RerunPolicy.RETRY_ONCE_THEN_FIX,
    ClassificationCategory.LOCATOR_CHANGE: RerunPolicy.FIX_FIRST_VERIFY_ONCE,
    ClassificationCategory.APP_BUG: RerunPolicy.NO_RERUN_EXCLUDE,
    ClassificationCategory.TEST_DATA: RerunPolicy.NO_RERUN_FIX_DATA,
    ClassificationCategory.FUNC_CHANGED: RerunPolicy.NO_RERUN_DRAFT_TEST,
    ClassificationCategory.UNKNOWN: RerunPolicy.NO_RERUN_EXCLUDE,
}

# Categories that land here (didn't get an automatic fix/ticket/test-draft
# path) and therefore need a human alert.
_NEEDS_SLACK_ALERT = {
    ClassificationCategory.FLAKY_INFRA,
    ClassificationCategory.SPORADIC,
    ClassificationCategory.TEST_DATA,
    ClassificationCategory.UNKNOWN,
}


def escalation_node(state: ClusterState) -> dict:
    cluster = state["cluster"]
    classification = state["classification"]
    stream = state["stream"]
    tracker = state["cost_tracker"]
    tracker.record_free_hit()  # rule lookup, zero LLM spend

    policy = _POLICY_TABLE.get(classification.category, RerunPolicy.NO_RERUN_EXCLUDE)
    excluded = policy in (RerunPolicy.NO_RERUN_EXCLUDE, RerunPolicy.NO_RERUN_FIX_DATA)

    store = get_state_store()
    attempt_info = store.record_attempt(cluster.representative.test_id, stream, classification.category.value)
    if excluded:
        store.set_excluded(cluster.representative.test_id, stream, True)

    slack_notified = False
    if classification.category in _NEEDS_SLACK_ALERT:
        slack = get_slack_adapter()
        slack.post_message(
            f":warning: *{classification.category.value}* in `{stream}` -- "
            f"`{cluster.representative.test_name}` ({cluster.size} affected run(s)). "
            f"Policy: `{policy.value}`. Flakiness score: {attempt_info['flakiness_score']:.2f}."
        )
        slack_notified = True

    decision = EscalationDecision(
        policy=policy,
        excluded_from_ci=excluded,
        slack_notified=slack_notified,
        notes=f"attempt_count={attempt_info['attempt_count']}, flakiness_score={attempt_info['flakiness_score']:.2f}",
    )
    logger.info("[escalation] cluster=%s policy=%s excluded=%s", cluster.signature[:8], policy, excluded)
    return {"escalation": decision}
