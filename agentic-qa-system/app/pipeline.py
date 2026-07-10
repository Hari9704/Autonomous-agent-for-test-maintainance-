"""
PipelineRunner -- top-level orchestration: parse -> cluster -> run the
LangGraph cluster graph over every cluster (concurrently, optimization #5)
-> aggregate a RunReport -> persist to disk and to the state store.
"""

from __future__ import annotations

import asyncio
import logging
import time
import uuid
from pathlib import Path

from app.config import settings
from app.cost.optimizer import CostTracker
from app.graph.supervisor import get_cluster_graph
from app.ingestion.clustering import cluster_failures
from app.ingestion.report_parser import parse_records, parse_report
from app.memory.state_store import get_state_store
from app.models import (
    AgentActionContract,
    ClusterResult,
    FailureCluster,
    RunMetrics,
    RunReport,
    RunRequest,
)

logger = logging.getLogger("qa_agent.pipeline")

# In-memory run registry for the API layer; also mirrored to disk under
# `data/runs/<run_id>.json` so runs survive a process restart.
_RUNS: dict[str, RunReport] = {}


def list_runs() -> list[RunReport]:
    return sorted(_RUNS.values(), key=lambda r: r.started_at, reverse=True)


def get_run(run_id: str) -> RunReport | None:
    return _RUNS.get(run_id)


async def start_run(request: RunRequest) -> RunReport:
    # uuid4 suffix, not a bare timestamp: two runs started without an
    # explicit build_id in the same second would otherwise get the same
    # default id and trip the idempotency guard as a false conflict.
    build_id = request.build_id or f"build-{uuid.uuid4().hex[:10]}"
    store = get_state_store()

    if store.is_build_already_running(build_id, request.stream.value):
        raise ValueError(f"Build {build_id} for stream {request.stream.value} is already being processed (idempotency guard).")

    run_id = str(uuid.uuid4())
    report = RunReport(run_id=run_id, stream=request.stream, build_id=build_id)
    _RUNS[run_id] = report
    store.mark_build_started(build_id, request.stream.value, run_id)

    asyncio.create_task(_execute_run(report, request))
    return report


async def _execute_run(report: RunReport, request: RunRequest) -> None:
    started = time.monotonic()
    store = get_state_store()
    try:
        if request.report_records is not None:
            records = parse_records(request.report_records)
        else:
            # Relative to the data directory (see `_resolve_within_data_dir`
            # in report_parser.py), not the process cwd.
            report_path = request.report_path or "sample_reports/nightly_failures_sample.json"
            records = parse_report(report_path)

        records = [r for r in records if r.stream == request.stream]
        clusters = cluster_failures(records)
        report.metrics.total_failures = len(records)
        report.metrics.total_clusters = len(clusters)

        semaphore = asyncio.Semaphore(settings.max_parallel_clusters)

        async def _run_one(cluster: FailureCluster) -> ClusterResult:
            async with semaphore:
                return await _run_cluster(cluster, request.stream.value)

        results = await asyncio.gather(*(_run_one(c) for c in clusters), return_exceptions=True)

        for cluster, result in zip(clusters, results):
            if isinstance(result, Exception):
                logger.exception("Cluster %s failed", cluster.signature[:8], exc_info=result)
                report.clusters.append(
                    ClusterResult(
                        signature=cluster.signature,
                        stream=request.stream,
                        cluster_size=cluster.size,
                        representative_test_id=cluster.representative.test_id,
                        classification=_fallback_classification(),
                        errors=[str(result)],
                    )
                )
            else:
                report.clusters.append(result)

        _aggregate_metrics(report)
        report.action_contract = _build_action_contract(report)
        report.status = "completed"
        store.mark_build_finished(report.build_id, report.stream.value, "completed")
    except Exception as exc:
        logger.exception("Run %s failed", report.run_id)
        report.status = "failed"
        report.error = str(exc)
        store.mark_build_finished(report.build_id, report.stream.value, "failed")
    finally:
        report.metrics.duration_seconds = round(time.monotonic() - started, 3)
        report.completed_at = report.completed_at or _iso_now()
        _persist_report(report)


async def _run_cluster(cluster: FailureCluster, stream: str) -> ClusterResult:
    graph = get_cluster_graph()
    tracker = CostTracker()
    initial_state = {"cluster": cluster, "stream": stream, "cost_tracker": tracker, "errors": []}

    final_state = await graph.ainvoke(initial_state)

    return ClusterResult(
        signature=cluster.signature,
        stream=stream,
        cluster_size=cluster.size,
        representative_test_id=cluster.representative.test_id,
        classification=final_state["classification"],
        evidence=final_state.get("evidence"),
        fix_result=final_state.get("fix_result"),
        bug_ticket=final_state.get("bug_ticket"),
        test_draft=final_state.get("test_draft"),
        escalation=final_state.get("escalation"),
        cost=tracker.cost,
        errors=final_state.get("errors", []),
    )


def _aggregate_metrics(report: RunReport) -> None:
    metrics = RunMetrics(total_failures=report.metrics.total_failures, total_clusters=report.metrics.total_clusters)
    for cluster_result in report.clusters:
        metrics.llm_calls += cluster_result.cost.llm_calls
        metrics.cache_hits += cluster_result.cost.cache_hits
        metrics.semantic_cache_hits += cluster_result.cost.semantic_cache_hits
        metrics.estimated_cost_usd += cluster_result.cost.estimated_cost_usd
        category = cluster_result.classification.category.value
        metrics.category_counts[category] = metrics.category_counts.get(category, 0) + cluster_result.cluster_size
    metrics.estimated_cost_usd = round(metrics.estimated_cost_usd, 6)
    report.metrics = metrics


def _build_action_contract(report: RunReport) -> AgentActionContract:
    contract = AgentActionContract(run_id=report.run_id, stream=report.stream, build_id=report.build_id)
    for c in report.clusters:
        if c.fix_result and c.fix_result.pr_url:
            contract.prs_opened.append(c.fix_result.pr_url)
        if c.test_draft and c.test_draft.pr_url:
            contract.tests_drafted.append(c.test_draft.pr_url)
        if c.bug_ticket and c.bug_ticket.filed and c.bug_ticket.issue_url:
            contract.bugs_filed.append(c.bug_ticket.issue_url)
        if c.escalation:
            contract.escalations.append(f"{c.representative_test_id}: {c.escalation.policy.value}")
            if c.escalation.excluded_from_ci:
                contract.excluded_test_ids.append(c.representative_test_id)
    return contract


def _fallback_classification():
    from app.models import Classification, ClassificationCategory, ClassificationTier

    return Classification(
        category=ClassificationCategory.UNKNOWN,
        confidence=0.0,
        tier=ClassificationTier.TIER1_RULE,
        reasoning="Cluster processing raised an exception; see `errors`.",
    )


def _persist_report(report: RunReport) -> None:
    Path(settings.storage.runs_dir).mkdir(parents=True, exist_ok=True)
    out_path = Path(settings.storage.runs_dir) / f"{report.run_id}.json"
    out_path.write_text(report.model_dump_json(indent=2))


def _iso_now() -> str:
    from datetime import datetime, timezone

    return datetime.now(timezone.utc).isoformat()
