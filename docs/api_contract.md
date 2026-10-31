# BridgeWise API Contract

**Version:** 1.0.0  
**Base URL:** `http://localhost:8000`  
**Frontend origin:** `http://localhost:5173` (CORS allowed)  
**Do not change field names without team consensus (Yap, Joe, Amn, Yuhang).**

> All partner data and generated content are **ILLUSTRATIVE**. No real partnerships are claimed.

---

## Quick Reference

| Method | Path | Who calls it | Needs AI |
|--------|------|--------------|----------|
| GET | `/health` | Anyone | No |
| POST | `/api/pitch/analyze` | Frontend (Step 1) | ✅ Gemma 4 |
| POST | `/api/matches` | Frontend (Step 2) | No — pure Python |
| POST | `/api/partnership/brief` | Frontend (Step 4) | ✅ Gemma 4 |
| GET | `/api/ecosystem/graph` | Frontend (Step 3) | No |

---

## `GET /health`

Liveness check. Also reports whether `MOCK_MODE` is active.

**Response 200**
```json
{
  "status": "ok",
  "mock_mode": false
}
```

---

## `POST /api/pitch/analyze`

Upload a pitch deck image. Gemma 4 extracts the startup profile via multimodal understanding.

**Request** — `multipart/form-data`

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `image` | file | ✅ | PNG, JPEG, or WebP; max 5 MB |

**Response 200** — `StartupProfile`
```json
{
  "company_name": "SmartTONG",
  "country": "Malaysia",
  "sector": "smart-city",
  "solution": "IoT-enabled smart bins that optimise municipal waste collection routes in real time.",
  "capabilities": ["iot-sensors", "route-optimisation", "real-time-dashboard", "waste-analytics"],
  "needs": ["municipal-pilot", "government-procurement", "local-distribution-network"],
  "target_markets": ["Vietnam", "Ho Chi Minh City", "Hanoi"],
  "partnership_goals": ["pilot", "distribution", "market-access"]
}
```

**Errors**

| Status | Condition |
|--------|-----------|
| 413 | Image > 5 MB |
| 415 | Unsupported MIME type |
| 502 | Gemma API error or quota exceeded |

---

## `POST /api/matches`

Deterministic weighted matching — **no LLM involved**. Returns top 3 partners.

**Weights (MVP, not validated metrics):**
- Industry compatibility 30%
- Complementary capabilities/needs 30%
- Target market overlap 20%
- Partnership goal alignment 20%

**Request body** — `application/json` (`StartupProfile`)
```json
{
  "company_name": "SmartTONG",
  "country": "Malaysia",
  "sector": "smart-city",
  "solution": "IoT-enabled smart bins that optimise municipal waste collection routes in real time.",
  "capabilities": ["iot-sensors", "route-optimisation", "real-time-dashboard", "waste-analytics"],
  "needs": ["municipal-pilot", "government-procurement", "local-distribution-network"],
  "target_markets": ["Vietnam", "Ho Chi Minh City", "Hanoi"],
  "partnership_goals": ["pilot", "distribution", "market-access"]
}
```

**Response 200**
```json
{
  "matches": [
    {
      "partner_id": "p001",
      "partner_name": "GreenCity Vietnam Initiative",
      "country": "Vietnam",
      "score": 87,
      "reasons": [
        "Sector alignment: smart-city ↔ smart-city",
        "They can fulfill your needs: municipal-pilot, government-procurement",
        "Shared target markets: Vietnam, Ho Chi Minh City"
      ],
      "opportunity": "GreenCity Vietnam Initiative's municipal procurement network gives SmartTONG a direct path to piloting in Ho Chi Minh City and Hanoi without cold-start BD."
    },
    {
      "partner_id": "p002",
      "partner_name": "CircularASEAN Hub",
      "country": "Singapore",
      "score": 74,
      "reasons": [
        "Sector alignment: smart-city ↔ sustainability",
        "Your capabilities match their needs: iot-sensors, waste-analytics",
        "Shared target markets: Vietnam, Ho Chi Minh City"
      ],
      "opportunity": "CircularASEAN Hub offers ASEAN-wide funding and investor introductions that can co-finance SmartTONG's Vietnam pilot and regional scale-up."
    },
    {
      "partner_id": "p003",
      "partner_name": "EcoRoute Logistics",
      "country": "Vietnam",
      "score": 68,
      "reasons": [
        "Your capabilities match their needs: route-optimisation",
        "They can fulfill your needs: local-distribution-network",
        "Shared target markets: Ho Chi Minh City"
      ],
      "opportunity": "EcoRoute Logistics' last-mile infrastructure in Ho Chi Minh City is the distribution backbone SmartTONG needs to deploy and service its smart bins at scale."
    }
  ]
}
```

**Errors**

| Status | Condition |
|--------|-----------|
| 422 | Request body fails `StartupProfile` validation |
| 500 | Internal matching error |

---

## `POST /api/partnership/brief`

Gemma 4 generates a partnership brief and 30-day POC plan grounded on the supplied profiles.  
All recommendations are labelled `(RECOMMENDATION)`.

