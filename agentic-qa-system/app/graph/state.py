"""
LangGraph state schema for processing a single failure cluster.

The supervisor graph fans out from START into `evidence` and `triage` in
parallel, routes to exactly one specialist based on the classification,
then funnels every path through `feedback` before `END`. One compiled
graph handles every cluster in a run; `app/pipeline.py` invokes it once
per cluster (optionally concurrently -- optimization #5).
"""

from __future__ import annotations

from typing import Optional

from typing_extensions import TypedDict

from app.cost.optimizer import CostTracker
from app.models import (
    BugTicket,
    Classification,
    EscalationDecision,
    EvidenceBundle,
    FailureCluster,
    FixResult,
    TestDraft,
)


class ClusterState(TypedDict, total=False):
    cluster: FailureCluster
    stream: str

    evidence: Optional[EvidenceBundle]
    classification: Optional[Classification]

    fix_result: Optional[FixResult]
    bug_ticket: Optional[BugTicket]
    test_draft: Optional[TestDraft]
    escalation: Optional[EscalationDecision]

    cost_tracker: CostTracker
    errors: list[str]
