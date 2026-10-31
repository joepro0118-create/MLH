# BridgeWise — AI Cross-Border Startup Partnership Intelligence

> **MLH Hacktoberfest Hack Day KL · 31 Oct 2026 · Team: Yap, Joe, Amn, Yuhang**
>
> Entries: **Best Use of Gemma 4** · **Best Open-Source AI Project**

BridgeWise is an AI-powered cross-border startup partnership platform for the ASEAN ecosystem.  
It solves the **Outcome Conversion** bottleneck identified by Startup ASEAN: high-potential startups exist across Malaysia, Vietnam, Singapore, Indonesia, Thailand, and the Philippines, but navigating cross-border partnerships that convert discussions into actionable pilots is slow and fragmented.

> ⚠️ **All partner records, organisations, programmes, and outcomes shown are ILLUSTRATIVE for hackathon demonstration purposes. No real corporate partnerships are claimed or implied.**

---

## The Demo Journey

BridgeWise guides founders through an end-to-end outcome conversion journey:

```
[Founder Demo Sign-in / Onboarding]
    │
    ▼  Upload 1-3 Pitch Slides / Proposal Files + Founder Notes
[Gemma 4 Multimodal Synthesis]
    │
    ▼  Single reconciled Startup Passport
[Founder Passport Review & Chip Editor] (Human-in-the-Loop)
    │
    ▼  Pure Python Deterministic Matching (30/30/20/20 Weights)
[Top 3 Scored ASEAN Partner Matches + Interactive Ecosystem Network Graph]
    │
    ▼  Founder Selects Partner -> Gemma 4 Strategic Synthesis
[Partnership Action Dashboard & 30-Day POC Plan]
    │
    ▼  Actions: Inline Edit · Copy · Download .md · Download .txt · Export JSON · Native Share
```

---

## Why BridgeWise Wins

### Best Use of Gemma 4
| Capability | How Gemma 4 is Applied | Implementation |
|---|---|---|
| **Multimodal Synthesis** | Reads 1 to 3 pitch deck images, reconciling multiple slides into a single structured `StartupProfile` | [`backend/app/gemma_service.py`](backend/app/gemma_service.py) `analyze_pitch()` |
| **Partnership Action Brief** | Synthesizes an executive concept, proposed 30-day POC pilot, and weekly milestones | [`backend/app/gemma_service.py`](backend/app/gemma_service.py) `generate_brief()` |

*Model: `gemma-4-26b-a4b-it` via the Gemini API using the `google-genai` SDK. Never silently substituted.*

### Best Open-Source AI Project
- **Open-weight AI**: Powered by Gemma 4 (`gemma-4-26b-a4b-it`).
- **Explainable & Deterministic**: Partner matching runs 100% in Python with explicit 30/30/20/20 weights (zero hallucinated rankings).
- **Human-in-the-Loop**: Interactive Startup Passport lets founders edit capabilities and needs before matching.
- **MIT Licensed**: Fully open-source, auditable, and extensible without vendor lock-in.

---

## Tech Stack

| Layer | Technologies |
|---|---|
| **Backend** | Python 3.11+, FastAPI, Pydantic v2, Uvicorn |
| **AI** | Gemma 4 (`gemma-4-26b-a4b-it`) via `google-genai` SDK |
| **Matching** | Deterministic token-aware weighted scoring (Pure Python) |
| **Frontend** | React 18, Vite 5, Canvas physics particles, CSS design system |
| **Data** | Local JSON (`data/demo_ecosystem.json`) — 12 illustrative ASEAN entities |

---

## Repository Structure

