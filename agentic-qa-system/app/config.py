"""
Central configuration for the Agentic QA Test-Maintenance System.

Every external dependency (LLM provider, GitHub, Jira, Slack, BrowserStack)
is read from environment variables. Nothing is hardcoded and nothing is
required to boot the system: if a credential is missing, the corresponding
adapter automatically falls back to a clearly-labeled simulated
implementation (see `app/integrations/base.py` and `app/llm.py`) so the
full multi-agent graph can run end-to-end on day one. Add real credentials
later (via Replit Secrets or a `.env` file) and the same code paths switch
to live calls -- no code changes required.
"""

from __future__ import annotations

import os
from dataclasses import dataclass, field

from dotenv import load_dotenv

load_dotenv()


def _get_bool(name: str, default: bool = False) -> bool:
    val = os.environ.get(name)
    if val is None:
        return default
    return val.strip().lower() in {"1", "true", "yes", "on"}


def _get_float(name: str, default: float) -> float:
    val = os.environ.get(name)
    try:
        return float(val) if val else default
    except ValueError:
        return default


def _get_int(name: str, default: int) -> int:
    val = os.environ.get(name)
    try:
        return int(val) if val else default
    except ValueError:
        return default


@dataclass(frozen=True)
class LLMSettings:
    anthropic_api_key: str | None = field(default_factory=lambda: os.environ.get("ANTHROPIC_API_KEY"))
    openai_api_key: str | None = field(default_factory=lambda: os.environ.get("OPENAI_API_KEY"))

    # "Cheap" model tier -- classification, JIRA templating, routing decisions.
    haiku_model: str = field(default_factory=lambda: os.environ.get("QA_AGENT_MODEL_CHEAP", "claude-haiku-4-5"))
    # "Deep" model tier -- code generation, fix synthesis, test authoring.
    sonnet_model: str = field(default_factory=lambda: os.environ.get("QA_AGENT_MODEL_DEEP", "claude-sonnet-4-5"))

    # OpenAI equivalents, used only if Anthropic key is absent but an OpenAI key is present.
    openai_cheap_model: str = field(default_factory=lambda: os.environ.get("QA_AGENT_OPENAI_MODEL_CHEAP", "gpt-4o-mini"))
    openai_deep_model: str = field(default_factory=lambda: os.environ.get("QA_AGENT_OPENAI_MODEL_DEEP", "gpt-4o"))

    max_reflexion_rounds: int = field(default_factory=lambda: _get_int("QA_AGENT_MAX_REFLEXION_ROUNDS", 3))
    reflexion_confidence_threshold: float = field(
        default_factory=lambda: _get_float("QA_AGENT_REFLEXION_CONFIDENCE_THRESHOLD", 0.75)
    )

    @property
    def provider(self) -> str:
        if self.anthropic_api_key:
            return "anthropic"
        if self.openai_api_key:
            return "openai"
        return "simulated"

    @property
    def is_live(self) -> bool:
        return self.provider != "simulated"


@dataclass(frozen=True)
class IntegrationSettings:
    github_token: str | None = field(default_factory=lambda: os.environ.get("GITHUB_TOKEN"))
    github_repo: str | None = field(default_factory=lambda: os.environ.get("QA_AGENT_GITHUB_REPO"))  # "owner/repo"

    jira_base_url: str | None = field(default_factory=lambda: os.environ.get("JIRA_BASE_URL"))
    jira_email: str | None = field(default_factory=lambda: os.environ.get("JIRA_EMAIL"))
    jira_api_token: str | None = field(default_factory=lambda: os.environ.get("JIRA_API_TOKEN"))
    jira_project_key: str = field(default_factory=lambda: os.environ.get("JIRA_PROJECT_KEY", "QA"))

    slack_bot_token: str | None = field(default_factory=lambda: os.environ.get("SLACK_BOT_TOKEN"))
    slack_channel: str = field(default_factory=lambda: os.environ.get("SLACK_CHANNEL", "#qa-agent-alerts"))

    browserstack_username: str | None = field(default_factory=lambda: os.environ.get("BROWSERSTACK_USERNAME"))
    browserstack_access_key: str | None = field(default_factory=lambda: os.environ.get("BROWSERSTACK_ACCESS_KEY"))


@dataclass(frozen=True)
class CostSettings:
    """Approximate $/1M-token pricing used for the cost tracker and dashboard.

    These are illustrative defaults for the "cheap" (Haiku-tier) and "deep"
    (Sonnet-tier) models described in the architecture doc. Override via env
    vars if your actual contracted pricing differs.
    """

    cheap_input_per_1m: float = field(default_factory=lambda: _get_float("QA_AGENT_PRICE_CHEAP_INPUT", 0.25))
    cheap_output_per_1m: float = field(default_factory=lambda: _get_float("QA_AGENT_PRICE_CHEAP_OUTPUT", 1.25))
    deep_input_per_1m: float = field(default_factory=lambda: _get_float("QA_AGENT_PRICE_DEEP_INPUT", 3.00))
    deep_output_per_1m: float = field(default_factory=lambda: _get_float("QA_AGENT_PRICE_DEEP_OUTPUT", 15.00))

    prompt_cache_discount: float = field(
        default_factory=lambda: _get_float("QA_AGENT_PROMPT_CACHE_DISCOUNT", 0.9)
    )  # fraction saved on cached input tokens (optimization #1)
    semantic_cache_similarity_threshold: float = field(
        default_factory=lambda: _get_float("QA_AGENT_SEMANTIC_CACHE_THRESHOLD", 0.90)
    )  # optimization #3


@dataclass(frozen=True)
class StorageSettings:
    data_dir: str = field(default_factory=lambda: os.environ.get("QA_AGENT_DATA_DIR", "data"))
    chroma_dir: str = field(default_factory=lambda: os.environ.get("QA_AGENT_CHROMA_DIR", "data/chroma"))
    sqlite_path: str = field(default_factory=lambda: os.environ.get("QA_AGENT_SQLITE_PATH", "data/state_store.db"))
    runs_dir: str = field(default_factory=lambda: os.environ.get("QA_AGENT_RUNS_DIR", "data/runs"))


@dataclass(frozen=True)
class Settings:
    llm: LLMSettings = field(default_factory=LLMSettings)
    integrations: IntegrationSettings = field(default_factory=IntegrationSettings)
    cost: CostSettings = field(default_factory=CostSettings)
    storage: StorageSettings = field(default_factory=StorageSettings)

    max_parallel_clusters: int = field(default_factory=lambda: _get_int("QA_AGENT_MAX_PARALLEL_CLUSTERS", 6))
    auto_pr_enabled: bool = field(default_factory=lambda: _get_bool("QA_AGENT_AUTOPR_ENABLED", False))
    jira_direct_execution: bool = field(default_factory=lambda: _get_bool("QA_AGENT_JIRA_DIRECT_EXECUTION", False))


settings = Settings()
