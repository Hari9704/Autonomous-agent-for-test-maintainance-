"""
Model-routed LLM client (cost optimization #6: Smart Model Routing).

`LLMRouter` picks a "cheap" tier model for classification/templating tasks
and a "deep" tier model for code-generation/fix-synthesis tasks, calling
whichever real provider has a configured API key (Anthropic first, then
OpenAI). If neither key is configured, it transparently falls back to a
`SimulatedLLM` that returns deterministic, clearly-labeled structured JSON
so the graph still runs end-to-end for demos. Add `ANTHROPIC_API_KEY` or
`OPENAI_API_KEY` later and every call site starts hitting the real model
with zero code changes.
"""

from __future__ import annotations

import json
import logging
from dataclasses import dataclass
from typing import Literal

from app.config import settings

logger = logging.getLogger("qa_agent.llm")

ModelTier = Literal["cheap", "deep"]


@dataclass
class LLMResponse:
    text: str
    input_tokens: int
    output_tokens: int
    cached_input_tokens: int
    model: str
    simulated: bool


class LLMRouter:
    """Provider-agnostic chat completion client with cheap/deep model routing.

    Anthropic prompt caching (optimization #1): when calling Anthropic, the
    static system prompt is sent with `cache_control: {"type": "ephemeral"}`
    so repeated calls within a run/cluster batch reuse the cached prefix
    instead of re-billing it at full price.
    """

    def __init__(self) -> None:
        self.provider = settings.llm.provider
        self._anthropic_client = None
        self._openai_client = None

        if self.provider == "anthropic":
            import anthropic

            self._anthropic_client = anthropic.Anthropic(api_key=settings.llm.anthropic_api_key)
        elif self.provider == "openai":
            import openai

            self._openai_client = openai.OpenAI(api_key=settings.llm.openai_api_key)

        logger.info("LLMRouter initialized with provider=%s", self.provider)

    def model_for(self, tier: ModelTier) -> str:
        if self.provider == "anthropic":
            return settings.llm.haiku_model if tier == "cheap" else settings.llm.sonnet_model
        if self.provider == "openai":
            return settings.llm.openai_cheap_model if tier == "cheap" else settings.llm.openai_deep_model
        return f"simulated-{tier}"

    def complete_json(
        self,
        *,
        tier: ModelTier,
        system_prompt: str,
        user_prompt: str,
        max_tokens: int = 1024,
    ) -> tuple[dict, LLMResponse]:
        """Request a JSON-only structured response (optimization #4: output
        token trimming -- we never ask for prose, only the schema)."""

        if self.provider == "anthropic":
            return self._complete_anthropic(tier, system_prompt, user_prompt, max_tokens)
        if self.provider == "openai":
            return self._complete_openai(tier, system_prompt, user_prompt, max_tokens)
        return self._complete_simulated(tier, system_prompt, user_prompt)

    # -- Anthropic -----------------------------------------------------

    def _complete_anthropic(
        self, tier: ModelTier, system_prompt: str, user_prompt: str, max_tokens: int
    ) -> tuple[dict, LLMResponse]:
        model = self.model_for(tier)
        response = self._anthropic_client.messages.create(
            model=model,
            max_tokens=max_tokens,
            system=[
                {
                    "type": "text",
                    "text": system_prompt,
                    "cache_control": {"type": "ephemeral"},
                }
            ],
            messages=[{"role": "user", "content": user_prompt + "\n\nRespond with JSON only, no prose."}],
        )
        text = "".join(block.text for block in response.content if getattr(block, "type", "") == "text")
        usage = response.usage
        llm_resp = LLMResponse(
            text=text,
            input_tokens=getattr(usage, "input_tokens", 0),
            output_tokens=getattr(usage, "output_tokens", 0),
            cached_input_tokens=getattr(usage, "cache_read_input_tokens", 0) or 0,
            model=model,
            simulated=False,
        )
        return _safe_json(text), llm_resp

    # -- OpenAI ----------------------------------------------------------

    def _complete_openai(
        self, tier: ModelTier, system_prompt: str, user_prompt: str, max_tokens: int
    ) -> tuple[dict, LLMResponse]:
        model = self.model_for(tier)
        response = self._openai_client.chat.completions.create(
            model=model,
            max_tokens=max_tokens,
            response_format={"type": "json_object"},
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
        )
        text = response.choices[0].message.content or "{}"
        usage = response.usage
        llm_resp = LLMResponse(
            text=text,
            input_tokens=getattr(usage, "prompt_tokens", 0),
            output_tokens=getattr(usage, "completion_tokens", 0),
            cached_input_tokens=getattr(usage, "prompt_tokens_details", None)
            and getattr(usage.prompt_tokens_details, "cached_tokens", 0)
            or 0,
            model=model,
            simulated=False,
        )
        return _safe_json(text), llm_resp

    # -- Simulated fallback -----------------------------------------------

    def _complete_simulated(self, tier: ModelTier, system_prompt: str, user_prompt: str) -> tuple[dict, LLMResponse]:
        """Deterministic, rule-flavoured stand-in used only when no API key
        is configured. Every simulated payload is tagged `"simulated": true`
        so it is never mistaken for a real model decision downstream."""

        payload = SimulatedLLM.respond(system_prompt, user_prompt)
        approx_input = max(1, len(system_prompt + user_prompt) // 4)
        approx_output = max(1, len(json.dumps(payload)) // 4)
        llm_resp = LLMResponse(
            text=json.dumps(payload),
            input_tokens=approx_input,
            output_tokens=approx_output,
            cached_input_tokens=0,
            model=self.model_for(tier),
            simulated=True,
        )
        return payload, llm_resp


def _safe_json(text: str) -> dict:
    text = text.strip()
    if text.startswith("```"):
        text = text.strip("`")
        if text.startswith("json"):
            text = text[4:]
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        logger.warning("LLM returned non-JSON payload, wrapping as raw text: %r", text[:200])
        return {"raw": text}


class SimulatedLLM:
    """Heuristic responder used when no LLM API key is configured.

    It inspects the prompt for the agent's intent tag (each prompt in
    `app/prompts/library.py` embeds an `[[INTENT:...]]` marker) and returns
    a structurally-correct, obviously-fake payload so the rest of the graph
    (routing, cost tracking, memory writes, API responses) exercises real
    code paths end-to-end without ever pretending to be a genuine model
    decision.
    """

    @staticmethod
    def respond(system_prompt: str, user_prompt: str) -> dict:
        intent = "UNKNOWN"
        if "[[INTENT:" in system_prompt:
            intent = system_prompt.split("[[INTENT:", 1)[1].split("]]", 1)[0]

        # Only inspect the user prompt for keyword heuristics -- the system
        # prompt is static boilerplate that names every category (including
        # the words "locator" and "element"), so matching against it would
        # bias every simulated classification toward the first branch below.
        text_blob = user_prompt.lower()

        if intent == "CLASSIFY":
            category = "UNKNOWN"
            if "assertionerror" in text_blob or "expected screen" in text_blob or "redesign" in text_blob:
                category = "FUNC_CHANGED"
            elif "no such element" in text_blob or "unable to locate element" in text_blob or "element not found" in text_blob:
                category = "LOCATOR_CHANGE"
            elif "timeout" in text_blob or "not visible in time" in text_blob:
                category = "WAIT_SYNC"
            elif "500" in text_blob or "exception" in text_blob or "crash" in text_blob or "nullpointer" in text_blob:
                category = "APP_BUG"
            return {
                "category": category,
                "confidence": 0.62,
                "reasoning": "[SIMULATED] heuristic keyword match -- configure ANTHROPIC_API_KEY or "
                "OPENAI_API_KEY for real semantic classification.",
                "simulated": True,
            }

        if intent == "REFLEXION_CRITIQUE":
            return {
                "should_revise": False,
                "revised_category": None,
                "critique": "[SIMULATED] no critique model configured; keeping original classification.",
                "simulated": True,
            }

        if intent == "FIX_SYNTHESIS":
            return {
                "diff_summary": "[SIMULATED] Update the locator strategy for the affected element "
                "(e.g. swap a brittle XPath for a stable testID/accessibilityId).",
                "file_path": "src/test/locators/PLACEHOLDER.locators.ts",
                "confidence": 0.5,
                "simulated": True,
            }

        if intent == "BUG_TICKET":
            return {
                "summary": "[SIMULATED] Draft bug summary -- add ANTHROPIC_API_KEY/OPENAI_API_KEY for a "
                "real LLM-written report grounded in evidence.",
                "is_regression_clone": False,
                "simulated": True,
            }

        if intent == "TEST_DRAFT":
            return {
                "test_code": "// [SIMULATED] draft Appium test skeleton would be generated here\n"
                "describe('PLACEHOLDER', () => { it('TODO', async () => {}); });",
                "simulated": True,
            }

        return {"simulated": True, "note": "[SIMULATED] no matching intent handler"}