**Request body** — `application/json`
```json
{
  "startup": {
    "company_name": "SmartTONG",
    "country": "Malaysia",
    "sector": "smart-city",
    "solution": "IoT-enabled smart bins that optimise municipal waste collection routes in real time.",
    "capabilities": ["iot-sensors", "route-optimisation", "real-time-dashboard", "waste-analytics"],
    "needs": ["municipal-pilot", "government-procurement", "local-distribution-network"],
    "target_markets": ["Vietnam", "Ho Chi Minh City", "Hanoi"],
    "partnership_goals": ["pilot", "distribution", "market-access"]
  },
  "partner_id": "p001"
}
```

**Response 200** — `PartnershipBrief`
```json
{
  "objective": "SmartTONG and GreenCity Vietnam Initiative will jointly pilot IoT smart-bin route optimisation across two Ho Chi Minh City districts to demonstrate ≥20% reduction in collection vehicle trips (RECOMMENDATION).",
  "collaboration_concept": "SmartTONG deploys its IoT sensor hardware and route-optimisation dashboard; GreenCity Vietnam Initiative provides municipal access, on-the-ground coordination with district waste authorities, and local technician support. Weekly joint steering calls ensure rapid iteration on collection schedules.",
  "proposed_poc": "Install 30 smart bins across District 1 and District 3, Ho Chi Minh City over Days 1–7. Run live route-optimisation for collection trucks from Days 8–28. Measure trip reduction, bin fill-rate accuracy, and resident satisfaction in a final joint report on Day 30 (ILLUSTRATIVE).",
  "timeline": [
    "Week 1: MOU signing, site survey, bin installation (30 units, 2 districts)",
    "Week 2: Dashboard onboarding for municipal drivers; baseline KPI capture",
    "Week 3: Live optimised routing; daily data review with GreenCity ops team",
    "Week 4: Impact report, media kit, and joint press release for next-phase funding"
  ],
  "success_metrics": [
    "≥20% reduction in collection vehicle trips vs. pre-pilot baseline",
    "≥85% bin fill-rate prediction accuracy over the 30-day window",
    "Letter of intent from Ho Chi Minh City waste authority for Phase 2 scale-up"
  ]
}
```

**Errors**

| Status | Condition |
|--------|-----------|
| 404 | `partner_id` not found in `demo_ecosystem.json` |
| 422 | Request body fails schema validation |
| 502 | Gemma API error, quota exceeded, or safety block |

---

## `GET /api/ecosystem/graph`

Returns the full ASEAN network graph for visualisation. Built from `demo_ecosystem.json` by `graph_service.py`.  
Edges exist between partners that share ≥1 target market or ≥1 partnership goal.

**Response 200** — `EcosystemGraph`
```json
{
  "nodes": [
    { "id": "p001", "label": "GreenCity Vietnam Initiative", "type": "programme", "country": "Vietnam" },
    { "id": "p002", "label": "CircularASEAN Hub",            "type": "organisation", "country": "Singapore" },
    { "id": "p003", "label": "EcoRoute Logistics",           "type": "startup",      "country": "Vietnam" }
  ],
  "edges": [
    { "source": "p001", "target": "p002", "relation": "shared market", "weight": 0.4 },
    { "source": "p001", "target": "p003", "relation": "aligned goals", "weight": 0.6 },
    { "source": "p002", "target": "p003", "relation": "shared market", "weight": 0.2 }
  ]
}
```

**Node types:** `"organisation"` | `"programme"` | `"startup"`  
**Edge weight:** float 0.1–1.0 (higher = stronger shared context)

**Errors**

| Status | Condition |
|--------|-----------|
| 500 | Graph build error (malformed data file) |

---

## Error Envelope

All errors return an HTTP status code and:
```json
{ "detail": "human readable message" }
```

---

## MOCK_MODE

Set `MOCK_MODE=true` in `.env` to return the SmartTONG → Vietnam canned responses for all AI-backed endpoints.  
`/api/matches` always runs real Python matching (deterministic, < 5 ms).

```bash
# .env
MOCK_MODE=true
GEMINI_API_KEY=           # not needed in mock mode
```

| Endpoint | MOCK_MODE behaviour |
|----------|---------------------|
| `GET /health` | `{"status":"ok","mock_mode":true}` |
| `POST /api/pitch/analyze` | Returns SmartTONG profile instantly |
| `POST /api/matches` | Real matching against `demo_ecosystem.json` |
| `POST /api/partnership/brief` | Returns canned SmartTONG × GreenCity brief |
| `GET /api/ecosystem/graph` | Real graph from `demo_ecosystem.json` |

---

## Pydantic Schemas (canonical reference)

```python
class StartupProfile(BaseModel):
    company_name: str
    country: str
    sector: str
    solution: str
    capabilities: List[str]
    needs: List[str]
    target_markets: List[str]
    partnership_goals: List[str]

class PartnerMatch(BaseModel):
    partner_id: str
    partner_name: str
    country: str
    score: int          # 0–100
    reasons: List[str]
    opportunity: str

class MatchResponse(BaseModel):
    matches: List[PartnerMatch]

class PartnershipBrief(BaseModel):
    objective: str
    collaboration_concept: str
    proposed_poc: str
    timeline: List[str]
    success_metrics: List[str]

class GraphNode(BaseModel):
    id: str
    label: str
    type: str           # "organisation" | "programme" | "startup"
    country: str

class GraphEdge(BaseModel):
    source: str
    target: str
    relation: str
    weight: float

class EcosystemGraph(BaseModel):
    nodes: List[GraphNode]
    edges: List[GraphEdge]
```

