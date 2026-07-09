"""
Pydantic data contracts shared across ingestion, the LangGraph agents, the
memory layer, and the API. Keeping these in one module gives every layer a
single source of truth for shape -- mirrors the role the OpenAPI spec plays
for the web artifacts in this workspace.
"""

from __future__ import annotations

from datetime import datetime, timezone
from enum import Enum
from typing import Any, Optional

from pydantic import BaseModel, Field


def utcnow() -> str:
    return datetime.now(timezone.utc).isoformat()


class Stream(str, Enum):
    SEVEN_ELEVEN_IOS = "7eleven-ios"
    SEVEN_ELEVEN_ANDROID = "7eleven-android"
    SEVEN_NINE_IOS = "7nine-ios"
    SEVEN_NINE_ANDROID = "7nine-android"


class ClassificationCategory(str, Enum):
    LOCATOR_CHANGE = "LOCATOR_CHANGE"
    WAIT_SYNC = "WAIT_SYNC"
    APP_BUG = "APP_BUG"
    FUNC_CHANGED = "FUNC_CHANGED"
    FLAKY_INFRA = "FLAKY_INFRA"
    SPORADIC = "SPORADIC"
    TEST_DATA = "TEST_DATA"
    UNKNOWN = "UNKNOWN"


class ClassificationTier(str, Enum):
    TIER1_RULE = "tier1_rule"
    TIER2_EXACT_CACHE = "tier2_exact_cache"
    TIER3_SEMANTIC_CACHE = "tier3_semantic_cache"
    TIER3_LLM = "tier3_llm"


# ---------------------------------------------------------------------------
# Ingestion
# ---------------------------------------------------------------------------


class FailureRecord(BaseModel):
    """A single failing test row, as parsed from a nightly Appium/BrowserStack report."""

    test_id: str
    stream: Stream
    build_id: str
    test_name: str
    error_message: str
    stack_trace: str = ""
    dom_snippet: str = ""
    screen_name: Optional[str] = None
    session_url: Optional[str] = None
    duration_ms: Optional[int] = None


class FailureCluster(BaseModel):
    """A group of failures sharing an error signature.

    Implements optimization #2 (Cluster Representative): evidence is
    fetched and classification is run once for `representative`; the
    resulting fix/verdict is broadcast to every member.
    """

    signature: str
    representative: FailureRecord
    members: list[FailureRecord]

    @property
    def size(self) -> int:
        return len(self.members)


# ---------------------------------------------------------------------------
# Agent outputs
# ---------------------------------------------------------------------------


class EvidenceBundle(BaseModel):
    source: str = "browserstack"
    simulated: bool = True
    session_id: str
    video_url: Optional[str] = None
    keyframe_summary: str = ""
    network_log_summary: str = ""
    failure_dom: str = ""


class Classification(BaseModel):
    category: ClassificationCategory
    confidence: float = Field(ge=0.0, le=1.0)
    tier: ClassificationTier
    reasoning: str = ""
    reflexion_rounds: int = 0
    grounded_docs: list[str] = Field(default_factory=list)


class FixResult(BaseModel):
    applied: bool
    file_path: Optional[str] = None
    diff_summary: str = ""
    pr_url: Optional[str] = None
    verified: bool = False
    verification_notes: str = ""
    simulated: bool = True


class BugTicket(BaseModel):
    filed: bool
    issue_key: Optional[str] = None
    issue_url: Optional[str] = None
    is_duplicate_of: Optional[str] = None
    is_regression_clone: bool = False
    summary: str = ""
    simulated: bool = True


class TestDraft(BaseModel):
    drafted: bool
    file_path: Optional[str] = None
    pr_url: Optional[str] = None
    test_code: str = ""
    simulated: bool = True


class RerunPolicy(str, Enum):
    RETRY_IMMEDIATE_3X = "RETRY_IMMEDIATE_3X"
    RETRY_IMMEDIATE_2X = "RETRY_IMMEDIATE_2X"
    RETRY_ONCE_THEN_FIX = "RETRY_ONCE_THEN_FIX"
    FIX_FIRST_VERIFY_ONCE = "FIX_FIRST_VERIFY_ONCE"
    NO_RERUN_EXCLUDE = "NO_RERUN_EXCLUDE"
    NO_RERUN_FIX_DATA = "NO_RERUN_FIX_DATA"
    NO_RERUN_DRAFT_TEST = "NO_RERUN_DRAFT_TEST"


class EscalationDecision(BaseModel):
    policy: RerunPolicy
    excluded_from_ci: bool
    slack_notified: bool
    notes: str = ""
    simulated: bool = True


class ClusterCost(BaseModel):
    llm_calls: int = 0
    input_tokens: int = 0
    output_tokens: int = 0
    cache_hits: int = 0
    cache_read_input_tokens: int = 0
    estimated_cost_usd: float = 0.0


class ClusterResult(BaseModel):
    signature: str
    stream: Stream
    cluster_size: int
    representative_test_id: str
    classification: Classification
    evidence: Optional[EvidenceBundle] = None
    fix_result: Optional[FixResult] = None
    bug_ticket: Optional[BugTicket] = None
    test_draft: Optional[TestDraft] = None
    escalation: Optional[EscalationDecision] = None
    cost: ClusterCost = Field(default_factory=ClusterCost)
    errors: list[str] = Field(default_factory=list)


class AgentActionContract(BaseModel):
    """Machine-readable summary of everything the agent decided this run.

    This is what a human reviewer (or a downstream CI gate) consumes each
    morning -- the "5 draft PRs, 3 JIRA bugs, 8 escalations" digest.
    """

    run_id: str
    stream: Stream
    build_id: str
    generated_at: str = Field(default_factory=utcnow)
    prs_opened: list[str] = Field(default_factory=list)
    bugs_filed: list[str] = Field(default_factory=list)
    tests_drafted: list[str] = Field(default_factory=list)
    escalations: list[str] = Field(default_factory=list)
    excluded_test_ids: list[str] = Field(default_factory=list)


class RunMetrics(BaseModel):
    total_failures: int = 0
    total_clusters: int = 0
    llm_calls: int = 0
    cache_hits: int = 0
    semantic_cache_hits: int = 0
    estimated_cost_usd: float = 0.0
    duration_seconds: float = 0.0
    category_counts: dict[str, int] = Field(default_factory=dict)


class RunReport(BaseModel):
    run_id: str
    stream: Stream
    build_id: str
    status: str = "running"  # running | completed | failed
    started_at: str = Field(default_factory=utcnow)
    completed_at: Optional[str] = None
    clusters: list[ClusterResult] = Field(default_factory=list)
    metrics: RunMetrics = Field(default_factory=RunMetrics)
    action_contract: Optional[AgentActionContract] = None
    error: Optional[str] = None


class RunRequest(BaseModel):
    stream: Stream = Stream.SEVEN_ELEVEN_ANDROID
    build_id: Optional[str] = None
    report_path: Optional[str] = None  # if omitted, the bundled sample report is used
    report_records: Optional[list[dict[str, Any]]] = None  # inline records, alternative to report_path
