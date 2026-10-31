# backend/app/schemas.py
# Pydantic v2 schemas for BridgeWise API — shared contract, do not change field names.
from pydantic import BaseModel, Field
from typing import List, Literal, Optional


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
    # v2 fields — fact-grounded extraction
    goal: Optional[str] = None          # "commercial_partnership"|"market_expansion"|"cross_border_poc"
    target_country: Optional[str] = None
    missing_fields: List[str] = []      # fields not visible in slides; never guessed
    confidence: Literal["high", "medium", "low"] = "medium"


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
    success_metrics: List[str]  # each must contain a number and a deadline
    # v2 fields — fact-grounded generation
    outcome_type: Literal[
        "commercial_partnership", "market_expansion", "cross_border_poc"
    ] = "cross_border_poc"
    assumptions: List[str] = []     # things Gemma assumed not in the source records
    grounded_in: List[str] = []     # which startup/partner fields were actually used
    disclaimer: str = (
        "Illustrative demo data. "
        "Recommendations are AI-generated suggestions, not verified facts."
    )


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
