"""
Ecosystem Network Graph Service.

Pure Python, dependency-free service that loads ASEAN partner ecosystem records,
normalizes entities, calculates multi-dimensional affinity edges (complements,
same sector, same market), and generates a graph topology for network visualization.
"""

from __future__ import annotations

import json
import re
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any, Dict, List, Optional, Sequence, Union


@dataclass
class StartupProfile:
    """
    Startup profile data model matching the shared team schema:
    company_name, country, sector, solution (str);
    capabilities, needs, target_markets, partnership_goals (list[str]).
    """
    company_name: str = "SmartTONG (illustrative)"
    country: str = "Malaysia"
    sector: str = "smart_waste"
    solution: str = "IoT ultrasonic fill-level sensors and dynamic fleet dispatch algorithms for municipal waste containers"
    capabilities: List[str] = field(
        default_factory=lambda: [
            "iot_fill_level_sensors",
            "route_optimization_software",
            "real_time_fleet_tracking",
            "data_analytics_dashboard",
        ]
    )
    needs: List[str] = field(
        default_factory=lambda: [
            "municipal_waste_concessions",
            "vietnam_local_distribution",
            "electric_waste_truck_fleet",
            "vietnam_market_entry_support",
            "regulatory_approvals",
        ]
    )
    target_markets: List[str] = field(default_factory=lambda: ["Vietnam", "Malaysia"])
    partnership_goals: List[str] = field(
        default_factory=lambda: [
            "Deploy 500 smart bin sensors in Ho Chi Minh City municipal pilots",
            "Partner with Vietnamese municipal concession holders and fleet operators",
        ]
    )
    id: Optional[str] = None
    name: Optional[str] = None


def _resolve_data_path() -> Path:
    """Locate data/demo_ecosystem.json relative to repository root."""
    current_file = Path(__file__).resolve()
    # current_file is <root>/backend/app/graph_service.py -> parents[2] is <root>
    root_dir = current_file.parents[2]
    candidate = root_dir / "data" / "demo_ecosystem.json"
    if candidate.exists():
        return candidate
    # Fallback to local working directory
    local_candidate = Path("data/demo_ecosystem.json").resolve()
    return local_candidate


def load_ecosystem_data(path: Optional[Union[str, Path]] = None) -> List[Dict[str, Any]]:
    """Load partner records from JSON file with error resilience."""
    file_path = Path(path).resolve() if path else _resolve_data_path()
    if not file_path.exists():
        return []
    with open(file_path, "r", encoding="utf-8") as f:
        data = json.load(f)
        if isinstance(data, list):
            return data
        return []


def _normalize_entity(entity: Any) -> Dict[str, Any]:
    """
    Extract normalized entity attributes whether entity is a dict,
    dataclass, or Pydantic model instance. Supports both StartupProfile
    and Partner record schema conventions.
    """
    if isinstance(entity, dict):
        d = entity
    elif hasattr(entity, "model_dump"):  # Pydantic v2
        d = entity.model_dump()
    elif hasattr(entity, "dict"):  # Pydantic v1
        d = entity.dict()
    elif hasattr(entity, "__dict__"):
        d = vars(entity)
    else:
        d = {}

    # Label / Name extraction
    label = str(
        d.get("company_name")
        or d.get("name")
        or d.get("label")
        or d.get("id")
        or "Unknown Entity"
    )

    # Unique entity ID
    if d.get("id"):
        entity_id = str(d["id"])
    elif d.get("company_name"):
        clean_slug = re.sub(r"[^a-zA-Z0-9]+", "-", d["company_name"]).strip("-").lower()
        entity_id = f"startup-{clean_slug}" if clean_slug else "startup-node"
    else:
        entity_id = "unknown-node"

    # Type: 'organisation' | 'programme' | 'startup'
    entity_type = str(d.get("type") or ("startup" if ("company_name" in d or "solution" in d) else "organisation"))
    country = str(d.get("country") or "Unknown")
    city = str(d.get("city") or "")

    # Sector normalization (supports singular 'sector' or plural 'sectors')
    sector_set = set()
    if d.get("sector"):
        sector_set.add(str(d["sector"]).strip().lower())
    if isinstance(d.get("sectors"), (list, tuple)):
        for s in d["sectors"]:
            if s:
                sector_set.add(str(s).strip().lower())
    sectors = sorted(list(sector_set))

    capabilities = [str(c).strip().lower() for c in d.get("capabilities", []) if c]
    needs = [str(n).strip().lower() for n in d.get("needs", []) if n]
    target_markets = [str(m).strip().lower() for m in d.get("target_markets", []) if m]
    partnership_goals = [str(g).strip() for g in d.get("partnership_goals", []) if g]

    return {
        "id": entity_id,
        "label": label,
        "type": entity_type,
        "country": country,
        "city": city,
        "sector": sectors[0] if sectors else "general",
        "sectors": sectors,
        "solution": str(d.get("solution") or ""),
        "capabilities": capabilities,
        "needs": needs,
        "target_markets": target_markets,
        "partnership_goals": partnership_goals,
        "illustrative": bool(d.get("illustrative", False)),
        "description": str(d.get("description") or ""),
    }


