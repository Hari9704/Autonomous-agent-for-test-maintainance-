from app.graph.triage import _tier1_classify
from app.models import ClassificationCategory


def test_locator_change_rule():
    result = _tier1_classify("NoSuchElementException: Unable to locate element with id 'btn_apply'")
    assert result is not None
    assert result.category == ClassificationCategory.LOCATOR_CHANGE


def test_wait_sync_rule():
    result = _tier1_classify("TimeoutException: element not visible in time waiting for 'x'")
    assert result is not None
    assert result.category == ClassificationCategory.WAIT_SYNC


def test_app_bug_rule():
    result = _tier1_classify("500 Internal Server Error, NullPointerException thrown")
    assert result is not None
    assert result.category == ClassificationCategory.APP_BUG


def test_unmatched_error_returns_none():
    result = _tier1_classify("some totally novel error message that matches nothing")
    assert result is None
