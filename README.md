# PACT — Partnership Action & Collaboration Toolkit

> **MLH Hacktoberfest Hack Day KL · 31 Oct 2026 · Team: Yap, Joe, Amn, Yuhang**
>
> Entries: **Best Use of Gemma 4** · **Best Open-Source AI Project**

PACT is an AI-powered cross-border startup partnership tool for the ASEAN ecosystem.  
It targets the **Outcome Conversion** problem faced by Startup ASEAN: great startups exist in every ASEAN country, but cross-border partnerships that convert potential into pilots remain rare and slow.

> ⚠️ **All partner records, organisations, programmes and outcomes shown are ILLUSTRATIVE and for demonstration purposes only. No real partnerships are claimed or implied.**

---

## Demo Journey

The entire product is built to serve this one end-to-end flow:

```
Pitch Image
    │
    ▼  Gemma 4 (multimodal)
Startup Profile (company, sector, capabilities, needs, markets, goals)
    │
    ▼  Python weighted matcher (deterministic, explainable)
Top 3 Partner Matches (scored 0–100 across 4 dimensions)
    │
    ▼  graph_service.py
ASEAN Network Graph (SVG, nodes by type, edges by shared markets/goals)
    │
    ▼  Gemma 4 (text generation)
Partnership Brief + 30-Day POC Plan
```

**Demo story:** SmartTONG, a Malaysian IoT smart-waste startup, wants a municipal pilot in Vietnam.

---

## Hackathon Challenges

### Best Use of Gemma 4

| Job | What Gemma 4 does | Code |
|---|---|---|
| Pitch extraction | Reads a pitch deck image (multimodal) and extracts `StartupProfile` JSON | [`backend/app/gemma_service.py` `extract_profile_from_image()`](backend/app/gemma_service.py) |
| Partnership brief | Generates `PartnershipBrief` + 30-day POC plan from startup × partner context | [`backend/app/gemma_service.py` `generate_partnership_brief()`](backend/app/gemma_service.py) |

Model used: **`gemma-4-26b-a4b-it`** via the Gemini API (`google-genai` SDK). Never substituted.

### Best Open-Source AI Project

- **Gemma 4** (`gemma-4-26b-a4b-it`) — extraction and generation
- **Python matching engine** — deterministic, explainable, zero AI black-box in scoring
- **MIT licensed** — see [LICENSE](LICENSE)
- Local JSON data, no database, no auth — fully auditable

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Backend** | Python 3.10+, FastAPI, Pydantic v2, Uvicorn |
| **AI** | Gemma 4 (`gemma-4-26b-a4b-it`) via `google-genai` SDK + Gemini API |
| **Matching** | Pure Python, deterministic weighted scoring |
| **Frontend** | React 18 + Vite 5, vanilla CSS |
| **Data** | Local JSON (`data/demo_ecosystem.json`) — no database |

---

## Repository Structure

```
BridgeWise/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py             # FastAPI app, all 5 routes
│   │   ├── schemas.py          # Pydantic models (shared API contract)
│   │   ├── gemma_service.py    # Gemma 4 integration: pitch extraction + brief
│   │   ├── matching_service.py # Deterministic weighted partner matching
│   │   └── graph_service.py    # ASEAN network graph builder
│   ├── tests/
│   │   ├── __init__.py
│   │   └── test_api.py         # Offline unit tests (no API keys needed)
│   ├── requirements.txt
│   └── run.py                  # uvicorn entrypoint
├── frontend/
│   ├── src/
│   │   ├── main.jsx
│   │   ├── App.jsx             # 4-step demo flow
│   │   ├── api.js              # API client
│   │   └── index.css           # Design system
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── data/
│   └── demo_ecosystem.json     # 12 illustrative ASEAN partner records
├── docs/                       # Architecture notes
├── screenshots/                # Demo screenshots
├── .env.example
├── LICENSE                     # MIT
└── README.md
```

---

## API Contract

```
GET  /health
     → {"status":"ok"}

POST /api/pitch/analyze
     multipart: file "image" (PNG/JPEG/WebP, max 5 MB)
     → StartupProfile

POST /api/matches
     body: StartupProfile
     → {"matches": [PartnerMatch × 3]}

POST /api/partnership/brief
     body: {"startup": StartupProfile, "partner_id": str}
     → PartnershipBrief

GET  /api/ecosystem/graph
     → {"nodes": [{id, label, type, country}], "edges": [{source, target, relation, weight}]}
```

Errors: HTTP status + `{"detail": "human readable message"}`.

---

## Matching Algorithm

Partner scores are computed **entirely in Python** (no LLM in the loop) for explainability:

| Dimension | Weight | Method |
|---|---|---|
| Industry compatibility | **30%** | Sector string matching with related-sector groups |
| Complementary capabilities/needs | **30%** | Bidirectional Jaccard similarity |
| Target market overlap | **20%** | Jaccard similarity |
| Partnership goal alignment | **20%** | Jaccard similarity |

> These are MVP weights chosen for the hackathon demo, not validated metrics.

---

## Getting Started

### Prerequisites

- Python 3.10+
- Node.js 18+ and `npm` (or `pnpm`)
- A [Google AI Studio](https://aistudio.google.com/apikey) API key (free tier)

### 1. Clone

```bash
git clone https://github.com/your-team/pact.git
cd pact
```

### 2. Backend

```bash
# Create virtualenv
python -m venv .venv
# Windows:
.venv\Scripts\Activate.ps1
# macOS/Linux:
source .venv/bin/activate

# Install dependencies
pip install -r backend/requirements.txt

# Configure
cp .env.example .env
# Edit .env — add your GEMINI_API_KEY

# Run backend (port 8000)
cd backend
python run.py
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
# → http://localhost:5173
```

### 4. Demo

Open `http://localhost:5173` and either:
- Click **"Use Demo — SmartTONG"** to skip image upload and jump straight into the flow, or
- Upload a pitch deck image (PNG/JPEG/WebP)

---

## Running Tests

Tests run completely offline — no API keys required.

```bash
cd backend
python -m pytest tests/ -v
```

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `GEMINI_API_KEY` | ✅ Yes | Gemma 4 via Google AI Studio (free tier available) |

---

## Data & Ethics

- All 12 partner records in `data/demo_ecosystem.json` are **illustrative fictional entities**.
- No real organisation has been associated with any partnership claim.
- Every partner record carries `"illustrative": true` as a programmatic flag.
- The UI displays a persistent disclaimer banner.

---

## Team

| Name | Role |
|---|---|
| Yap | — |
| Joe | — |
| Amn | — |
| Yuhang | — |

---

## License

[MIT](LICENSE) © 2026 PACT Hackathon Team
