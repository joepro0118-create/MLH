# backend/app/main.py
# BridgeWise FastAPI backend — all 5 API routes.
# Set MOCK_MODE=true in .env to return canned responses (unblocks frontend dev).
import json
import logging
import os
from pathlib import Path

from typing import List, Optional
from fastapi import FastAPI, File, Form, HTTPException, UploadFile
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
            partner_id="partner-vn-01",
            partner_name="Saigon Green Urban Waste Board (illustrative)",
            country="Vietnam",
            score=88,
            reasons=[
                "Sector alignment: smart-city <-> smart-waste, cleantech, govtech",
                "Your capabilities match their needs: iot fill level sensors, route optimization software",
                "Shared target market: Vietnam, Ho Chi Minh City",
            ],
            opportunity=(
                "Saigon Green Urban Waste Board's municipal concessions and landfill jurisdiction give SmartTONG "
                "a direct path to piloting smart bin sensors in District 1 and District 3 without cold-start procurement delays."
            ),
        ),
        PartnerMatch(
            partner_id="partner-vn-03",
            partner_name="Mekong Green Horizons Accelerator (illustrative)",
            country="Vietnam",
            score=76,
            reasons=[
                "Sector alignment: smart-city <-> cleantech, smart-waste",
                "They can fulfill your needs: vietnam market entry support, pilot project subsidies",
                "Shared target market: Vietnam, Malaysia",
            ],
            opportunity=(
                "Mekong Green Horizons Accelerator provides matching pilot grants and bilateral regulatory fast-tracking "
                "specifically designed for Malaysian cleantech innovators deploying in Vietnam."
            ),
        ),
        PartnerMatch(
            partner_id="partner-vn-02",
            partner_name="VinaFleet EcoLogistics (illustrative)",
            country="Vietnam",
            score=70,
            reasons=[
                "Your capabilities match their needs: route optimization software, iot fill level sensors",
                "They can fulfill your needs: electric waste truck fleet, field maintenance",
                "Shared target market: Vietnam",
            ],
            opportunity=(
                "VinaFleet EcoLogistics' commercial electric waste truck fleet serves as the immediate operational fleet partner "
                "to install SmartTONG sensors and validate dynamic route scheduling across northern and southern industrial parks."
            ),
        ),
    ]
)

_MOCK_BRIEF = PartnershipBrief(
    objective=(
        "SmartTONG and Saigon Green Urban Waste Board will jointly pilot IoT smart-bin route "
        "optimisation across Ho Chi Minh City District 1 and District 3 to demonstrate a >=20% reduction "
        "in collection vehicle diesel emissions and eliminate bin overflow complaints (RECOMMENDATION)."
    ),
    collaboration_concept=(
        "SmartTONG deploys 50 solar-assisted IoT ultrasonic fill-level sensors and provides live access to its route-optimisation telematics dashboard. "
        "Saigon Green Urban Waste Board provides municipal bin concession sites, coordinates driver route dispatch, and provides local maintenance personnel. "
        "Weekly joint operational steering reviews ensure rapid calibration against Ho Chi Minh City traffic patterns."
    ),
    proposed_poc=(
        "Deploy 50 IoT smart bin sensor nodes across commercial corridors in District 1 and District 3 over Days 1-7. "
        "Run live route-optimisation for municipal collection trucks from Days 8-28. "
        "Measure fuel savings, overflow incident reduction, and sensor reliability in a final joint audit on Day 30 (ILLUSTRATIVE)."
    ),
    timeline=[
        "Week 1: MOU signing, site survey in District 1/3, sensor installation on 50 civic bins",
        "Week 2: Dashboard onboarding for municipal dispatchers; baseline route fuel telemetry capture",
        "Week 3: Live dynamic routing execution; daily driver sync with Saigon Green operations team",
        "Week 4: Joint performance audit report, city council showcase, and Phase 2 scale-up proposal",
    ],
    success_metrics=[
        ">=20% reduction in collection truck trip miles and diesel consumption vs. baseline",
        ">=90% fill-rate telemetry accuracy across all 50 pilot bins over 30 days",
        "Formal Letter of Intent from Saigon Green Urban Waste Board for municipal-wide expansion",
    ],
)

# ---------------------------------------------------------------------------
# App setup
# ---------------------------------------------------------------------------
app = FastAPI(
    title="BridgeWise API",
    description=(
        "BridgeWise — AI Cross-Border Startup Partnership Intelligence for ASEAN. "
        "All partner data is ILLUSTRATIVE. "
        f"{ '[MOCK_MODE ACTIVE: all AI responses are canned]' if MOCK_MODE else '' }"
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
async def analyze_pitch(
    image: Optional[UploadFile] = File(None),
    images: Optional[List[UploadFile]] = File(None),
    notes: Optional[str] = Form(None),
    goal: Optional[str] = Form(None),
    target_country: Optional[str] = Form(None),
):
    """
    Accept 1 to 3 pitch deck / flyer / proposal images + optional notes and goal.
    In MOCK_MODE returns the SmartTONG canned profile immediately.
    Otherwise sends all files to Gemma 4 to synthesize a unified Startup Passport.
    """
    if MOCK_MODE:
        logger.info("MOCK_MODE: returning canned StartupProfile")
        return _MOCK_PROFILE

    # Collect files from either 'images' list or single 'image' parameter
    upload_list: List[UploadFile] = []
    if images:
        upload_list.extend(images)
    if image:
        upload_list.append(image)

    if not upload_list:
        raise HTTPException(
            status_code=400,
            detail="At least one pitch deck or proposal image file is required.",
        )

    # Restrict to 1-3 files
    if len(upload_list) > 3:
        raise HTTPException(
            status_code=400,
            detail="Please upload a maximum of 3 document images.",
        )

    prepared_files = []
    for f in upload_list:
        if f.content_type not in ALLOWED_MIME:
            raise HTTPException(
                status_code=415,
                detail=f"Unsupported image type '{f.content_type}' for {f.filename}. Use PNG, JPEG, or WebP.",
            )
        f_bytes = await f.read()
        if len(f_bytes) > MAX_IMAGE_BYTES:
            raise HTTPException(
                status_code=413,
                detail=f"Image {f.filename} exceeds 5 MB limit.",
            )
        prepared_files.append((f_bytes, f.content_type))

    try:
        profile = await gemma.analyze_pitch(
            prepared_files,
            notes=notes,
            goal=goal,
            target_country=target_country,
        )
    except Exception as exc:
        logger.error("Gemma extraction failed: %s", exc)
        raise HTTPException(status_code=502, detail=str(exc))
    return profile


@app.post("/api/matches", response_model=MatchResponse)
async def get_matches(startup: StartupProfile):
    """
    Deterministic weighted matching â€” Python only, no LLM.
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
    In MOCK_MODE returns the canned SmartTONG Ã— GreenCity brief.
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

