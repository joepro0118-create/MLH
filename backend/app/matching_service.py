# backend/app/matching_service.py
# Deterministic weighted matching — Python only, no LLM calls.
# Weights: industry 30%, complementary caps/needs 30%, target market 20%, partnership goals 20%.
# These are MVP weights for demo purposes, not validated metrics.
import json
from pathlib import Path
from typing import List

from .schemas import StartupProfile, PartnerMatch

DATA_PATH = Path(__file__).parent.parent.parent / "data" / "demo_ecosystem.json"


def _load_partners() -> list:
    with open(DATA_PATH, encoding="utf-8") as f:
        return json.load(f)


def _jaccard(a: list, b: list) -> float:
    """Jaccard similarity between two lists of strings (case-insensitive)."""
    sa = {x.lower() for x in a}
    sb = {x.lower() for x in b}
    if not sa and not sb:
        return 0.0
    return len(sa & sb) / len(sa | sb)


def _sector_match(startup_sector: str, partner_sector: str) -> float:
    """1.0 if same sector, 0.5 if one contains the other word, else 0.0."""
    s, p = startup_sector.lower(), partner_sector.lower()
    if s == p:
        return 1.0
    if s in p or p in s:
        return 0.5
    # Treat related sectors as partial matches
    related = {
        frozenset({"smart-city", "sustainability", "smart-waste", "iot"}),
        frozenset({"logistics", "supply-chain"}),
        frozenset({"fintech", "payments"}),
        frozenset({"agritech", "sustainability"}),
    }
    for group in related:
        if s in group and p in group:
            return 0.4
    return 0.0


def _complementary_score(startup: StartupProfile, partner: dict) -> float:
    """
    Measures complementarity: startup capabilities meeting partner needs,
    and partner capabilities meeting startup needs (bidirectional).
    """
    cap_to_needs = _jaccard(startup.capabilities, partner["needs"])
    needs_to_cap = _jaccard(startup.needs, partner["capabilities"])
    return (cap_to_needs + needs_to_cap) / 2


def score_partner(startup: StartupProfile, partner: dict) -> int:
    """
    Weighted score 0-100:
      industry compatibility  30%
      complementary caps/needs 30%
      target market overlap   20%
      partnership goals       20%
    """
    industry = _sector_match(startup.sector, partner["sector"])
    complementary = _complementary_score(startup, partner)
    market = _jaccard(startup.target_markets, partner["target_markets"])
    goals = _jaccard(startup.partnership_goals, partner["partnership_goals"])

    raw = (
        industry * 0.30
        + complementary * 0.30
        + market * 0.20
        + goals * 0.20
    )
    return round(raw * 100)


def _build_reasons(startup: StartupProfile, partner: dict, score: int) -> List[str]:
    """Generate human-readable match reasons from the scoring components."""
    reasons = []
    if _sector_match(startup.sector, partner["sector"]) >= 0.5:
        reasons.append(
            f"Sector alignment: {startup.sector} ↔ {partner['sector']}"
        )
    cap_overlap = set(c.lower() for c in startup.capabilities) & set(n.lower() for n in partner["needs"])
    if cap_overlap:
        reasons.append(f"Your capabilities match their needs: {', '.join(list(cap_overlap)[:3])}")
    needs_overlap = set(n.lower() for n in startup.needs) & set(c.lower() for c in partner["capabilities"])
    if needs_overlap:
        reasons.append(f"They can fulfill your needs: {', '.join(list(needs_overlap)[:3])}")
    market_overlap = set(m.lower() for m in startup.target_markets) & set(m.lower() for m in partner["target_markets"])
    if market_overlap:
        reasons.append(f"Shared target markets: {', '.join(list(market_overlap)[:3])}")
    if not reasons:
        reasons.append(f"Partial ecosystem fit (score {score}/100)")
    return reasons


def get_top_matches(startup: StartupProfile, top_n: int = 3) -> List[PartnerMatch]:
    """Return top_n scored partners sorted by descending score."""
    partners = _load_partners()
    scored = []
    for p in partners:
        s = score_partner(startup, p)
        reasons = _build_reasons(startup, p, s)
        opportunity = (
            f"Explore {p['name']}'s network to accelerate {startup.company_name}'s "
            f"entry into {', '.join(p['target_markets'][:2])} markets."
        )
        scored.append(
            PartnerMatch(
                partner_id=p["id"],
                partner_name=p["name"],
                country=p["country"],
                score=s,
                reasons=reasons,
                opportunity=opportunity,
            )
        )
    scored.sort(key=lambda x: x.score, reverse=True)
    return scored[:top_n]
