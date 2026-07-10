"""
Optimization #2 -- Cluster Representative.

Groups failures that share a normalized error signature so evidence is
fetched and classification runs once per cluster instead of once per test.
A signature strips things that vary per-test-instance (numbers, quoted
literals, UUIDs) but keeps the shape of the error message, so "checkout
button not found for order #4471" and "checkout button not found for
order #9820" collapse into the same cluster.
"""

from __future__ import annotations

import re
from collections import defaultdict

from app.memory.state_store import signature_hash
from app.models import FailureCluster, FailureRecord

_NUMBER_RE = re.compile(r"\d+")
_QUOTED_RE = re.compile(r"['\"][^'\"]*['\"]")
_UUID_RE = re.compile(r"[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}")


def normalize_error(message: str) -> str:
    text = _UUID_RE.sub("<uuid>", message)
    text = _QUOTED_RE.sub("<literal>", text)
    text = _NUMBER_RE.sub("<n>", text)
    return " ".join(text.split()).lower().strip()


def cluster_failures(records: list[FailureRecord]) -> list[FailureCluster]:
    groups: dict[str, list[FailureRecord]] = defaultdict(list)
    for record in records:
        key = normalize_error(f"{record.test_name}::{record.error_message}")
        groups[key].append(record)

    clusters: list[FailureCluster] = []
    for normalized, members in groups.items():
        # Prefer the member with the richest evidence (DOM snippet + stack trace) as representative.
        representative = max(members, key=lambda r: len(r.dom_snippet) + len(r.stack_trace))
        clusters.append(
            FailureCluster(
                signature=signature_hash(normalized),
                representative=representative,
                members=members,
            )
        )
    # Largest clusters first -- these are the highest-value fixes to review first.
    clusters.sort(key=lambda c: c.size, reverse=True)
    return clusters
