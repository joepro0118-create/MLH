# backend/app/matching_service.py
# Deterministic weighted matching — Python only, no LLM calls.
# Weights: industry 30%, complementary caps/needs 30%, target market 20%, partnership goals 20%.
# These are MVP weights for demo purposes, not validated metrics.
import json
import re
from pathlib import Path
from typing import List, Set

from .schemas import StartupProfile, PartnerMatch

DATA_PATH = Path(__file__).parent.parent.parent / "data" / "demo_ecosystem.json"

_STOPWORDS = {
    "a", "an", "the", "and", "or", "to", "in", "of", "for", "with", "on", "by", "across", "into"
}

_SYNONYMS = {
    "optimisation": "optimization",
    "optimise": "optimize",
    "iot": "iot",
    "sensor": "sensors",
    "bin": "bins",
    "municipal": "municipal",
    "concessions": "pilot",
    "concession": "pilot",
    "approvals": "procurement",
    "regulatory": "government",
    "analytic": "analytics",
}


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


def _tokenize_phrase(phrase: str) -> Set[str]:
    """Normalize hyphens/underscores and UK/US spelling into canonical tokens."""
    norm = phrase.lower().replace("_", " ").replace("-", " ")
    words = re.findall(r"[a-z0-9]+", norm)
    tokens = set()
    for w in words:
        if w in _STOPWORDS:
            continue
        tokens.add(_SYNONYMS.get(w, w))
    return tokens


def _phrase_list_similarity(list_a: list, list_b: list) -> float:
    """
    Hybrid similarity between two string lists that works for both exact tags
    ('iot-sensors') and descriptive phrases ('iot_fill_level_sensors').
    """
    if not list_a or not list_b:
        return 0.0
    exact = _jaccard(list_a, list_b)
    # Count how many items in list_a have a strong token match in list_b
    matched_a = 0
    for item_a in list_a:
        ta = _tokenize_phrase(item_a)
        if not ta:
            continue
        best_item_sim = 0.0
        for item_b in list_b:
            tb = _tokenize_phrase(item_b)
            if not tb:
                continue
            overlap = len(ta & tb)
            if overlap > 0:
                sim = overlap / min(len(ta), len(tb))
                if sim > best_item_sim:
                    best_item_sim = sim
        if best_item_sim >= 0.45:
            matched_a += 1

    coverage = matched_a / len(list_a)
    return max(exact, coverage)


def _sector_match(startup_sector: str, partner: dict | str) -> float:
    """1.0 if same/aligned sector, 0.75 if in partner's sectors list or related group, else 0.0."""
    partner_sector = partner["sector"] if isinstance(partner, dict) else str(partner)
    partner_sectors = (
        [s.lower().replace("_", "-") for s in partner.get("sectors", [])]
        if isinstance(partner, dict)
        else []
    )

    s = startup_sector.lower().replace("_", "-")
    p = partner_sector.lower().replace("_", "-")

    if s == p or s in partner_sectors:
        return 1.0
    if s in p or p in s:
        return 0.85

    related = [
        {"smart-city", "sustainability", "smart-waste", "cleantech", "govtech", "circular-economy", "iot", "iot-sensors"},
        {"logistics", "supply-chain", "fleet", "smart-waste"},
        {"fintech", "payments"},
        {"agritech", "sustainability", "cleantech"},
    ]
    for group in related:
        in_s = s in group or any(tok in group for tok in _tokenize_phrase(s))
        in_p = p in group or any(sec in group for sec in partner_sectors)
        if in_s and in_p:
            return 0.85
    return 0.0


def _complementary_score(startup: StartupProfile, partner: dict) -> float:
    """
    Measures complementarity: startup capabilities meeting partner needs,
    and partner capabilities meeting startup needs (bidirectional).
    """
    cap_to_needs = _phrase_list_similarity(startup.capabilities, partner.get("needs", []))
    needs_to_cap = _phrase_list_similarity(startup.needs, partner.get("capabilities", []))
    return (cap_to_needs + needs_to_cap) / 2


def score_partner(startup: StartupProfile, partner: dict) -> int:
    """
    Weighted score 0-100:
      industry compatibility  30%
      complementary caps/needs 30%
      target market overlap   20%
      partnership goals       20%
    """
    industry = _sector_match(startup.sector, partner)
    complementary = _complementary_score(startup, partner)
    market = _phrase_list_similarity(partner.get("target_markets", []), startup.target_markets)
    goals = _phrase_list_similarity(startup.partnership_goals, partner.get("partnership_goals", []))

    raw = (
        industry * 0.30
        + complementary * 0.30
        + market * 0.20
        + goals * 0.20
    )
    return min(100, max(0, round(raw * 100)))


def _matched_pairs(items_a: list, items_b: list) -> List[str]:
    """Return human-readable items from items_a that align with items_b."""
    matched = []
    for a in items_a:
        ta = _tokenize_phrase(a)
        for b in items_b:
            tb = _tokenize_phrase(b)
            if ta & tb:
                matched.append(a.replace("_", " "))
                break
    return matched


def _build_reasons(startup: StartupProfile, partner: dict, score: int) -> List[str]:
    """Generate human-readable match reasons from the scoring components."""
    reasons = []
    if _sector_match(startup.sector, partner) >= 0.5:
        reasons.append(
            f"Industry Compatibility (30%): {startup.sector} aligns with {partner['sector'].replace('_', ' ')}"
        )
    cap_matches = _matched_pairs(startup.capabilities, partner.get("needs", []))
    if cap_matches:
        reasons.append(
            f"Capabilities Meet Partner Needs (30%): {', '.join(cap_matches[:3])}"
        )
    need_matches = _matched_pairs(startup.needs, partner.get("capabilities", []))
    if need_matches:
        reasons.append(
            f"Partner Fulfills Your Needs: {', '.join(need_matches[:3])}"
        )
    market_matches = _matched_pairs(startup.target_markets, partner.get("target_markets", []))
    if market_matches:
        reasons.append(
            f"Target Market Alignment (20%): {', '.join(market_matches[:3])}"
        )
    if not reasons:
        reasons.append(f"Regional ASEAN ecosystem fit (score {score}/100)")
    return reasons


def get_top_matches(startup: StartupProfile, top_n: int = 3) -> List[PartnerMatch]:
    """Return top_n scored partners sorted by descending score."""
    partners = _load_partners()
    scored = []
    for p in partners:
        s = score_partner(startup, p)
        reasons = _build_reasons(startup, p, s)
        goals = p.get("partnership_goals", [])
        if goals:
            opportunity = f"{goals[0]} (with {p['name']} in {p['country']})."
        else:
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
