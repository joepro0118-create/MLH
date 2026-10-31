# backend/app/matching_service.py
# Deterministic weighted matching — Python only, no LLM calls.
# Weights: industry 30%, complementary caps/needs 30%, target market 20%, partnership goals 20%.
# These are MVP weights for demo purposes, not validated metrics.

import json
import re
from pathlib import Path
from typing import Any, Dict, List, Set

from .schemas import StartupProfile, PartnerMatch

DATA_PATH = Path(__file__).parent.parent.parent / "data" / "demo_ecosystem.json"
_PARTNERS_CACHE: List[Dict[str, Any]] | None = None
_PARTNERS_MTIME: float | None = None


def _load_partners() -> List[Dict[str, Any]]:
    global _PARTNERS_CACHE, _PARTNERS_MTIME
    try:
        mtime = DATA_PATH.stat().st_mtime
    except OSError:
        mtime = None
    if _PARTNERS_CACHE is not None and mtime == _PARTNERS_MTIME:
        return _PARTNERS_CACHE
    with open(DATA_PATH, encoding="utf-8") as f:
        _PARTNERS_CACHE = json.load(f)
        _PARTNERS_MTIME = mtime
        return _PARTNERS_CACHE



def _tokenize(items: Any) -> Set[str]:
    """
    Extract normalized keyword tokens from strings or lists of strings.
    Handles hyphens, underscores, plurals, and regional spelling (e.g. s/z).
    """
    tokens = set()
    if isinstance(items, str):
        items = [items]
    elif not isinstance(items, (list, tuple, set)):
        return tokens

    for it in items:
        for w in re.findall(r"[a-zA-Z0-9]+", str(it).lower()):
            if w in ("optimization", "optimisation"):
                w = "optim"
            elif w in ("sensors", "sensor"):
                w = "sensor"
            elif w in ("analytics", "analytic"):
                w = "analyt"
            elif w in ("pilots", "pilot"):
                w = "pilot"
            elif w in ("routes", "route", "routing"):
                w = "route"
            elif w in ("bins", "bin"):
                w = "bin"
            elif w in ("wastes", "waste"):
                w = "waste"
            elif w in ("cities", "city"):
                w = "city"
            elif w in ("logistics", "logistic"):
                w = "logistic"
            tokens.add(w)
    return tokens


def _jaccard(a: Any, b: Any) -> float:
    """Jaccard similarity between two lists or sets of strings (case-insensitive)."""
    if isinstance(a, set) and isinstance(b, set):
        return _token_jaccard(a, b)
    toks_a = _tokenize(a)
    toks_b = _tokenize(b)
    return _token_jaccard(toks_a, toks_b)


def _token_jaccard(toks_a: Set[str], toks_b: Set[str]) -> float:
    if not toks_a and not toks_b:
        return 0.0
    return len(toks_a & toks_b) / max(len(toks_a | toks_b), 1)


_STOPWORDS = {
    "and", "or", "the", "to", "in", "of", "for", "with", "on", "by", "a", "an", "across", "into", "from"
}


def _clean_tokens(items: Any) -> Set[str]:
    return _tokenize(items) - _STOPWORDS


def _item_coverage(source_items: List[str], target_pool: Any) -> float:
    """
    Measures what fraction of source_items have keyword overlap with target_pool,
    blended with the Szymkiewicz-Simpson overlap coefficient.
    """
    if not source_items:
        return 0.0
    target_toks = _clean_tokens(target_pool)
    if not target_toks:
        return 0.0

    matched_items = 0
    for item in source_items:
        item_toks = _clean_tokens(item)
        if item_toks and (item_toks & target_toks):
            matched_items += 1

    source_toks = _clean_tokens(source_items)
    if not source_toks:
        return 0.0

    overlap_coeff = len(source_toks & target_toks) / max(min(len(source_toks), len(target_toks)), 1)
    item_ratio = matched_items / len(source_items)
    return min(1.0, item_ratio * 0.65 + overlap_coeff * 0.35)


def _sector_match(startup_sector: str, partner: Dict[str, Any]) -> float:
    """
    Calculate sector compatibility score between 0.0 and 1.0.
    Considers partner['sector'] and partner['sectors'].
    """
    p_sectors = [partner.get("sector", "")] + partner.get("sectors", [])
    s_tok = _clean_tokens(startup_sector)
    p_tok = _clean_tokens(p_sectors)

    exact = _token_jaccard(s_tok, p_tok)
    if exact >= 0.5:
        return min(1.0, exact * 1.5)

    # Related cross-border innovation clusters
    smart_sustainability = {"smart", "waste", "city", "cleantech", "govtech", "sustainability", "iot"}
    if (s_tok & smart_sustainability) and (p_tok & smart_sustainability):
        return 0.90 if len(p_tok & smart_sustainability) >= 2 else 0.80

    logistics_supply = {"logistic", "supply", "chain", "fleet", "transport"}
    if (s_tok & logistics_supply) and (p_tok & logistics_supply):
        return 0.80

    fintech_commerce = {"fintech", "payment", "bank", "token", "exchange"}
    if (s_tok & fintech_commerce) and (p_tok & fintech_commerce):
        return 0.75

    agri_food = {"agritech", "food", "bio", "nutrient", "circular"}
    if (s_tok & agri_food) and (p_tok & agri_food):
        return 0.75

    return exact


