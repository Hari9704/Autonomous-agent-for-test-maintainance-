"""
Triage Agent node -- the 3-tier classifier described in the architecture
doc, plus a bounded Reflexion self-critique loop:

  Tier 1  regex rules            (free, instant)
  Tier 2  exact-match cache      (free, SQLite `classification_cache`)
  Tier 3a semantic cache         (near-free, Chroma similarity search)
  Tier 3b LLM classification     (real cost) + up to N reflexion rounds
           when confidence is below threshold
"""

from __future__ import annotations

import logging
import re

from app.config import settings
from app.cost.optimizer import enforce_json_only
from app.graph.state import ClusterState
from app.llm import LLMRouter
from app.memory.knowledge_bases import KB_EXECUTION_MEMORY, get_kb_store
from app.memory.semantic_cache import get_semantic_cache
from app.memory.state_store import get_state_store, signature_hash
from app.models import Classification, ClassificationCategory, ClassificationTier
from app.prompts.library import CLASSIFY_SYSTEM_PROMPT, classify_user_prompt, reflexion_user_prompt, REFLEXION_CRITIQUE_SYSTEM_PROMPT

logger = logging.getLogger("qa_agent.graph.triage")

_llm = LLMRouter()

# Tier 1: fast regex rules for the unambiguous cases. Anything that doesn't
# match falls through to the cache/LLM tiers.
_TIER1_RULES: list[tuple[re.Pattern, ClassificationCategory, float]] = [
    (re.compile(r"no such element|element not found|unable to locate element", re.I), ClassificationCategory.LOCATOR_CHANGE, 0.9),
    (re.compile(r"timeout|timed out waiting|element not visible in time", re.I), ClassificationCategory.WAIT_SYNC, 0.85),
    (re.compile(r"\b5\d\d\b.*(error|exception)|internal server error|null pointer|nullpointerexception|app crashed", re.I), ClassificationCategory.APP_BUG, 0.9),
    (re.compile(r"stale element reference|element is not attached", re.I), ClassificationCategory.SPORADIC, 0.75),
    (re.compile(r"session not created|driver.*(disconnected|crashed)|device unresponsive", re.I), ClassificationCategory.FLAKY_INFRA, 0.8),
    (re.compile(r"invalid (promo|coupon) code|test account.*(locked|expired)|fixture.*expired", re.I), ClassificationCategory.TEST_DATA, 0.85),
]


def _tier1_classify(error_message: str) -> Classification | None:
    for pattern, category, confidence in _TIER1_RULES:
        if pattern.search(error_message):
            return Classification(
                category=category,
                confidence=confidence,
                tier=ClassificationTier.TIER1_RULE,
                reasoning=f"Matched rule pattern: {pattern.pattern}",
            )
    return None


def triage_node(state: ClusterState) -> dict:
    cluster = state["cluster"]
    stream = state["stream"]
    tracker = state["cost_tracker"]
    rep = cluster.representative
    sig = signature_hash(f"{rep.test_name}::{rep.error_message}")

    # Tier 1
    tier1 = _tier1_classify(rep.error_message)
    if tier1:
        logger.info("[triage] cluster=%s TIER1 hit -> %s", cluster.signature[:8], tier1.category)
        tracker.record_free_hit()
        _persist_tier2(sig, stream, tier1)
        return {"classification": tier1}

    # Tier 2 -- exact-match cache
    store = get_state_store()
    cached = store.get_cached_classification(sig, stream)
    if cached:
        logger.info("[triage] cluster=%s TIER2 cache hit -> %s", cluster.signature[:8], cached["category"])
        tracker.record_free_hit()
        return {
            "classification": Classification(
                category=ClassificationCategory(cached["category"]),
                confidence=cached["confidence"],
                tier=ClassificationTier.TIER2_EXACT_CACHE,
                reasoning="Exact-match hit in classification_cache.",
            )
        }

    # Tier 3a -- semantic cache
    semantic_cache = get_semantic_cache()
    semantic_hit = semantic_cache.get(rep.error_message, namespace="classification")
    if semantic_hit:
        logger.info("[triage] cluster=%s TIER3-semantic hit -> %s", cluster.signature[:8], semantic_hit["category"])
        tracker.record_free_hit()
        classification = Classification(
            category=ClassificationCategory(semantic_hit["category"]),
            confidence=semantic_hit.get("confidence", 0.7),
            tier=ClassificationTier.TIER3_SEMANTIC_CACHE,
            reasoning="Semantic similarity hit against a past classification.",
        )
        _persist_tier2(sig, stream, classification)
        return {"classification": classification}

    # Tier 3b -- LLM classification with bounded Reflexion loop
    kb = get_kb_store()
    kb_hits = kb.query(KB_EXECUTION_MEMORY, rep.error_message, top_k=3)
    kb_context = [h["text"] for h in kb_hits]

    payload, llm_resp = _llm.complete_json(
        tier="cheap",
        system_prompt=CLASSIFY_SYSTEM_PROMPT + "\n" + enforce_json_only('{"category": str, "confidence": float, "reasoning": str}'),
        user_prompt=classify_user_prompt(cluster, kb_context),
    )
    tracker.record("cheap", llm_resp)

    category = _coerce_category(payload.get("category"))
    confidence = float(payload.get("confidence", 0.5))
    reasoning = payload.get("reasoning", "")
    rounds = 0

    while confidence < settings.llm.reflexion_confidence_threshold and rounds < settings.llm.max_reflexion_rounds:
        rounds += 1
        critique_payload, critique_resp = _llm.complete_json(
            tier="cheap",
            system_prompt=REFLEXION_CRITIQUE_SYSTEM_PROMPT,
            user_prompt=reflexion_user_prompt(cluster, category.value, reasoning),
        )
        tracker.record("cheap", critique_resp)
        if critique_payload.get("should_revise") and critique_payload.get("revised_category"):
            category = _coerce_category(critique_payload["revised_category"])
            reasoning = critique_payload.get("critique", reasoning)
            confidence = min(1.0, confidence + 0.15)
        else:
            confidence = min(1.0, confidence + 0.1)
            break

    classification = Classification(
        category=category,
        confidence=confidence,
        tier=ClassificationTier.TIER3_LLM,
        reasoning=reasoning,
        reflexion_rounds=rounds,
        grounded_docs=[h["id"] for h in kb_hits],
    )

    semantic_cache.set(rep.error_message, namespace="classification", response={"category": category.value, "confidence": confidence})
    _persist_tier2(sig, stream, classification)

    logger.info(
        "[triage] cluster=%s TIER3-llm -> %s (confidence=%.2f, reflexion_rounds=%d)",
        cluster.signature[:8], category, confidence, rounds,
    )
    return {"classification": classification}


def _persist_tier2(signature: str, stream: str, classification: Classification) -> None:
    get_state_store().put_cached_classification(
        signature, stream, classification.category.value, classification.confidence, classification.tier.value
    )


def _coerce_category(value: str | None) -> ClassificationCategory:
    try:
        return ClassificationCategory(value)
    except (ValueError, TypeError):
        return ClassificationCategory.UNKNOWN
