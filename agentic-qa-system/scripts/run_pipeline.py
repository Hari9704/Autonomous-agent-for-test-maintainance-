"""
CLI runner -- exercises the full pipeline synchronously without needing the
FastAPI server, and pretty-prints the resulting report. Good for a quick
local demo:

    python -m scripts.run_pipeline --stream 7eleven-android
    python -m scripts.run_pipeline --report path/to/report.json --stream 7eleven-android
"""

from __future__ import annotations

import argparse
import asyncio

from rich.console import Console
from rich.table import Table

from app.models import RunRequest, Stream
from app.pipeline import _execute_run  # noqa: SLF001 -- intentional reuse of the run executor for the CLI
from app.models import RunReport
from scripts.seed_knowledge_bases import seed

console = Console()


async def _main(stream: str, report_path: str | None, seed_first: bool) -> None:
    if seed_first:
        stats = seed()
        console.print(f"[cyan]Seeded knowledge bases:[/cyan] {stats}")

    request = RunRequest(stream=Stream(stream), report_path=report_path, build_id="cli-run")
    report = RunReport(run_id="cli-run-report", stream=request.stream, build_id=request.build_id)
    console.print(f"[bold]Running agentic QA pipeline for stream={stream}...[/bold]")
    await _execute_run(report, request)

    console.print(f"\n[bold green]Run {report.status}[/bold green] in {report.metrics.duration_seconds:.2f}s")

    table = Table(title="Cluster Results")
    table.add_column("Test")
    table.add_column("Size")
    table.add_column("Category")
    table.add_column("Tier")
    table.add_column("Outcome")
    for c in report.clusters:
        outcome = "-"
        if c.fix_result and c.fix_result.pr_url:
            outcome = f"PR {c.fix_result.pr_url}"
        elif c.bug_ticket and c.bug_ticket.filed:
            outcome = f"Bug {c.bug_ticket.issue_key}"
        elif c.bug_ticket and c.bug_ticket.is_duplicate_of:
            outcome = f"Dup of {c.bug_ticket.is_duplicate_of}"
        elif c.test_draft and c.test_draft.pr_url:
            outcome = f"Test draft PR {c.test_draft.pr_url}"
        elif c.escalation:
            outcome = f"{c.escalation.policy.value} (excluded={c.escalation.excluded_from_ci})"
        table.add_row(
            c.representative_test_id,
            str(c.cluster_size),
            c.classification.category.value,
            c.classification.tier.value,
            outcome,
        )
    console.print(table)

    console.print(
        f"\n[bold]Metrics:[/bold] failures={report.metrics.total_failures} "
        f"clusters={report.metrics.total_clusters} llm_calls={report.metrics.llm_calls} "
        f"cache_hits={report.metrics.cache_hits} est_cost=${report.metrics.estimated_cost_usd:.6f}"
    )
    console.print(f"[bold]Category breakdown:[/bold] {report.metrics.category_counts}")

    if report.action_contract:
        console.print("\n[bold]Agent Action Contract:[/bold]")
        console.print(report.action_contract.model_dump())


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Run the agentic QA pipeline locally.")
    parser.add_argument("--stream", default="7eleven-android", choices=[s.value for s in Stream])
    parser.add_argument("--report", default=None, help="Path to a failure report JSON/XLSX file")
    parser.add_argument("--no-seed", action="store_true", help="Skip seeding demo knowledge base documents")
    args = parser.parse_args()

    asyncio.run(_main(args.stream, args.report, seed_first=not args.no_seed))
