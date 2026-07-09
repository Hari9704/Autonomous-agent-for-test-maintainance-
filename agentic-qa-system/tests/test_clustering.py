from app.ingestion.clustering import cluster_failures, normalize_error
from app.models import FailureRecord, Stream


def _record(test_id: str, error: str) -> FailureRecord:
    return FailureRecord(
        test_id=test_id,
        stream=Stream.SEVEN_ELEVEN_ANDROID,
        build_id="b1",
        test_name="some_test",
        error_message=error,
    )


def test_normalize_error_strips_numbers_and_literals():
    a = normalize_error("checkout button not found for order #4471")
    b = normalize_error("checkout button not found for order #9820")
    assert a == b


def test_cluster_failures_groups_similar_errors():
    records = [
        _record("t1", "NoSuchElementException: Unable to locate element with id 'btn_apply'"),
        _record("t2", "NoSuchElementException: Unable to locate element with id 'btn_apply'"),
        _record("t3", "TimeoutException: element not visible in time"),
    ]
    clusters = cluster_failures(records)
    assert len(clusters) == 2
    sizes = sorted(c.size for c in clusters)
    assert sizes == [1, 2]


def test_cluster_representative_prefers_richer_evidence():
    thin = _record("t1", "NoSuchElementException: Unable to locate element with id 'btn_apply'")
    rich = _record("t2", "NoSuchElementException: Unable to locate element with id 'btn_apply'")
    rich.dom_snippet = "<Button id='btn_apply_v2' />"
    rich.stack_trace = "some very long stack trace with lots of detail" * 3

    clusters = cluster_failures([thin, rich])
    assert len(clusters) == 1
    assert clusters[0].representative.test_id == "t2"
