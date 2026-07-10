"""
Seeds the 4 local knowledge bases with a handful of demo documents so the
first pipeline run has something to retrieve against (past execution
memory, functional docs, semantic UI descriptions, and Jira history).
In a real deployment these would be populated continuously by the
Feedback Agent and by syncing product docs / past tickets.

Run directly:  python -m scripts.seed_knowledge_bases
Or via the API: POST /knowledge-bases/seed
"""

from __future__ import annotations

from app.memory.knowledge_bases import (
    KB_EXECUTION_MEMORY,
    KB_FUNCTIONAL_DOCS,
    KB_JIRA_HISTORY,
    KB_SEMANTIC_UI,
    get_kb_store,
)

_FUNCTIONAL_DOCS = [
    "CheckoutScreen: The 'Apply' promo button was renamed from btn_checkout_apply to "
    "btn_checkout_apply_v2 as part of the July 2026 checkout redesign (PRD-CHK-118).",
    "RewardsRedeemSummaryV2: Replaces RewardsRedeemConfirm. Users now choose a reward tier "
    "before confirming redemption, per PRD-RWD-204.",
    "LoyaltyScreen: loyalty_balance_label is populated asynchronously after the /loyalty/balance "
    "call resolves; typical latency under normal load is 1-2s, but can spike to 8s+ under load "
    "test conditions (see INFRA-77 postmortem).",
]

_SEMANTIC_UI_DOCS = [
    "7eleven-android CheckoutScreen (build >= 2026.07.01): primary CTA is 'btn_checkout_apply_v2', "
    "styled as a filled orange button below the promo code field.",
    "7eleven-android RewardsRedeemSummaryV2 (build >= 2026.06.20): tier-selection cards replace the "
    "single confirm button used in the legacy RewardsRedeemConfirm screen.",
]

_JIRA_HISTORY = [
    {
        "text": "QA-411: StoreLocator crashes with NullPointerException when search returns zero "
        "results and the results adapter is not null-checked.",
        "issue_key": "QA-411",
    },
    {
        "text": "QA-388: Intermittent 500 from /api/v2/stores/search under high concurrency during "
        "nightly load; root cause was a connection pool exhaustion, fixed in backend release 4.12.",
        "issue_key": "QA-388",
    },
]

_EXECUTION_MEMORY_DOCS = [
    "Test 'checkout_apply_promo_code' failed with NoSuchElementException for btn_checkout_apply. "
    "Classified as LOCATOR_CHANGE (confidence=0.91, tier=tier1_rule). Outcome: fix_pr opened, "
    "renamed locator to btn_checkout_apply_v2.",
]


def seed() -> dict:
    kb = get_kb_store()
    for i, text in enumerate(_FUNCTIONAL_DOCS):
        kb.add_document(KB_FUNCTIONAL_DOCS, text, metadata={"source": "seed"}, doc_id=f"seed-func-{i}")
    for i, text in enumerate(_SEMANTIC_UI_DOCS):
        kb.add_document(KB_SEMANTIC_UI, text, metadata={"source": "seed"}, doc_id=f"seed-ui-{i}")
    for i, doc in enumerate(_JIRA_HISTORY):
        kb.add_document(KB_JIRA_HISTORY, doc["text"], metadata={"issue_key": doc["issue_key"], "source": "seed"}, doc_id=f"seed-jira-{i}")
    for i, text in enumerate(_EXECUTION_MEMORY_DOCS):
        kb.add_document(KB_EXECUTION_MEMORY, text, metadata={"source": "seed"}, doc_id=f"seed-exec-{i}")
    return kb.stats()


if __name__ == "__main__":
    stats = seed()
    print("Seeded knowledge bases:", stats)
