"""
Shared adapter contract for every external tool (BrowserStack, GitHub,
Jira, Slack). Each adapter exposes `is_live` (True once its credentials
are configured) and returns response objects tagged `simulated: bool` so
callers and the API always know whether a given result came from a real
API call or a stand-in. This is the seam you swap when you add real
credentials -- no other code in the graph needs to change.
"""

from __future__ import annotations

import logging
from abc import ABC, abstractmethod

logger = logging.getLogger("qa_agent.integrations")


class ToolAdapter(ABC):
    name: str = "tool"

    @property
    @abstractmethod
    def is_live(self) -> bool:
        """True once real credentials are present for this adapter."""

    def log_mode(self) -> None:
        mode = "LIVE" if self.is_live else "SIMULATED"
        logger.info("[%s] operating in %s mode", self.name, mode)
