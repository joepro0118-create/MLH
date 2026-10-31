# backend/app/schemas.py
# Pydantic v2 schemas for PACT API — shared contract, do not change field names.
from pydantic import BaseModel, Field
from typing import List


class StartupProfile(BaseModel):
    """Extracted profile of the pitching startup."""
    company_name: str
    country: str
    sector: str
    solution: str
    capabilities: List[str]
    needs: List[str]
    target_markets: List[str]
    partnership_goals: List[str]


class PartnerMatch(BaseModel):
    """A ranked partner recommendation."""
    partner_id: str
    partner_name: str
    country: str
    score: int = Field(ge=0, le=100)
    reasons: List[str]
    opportunity: str


class MatchResponse(BaseModel):
    matches: List[PartnerMatch]


class PartnershipBrief(BaseModel):
    """AI-generated partnership brief and POC plan."""
    objective: str
    collaboration_concept: str
    proposed_poc: str
    timeline: List[str]
    success_metrics: List[str]


class BriefRequest(BaseModel):
    startup: StartupProfile
    partner_id: str


class GraphNode(BaseModel):
    id: str
    label: str
    type: str  # "organisation" | "programme" | "startup"
    country: str


class GraphEdge(BaseModel):
    source: str
    target: str
    relation: str
    weight: float


class EcosystemGraph(BaseModel):
    nodes: List[GraphNode]
    edges: List[GraphEdge]