```
BridgeWise/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py             # FastAPI app, CORS, all 5 routes
│   │   ├── schemas.py          # Shared Pydantic API contract
│   │   ├── gemma_service.py    # Gemma 4 multimodal & generation service
│   │   ├── matching_service.py # Deterministic weighted partner matching
│   │   └── graph_service.py    # ASEAN network graph builder
│   ├── tests/
│   │   ├── __init__.py
│   │   └── test_api.py         # Offline test suite (14 passing tests)
│   ├── requirements.txt
│   └── run.py                  # Uvicorn entrypoint (port 8000)
├── frontend/
│   ├── src/
│   │   ├── components/         # Interactive Ecosystem Network Graph
│   │   ├── App.jsx             # Auth -> Upload -> Passport -> Match -> Dashboard
│   │   ├── api.js              # Fetch client for all backend endpoints
│   │   ├── index.css           # Modern violet SaaS design system
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── data/
│   ├── demo_ecosystem.json     # 12 illustrative ASEAN partner records
│   └── sample_pitch_deck.png   # Sample SmartTONG pitch image for testing
├── docs/
│   ├── api_contract.md         # Full API documentation & JSON schemas
│   └── data_sources.md         # Illustrative data disclaimers
├── screenshots/                # Walkthrough screenshots
├── .env.example
├── LICENSE                     # MIT
└── README.md
```

---

## Shared API Contract

All endpoints adhere to strict Pydantic schemas:

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Healthcheck and mock mode status |
| `POST` | `/api/pitch/analyze` | Multimodal upload (1–3 images + notes) -> `StartupProfile` |
| `POST` | `/api/matches` | Weighted deterministic matching -> Top 3 `PartnerMatch` |
| `POST` | `/api/partnership/brief` | Generates 30-day POC plan & metrics -> `PartnershipBrief` |
| `GET` | `/api/ecosystem/graph` | Regional relationship nodes & edges -> `EcosystemGraph` |

---

## Quickstart Guide

### 1. Clone & Setup
```bash
git clone https://github.com/joepro0118-create/MLH.git
cd BridgeWise
```

### 2. Backend Setup
```bash
# Create and activate virtual environment (optional)
python -m venv .venv
.venv\Scripts\activate   # Windows

# Install dependencies
pip install -r backend/requirements.txt

# Configure environment
cp .env.example .env
# Edit .env to add your GEMINI_API_KEY (or set MOCK_MODE=true for offline development)

# Start backend server (runs on http://localhost:8000)
cd backend
python run.py
```

### 3. Frontend Setup
```bash
# In a new terminal:
cd frontend
npm install
npm run dev
# Open http://localhost:5173
```

### 4. Running the Demo Flow
1. **Founder Auth**: Click **"One-Click Demo Login"** on the login page (or sign in as `alex@smarttong.my`).
2. **Founder Prompt**: Click **"Use SmartTONG Demo"** (or upload `data/sample_pitch_deck.png`).
3. **Startup Passport**: Inspect what Gemma 4 extracted, test adding/removing chips.
4. **Partner Matches**: Explore the top 3 scored matches and click around the interactive ASEAN Network Graph.
5. **POC Dashboard**: Select Saigon Green Urban Waste Board, review the 30-day pilot milestones, edit cards inline, and test **Copy**, **Download .md**, **Export JSON**, or **Share**.

---

## Testing

The test suite runs completely offline with no network or API keys required:

```bash
python -m pytest backend/tests/ tests/ -v
# 14 passed in 0.24s
```

---

## Environment Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `GEMINI_API_KEY` | Yes (for live AI) | — | Gemini API key for Gemma 4 |
| `GEMMA_MODEL` | No | `gemma-4-26b-a4b-it` | Target open-weight Gemma model |
| `MOCK_MODE` | No | `false` | When `true`, returns instant canned responses |

---

## Team BridgeWise

| Member | Focus Area |
|---|---|
| **Yap** | Backend, Gemma 4 Integration, Deterministic Matching Engine, API Contract |
| **Joe** | Frontend Application, SaaS UI Components, Founder Dashboard |
| **Amn** | Illustrative ASEAN Ecosystem Dataset, D3 Ecosystem Network Graph |
| **Yuhang** | Architecture Integration, QA, Pitch Presentation |

---

## License

[MIT](LICENSE) © 2026 BridgeWise Hackathon Team
