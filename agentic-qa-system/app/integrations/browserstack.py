"""
BrowserStack adapter -- fetches session evidence (video, logs, DOM) for the
representative test in a failure cluster (used by the Evidence Agent).

Live mode calls the real BrowserStack App Automate REST API using
`BROWSERSTACK_USERNAME` / `BROWSERSTACK_ACCESS_KEY`. Without those, returns
a deterministic simulated bundle shaped exactly like the real response so
downstream code (evidence node, cost tracker, API serialization) is
exercised identically either way.

Docs: https://www.browserstack.com/docs/app-automate/api-reference
"""

from __future__ import annotations

import logging

import httpx

from app.config import settings
from app.integrations.base import ToolAdapter
from app.models import EvidenceBundle, FailureRecord

logger = logging.getLogger("qa_agent.integrations.browserstack")

_BASE_URL = "https://api-cloud.browserstack.com/app-automate"


class BrowserStackAdapter(ToolAdapter):
    name = "browserstack"

    def __init__(self) -> None:
        self._username = settings.integrations.browserstack_username
        self._access_key = settings.integrations.browserstack_access_key
        self.log_mode()

    @property
    def is_live(self) -> bool:
        return bool(self._username and self._access_key)

    def fetch_evidence(self, record: FailureRecord) -> EvidenceBundle:
        if not self.is_live:
            return self._simulated_evidence(record)

        session_id = record.session_url.rstrip("/").rsplit("/", 1)[-1] if record.session_url else record.test_id
        try:
            with httpx.Client(auth=(self._username, self._access_key), timeout=15) as client:
                resp = client.get(f"{_BASE_URL}/sessions/{session_id}.json")
                resp.raise_for_status()
                data = resp.json().get("automation_session", {})
            return EvidenceBundle(
                simulated=False,
                session_id=session_id,
                video_url=data.get("video_url"),
                keyframe_summary=f"BrowserStack session status: {data.get('status', 'unknown')}",
                network_log_summary="Fetched via BrowserStack App Automate API.",
                failure_dom=record.dom_snippet,
            )
        except Exception as exc:  # network/API errors shouldn't crash the graph
            logger.warning("BrowserStack live call failed (%s); falling back to simulated evidence", exc)
            return self._simulated_evidence(record)

    @staticmethod
    def _simulated_evidence(record: FailureRecord) -> EvidenceBundle:
        return EvidenceBundle(
            simulated=True,
            session_id=f"sim-session-{record.test_id}",
            video_url=None,
            keyframe_summary=f"[SIMULATED] Keyframes would show the '{record.screen_name or 'unknown'}' screen "
            f"at the moment of failure for test '{record.test_name}'.",
            network_log_summary="[SIMULATED] No live BrowserStack credentials configured "
            "(set BROWSERSTACK_USERNAME / BROWSERSTACK_ACCESS_KEY).",
            failure_dom=record.dom_snippet or "[SIMULATED] <no DOM snapshot captured>",
        )


_adapter: BrowserStackAdapter | None = None


def get_browserstack_adapter() -> BrowserStackAdapter:
    global _adapter
    if _adapter is None:
        _adapter = BrowserStackAdapter()
    return _adapter
