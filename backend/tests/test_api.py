# backend/tests/test_api.py
# Offline unit tests — no live API calls required.
import json
import sys
from pathlib import Path

import pytest

# Allow importing app from backend/
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.matching_service import get_top_matches, score_partner, _jaccard
from app.schemas import StartupProfile


DEMO_STARTUP = StartupProfile(
    company_name="SmartTONG",
    country="Malaysia",
    sector="smart-city",
    solution="IoT-enabled smart bins that optimise municipal waste collection routes.",
    capabilities=["iot-sensors", "route-optimisation", "real-time-dashboard"],
    needs=["municipal-pilot", "government-procurement", "distribution-network"],
    target_markets=["Vietnam", "Ho Chi Minh City"],
    partnership_goals=["pilot", "distribution", "co-development"],
)


def test_jaccard_identical():
    assert _jaccard(["a", "b"], ["a", "b"]) == 1.0


def test_jaccard_disjoint():
    assert _jaccard(["a"], ["b"]) == 0.0


def test_jaccard_partial():
    score = _jaccard(["a", "b"], ["b", "c"])
    assert 0 < score < 1


def test_score_partner_returns_int():
    from app.matching_service import _load_partners
    partners = _load_partners()
    for p in partners:
        s = score_partner(DEMO_STARTUP, p)
        assert isinstance(s, int)
        assert 0 <= s <= 100


def test_top_matches_returns_three():
    matches = get_top_matches(DEMO_STARTUP, top_n=3)
    assert len(matches) == 3


def test_top_matches_sorted_descending():
    matches = get_top_matches(DEMO_STARTUP, top_n=3)
    scores = [m.score for m in matches]
    assert scores == sorted(scores, reverse=True)


def test_match_schema_fields():
    matches = get_top_matches(DEMO_STARTUP, top_n=3)
    for m in matches:
        assert m.partner_id
        assert m.partner_name
        assert m.country
        assert 0 <= m.score <= 100
        assert len(m.reasons) >= 1
        assert m.opportunity


def test_data_file_exists():
    data_path = Path(__file__).parent.parent.parent / "data" / "demo_ecosystem.json"
    assert data_path.exists(), "demo_ecosystem.json not found"


def test_all_partners_illustrative():
    from app.matching_service import _load_partners
    partners = _load_partners()
    for p in partners:
        assert p.get("illustrative") is True, f"Partner {p['id']} missing illustrative flag"
