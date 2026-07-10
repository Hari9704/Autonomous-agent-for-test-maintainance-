"""
Cost tracking + the two optimizations that aren't naturally expressed as a
single function elsewhere: (#4) output-token trimming enforcement and
(#7) execution-memory-growth reporting. (#1 prompt caching lives in
`app/llm.py`, #2 cluster representative lives in `app/ingestion/clustering.py`,
#3 semantic cache lives in `app/memory/semantic_cache.py`, #5 parallel
execution lives in `app/pipeline.py`, #6 model routing lives in
`app/llm.py::LLMRouter.model_for`.)
"""

from __future__ import annotations

from dataclasses import dataclass, field

from app.config import settings
from app.llm import LLMResponse
from app.models import ClusterCost


def price_for(tier: str, llm_response: LLMResponse) -> float:
    """Estimated USD cost for one LLM call, honoring the prompt-cache discount."""
    prices = settings.cost
    input_price = prices.cheap_input_per_1m if tier == "cheap" else prices.deep_input_per_1m
    output_price = prices.cheap_output_per_1m if tier == "cheap" else prices.deep_output_per_1m

    billable_input = max(0, llm_response.input_tokens - llm_response.cached_input_tokens)
    cached_input_cost = (
        llm_response.cached_input_tokens * input_price * (1 - prices.prompt_cache_discount) / 1_000_000
    )
    fresh_input_cost = billable_input * input_price / 1_000_000
    output_cost = llm_response.output_tokens * output_price / 1_000_000
    return round(fresh_input_cost + cached_input_cost + output_cost, 8)


@dataclass
class CostTracker:
    """Accumulates per-cluster cost across every LLM call made while
    processing that cluster; the running total rolls up into `RunMetrics`.
    """

    cost: ClusterCost = field(default_factory=ClusterCost)

    def record(self, tier: str, llm_response: LLMResponse) -> None:
        self.cost.llm_calls += 1
        self.cost.input_tokens += llm_response.input_tokens
        self.cost.output_tokens += llm_response.output_tokens
        if llm_response.cached_input_tokens:
            self.cost.cache_hits += 1
            self.cost.cache_read_input_tokens += llm_response.cached_input_tokens
        self.cost.estimated_cost_usd += price_for(tier, llm_response)
        self.cost.estimated_cost_usd = round(self.cost.estimated_cost_usd, 8)

    def record_free_hit(self, *, semantic: bool = False) -> None:
        """Tier-1 rule match, Tier-2 exact cache hit, or a rule-based
        escalation lookup -- zero LLM spend either way. `semantic=True`
        additionally counts it as a semantic-cache hit (Tier-3a) so the two
        are distinguishable in the run report instead of being merged into
        one generic "cache_hits" bucket."""
        self.cost.cache_hits += 1
        if semantic:
            self.cost.semantic_cache_hits += 1


def enforce_json_only(schema_hint: str) -> str:
    """Optimization #4: always ask for structured JSON, never free-form
    prose, to keep output tokens (which cost 3-5x input tokens) minimal."""
    return f"Respond with a single JSON object matching this shape: {schema_hint}. No prose, no markdown fences."
