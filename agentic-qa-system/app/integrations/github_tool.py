"""
GitHub adapter -- opens draft PRs for locator fixes and new test files (used
by the Fix Agent and Test Writer Agent).

Live mode uses the GitHub REST API (`GITHUB_TOKEN` + `QA_AGENT_GITHUB_REPO`,
e.g. "org/mobile-qa-suite") to create a branch, commit a file, and open a
pull request. Without those, returns a simulated PR URL/number so the
graph still produces a complete, inspectable `FixResult` / `TestDraft`.

Docs: https://docs.github.com/en/rest/pulls/pulls
"""

from __future__ import annotations

import base64
import logging
import time

import httpx

from app.config import settings
from app.integrations.base import ToolAdapter

logger = logging.getLogger("qa_agent.integrations.github")

_API = "https://api.github.com"


class GitHubAdapter(ToolAdapter):
    name = "github"

    def __init__(self) -> None:
        self._token = settings.integrations.github_token
        self._repo = settings.integrations.github_repo
        self.log_mode()

    @property
    def is_live(self) -> bool:
        return bool(self._token and self._repo)

    def open_pull_request(
        self,
        *,
        branch_name: str,
        file_path: str,
        file_content: str,
        commit_message: str,
        pr_title: str,
        pr_body: str,
        base_branch: str = "main",
    ) -> dict:
        if not self.is_live:
            return self._simulated_pr(branch_name, pr_title)

        headers = {"Authorization": f"Bearer {self._token}", "Accept": "application/vnd.github+json"}
        try:
            with httpx.Client(base_url=_API, headers=headers, timeout=20) as client:
                base_ref = client.get(f"/repos/{self._repo}/git/ref/heads/{base_branch}")
                base_ref.raise_for_status()
                base_sha = base_ref.json()["object"]["sha"]

                client.post(
                    f"/repos/{self._repo}/git/refs",
                    json={"ref": f"refs/heads/{branch_name}", "sha": base_sha},
                ).raise_for_status()

                client.put(
                    f"/repos/{self._repo}/contents/{file_path}",
                    json={
                        "message": commit_message,
                        "content": base64.b64encode(file_content.encode()).decode(),
                        "branch": branch_name,
                    },
                ).raise_for_status()

                pr_resp = client.post(
                    f"/repos/{self._repo}/pulls",
                    json={
                        "title": pr_title,
                        "body": pr_body,
                        "head": branch_name,
                        "base": base_branch,
                        "draft": True,
                    },
                )
                pr_resp.raise_for_status()
                pr = pr_resp.json()
            return {"simulated": False, "pr_url": pr["html_url"], "pr_number": pr["number"]}
        except Exception as exc:
            logger.warning("GitHub live call failed (%s); falling back to simulated PR", exc)
            return self._simulated_pr(branch_name, pr_title)

    @staticmethod
    def _simulated_pr(branch_name: str, pr_title: str) -> dict:
        fake_number = int(time.time()) % 10000
        return {
            "simulated": True,
            "pr_url": f"https://github.com/simulated/repo/pull/{fake_number}",
            "pr_number": fake_number,
            "note": f"[SIMULATED] Would open draft PR '{pr_title}' from branch '{branch_name}' "
            "(set GITHUB_TOKEN + QA_AGENT_GITHUB_REPO for a real PR).",
        }


_adapter: GitHubAdapter | None = None


def get_github_adapter() -> GitHubAdapter:
    global _adapter
    if _adapter is None:
        _adapter = GitHubAdapter()
    return _adapter
