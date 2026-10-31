# backend/app/graph_service.py
# Builds ASEAN network graph from demo_ecosystem.json.
# Edges are generated from shared target_markets and partnership_goals.
import json
from pathlib import Path
from typing import List
from .schemas import GraphNode, GraphEdge, EcosystemGraph

DATA_PATH = Path(__file__).parent.parent.parent / "data" / "demo_ecosystem.json"


def _load_partners() -> list:
    with open(DATA_PATH, encoding="utf-8") as f:
        return json.load(f)


def build_graph() -> EcosystemGraph:
    """
    Build nodes from all partners.
    Build edges when two partners share >=1 target market OR >=1 partnership goal.
    Edge weight = overlap count normalised to [0.1, 1.0].
    """
    partners = _load_partners()

    nodes: List[GraphNode] = [
        GraphNode(
            id=p["id"],
            label=p["name"],
            type=p["type"],
            country=p["country"],
        )
        for p in partners
    ]

    edges: List[GraphEdge] = []
    for i, a in enumerate(partners):
        for b in partners[i + 1 :]:
            market_overlap = len(
                set(a["target_markets"]) & set(b["target_markets"])
            )
            goal_overlap = len(
                set(a["partnership_goals"]) & set(b["partnership_goals"])
            )
            total = market_overlap + goal_overlap
            if total > 0:
                weight = min(1.0, total * 0.2)
                relation = (
                    "shared market"
                    if market_overlap >= goal_overlap
                    else "aligned goals"
                )
                edges.append(
                    GraphEdge(
                        source=a["id"],
                        target=b["id"],
                        relation=relation,
                        weight=round(weight, 2),
                    )
                )

    return EcosystemGraph(nodes=nodes, edges=edges)
