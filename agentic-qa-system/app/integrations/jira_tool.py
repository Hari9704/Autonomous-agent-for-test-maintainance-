"""
Jira adapter -- files bug tickets for APP_BUG classifications (used by the
Bug Review Agent). Dedup/regression-clone decisions happen upstream via
semantic search against KB_JIRA_HISTORY (see `app/graph/bug_review.py`);
this module only performs the actual create-issue call.

Live mode uses the Jira Cloud REST API v3 (`JIRA_BASE_URL`, `JIRA_EMAIL`,
`JIRA_API_TOKEN`, `JIRA_PROJECT_KEY`). Without those, returns a simulated
issue key so the graph still produces a complete `BugTicket`.

Docs: https://developer.atlassian.com/cloud/jira/platform/rest/v3/
"""

from __future__ import annotations

import logging
import time

import httpx

from app.config import settings
from app.integrations.base import ToolAdapter

logger = logging.getLogger("qa_agent.integrations.jira")


class JiraAdapter(ToolAdapter):
    name = "jira"

    def __init__(self) -> None:
        cfg = settings.integrations
        self._base_url = cfg.jira_base_url
        self._email = cfg.jira_email
        self._token = cfg.jira_api_token
        self._project_key = cfg.jira_project_key
        self.log_mode()

    @property
    def is_live(self) -> bool:
        return bool(self._base_url and self._email and self._token)

    def create_issue(self, *, summary: str, description: str, labels: list[str] | None = None) -> dict:
        if not self.is_live:
            return self._simulated_issue(summary)

        try:
            with httpx.Client(
                base_url=self._base_url.rstrip("/"),
                auth=(self._email, self._token),
                headers={"Accept": "application/json", "Content-Type": "application/json"},
                timeout=20,
            ) as client:
                resp = client.post(
                    "/rest/api/3/issue",
                    json={
                        "fields": {
                            "project": {"key": self._project_key},
                            "summary": summary,
                            "description": {
                                "type": "doc",
                                "version": 1,
                                "content": [
                                    {"type": "paragraph", "content": [{"type": "text", "text": description}]}
                                ],
                            },
                            "issuetype": {"name": "Bug"},
                            "labels": labels or ["agentic-qa"],
                        }
                    },
                )
                resp.raise_for_status()
                data = resp.json()
            issue_key = data["key"]
            return {
                "simulated": False,
                "issue_key": issue_key,
                "issue_url": f"{self._base_url.rstrip('/')}/browse/{issue_key}",
            }
        except Exception as exc:
            logger.warning("Jira live call failed (%s); falling back to simulated issue", exc)
            return self._simulated_issue(summary)

    def _simulated_issue(self, summary: str) -> dict:
        fake_id = int(time.time()) % 10000
        issue_key = f"{self._project_key}-{fake_id}"
        return {
            "simulated": True,
            "issue_key": issue_key,
            "issue_url": f"https://simulated.atlassian.net/browse/{issue_key}",
            "note": f"[SIMULATED] Would file bug '{summary}' (set JIRA_BASE_URL/JIRA_EMAIL/JIRA_API_TOKEN "
            "for a real ticket).",
        }


_adapter: JiraAdapter | None = None


def get_jira_adapter() -> JiraAdapter:
    global _adapter
    if _adapter is None:
        _adapter = JiraAdapter()
    return _adapter
