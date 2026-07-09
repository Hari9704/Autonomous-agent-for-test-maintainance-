"""
Slack adapter -- posts escalation alerts for flaky/infra/test-data failures
that don't get an automatic fix (used by the Escalation Agent).

Live mode uses the Slack Web API `chat.postMessage` (`SLACK_BOT_TOKEN`,
`SLACK_CHANNEL`). Without those, logs and returns a simulated delivery
receipt.

Docs: https://api.slack.com/methods/chat.postMessage
"""

from __future__ import annotations

import logging

import httpx

from app.config import settings
from app.integrations.base import ToolAdapter

logger = logging.getLogger("qa_agent.integrations.slack")


class SlackAdapter(ToolAdapter):
    name = "slack"

    def __init__(self) -> None:
        self._token = settings.integrations.slack_bot_token
        self._channel = settings.integrations.slack_channel
        self.log_mode()

    @property
    def is_live(self) -> bool:
        return bool(self._token)

    def post_message(self, text: str) -> dict:
        if not self.is_live:
            logger.info("[SIMULATED SLACK -> %s] %s", self._channel, text)
            return {"simulated": True, "channel": self._channel, "note": "[SIMULATED] set SLACK_BOT_TOKEN for real alerts"}

        try:
            with httpx.Client(
                base_url="https://slack.com/api",
                headers={"Authorization": f"Bearer {self._token}"},
                timeout=10,
            ) as client:
                resp = client.post("/chat.postMessage", json={"channel": self._channel, "text": text})
                resp.raise_for_status()
                data = resp.json()
                if not data.get("ok"):
                    raise RuntimeError(data.get("error", "unknown_slack_error"))
            return {"simulated": False, "channel": self._channel, "ts": data.get("ts")}
        except Exception as exc:
            logger.warning("Slack live call failed (%s); falling back to simulated alert", exc)
            return {"simulated": True, "channel": self._channel, "note": f"[SIMULATED] live call failed: {exc}"}


_adapter: SlackAdapter | None = None


def get_slack_adapter() -> SlackAdapter:
    global _adapter
    if _adapter is None:
        _adapter = SlackAdapter()
    return _adapter
