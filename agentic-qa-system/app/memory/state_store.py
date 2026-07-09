"""
Fast exact-match memory tier -- a local SQLite stand-in for the 3 DynamoDB
tables in the architecture doc. Swap for a real `boto3` DynamoDB client
later behind the same `StateStore` interface.

  classification_cache  -- SHA-256(error signature) -> last classification (Tier-2 cache)
  test_execution_state  -- per test_id attempt/flakiness tracking
  idempotency            -- build_id+stream already processed? guards duplicate runs
"""

from __future__ import annotations

import hashlib
import sqlite3
import threading
from contextlib import contextmanager
from datetime import datetime, timezone
from pathlib import Path

from app.config import settings

_SCHEMA = """
CREATE TABLE IF NOT EXISTS classification_cache (
    signature TEXT NOT NULL,
    stream TEXT NOT NULL,
    category TEXT NOT NULL,
    confidence REAL NOT NULL,
    tier TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    PRIMARY KEY (signature, stream)
);

CREATE TABLE IF NOT EXISTS test_execution_state (
    test_id TEXT NOT NULL,
    stream TEXT NOT NULL,
    attempt_count INTEGER NOT NULL DEFAULT 0,
    last_category TEXT,
    flakiness_score REAL NOT NULL DEFAULT 0.0,
    excluded_from_ci INTEGER NOT NULL DEFAULT 0,
    updated_at TEXT NOT NULL,
    PRIMARY KEY (test_id, stream)
);

CREATE TABLE IF NOT EXISTS idempotency (
    build_id TEXT NOT NULL,
    stream TEXT NOT NULL,
    status TEXT NOT NULL,
    run_id TEXT,
    started_at TEXT NOT NULL,
    PRIMARY KEY (build_id, stream)
);
"""


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


def signature_hash(text: str) -> str:
    return hashlib.sha256(text.strip().lower().encode("utf-8")).hexdigest()


class StateStore:
    _instance: "StateStore | None" = None
    _lock = threading.Lock()

    def __init__(self) -> None:
        Path(settings.storage.sqlite_path).parent.mkdir(parents=True, exist_ok=True)
        self._path = settings.storage.sqlite_path
        self._local = threading.local()
        with self._connect() as conn:
            conn.executescript(_SCHEMA)

    @classmethod
    def instance(cls) -> "StateStore":
        with cls._lock:
            if cls._instance is None:
                cls._instance = cls()
            return cls._instance

    @contextmanager
    def _connect(self):
        conn = sqlite3.connect(self._path, check_same_thread=False)
        try:
            yield conn
            conn.commit()
        finally:
            conn.close()

    # -- classification_cache (Tier-2 exact match) ------------------------

    def get_cached_classification(self, signature: str, stream: str) -> dict | None:
        with self._connect() as conn:
            row = conn.execute(
                "SELECT category, confidence, tier FROM classification_cache WHERE signature = ? AND stream = ?",
                (signature, stream),
            ).fetchone()
        if not row:
            return None
        return {"category": row[0], "confidence": row[1], "tier": row[2]}

    def put_cached_classification(self, signature: str, stream: str, category: str, confidence: float, tier: str) -> None:
        with self._connect() as conn:
            conn.execute(
                """INSERT INTO classification_cache (signature, stream, category, confidence, tier, updated_at)
                   VALUES (?, ?, ?, ?, ?, ?)
                   ON CONFLICT(signature, stream) DO UPDATE SET
                       category=excluded.category, confidence=excluded.confidence,
                       tier=excluded.tier, updated_at=excluded.updated_at""",
                (signature, stream, category, confidence, tier, _now()),
            )

    # -- test_execution_state ---------------------------------------------

    def record_attempt(self, test_id: str, stream: str, category: str) -> dict:
        with self._connect() as conn:
            row = conn.execute(
                "SELECT attempt_count, flakiness_score FROM test_execution_state WHERE test_id = ? AND stream = ?",
                (test_id, stream),
            ).fetchone()
            attempt_count = (row[0] if row else 0) + 1
            prior_flakiness = row[1] if row else 0.0
            # Simple exponential smoothing: repeated FLAKY_INFRA/SPORADIC pushes the score up.
            bump = 0.25 if category in ("FLAKY_INFRA", "SPORADIC") else -0.1
            flakiness_score = max(0.0, min(1.0, prior_flakiness + bump))
            conn.execute(
                """INSERT INTO test_execution_state (test_id, stream, attempt_count, last_category, flakiness_score, updated_at)
                   VALUES (?, ?, ?, ?, ?, ?)
                   ON CONFLICT(test_id, stream) DO UPDATE SET
                       attempt_count=excluded.attempt_count, last_category=excluded.last_category,
                       flakiness_score=excluded.flakiness_score, updated_at=excluded.updated_at""",
                (test_id, stream, attempt_count, category, flakiness_score, _now()),
            )
        return {"attempt_count": attempt_count, "flakiness_score": flakiness_score}

    def set_excluded(self, test_id: str, stream: str, excluded: bool) -> None:
        with self._connect() as conn:
            conn.execute(
                "UPDATE test_execution_state SET excluded_from_ci = ?, updated_at = ? WHERE test_id = ? AND stream = ?",
                (1 if excluded else 0, _now(), test_id, stream),
            )

    # -- idempotency ---------------------------------------------------------

    def is_build_already_running(self, build_id: str, stream: str) -> bool:
        with self._connect() as conn:
            row = conn.execute(
                "SELECT status FROM idempotency WHERE build_id = ? AND stream = ?", (build_id, stream)
            ).fetchone()
        return bool(row) and row[0] == "running"

    def mark_build_started(self, build_id: str, stream: str, run_id: str) -> None:
        with self._connect() as conn:
            conn.execute(
                """INSERT INTO idempotency (build_id, stream, status, run_id, started_at)
                   VALUES (?, ?, 'running', ?, ?)
                   ON CONFLICT(build_id, stream) DO UPDATE SET status='running', run_id=excluded.run_id""",
                (build_id, stream, run_id, _now()),
            )

    def mark_build_finished(self, build_id: str, stream: str, status: str = "completed") -> None:
        with self._connect() as conn:
            conn.execute(
                "UPDATE idempotency SET status = ? WHERE build_id = ? AND stream = ?",
                (status, build_id, stream),
            )


def get_state_store() -> StateStore:
    return StateStore.instance()