def _calculate_edges_between(
    node_a: Dict[str, Any], node_b: Dict[str, Any]
) -> List[Dict[str, Any]]:
    """
    Calculate affinity edges between two normalized nodes across 3 dimensions:
    1. 'complements': capability <-> need matches
    2. 'same sector': shared sector intersection
    3. 'same market': shared target market intersection
    """
    edges: List[Dict[str, Any]] = []
    id_a = node_a["id"]
    id_b = node_b["id"]

    # 1. Complementary capability <-> need
    # A provides what B needs, OR B provides what A needs
    a_caps_b_needs = set(node_a["capabilities"]).intersection(set(node_b["needs"]))
    b_caps_a_needs = set(node_b["capabilities"]).intersection(set(node_a["needs"]))
    total_comp_matches = len(a_caps_b_needs) + len(b_caps_a_needs)

    if total_comp_matches > 0:
        weight = min(1.0, round(0.4 + 0.15 * total_comp_matches, 2))
        edges.append(
            {
                "source": id_a,
                "target": id_b,
                "relation": "complements",
                "weight": weight,
                "overlap_count": total_comp_matches,
                "details": sorted(list(a_caps_b_needs.union(b_caps_a_needs))),
            }
        )

    # 2. Shared sectors
    shared_sectors = set(node_a["sectors"]).intersection(set(node_b["sectors"]))
    if shared_sectors:
        weight = min(1.0, round(0.3 + 0.1 * len(shared_sectors), 2))
        edges.append(
            {
                "source": id_a,
                "target": id_b,
                "relation": "same sector",
                "weight": weight,
                "overlap_count": len(shared_sectors),
                "details": sorted(list(shared_sectors)),
            }
        )

    # 3. Shared target markets
    shared_markets = set(node_a["target_markets"]).intersection(set(node_b["target_markets"]))
    if shared_markets:
        weight = min(1.0, round(0.3 + 0.1 * len(shared_markets), 2))
        edges.append(
            {
                "source": id_a,
                "target": id_b,
                "relation": "same market",
                "weight": weight,
                "overlap_count": len(shared_markets),
                "details": sorted(list(shared_markets)),
            }
        )

    return edges


def build_graph(
    startup: Optional[Union[StartupProfile, Dict[str, Any], Any]] = None,
    partners: Optional[Sequence[Union[Dict[str, Any], Any]]] = None,
) -> Dict[str, Any]:
    """
    Construct the ecosystem network graph with nodes and relationship edges.

    Shared API Contract:
        GET /api/ecosystem/graph -> {"nodes": [{id, label, type, country}], "edges": [{source, target, relation, weight}]}

    Function Signature (for Yap / main.py):
        build_graph(startup: StartupProfile | None = None) -> {"nodes": [...], "edges": [...]}

    Args:
        startup: Optional StartupProfile instance or dict. When provided, the startup
                 is included as an active node with edges connected to relevant partners.
        partners: Optional custom list of partner records. When None, records are
                  automatically loaded from data/demo_ecosystem.json.

    Returns:
        A dictionary containing:
        {
            "nodes": [
                {
                    "id": str,
                    "label": str,
                    "type": str,      # 'organisation' | 'programme' | 'startup'
                    "country": str,   # e.g. 'Vietnam', 'Malaysia'
                    ...
                }
            ],
            "edges": [
                {
                    "source": str,
                    "target": str,
                    "relation": str,  # 'complements' | 'same sector' | 'same market'
                    "weight": float,   # normalized score between 0.0 and 1.0
                    "overlap_count": int,
                    "details": list[str]
                }
            ]
        }
    """
    # 1. Load partners if not provided
    if partners is None:
        raw_partners = load_ecosystem_data()
    else:
        raw_partners = list(partners)

    normalized_nodes: List[Dict[str, Any]] = []
    edges: List[Dict[str, Any]] = []

    # 2. Add startup node if provided
    normalized_startup = None
    if startup is not None:
        normalized_startup = _normalize_entity(startup)
        startup_node = {
            "id": normalized_startup["id"],
            "label": normalized_startup["label"],
            "type": normalized_startup["type"],
            "country": normalized_startup["country"],
            "city": normalized_startup.get("city", ""),
            "sector": normalized_startup.get("sector", ""),
            "sectors": normalized_startup.get("sectors", []),
            "capabilities": normalized_startup.get("capabilities", []),
            "needs": normalized_startup.get("needs", []),
            "target_markets": normalized_startup.get("target_markets", []),
            "is_startup": True,
        }
        normalized_nodes.append(startup_node)

    # 3. Add partner nodes
    norm_partners: List[Dict[str, Any]] = []
    for p in raw_partners:
        norm_p = _normalize_entity(p)
        norm_partners.append(norm_p)
        node = {
            "id": norm_p["id"],
            "label": norm_p["label"],
            "type": norm_p["type"],
            "country": norm_p["country"],
            "city": norm_p.get("city", ""),
            "sector": norm_p.get("sector", ""),
            "sectors": norm_p.get("sectors", []),
            "capabilities": norm_p.get("capabilities", []),
            "needs": norm_p.get("needs", []),
            "target_markets": norm_p.get("target_markets", []),
            "illustrative": norm_p.get("illustrative", True),
            "is_startup": False,
        }
        normalized_nodes.append(node)

    # 4. Connect partner <-> partner edges (pairwise without duplicates)
    num_partners = len(norm_partners)
    for i in range(num_partners):
        for j in range(i + 1, num_partners):
            p_a = norm_partners[i]
            p_b = norm_partners[j]
            pair_edges = _calculate_edges_between(p_a, p_b)
            edges.extend(pair_edges)

    # 5. Connect startup <-> partner edges if startup is present
    if normalized_startup:
        for p in norm_partners:
            startup_edges = _calculate_edges_between(normalized_startup, p)
            edges.extend(startup_edges)

    return {
        "nodes": normalized_nodes,
        "edges": edges,
    }