def _complementary_score(startup: StartupProfile, partner: Dict[str, Any]) -> float:
    """
    Measures bidirectional complementarity:
    1. startup capabilities fulfilling partner needs
    2. partner capabilities fulfilling startup needs
    """
    cap_to_needs = _item_coverage(
        startup.capabilities,
        partner.get("needs", []) + partner.get("partnership_goals", []),
    )
    needs_to_cap = _item_coverage(
        startup.needs,
        partner.get("capabilities", []) + [partner.get("description", "")],
    )
    return (cap_to_needs + needs_to_cap) / 2


def score_partner(startup: StartupProfile, partner: Dict[str, Any]) -> int:
    """
    Weighted score 0-100:
      industry compatibility:  30%
      complementary caps/needs: 30%
      target market overlap:    20%
      partnership goals:        20%
    """
    industry = _sector_match(startup.sector, partner)
    complementary = _complementary_score(startup, partner)

    # Market overlap (includes country and city)
    s_mkt_list = list(startup.target_markets or [])
    if startup.target_country and startup.target_country not in s_mkt_list:
        s_mkt_list.append(startup.target_country)
    s_mkt = _clean_tokens(s_mkt_list)
    p_mkt = _clean_tokens(
        partner.get("target_markets", []) + [partner.get("country", ""), partner.get("city", "")]
    )
    market = (
        len(s_mkt & p_mkt) / max(min(len(s_mkt), len(p_mkt)), 1)
        if (s_mkt and p_mkt)
        else 0.0
    )

    # Goals overlap
    s_goal_list = list(startup.partnership_goals or [])
    if startup.goal:
        s_goal_list.append(startup.goal)
    goals = _item_coverage(
        s_goal_list,
        partner.get("partnership_goals", []) + partner.get("capabilities", []) + [partner.get("description", "")],
    )

    raw = (
        industry * 0.30
        + complementary * 0.30
        + market * 0.20
        + goals * 0.20
    )
    return round(raw * 100)


def _build_reasons(startup: StartupProfile, partner: Dict[str, Any], score: int) -> List[str]:
    """Generate human-readable match reasons from the scoring components."""
    reasons = []

    # 1. Sector alignment
    partner_sectors = [partner.get("sector", "")] + partner.get("sectors", [])
    clean_partner_sec = ", ".join(sorted(set(s.replace("_", "-") for s in partner_sectors if s)))
    reasons.append(f"Sector alignment: {startup.sector} ↔ {clean_partner_sec}")

    # 2. Capabilities meeting needs
    s_cap_tok = _tokenize(startup.capabilities)
    p_need_raw = partner.get("needs", [])
    matched_needs = [
        n.replace("_", " ") for n in p_need_raw if _tokenize(n) & s_cap_tok
    ]
    if matched_needs:
        reasons.append(f"Your capabilities match their needs: {', '.join(matched_needs[:2])}")
    else:
        # Fallback to general capability overlap
        reasons.append("Complementary operational technology fit")

    # 3. Partner capabilities fulfilling startup needs
    s_need_tok = _tokenize(startup.needs)
    p_cap_raw = partner.get("capabilities", [])
    matched_caps = [
        c.replace("_", " ") for c in p_cap_raw if _tokenize(c) & s_need_tok
    ]
    if matched_caps:
        reasons.append(f"They can fulfill your needs: {', '.join(matched_caps[:2])}")
    else:
        reasons.append(f"Local {partner.get('country', 'ASEAN')} execution capacity")

    # 4. Market presence
    s_mkt_tok = _tokenize(startup.target_markets)
    p_mkt_tok = _tokenize(partner.get("target_markets", [])) | _tokenize(partner.get("city", ""))
    shared_mkts = s_mkt_tok & p_mkt_tok
    if shared_mkts:
        reasons.append(f"Shared target market: {', '.join(sorted(shared_mkts)[:2]).title()}")

    return reasons[:3]


def get_top_matches(startup: StartupProfile, top_n: int = 3) -> List[PartnerMatch]:
    """Return top_n scored partners sorted by descending score."""
    partners = _load_partners()
    scored = []
    for p in partners:
        s = score_partner(startup, p)
        reasons = _build_reasons(startup, p, s)
        target_display = partner_target = ", ".join(p.get("target_markets", [p.get("country", "ASEAN")])[:2])
        opportunity = (
            f"Partnering with {p['name']} accelerates {startup.company_name}'s "
            f"cross-border market validation in {target_display} via local deployment and pilot synergy."
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
