"""Test Writer Agent node -- for FUNC_CHANGED classifications, drafts a new
test skeleton grounded in KB_FUNCTIONAL_DOCS and opens a draft PR."""

from __future__ import annotations

import logging
import time

from app.cost.optimizer import enforce_json_only
from app.graph.state import ClusterState
from app.integrations.github_tool import get_github_adapter
from app.llm import LLMRouter
from app.memory.knowledge_bases import KB_FUNCTIONAL_DOCS, get_kb_store
from app.models import TestDraft
from app.prompts.library import TEST_DRAFT_SYSTEM_PROMPT, test_draft_user_prompt

logger = logging.getLogger("qa_agent.graph.test_writer")

_llm = LLMRouter()


def test_writer_node(state: ClusterState) -> dict:
    cluster = state["cluster"]
    tracker = state["cost_tracker"]

    kb = get_kb_store()
    doc_hits = kb.query(KB_FUNCTIONAL_DOCS, cluster.representative.error_message, top_k=2)
    doc_context = [h["text"] for h in doc_hits]

    payload, llm_resp = _llm.complete_json(
        tier="deep",
        system_prompt=TEST_DRAFT_SYSTEM_PROMPT + "\n" + enforce_json_only('{"file_path": str, "test_code": str}'),
        user_prompt=test_draft_user_prompt(cluster, doc_context),
    )
    tracker.record("deep", llm_resp)

    file_path = payload.get("file_path") or f"src/test/specs/{cluster.representative.test_name}.updated.spec.ts"
    test_code = payload.get("test_code", "")

    github = get_github_adapter()
    branch_name = f"agentic-qa/test-draft-{cluster.signature[:8]}-{int(time.time())}"
    pr = github.open_pull_request(
        branch_name=branch_name,
        file_path=file_path,
        file_content=test_code,
        commit_message=f"test(qa-agent): draft updated test for {cluster.representative.test_name}",
        pr_title=f"[QA-Agent] Draft updated test for {cluster.representative.test_name} (flow changed)",
        pr_body=f"The underlying flow appears to have changed intentionally. Draft test for human review.\n\n"
        f"Cluster `{cluster.signature[:8]}`, {cluster.size} affected test run(s).",
    )

    test_draft = TestDraft(
        drafted=True,
        file_path=file_path,
        pr_url=pr.get("pr_url"),
        test_code=test_code,
        simulated=pr.get("simulated", True),
    )
    logger.info("[test_writer] cluster=%s pr=%s simulated=%s", cluster.signature[:8], test_draft.pr_url, test_draft.simulated)
    return {"test_draft": test_draft}
