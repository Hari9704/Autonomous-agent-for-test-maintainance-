"""
Builds the compiled LangGraph supervisor graph for processing one failure
cluster end to end:

              START
             /      \\
       evidence    triage
             \\      /
            route_by_classification (conditional edge)
          /      |        |          \\
        fix   bug_review  test_writer  escalation
          \\      |        |          /
                 feedback
                    |
                   END
"""

from __future__ import annotations

from langgraph.graph import END, START, StateGraph

from app.graph.bug_review import bug_review_node
from app.graph.escalation import escalation_node
from app.graph.evidence import evidence_node
from app.graph.feedback import feedback_node
from app.graph.fix import fix_node
from app.graph.state import ClusterState
from app.graph.test_writer import test_writer_node
from app.graph.triage import triage_node
from app.models import ClassificationCategory

_ROUTE_TABLE: dict[ClassificationCategory, str] = {
    ClassificationCategory.LOCATOR_CHANGE: "fix",
    ClassificationCategory.WAIT_SYNC: "fix",
    ClassificationCategory.APP_BUG: "bug_review",
    ClassificationCategory.FUNC_CHANGED: "test_writer",
    ClassificationCategory.FLAKY_INFRA: "escalation",
    ClassificationCategory.SPORADIC: "escalation",
    ClassificationCategory.TEST_DATA: "escalation",
    ClassificationCategory.UNKNOWN: "escalation",
}


def _route_by_classification(state: ClusterState) -> str:
    classification = state["classification"]
    return _ROUTE_TABLE.get(classification.category, "escalation")


def build_cluster_graph():
    graph = StateGraph(ClusterState)

    graph.add_node("evidence", evidence_node)
    graph.add_node("triage", triage_node)
    graph.add_node("fix", fix_node)
    graph.add_node("bug_review", bug_review_node)
    graph.add_node("test_writer", test_writer_node)
    graph.add_node("escalation", escalation_node)
    graph.add_node("feedback", feedback_node)

    # Fan-out: evidence gathering and triage classification happen in parallel.
    graph.add_edge(START, "evidence")
    graph.add_edge(START, "triage")

    # The supervisor routes to exactly one specialist based on classification.
    # (Evidence must complete before routing since specialists may consult it;
    # LangGraph waits for all incoming edges of a node before running it, so
    # both `evidence` and `triage` are guaranteed to have run before any
    # specialist that depends on `triage`'s conditional routing executes.)
    graph.add_conditional_edges(
        "triage",
        _route_by_classification,
        {"fix": "fix", "bug_review": "bug_review", "test_writer": "test_writer", "escalation": "escalation"},
    )

    for specialist in ("fix", "bug_review", "test_writer", "escalation"):
        graph.add_edge(specialist, "feedback")

    graph.add_edge("feedback", END)

    return graph.compile()


_compiled_graph = None


def get_cluster_graph():
    global _compiled_graph
    if _compiled_graph is None:
        _compiled_graph = build_cluster_graph()
    return _compiled_graph
