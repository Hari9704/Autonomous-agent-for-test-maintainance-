"""Evidence Agent node -- fetches BrowserStack evidence for the cluster's
representative failure. Runs in parallel with `triage` (fan-out from START)."""

from __future__ import annotations

import logging

from app.graph.state import ClusterState
from app.integrations.browserstack import get_browserstack_adapter

logger = logging.getLogger("qa_agent.graph.evidence")


def evidence_node(state: ClusterState) -> dict:
    cluster = state["cluster"]
    adapter = get_browserstack_adapter()
    evidence = adapter.fetch_evidence(cluster.representative)
    logger.info(
        "[evidence] cluster=%s live=%s session=%s", cluster.signature[:8], not evidence.simulated, evidence.session_id
    )
    return {"evidence": evidence}
