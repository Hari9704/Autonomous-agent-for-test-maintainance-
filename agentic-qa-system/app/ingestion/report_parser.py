"""
Parses a nightly failure report (JSON or XLSX export from the Appium/
BrowserStack CI run) into `FailureRecord` objects. This is the entry point
for the "GitHub Actions -> S3 -> report" leg of the trigger chain described
in the architecture doc; here it just reads a local file since there is no
S3/EventBridge wiring configured yet.
"""

from __future__ import annotations

import json
from pathlib import Path

import pandas as pd

from app.config import settings
from app.models import FailureRecord, Stream

REQUIRED_COLUMNS = ["test_id", "stream", "build_id", "test_name", "error_message"]

# Report files are only ever meant to come from the trusted "GitHub Actions
# -> S3 -> report" drop location this stands in for; the API accepts a path
# rather than an upload for POC simplicity, so it must not be usable to read
# arbitrary files on the host (path traversal / local file disclosure).
MAX_REPORT_BYTES = 10 * 1024 * 1024


def _resolve_within_data_dir(path: str | Path) -> Path:
    data_root = Path(settings.storage.data_dir).resolve()
    resolved = (data_root / path).resolve() if not Path(path).is_absolute() else Path(path).resolve()
    try:
        resolved.relative_to(data_root)
    except ValueError:
        raise ValueError(
            f"Report path must live under the data directory ({data_root}); got: {path}"
        ) from None
    return resolved


def parse_report(path: str | Path) -> list[FailureRecord]:
    path = _resolve_within_data_dir(path)
    if not path.exists():
        raise FileNotFoundError(f"Failure report not found: {path}")
    if not path.is_file():
        raise ValueError(f"Failure report path is not a file: {path}")
    if path.stat().st_size > MAX_REPORT_BYTES:
        raise ValueError(f"Failure report exceeds max size of {MAX_REPORT_BYTES} bytes: {path}")

    if path.suffix.lower() in (".xlsx", ".xls"):
        df = pd.read_excel(path)
        rows = df.to_dict(orient="records")
    elif path.suffix.lower() == ".json":
        rows = json.loads(path.read_text())
    else:
        raise ValueError(f"Unsupported report format: {path.suffix}")

    return parse_records(rows)


def parse_records(rows: list[dict]) -> list[FailureRecord]:
    records: list[FailureRecord] = []
    for row in rows:
        missing = [c for c in REQUIRED_COLUMNS if not row.get(c)]
        if missing:
            raise ValueError(f"Failure row missing required columns {missing}: {row}")
        records.append(
            FailureRecord(
                test_id=str(row["test_id"]),
                stream=Stream(row["stream"]),
                build_id=str(row["build_id"]),
                test_name=str(row["test_name"]),
                error_message=str(row["error_message"]),
                stack_trace=str(row.get("stack_trace", "") or ""),
                dom_snippet=str(row.get("dom_snippet", "") or ""),
                screen_name=row.get("screen_name"),
                session_url=row.get("session_url"),
                duration_ms=row.get("duration_ms"),
            )
        )
    return records
