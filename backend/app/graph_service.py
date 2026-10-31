"""
backend/app/graph_service.py
Pure Python service that builds the ASEAN cross-border ecosystem network graph.

Exposes:
    build_graph(startup: StartupProfile | None = None) -> EcosystemGraph

Adheres to EcosystemGraph schema defined in backend/app/schemas.py:
    GraphNode(id, label, type, country)
    GraphEdge(source, target, relation, weight)
"""

from __future__ import annotations

import json
import re
from pathlib import Path
from typing import Any, Dict, List, Optional, Sequence, Union

# Attempt import of Pydantic schemas from schemas.py
try:
    from .schemas import EcosystemGraph, GraphEdge, GraphNode, StartupProfile
except ImportError:
    try:
        from schemas import EcosystemGraph, GraphEdge, GraphNode, StartupProfile
    except ImportError:
        EcosystemGraph = None
        GraphEdge = None
        GraphNode = None
        StartupProfile = None

from .data_utils import load_partners, get_ecosystem_data_path

DATA_PATH = get_ecosystem_data_path()
_ECOSYSTEM_CACHE: Optional[List[Dict[str, Any]]] = None
_ECOSYSTEM_MTIME: Optional[float] = None
_DEFAULT_GRAPH_CACHE: Any = None
_DEFAULT_GRAPH_MTIME: Optional[float] = None


def load_ecosystem_data(path: Optional[Union[str, Path]] = None) -> List[Dict[str, Any]]:
    """Load partner records from JSON file with error resilience."""
    if path is None:
        return load_partners()
    file_path = Path(path).resolve()
    if not file_path.exists():
        return load_partners()
    with open(file_path, "r", encoding="utf-8") as f:
        data = json.load(f)
        if isinstance(data, list):
            return data
        return []

        data = json.load(f)
        if isinstance(data, list):
            return data
        return []


def _normalize_entity(entity: Any) -> Dict[str, Any]:
    """
    Extract normalized entity attributes whether entity is a dict,
    dataclass, or Pydantic model instance.
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

    label = str(
        d.get("company_name")
        or d.get("name")
        or d.get("label")
        or d.get("id")
        or "Unknown Entity"
    )

    if d.get("id"):
        entity_id = str(d["id"])
    elif d.get("company_name"):
        clean_slug = re.sub(r"[^a-zA-Z0-9]+", "-", d["company_name"]).strip("-").lower()
        entity_id = f"startup-{clean_slug}" if clean_slug else "startup-node"
    else:
        entity_id = "unknown-node"

    entity_type = str(
        d.get("type") or ("startup" if ("company_name" in d or "solution" in d) else "organisation")
    )
    country = str(d.get("country") or "Unknown")

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
    partnership_goals = [str(g).strip().lower() for g in d.get("partnership_goals", []) if g]

    return {
        "id": entity_id,
        "label": label,
        "type": entity_type,
        "country": country,
        "sector": sectors[0] if sectors else "general",
        "sectors": sectors,
        "capabilities": capabilities,
        "needs": needs,
        "target_markets": target_markets,
        "partnership_goals": partnership_goals,
        "is_startup": bool("company_name" in d or "solution" in d or entity_type == "startup"),
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
            }
        )

    return edges


def build_graph(
    startup: Optional[Union[StartupProfile, Dict[str, Any], Any]] = None,
    partners: Optional[Sequence[Union[Dict[str, Any], Any]]] = None,
) -> Any:
    """
    Build ASEAN network graph: nodes (all partners) and relationship edges.
    Adheres strictly to EcosystemGraph schema: nodes: List[GraphNode], edges: List[GraphEdge].
    
    Function signature:
        build_graph() -> EcosystemGraph
        build_graph(startup: StartupProfile) -> EcosystemGraph
    """
    global _DEFAULT_GRAPH_CACHE, _DEFAULT_GRAPH_MTIME
    if partners is None:
        raw_partners = load_ecosystem_data()
        if startup is None and _DEFAULT_GRAPH_CACHE is not None and _DEFAULT_GRAPH_MTIME == _ECOSYSTEM_MTIME:
            return _DEFAULT_GRAPH_CACHE
    else:
        raw_partners = list(partners)

    normalized_nodes: List[Dict[str, Any]] = []
    edges_raw: List[Dict[str, Any]] = []

    # Optional active startup node
    normalized_startup = None
    if startup is not None:
        normalized_startup = _normalize_entity(startup)
        normalized_nodes.append(normalized_startup)

    # Partner nodes
    norm_partners: List[Dict[str, Any]] = []
    for p in raw_partners:
        norm_p = _normalize_entity(p)
        norm_partners.append(norm_p)
        normalized_nodes.append(norm_p)

    # Inter-partner edges
    num_partners = len(norm_partners)
    for i in range(num_partners):
        for j in range(i + 1, num_partners):
            pair_edges = _calculate_edges_between(norm_partners[i], norm_partners[j])
            edges_raw.extend(pair_edges)

    # Startup <-> partner edges if startup present
    if normalized_startup:
        for p in norm_partners:
            s_edges = _calculate_edges_between(normalized_startup, p)
            edges_raw.extend(s_edges)

    # Construct schema-compliant nodes and edges
    if GraphNode and GraphEdge and EcosystemGraph:
        nodes_out = [
            GraphNode(
                id=n["id"],
                label=n["label"],
                type=n["type"],
                country=n["country"],
            )
            for n in normalized_nodes
        ]
        edges_out = [
            GraphEdge(
                source=e["source"],
                target=e["target"],
                relation=e["relation"],
                weight=e["weight"],
            )
            for e in edges_raw
        ]
        result = EcosystemGraph(nodes=nodes_out, edges=edges_out)
        if startup is None and partners is None:
            _DEFAULT_GRAPH_CACHE = result
            _DEFAULT_GRAPH_MTIME = _ECOSYSTEM_MTIME
        return result

    # Fallback to dictionary
    return {
        "nodes": [
            {
                "id": n["id"],
                "label": n["label"],
                "type": n["type"],
                "country": n["country"],
            }
            for n in normalized_nodes
        ],
        "edges": edges_raw,
    }
