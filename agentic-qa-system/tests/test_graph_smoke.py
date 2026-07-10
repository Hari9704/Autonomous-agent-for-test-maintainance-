"""
End-to-end smoke test: runs the full compiled LangGraph cluster graph with
no LLM API keys configured (i.e. fully simulated mode) and asserts it
completes without raising and produces a well-formed result for each
classification path.
"""

import asyncio
import tempfile
from pathlib import Path

import pytest

from app.config import settings
from app.graph.supervisor import get_cluster_graph
from app.ingestion.clustering import cluster_failures
from app.ingestion.report_parser import parse_report


@pytest.fixture(autouse=True)
def _isolated_storage(tmp_path):
    # Point storage at a temp dir so the smoke test never touches real run data.
    # `settings.storage` is a frozen dataclass, so we bypass immutability
    # deliberately here rather than relax it for the whole app.
    object.__setattr__(settings.storage, "chroma_dir", str(tmp_path / "chroma"))
    object.__setattr__(settings.storage, "sqlite_path", str(tmp_path / "state.db"))
    # Reset memoized singletons so they pick up the patched paths.
    import app.memory.knowledge_bases as kb_mod
    import app.memory.semantic_cache as cache_mod
    import app.memory.state_store as store_mod

    kb_mod.KnowledgeBaseStore._instance = None
    cache_mod.SemanticResponseCache._instance = None
    store_mod.StateStore._instance = None
    yield


def test_cluster_graph_runs_end_to_end_in_simulated_mode():
    records = parse_report(Path(__file__).parent.parent / "data" / "sample_reports" / "nightly_failures_sample.json")
    clusters = cluster_failures(records)
    assert len(clusters) >= 4

    graph = get_cluster_graph()

    async def run_all():
        from app.cost.optimizer import CostTracker

        results = []
        for cluster in clusters:
            tracker = CostTracker()
            state = {"cluster": cluster, "stream": cluster.representative.stream.value, "cost_tracker": tracker, "errors": []}
            final_state = await graph.ainvoke(state)
            results.append(final_state)
        return results

    results = asyncio.run(run_all())

    assert len(results) == len(clusters)
    for final_state in results:
        assert "classification" in final_state
        # Every cluster must exit through exactly one specialist path.
        specialist_outputs = [
            final_state.get("fix_result"),
            final_state.get("bug_ticket"),
            final_state.get("test_draft"),
            final_state.get("escalation"),
        ]
        assert sum(1 for o in specialist_outputs if o is not None) == 1
