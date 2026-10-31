# backend/tests/test_api.py
# Offline unit tests — no live API calls required.
import json
import sys
from io import BytesIO
from pathlib import Path
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

# Allow importing app from backend/
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.matching_service import get_top_matches, score_partner, _jaccard
from app.schemas import StartupProfile, PartnershipBrief


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


# ---------------------------------------------------------------------------
# Matching / Jaccard tests
# ---------------------------------------------------------------------------

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


# ---------------------------------------------------------------------------
# Schema v2 field tests
# ---------------------------------------------------------------------------

def test_startup_profile_new_fields_defaults():
    """StartupProfile new fields should have correct defaults."""
    profile = StartupProfile(
        company_name="Acme",
        country="Singapore",
        sector="fintech",
        solution="Payments platform",
        capabilities=["api"],
        needs=["distribution"],
        target_markets=["Malaysia"],
        partnership_goals=["pilot"],
    )
    assert profile.missing_fields == []
    assert profile.confidence == "medium"
    assert profile.goal is None
    assert profile.target_country is None


def test_startup_profile_missing_fields_populated():
    """StartupProfile accepts missing_fields list."""
    profile = StartupProfile(
        company_name="TestCo",
        country="Thailand",
        sector="agritech",
        solution="",
        capabilities=[],
        needs=[],
        target_markets=[],
        partnership_goals=[],
        missing_fields=["solution", "revenue", "customers"],
        confidence="low",
    )
    assert "solution" in profile.missing_fields
    assert profile.confidence == "low"


def test_confidence_values_valid():
    """Only 'high', 'medium', 'low' are valid confidence values."""
    for val in ("high", "medium", "low"):
        p = StartupProfile(
            company_name="X",
            country="SG",
            sector="other",
            solution="s",
            capabilities=[],
            needs=[],
            target_markets=[],
            partnership_goals=[],
            confidence=val,
        )
        assert p.confidence == val


def test_confidence_invalid_raises():
    """Invalid confidence value must raise ValidationError."""
    from pydantic import ValidationError as PydanticValidationError
    with pytest.raises(PydanticValidationError):
        StartupProfile(
            company_name="X",
            country="SG",
            sector="other",
            solution="s",
            capabilities=[],
            needs=[],
            target_markets=[],
            partnership_goals=[],
            confidence="very_high",
        )


def test_partnership_brief_new_fields_defaults():
    """PartnershipBrief new fields should have correct defaults."""
    brief = PartnershipBrief(
        objective="obj",
        collaboration_concept="collab",
        proposed_poc="poc",
        timeline=["Week 1: start"],
        success_metrics=["1 meeting by Day 7"],
    )
    assert brief.outcome_type == "cross_border_poc"
    assert brief.assumptions == []
    assert brief.grounded_in == []
    assert "Illustrative" in brief.disclaimer


def test_partnership_brief_outcome_type_valid():
    """All 3 outcome_type values should be accepted."""
    for ot in ("commercial_partnership", "market_expansion", "cross_border_poc"):
        b = PartnershipBrief(
            objective="o",
            collaboration_concept="c",
            proposed_poc="p",
            timeline=["Week 1: x"],
            success_metrics=["1 kpi by Day 30"],
            outcome_type=ot,
        )
        assert b.outcome_type == ot


def test_brief_disclaimer_always_set():
    """Brief disclaimer must be the standard illustrative text."""
    brief = PartnershipBrief(
        objective="o",
        collaboration_concept="c",
        proposed_poc="p",
        timeline=["Week 1: x"],
        success_metrics=["1 kpi by Day 30"],
        disclaimer="Illustrative demo data. Recommendations are AI-generated suggestions, not verified facts.",
    )
    assert "Illustrative" in brief.disclaimer
    assert "not verified" in brief.disclaimer


def test_mock_profile_has_new_fields():
    """The mock profile in main.py must include v2 fields."""
    # Dynamically import to pick up the patched main.py
    import importlib
    import os
    os.environ.setdefault("MOCK_MODE", "false")
    # We only need _MOCK_PROFILE — import without starting FastAPI
    from app import main as m
    assert m._MOCK_PROFILE.goal == "cross_border_poc"
    assert m._MOCK_PROFILE.target_country == "Vietnam"
    assert m._MOCK_PROFILE.confidence == "high"
    assert isinstance(m._MOCK_PROFILE.missing_fields, list)


def test_mock_brief_has_new_fields():
    """The mock brief in main.py must include v2 fields."""
    from app import main as m
    assert m._MOCK_BRIEF.outcome_type == "cross_border_poc"
    assert isinstance(m._MOCK_BRIEF.assumptions, list)
    assert isinstance(m._MOCK_BRIEF.grounded_in, list)
    assert "Illustrative" in m._MOCK_BRIEF.disclaimer
