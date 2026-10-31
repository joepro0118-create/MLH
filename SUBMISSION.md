# Submission: BridgeWise

## Project name

**BridgeWise**: AI Cross-Border Startup Partnership Intelligence for the ASEAN Ecosystem.

## Team / attendee

- Team name: **Team BridgeWise**
- Members: **Yap En Thong, Joe Vei Xiang Zu, Manjishtha Chakma, Tan Yong Hung**
- GitHub Repository: [https://github.com/joepro0118-create/MLH](https://github.com/joepro0118-create/MLH)

## Challenge

- [x] Best Open-Source AI Project
- [x] Best Use of Gemma 4

Entering both categories. Evidence for each challenge is documented below.

## Project links

[![Vercel Deployment](https://img.shields.io/badge/Vercel-Live_App-000000?style=for-the-badge&logo=vercel)](https://mlh-vert.vercel.app/)
[![YouTube Video Demo](https://img.shields.io/badge/YouTube-Video_Demo-FF0000?style=for-the-badge&logo=youtube)](https://www.youtube.com/)
[![Pitch Deck](https://img.shields.io/badge/Pitch_Deck-Canva_Presentation-00C4CC?style=for-the-badge&logo=canva)](https://canva.link/v6b0hx0p5yl6w4t)
[![GitHub Repository](https://img.shields.io/badge/GitHub-BridgeWise_Repo-181717?style=for-the-badge&logo=github)](https://github.com/joepro0118-create/MLH)

- Live deployment: [https://mlh-vert.vercel.app/](https://mlh-vert.vercel.app/)
- Video walkthrough: [YouTube Video Walkthrough](https://www.youtube.com/) *(replace with your link)*
- Pitch deck presentation (Canva): [https://canva.link/v6b0hx0p5yl6w4t](https://canva.link/v6b0hx0p5yl6w4t)
- Public GitHub repository: [https://github.com/joepro0118-create/MLH](https://github.com/joepro0118-create/MLH)
- Open-source license: [MIT](LICENSE)

## Problem and solution

**Who it is for:** ASEAN founders, government municipal innovation boards, and cross-border accelerators (across Malaysia, Vietnam, Singapore, Indonesia, Thailand, and the Philippines) who need to convert fragmented cross-border networking into concrete, de-risked 30-day pilot projects.

**What it does:** Founders upload or `Ctrl+V` paste pitch slides, PDFs, Word documents (`.docx`), PowerPoint decks (`.pptx`), spreadsheets, or founder notes. BridgeWise synthesizes a verified **Startup Passport** using **Gemma 4**, runs **deterministic 30/30/20/20 Python matching** against an ASEAN ecosystem dataset, visualizes cross-border synergies on an interactive force-directed network graph, and generates an editable **Partnership Action Brief & 30-Day Proof-of-Concept (POC) Roadmap** exportable to Word (`.doc`), vector PDF (`.pdf`), Markdown (`.md`), Text (`.txt`), and JSON.

**Workflow:**
1. **Founder Demo Sign-in / Onboarding** →
2. **Multi-Format Pitch Intake** (PDF, DOCX, PPTX, images, or `Ctrl+V` clipboard paste) →
3. **Gemma 4 (`gemma-4-26b-a4b-it`) Multimodal + Document Synthesis** into a structured, fact-grounded `StartupProfile` (flagging `missing_fields` rather than guessing) →
4. **Human-in-the-Loop Startup Passport Chip Editor** →
5. **Deterministic Python Matching (`30/30/20/20` weights)** + **Interactive HTML5 Canvas ASEAN Network Graph** →
6. **Gemma 4 Grounded Partnership Action Brief & 4-Week Interactive POC To-Do Roadmap** + **One-Click Export to Word (`.doc`), PDF (`.pdf`), `.md`, `.txt`, and `.json`**.

## Approach and technologies

| Part | Choice | Why |
|---|---|---|
| Multimodal Pitch Synthesis & POC Brief Generation | **Gemma 4** `gemma-4-26b-a4b-it` via the Gemini API (`google-genai` SDK) | Open-weight, multimodal model: reads rendered PDF pages, slide images, Office XML text, and founder notes in a single call, and drafts structured 30-day bilateral POC plans |
| Partner Matching Engine | Pure Python (`backend/app/matching_service.py`) with 30/30/20/20 weights | 100% deterministic, explainable, and fast (`< 5 ms`). Prevents LLM score hallucination |
| ASEAN Network Graph | Pure Python (`backend/app/graph_service.py`) + HTML5 Canvas 2D (`EcosystemGraph.jsx`) | Computes `complements`, `same sector`, and `same market` affinity edges and renders a spring-embedder force graph |
| Document Parsing | `PyMuPDF` (`fitz`) + Python `zipfile` / `xml.etree.ElementTree` | Extracts PDF text + renders 140 DPI page PNGs for Gemma 4 vision; parses `.docx`, `.pptx`, and `.xlsx` natively |
| Backend Server | Python 3.11+, FastAPI, Pydantic v2, Uvicorn | Strict schema validation (`StartupProfile`, `PartnerMatch`, `PartnershipBrief`, `EcosystemGraph`) and `MOCK_MODE` offline support |
| Frontend & Exports | React 18, Vite, native PDF 1.4 binary writer & MSO Word `.doc` builder (`exportUtils.js`) | Interactive 4-step SaaS workflow with boardroom-ready exports and zero pop-up blockers |

## Challenge evidence

### Best Open-Source AI Project

- **Open-source / open-weight AI components and their roles:**
  - **Gemma 4 (`gemma-4-26b-a4b-it`, open weights):** Powers multimodal pitch deck & multi-document synthesis (`analyze_pitch`) and grounded bilateral 30-day POC brief generation (`generate_brief`).
  - **Deterministic Python Matching (`matching_service.py`):** Computes all partner compatibility scores (`0–100`) and match reasons using explicit 30/30/20/20 weights without black-box LLM ranking.
  - **Pure-Python Graph Topology (`graph_service.py`):** Builds regional ecosystem nodes and weighted affinity edges.
- **Code links showing the integration:**
  - Gemma 4 multimodal & brief service: [`backend/app/gemma_service.py`](backend/app/gemma_service.py)
  - Deterministic matching engine: [`backend/app/matching_service.py`](backend/app/matching_service.py)
  - ASEAN network graph builder: [`backend/app/graph_service.py`](backend/app/graph_service.py)
  - Shared Pydantic v2 schemas: [`backend/app/schemas.py`](backend/app/schemas.py)
  - FastAPI routes & orchestration: [`backend/app/main.py`](backend/app/main.py)
- **Original harness implementation:**
  - **Multi-format document fusion:** Combines rendered 140 DPI PDF page images, extracted PDF text, Office Open XML (`.docx`/`.pptx`/`.xlsx`), raw images, and founder intent into a single multimodal payload.
  - **Self-healing JSON retry loop (`_call_with_retry`):** Validates Gemma 4 outputs against strict Pydantic v2 models with `max_output_tokens=8192` and retries automatically with a corrective prompt if JSON parsing or schema validation fails.
  - **Fact-grounding & assumption audit:** Never fabricates unstated startup fields (isolating them in `missing_fields`), tracks `grounded_in` attributes, and runs a post-generation regex audit on `PartnershipBrief` to flag any ungrounded organisation names into `assumptions`.
  - **Offline `MOCK_MODE` resilience:** Full offline fallback for zero-key evaluation and automated testing.

### Best Use of Gemma 4

- **Gemma 4 model identifier and Gemini API integration:** `gemma-4-26b-a4b-it` (`models/gemma-4-26b-a4b-it`), invoked via `google-genai` `client.models.generate_content` with `types.Part.from_bytes` for multimodal slide/PDF page inspection and `max_output_tokens=8192`.
- **Code link showing the integration:** [`backend/app/gemma_service.py`](backend/app/gemma_service.py) (`GemmaService.analyze_pitch()`, `GemmaService.generate_brief()`, `GemmaService._call_with_retry()`).
- **Input and useful output; multimodal value:**
  - **Input:** Multi-page PDF pitch deck (`data/sample_pitch_deck.pdf`), slide images (`data/sample_pitch_deck.png`), Word documents, or pasted screenshots + founder expansion goal (`cross-border POC` in `Vietnam`).
  - **Gemma 4 Output 1 (`StartupProfile`):** Reconciles visual slide diagrams and text into `company_name`, `country`, `sector`, `solution`, `capabilities[]`, `needs[]`, `target_markets[]`, `partnership_goals[]`, `missing_fields[]`, and `confidence`.
  - **Gemma 4 Output 2 (`PartnershipBrief`):** Synthesizes the confirmed `StartupProfile` and chosen ASEAN partner record into a shared `objective`, `collaboration_concept`, `proposed_poc`, 4-week actionable bulleted `timeline`, and quantified `success_metrics` with deadlines.

## Demo instructions

1. Clone and install backend:
   ```bash
   git clone https://github.com/joepro0118-create/MLH.git
   cd MLH
   pip install -r backend/requirements.txt
   cp .env.example .env   # add GEMINI_API_KEY (or set MOCK_MODE=true for offline mode)
   cd backend
   python run.py          # starts FastAPI on http://localhost:8000
   ```
2. Start frontend (in a second terminal):
   ```bash
   cd frontend
   npm install
   npm run dev            # open http://localhost:5173
   ```
3. Walkthrough:
   - Click **"One-Click Demo Login"** on the login screen.
   - Click **"📕 Load Sample PDF Deck"** + **"🤖 Analyze with Gemma 4 & Build Passport"** (or click **"🚀 Use SmartTONG Demo"** for instant offline loading, or press **`Ctrl+V`** to paste any screenshot/file).
   - Review and edit chips on the **Startup Passport**, then click **"🤝 Confirm & Find Top Partners →"**.
   - Inspect the Top 3 ranked ASEAN partners (`83`, `71`, `67`) and interact with the **ASEAN Ecosystem Network Graph**.
   - Click **"Generate Partnership Brief →"** on *Saigon Green Urban Waste Board* to view the 4-column interactive 30-day POC roadmap, check off tasks, edit cards inline, and export to **Word (`.doc`)**, **PDF (`.pdf`)**, **Markdown (`.md`)**, or **JSON**.
4. Offline automated tests (no API keys required):
   ```bash
   py -m pytest backend/tests/ tests/ -v
   ```

## Current status

- **What works:**
  - End-to-end 4-step founder flow (Demo Auth → Multi-format Upload & `Ctrl+V` Paste → Editable Startup Passport → Top 3 Matches + Interactive Canvas Network Graph → Editable 30-Day POC Dashboard + Word/PDF/MD/TXT/JSON Exports).
  - Live **Gemma 4 (`gemma-4-26b-a4b-it`)** multimodal & multi-document synthesis (`PDF`, `DOCX`, `PPTX`, `XLSX`, `PNG`, `JPG`, `WEBP`, `TXT`) and grounded POC brief generation.
  - Pure-Python 30/30/20/20 deterministic matching engine and 12-entity ASEAN illustrative ecosystem dataset.
  - 23 passing offline automated tests (`pytest backend/tests/ tests/ -v`).
- **Known limitations:**
  - All 12 ASEAN ecosystem partner records in `data/demo_ecosystem.json` are synthetic and illustrative (`"illustrative": true`) for hackathon demonstration purposes.
  - Session state is held in client memory rather than a persistent database.
- **What we would improve next:**
  - Connect to live opted-in ASEAN accelerator cohorts and municipal open-procurement feeds.
  - Add multi-party collaborative workspace rooms so both startup and partner teams can co-edit the 30-day POC checklist in real time.

## Submission checklist

- [x] Project repository is public and links work.
- [x] Required challenge evidence is included.
- [x] Project uses an open-source license (MIT).
- [x] Work and illustrative data disclaimers are represented transparently.
- [x] No API keys, tokens, passwords, or private data are included (`.env` is gitignored; only `.env.example` is committed).
