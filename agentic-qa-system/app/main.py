"""
FastAPI entrypoint for the Agentic QA Test-Maintenance System.

Run locally with:  uvicorn app.main:app --host 0.0.0.0 --port $PORT
(the configured Replit workflow does exactly this).

Interactive API docs are available at `/docs` once running -- the easiest
way to trigger a run and watch the agent work without writing any client
code.
"""

from __future__ import annotations

import logging

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.memory.knowledge_bases import get_kb_store
from app.models import RunReport, RunRequest
from app.pipeline import get_run, list_runs, start_run

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s: %(message)s")
logger = logging.getLogger("qa_agent.main")

app = FastAPI(
    title="Agentic QA Test-Maintenance System",
    description=(
        "Autonomous multi-agent pipeline (LangGraph) that triages nightly mobile-QA failures, "
        "auto-fixes locator/wait issues, files deduplicated bug tickets, drafts tests for changed "
        "flows, and applies a rule-based smart re-run/escalation policy. "
        "Proof-of-concept: LLM calls, GitHub/Jira/Slack/BrowserStack integrations, and the semantic "
        "memory layer all run in a clearly-labeled SIMULATED mode until real credentials are added "
        "(see README.md)."
    ),
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health() -> dict:
    return {
        "status": "ok",
        "llm_provider": settings.llm.provider,
        "llm_live": settings.llm.is_live,
        "integrations": {
            "github": bool(settings.integrations.github_token and settings.integrations.github_repo),
            "jira": bool(settings.integrations.jira_base_url),
            "slack": bool(settings.integrations.slack_bot_token),
            "browserstack": bool(settings.integrations.browserstack_username),
        },
        "knowledge_bases": get_kb_store().stats(),
    }


@app.post("/runs", response_model=RunReport)
async def create_run(request: RunRequest) -> RunReport:
    try:
        return await start_run(request)
    except ValueError as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc


@app.get("/runs", response_model=list[RunReport])
def get_runs() -> list[RunReport]:
    return list_runs()


@app.get("/runs/{run_id}", response_model=RunReport)
def get_run_by_id(run_id: str) -> RunReport:
    report = get_run(run_id)
    if report is None:
        raise HTTPException(status_code=404, detail="Run not found")
    return report


@app.get("/runs/{run_id}/action-contract")
def get_action_contract(run_id: str) -> dict:
    report = get_run(run_id)
    if report is None:
        raise HTTPException(status_code=404, detail="Run not found")
    if report.action_contract is None:
        raise HTTPException(status_code=202, detail="Run still in progress")
    return report.action_contract.model_dump()


@app.post("/knowledge-bases/seed")
def seed_knowledge_bases_endpoint() -> dict:
    from scripts.seed_knowledge_bases import seed

    return seed()
