# backend/app/main.py
# PACT FastAPI backend — all 5 API routes.
# Set MOCK_MODE=true in .env to return canned responses (unblocks frontend dev).
import json
import logging
import os
from pathlib import Path

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from .gemma_service import GemmaService
from .graph_service import build_graph
from .matching_service import get_top_matches
from .schemas import (
    BriefRequest,
    EcosystemGraph,
    MatchResponse,
    PartnerMatch,
    PartnershipBrief,
    StartupProfile,
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# MOCK_MODE: set MOCK_MODE=true to skip all AI calls and return canned data.
# Useful for frontend dev when GEMINI_API_KEY is not yet available.
# ---------------------------------------------------------------------------
MOCK_MODE = os.environ.get("MOCK_MODE", "false").lower() == "true"

# Canned SmartTONG (Malaysia -> Vietnam) demo responses
_MOCK_PROFILE = StartupProfile(
    company_name="SmartTONG",
    country="Malaysia",
    sector="smart-city",
    solution="IoT-enabled smart bins that optimise municipal waste collection routes in real time.",
    capabilities=["iot-sensors", "route-optimisation", "real-time-dashboard", "waste-analytics"],
    needs=["municipal-pilot", "government-procurement", "local-distribution-network"],
    target_markets=["Vietnam", "Ho Chi Minh City", "Hanoi"],
    partnership_goals=["pilot", "distribution", "market-access"],
)

_MOCK_MATCHES = MatchResponse(
    matches=[
        PartnerMatch(
            partner_id="p001",
            partner_name="GreenCity Vietnam Initiative",
            country="Vietnam",
            score=87,
            reasons=[
                "Sector alignment: smart-city ↔ smart-city",
                "They can fulfill your needs: municipal-pilot, government-procurement",
                "Shared target markets: Vietnam, Ho Chi Minh City",
            ],
            opportunity=(
                "GreenCity Vietnam Initiative's municipal procurement network gives SmartTONG "
                "a direct path to piloting in Ho Chi Minh City and Hanoi without cold-start BD."
            ),
        ),
        PartnerMatch(
            partner_id="p002",
            partner_name="CircularASEAN Hub",
            country="Singapore",
            score=74,
            reasons=[
                "Sector alignment: smart-city ↔ sustainability",
                "Your capabilities match their needs: iot-sensors, waste-analytics",
                "Shared target markets: Vietnam, Ho Chi Minh City",
            ],
            opportunity=(
                "CircularASEAN Hub offers ASEAN-wide funding and investor introductions "
                "that can co-finance SmartTONG's Vietnam pilot and regional scale-up."
            ),
        ),
        PartnerMatch(
            partner_id="p003",
            partner_name="EcoRoute Logistics",
            country="Vietnam",
            score=68,
            reasons=[
                "Your capabilities match their needs: route-optimisation",
                "They can fulfill your needs: local-distribution-network",
                "Shared target markets: Ho Chi Minh City",
            ],
            opportunity=(
                "EcoRoute Logistics' last-mile infrastructure in Ho Chi Minh City is the "
                "distribution backbone SmartTONG needs to deploy and service its smart bins at scale."
            ),
        ),
    ]
)

_MOCK_BRIEF = PartnershipBrief(
    objective=(
        "SmartTONG and GreenCity Vietnam Initiative will jointly pilot IoT smart-bin route "
        "optimisation across two Ho Chi Minh City districts to demonstrate ≥20% reduction "
        "in collection vehicle trips (ILLUSTRATIVE RECOMMENDATION)."
    ),
    collaboration_concept=(
        "SmartTONG deploys its IoT sensor hardware and route-optimisation dashboard; "
        "GreenCity Vietnam Initiative provides municipal access, on-the-ground coordination "
        "with district waste authorities, and local technician support. "
        "Weekly joint steering calls ensure rapid iteration on collection schedules."
    ),
    proposed_poc=(
        "Install 30 smart bins across District 1 and District 3, Ho Chi Minh City over Days 1–7. "
        "Run live route-optimisation for collection trucks from Days 8–28. "
        "Measure trip reduction, bin fill-rate accuracy, and resident satisfaction in a final "
        "joint report delivered on Day 30 (ILLUSTRATIVE)."
    ),
    timeline=[
        "Week 1: MOU signing, site survey, bin installation (30 units, 2 districts)",
        "Week 2: Dashboard onboarding for municipal drivers; baseline KPI capture",
        "Week 3: Live optimised routing; daily data review with GreenCity ops team",
        "Week 4: Impact report, media kit, and joint press release for next-phase funding",
    ],
    success_metrics=[
        "≥20% reduction in collection vehicle trips vs. pre-pilot baseline",
        "≥85% bin fill-rate prediction accuracy over the 30-day window",
        "Letter of intent from Ho Chi Minh City waste authority for Phase 2 scale-up",
    ],
)

# ---------------------------------------------------------------------------
# App setup
# ---------------------------------------------------------------------------
app = FastAPI(
    title="PACT API",
    description=(
        "Partnership Action & Collaboration Toolkit — ASEAN startup matching. "
        "All partner data is ILLUSTRATIVE. "
        f"{'⚠️ MOCK_MODE ACTIVE — all AI responses are canned.' if MOCK_MODE else ''}"
    ),
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

DATA_PATH = Path(__file__).parent.parent.parent / "data" / "demo_ecosystem.json"
ALLOWED_MIME = {"image/png", "image/jpeg", "image/webp"}
MAX_IMAGE_BYTES = 5 * 1024 * 1024  # 5 MB

gemma = GemmaService()


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@app.get("/health")
async def health():
    """Liveness check. Reports mock mode status."""
    return {"status": "ok", "mock_mode": MOCK_MODE}


@app.post("/api/pitch/analyze", response_model=StartupProfile)
async def analyze_pitch(image: UploadFile = File(...)):
    """
    Accept a pitch deck image (PNG/JPEG/WebP, max 5 MB).
    In MOCK_MODE returns the SmartTONG canned profile immediately.
    Otherwise sends to Gemma 4 for multimodal extraction.
    """
    if MOCK_MODE:
        logger.info("MOCK_MODE: returning canned StartupProfile")
        return _MOCK_PROFILE

    if image.content_type not in ALLOWED_MIME:
        raise HTTPException(
            status_code=415,
            detail=f"Unsupported image type '{image.content_type}'. Use PNG, JPEG, or WebP.",
        )
    image_bytes = await image.read()
    if len(image_bytes) > MAX_IMAGE_BYTES:
        raise HTTPException(status_code=413, detail="Image exceeds 5 MB limit.")

    try:
        profile = await gemma.analyze_pitch(image_bytes, image.content_type)
    except Exception as exc:
        logger.error("Gemma extraction failed: %s", exc)
        raise HTTPException(status_code=502, detail=str(exc))
    return profile


@app.post("/api/matches", response_model=MatchResponse)
async def get_matches(startup: StartupProfile):
    """
    Deterministic weighted matching — Python only, no LLM.
    Returns top 3 partner matches from demo_ecosystem.json.
    MOCK_MODE still runs real matching (it's deterministic and fast).
    """
    try:
        matches = get_top_matches(startup, top_n=3)
    except Exception as exc:
        logger.error("Matching failed: %s", exc)
        raise HTTPException(status_code=500, detail=f"Matching error: {exc}")
    return MatchResponse(matches=matches)


@app.post("/api/partnership/brief", response_model=PartnershipBrief)
async def partnership_brief(req: BriefRequest):
    """
    Gemma 4 generates a partnership brief + 30-day POC plan.
    In MOCK_MODE returns the canned SmartTONG × GreenCity brief.
    """
    if MOCK_MODE:
        logger.info("MOCK_MODE: returning canned PartnershipBrief")
        return _MOCK_BRIEF

    with open(DATA_PATH, encoding="utf-8") as f:
        partners = json.load(f)
    partner = next((p for p in partners if p["id"] == req.partner_id), None)
    if not partner:
        raise HTTPException(
            status_code=404,
            detail=f"Partner '{req.partner_id}' not found in ecosystem data.",
        )
    try:
        brief = await gemma.generate_brief(req.startup, partner)
    except Exception as exc:
        logger.error("Brief generation failed: %s", exc)
        raise HTTPException(status_code=502, detail=str(exc))
    return brief


@app.get("/api/ecosystem/graph", response_model=EcosystemGraph)
async def ecosystem_graph():
    """
    Return ASEAN network graph: nodes (all partners) and edges (shared markets/goals).
    All data is ILLUSTRATIVE. Built by graph_service.py (Amn).
    """
    try:
        graph = build_graph()
    except Exception as exc:
        logger.error("Graph build failed: %s", exc)
        raise HTTPException(status_code=500, detail=f"Graph error: {exc}")
    return graph
