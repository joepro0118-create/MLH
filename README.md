# BridgeWise — AI Cross-Border Startup Partnership Intelligence

[![Pitch Deck](https://img.shields.io/badge/Pitch_Deck-Canva_Presentation-00C4CC?style=for-the-badge&logo=canva)](https://canva.link/v6b0hx0p5yl6w4t)
[![Vercel Deployment](https://img.shields.io/badge/Vercel-Live_App-000000?style=for-the-badge&logo=vercel)](https://mlh-vert.vercel.app/)
[![YouTube Video Demo](https://img.shields.io/badge/YouTube-Video_Demo-FF0000?style=for-the-badge&logo=youtube)](https://youtu.be/2Wf1PZ2cP8s?si=sexV36wlvz6WPkMV)
[![GitHub Repository](https://img.shields.io/badge/GitHub-BridgeWise_Repo-181717?style=for-the-badge&logo=github)](https://github.com/joepro0118-create/MLH)

> **MLH Hacktoberfest Hack Day KL · 31 October 2026 · Team BridgeWise (Yap En Thong, Joe Vei Xiang Zu, Manjishtha Chakma, Tan Yong Hung)**
>
> **Challenge Entries:** 🏆 **Best Use of Gemma 4** · 🏆 **Best Open-Source AI Project**
>
> Expanding a startup across Southeast Asia is fragmented and slow. **BridgeWise** transforms raw pitch decks, documents, screenshots, or founder notes into a structured **Startup Passport** using **Google Gemma 4 (`gemma-4-26b-a4b-it`)**, runs **100% deterministic, explainable Python partner matching** across an ASEAN ecosystem dataset, visualizes cross-border synergies on an interactive force-directed network graph, and generates a fact-grounded **Partnership Action Brief & 30-Day Proof-of-Concept (POC) Roadmap** exportable to Microsoft Word (`.doc`), vector PDF (`.pdf`), Markdown (`.md`), Text (`.txt`), and JSON.

It converts open-ended cross-border networking into concrete, measurable 30-day pilot execution — without hallucinated rankings or black-box matchmaking.

> ⚠️ **Illustrative Data Disclaimer:** All partner records, organisations, programmes, and generated outcomes in `data/demo_ecosystem.json` are **ILLUSTRATIVE** (`"illustrative": true`) for hackathon demonstration purposes. No real corporate or municipal partnerships are claimed or implied.

---

## Table of Contents

- [Project Overview & Hackathon Submission Summary](#project-overview--hackathon-submission-summary)
  - [Deployment & Live Demo Links](#deployment--live-demo-links)
  - [GitHub Repository & Open-Source License](#github-repository--open-source-license)
  - [Live Demo & Local Judge Evaluation](#live-demo--local-judge-evaluation)
  - [Project Description](#project-description)
- [Hackathon Challenges: Gemma 4 & Open-Source AI](#hackathon-challenges-gemma-4--open-source-ai)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
  - [1. Clone the Repository](#1-clone-the-repository)
  - [2. Create a Virtual Environment](#2-create-a-virtual-environment)
  - [3. Install Backend Dependencies](#3-install-backend-dependencies)
  - [4. Configure Environment Variables](#4-configure-environment-variables)
  - [5. Start the Backend Server](#5-start-the-backend-server)
  - [6. Install & Start the Frontend Application](#6-install--start-the-frontend-application)
  - [7. Judge Evaluation Walkthrough (Under 3 Minutes)](#7-judge-evaluation-walkthrough-under-3-minutes)
- [Architecture & System Design](#architecture--system-design)
  - [Directory Structure](#directory-structure)
  - [The 5-Stage Outcome Conversion Pipeline](#the-5-stage-outcome-conversion-pipeline)
  - [Data Flow Diagram](#data-flow-diagram)
  - [Core Subsystems](#core-subsystems)
- [Deterministic Matching Matrix & ASEAN Network Graph](#deterministic-matching-matrix--asean-network-graph)
- [API Reference](#api-reference)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [Testing Guide](#testing-guide)
- [Deployment](#deployment)
  - [Local Area Network (LAN) Access](#local-area-network-lan-access)
  - [Docker Container](#docker-container)
  - [Production Reverse Proxy (Nginx / Caddy)](#production-reverse-proxy-nginx--caddy)
- [Troubleshooting](#troubleshooting)
- [Privacy, Security & Grounding Guardrails](#privacy-security--grounding-guardrails)
- [Team BridgeWise & Contributing](#team-bridgewise--contributing)
- [License](#license)

---

## Project Overview & Hackathon Submission Summary

### Deployment & Live Demo Links

[![Pitch Deck](https://img.shields.io/badge/Pitch_Deck-Canva_Presentation-00C4CC?style=for-the-badge&logo=canva)](https://canva.link/v6b0hx0p5yl6w4t)
[![Vercel Deployment](https://img.shields.io/badge/Vercel-Live_App-000000?style=for-the-badge&logo=vercel)](https://mlh-vert.vercel.app/)
[![YouTube Video Demo](https://img.shields.io/badge/YouTube-Video_Demo-FF0000?style=for-the-badge&logo=youtube)](https://youtu.be/2Wf1PZ2cP8s?si=sexV36wlvz6WPkMV)
[![GitHub Repository](https://img.shields.io/badge/GitHub-BridgeWise_Repo-181717?style=for-the-badge&logo=github)](https://github.com/joepro0118-create/MLH)

- 📑 **Pitch Deck Presentation (Canva):** [https://canva.link/v6b0hx0p5yl6w4t](https://canva.link/v6b0hx0p5yl6w4t)
- 🌐 **Live Web Application (Vercel):** [https://mlh-vert.vercel.app/](https://mlh-vert.vercel.app/)
- 🎥 **Video Demo Walkthrough (YouTube):** [https://youtu.be/2Wf1PZ2cP8s?si=sexV36wlvz6WPkMV](https://youtu.be/2Wf1PZ2cP8s?si=sexV36wlvz6WPkMV)
- 💻 **Public GitHub Repository:** [https://github.com/joepro0118-create/MLH](https://github.com/joepro0118-create/MLH)

---

### GitHub Repository & Open-Source License

- **Public GitHub Repository:** [https://github.com/joepro0118-create/MLH](https://github.com/joepro0118-create/MLH)
- **Open-Source License:** [**MIT License**](LICENSE) (located in the root folder)
- **Technical Documentation:**
  - Full Submission Evidence: [`SUBMISSION.md`](SUBMISSION.md)
  - Canonical REST API Contract & Schemas: [`docs/api_contract.md`](docs/api_contract.md)
  - Illustrative ASEAN Ecosystem Dataset & Calibration Spec: [`docs/data_sources.md`](docs/data_sources.md)

---

### Live Demo & Local Judge Evaluation

- 📑 **Pitch Deck Presentation (Canva):** [https://canva.link/v6b0hx0p5yl6w4t](https://canva.link/v6b0hx0p5yl6w4t)
- 🌐 **Live Web Application (Vercel):** [https://mlh-vert.vercel.app/](https://mlh-vert.vercel.app/)
- 🎥 **Video Demo Walkthrough (YouTube):** [https://youtu.be/2Wf1PZ2cP8s?si=sexV36wlvz6WPkMV](https://youtu.be/2Wf1PZ2cP8s?si=sexV36wlvz6WPkMV)
- 💻 **Public GitHub Repository:** [https://github.com/joepro0118-create/MLH](https://github.com/joepro0118-create/MLH)

BridgeWise is designed so judges can evaluate the complete end-to-end product either live in production or locally in **under 2 minutes** — either with **live Gemma 4 multimodal inference** (using a free Google AI Studio key) or **completely offline** using `MOCK_MODE=true` and the built-in **One-Click Demo Login** + **SmartTONG Sample Pitch Deck**.

See [Getting Started](#getting-started) and [7. Judge Evaluation Walkthrough](#7-judge-evaluation-walkthrough-under-3-minutes) below for copy-pasteable startup commands.

---

### Project Description

#### 1. Which Problem Statement We Tackled
We tackled the **Startup ASEAN Cross-Border Outcome Conversion** challenge: bridging high-potential ASEAN startups with regional government agencies, municipal boards, accelerators, and commercial fleet/distribution partners across Malaysia, Vietnam, Singapore, Indonesia, Thailand, and the Philippines.

#### 2. The Problem We Are Solving
Southeast Asia's startup ecosystem is vibrant but heavily siloed by national borders, regulatory regimes, and fragmented partner directories. When a startup (for example, a Malaysian smart-waste IoT company) tries to expand into Vietnam or Indonesia:
- **Static Directories Don't Convert:** Existing ecosystem databases list thousands of logos but fail to evaluate bidirectional operational fit (*Do our technical capabilities solve their municipal needs? Do their local concessions solve our market-entry needs?*).
- **Pitch Materials Are Unstructured:** Founders carry information across PDF pitch decks, Word proposals, slide screenshots, and rough notes rather than standardized machine-readable profiles.
- **Networking Talks Stall Without an Execution Plan:** Even when two organisations meet at a trade mission or hackathon, discussions rarely convert into a concrete, time-bound **30-day Proof-of-Concept (POC)** with weekly deliverables and measurable KPIs.

#### 3. Our Proposed Solution
**BridgeWise** is an AI-powered cross-border partnership intelligence platform that automates the journey from **unstructured pitch materials** to an **executable 30-day bilateral POC plan**:
1. **Multimodal & Multi-Format Startup Intake:** Founders upload or `Ctrl+V` paste pitch slides, PDFs, Word documents (`.docx`), PowerPoint decks (`.pptx`), spreadsheets, or notes.
2. **Fact-Grounded Startup Passport (Gemma 4):** Google's open-weight **Gemma 4 (`gemma-4-26b-a4b-it`)** extracts a structured `StartupProfile`, flagging any missing fields rather than guessing, and presents an interactive **Human-in-the-Loop Chip Editor** for founder verification.
3. **Deterministic 30/30/20/20 Partner Matching:** A pure-Python weighted scoring engine ranks ASEAN ecosystem entities across four explicit dimensions (Sector 30%, Bidirectional Capabilities/Needs 30%, Target Market 20%, Partnership Goals 20%) and visualizes the regional cluster on an interactive HTML5 Canvas force-directed network graph.
4. **Actionable 30-Day POC Roadmap & Executive Exports (Gemma 4):** Once the founder selects a partner, Gemma 4 synthesizes a grounded **Partnership Action Brief** featuring a 4-week interactive to-do checklist, measurable KPIs with deadlines, explicit assumption auditing, and one-click exports to **Microsoft Word (`.doc`)**, **Vector PDF (`.pdf`)**, **Markdown (`.md`)**, **Text (`.txt`)**, and **JSON**.

#### 4. How Our Solution Works
```text
[Step 0: Founder Demo Auth / Onboarding]
                  │
                  ▼
[Step 1: Multi-Format Upload (PDF/DOCX/PPTX/Images) or `Ctrl+V` Paste + Expansion Goal]
                  │
                  ▼  Gemma 4 (gemma-4-26b-a4b-it) Multimodal + Document Synthesis
[Step 2: Fact-Grounded Startup Passport + Interactive Human-in-the-Loop Chip Editor]
                  │
                  ▼  Pure Python Deterministic Matching (30/30/20/20 Weights) + Graph Builder
[Step 3: Top 3 Ranked ASEAN Partners + Interactive Force-Directed Ecosystem Network Graph]
                  │
                  ▼  Founder Selects Partner → Gemma 4 Grounded Strategic Synthesis
[Step 4: Partnership Action Dashboard + 4-Week Interactive POC To-Do Roadmap + Word/PDF/MD/JSON Export]
```

#### 5. The Technologies and Tools Used
- **Open-Weight AI Model:** Google **Gemma 4 (`gemma-4-26b-a4b-it`)** via the official `google-genai` SDK (`client.models.generate_content`).
- **Backend:** Python 3.11+, **FastAPI**, **Pydantic v2** (strict schema validation), **PyMuPDF (`fitz`)** (PDF text + 140 DPI page image rendering for vision), Python `zipfile` + `xml.etree.ElementTree` (Office Open XML `.docx`/`.pptx`/`.xlsx` extraction), **Uvicorn**.
- **Frontend:** **React 18**, **Vite**, HTML5 Canvas 2D physics simulation (force-directed ASEAN network graph & celebration confetti), custom CSS variables design system, client-side binary PDF 1.4 generator and Word HTML/XML document builder.
- **Testing & QA:** **Pytest** & `unittest` (23 offline unit and schema validation tests).

#### 6. Target Users & Beneficiaries
- **ASEAN Early- to Growth-Stage Founders:** Seeking rapid, de-risked cross-border pilot entry without months of cold business development.
- **Government Agencies & Municipal Innovation Boards:** Looking for vetted regional technology providers whose capabilities directly address civic infrastructure needs.
- **Cross-Border Accelerators & Venture Builders (e.g., Startup ASEAN, Cradle, Mekong programmes):** Facilitating high-conversion bilateral cohorts with standardized POC briefs.

#### 7. What Makes BridgeWise Unique
- **Hybrid Neuro-Symbolic Architecture (AI Where It Helps, Deterministic Math Where It Matters):** We use **Gemma 4** for what LLMs excel at (multimodal pitch comprehension and structured POC drafting), while keeping partner ranking **100% deterministic in Python**. No LLM can hallucinate a match score or arbitrarily favor a partner.
- **Strict Anti-Hallucination & Assumption Auditing:** Both Gemma 4 stages enforce strict fact-grounding. Missing slide details are recorded in `missing_fields` rather than fabricated, and any organisation mentioned in a generated brief that was not in the two input records is automatically flagged by a Python post-processor into `assumptions`.
- **Zero-Friction Intake & Boardroom-Ready Output:** From `Ctrl+V` pasting a slide screenshot on Step 1 to downloading a formatted Microsoft Word (`.doc`) or vector PDF (`.pdf`) 30-day pilot agreement on Step 4.

---

## Hackathon Challenges: Gemma 4 & Open-Source AI

Full submission answers and evidence: **[SUBMISSION.md](SUBMISSION.md)**.

**Where Gemma 4 works** (`gemma-4-26b-a4b-it` via the Gemini API, `google-genai` SDK — never silently substituted with a closed model):

| Job | What Gemma 4 does | Code |
|---|---|---|
| **1. Multimodal + Multi-Format Pitch Synthesis** | Reads 1–10 uploaded files — rendering PDF pages as 140 DPI PNG vision parts alongside extracted PDF text, Office XML (`.docx`/`.pptx`/`.xlsx`), images (`PNG`/`JPEG`/`WebP`), and founder notes — and reconciles them into a single `StartupProfile` JSON | [`backend/app/gemma_service.py` `analyze_pitch()`](backend/app/gemma_service.py), [`backend/app/main.py` `/api/pitch/analyze`](backend/app/main.py) |
| **2. Fact-Grounded Extraction & Confidence Scoring** | Refuses to guess unstated revenue, customers, or markets; populates `missing_fields` and assigns a `confidence` level (`high` \| `medium` \| `low`) | [`backend/app/gemma_service.py` `analyze_pitch()`](backend/app/gemma_service.py), [`backend/app/schemas.py` `StartupProfile`](backend/app/schemas.py) |
| **3. Grounded Partnership Action Brief & 30-Day POC Plan** | Synthesizes two records (`StartupProfile` × chosen ASEAN `Partner`) into an executive objective, collaboration concept, 30-day POC design, 4-week actionable bulleted roadmap, and quantified `success_metrics` with deadlines | [`backend/app/gemma_service.py` `generate_brief()`](backend/app/gemma_service.py), [`backend/app/main.py` `/api/partnership/brief`](backend/app/main.py) |
| **4. Post-Generation Assumption & Hallucination Audit** | Lists any inferences in `assumptions`, tracks utilized source attributes in `grounded_in`, and runs a Python regex audit over the generated brief to flag any organisation names not present in the two source records | [`backend/app/gemma_service.py` `generate_brief()`](backend/app/gemma_service.py) |

**Resilient Gemma 4 Harness Details:**
- **Right-Sized Token Budgets:** `max_output_tokens=4096` for Startup Passport synthesis and `2048` for Partnership Briefs — enough headroom for the structured JSON payload without paying latency for an unused 8K budget.
- **Non-Blocking Inference (`asyncio.to_thread`):** The synchronous `google-genai` SDK call and PDF/Office parsing run in a worker thread, so FastAPI keeps serving `/api/matches` and `/api/ecosystem/graph` while Gemma 4 is generating.
- **Brief Cache + In-Flight Deduplication:** Partnership Briefs are cached by `SHA-256(StartupProfile + partner_id)`; a duplicate request for a brief that is still generating joins the existing call instead of starting a new one. Editing any Passport field changes the hash, so edited profiles always get a fresh brief.
- **Self-Healing JSON Retry Loop (`_call_with_retry`):** Strips markdown fences, extracts the JSON object, validates it against strict Pydantic v2 models (`StartupProfile`, `PartnershipBrief`), and automatically retries with a corrective system instruction if validation fails on the first attempt.
- **Open-Weight & Open-Source Stack:** Powered by open-weight **Gemma 4 (`gemma-4-26b-a4b-it`)**, deterministic Python matching (`backend/app/matching_service.py`), pure-Python graph topology (`backend/app/graph_service.py`), and released under the **MIT License**.

---

## Key Features

- **Universal Multi-Format Pitch Intake + Global `Ctrl+V` Paste:** Upload up to 10 files (`.pdf`, `.docx`, `.pptx`, `.xlsx`, `.csv`, `.txt`, `.md`, `.png`, `.jpg`, `.webp`) up to 20 MB each, or press `Ctrl+V` / `Cmd+V` anywhere on Step 1 to paste clipboard screenshots or text directly into the analyzer.
- **Multimodal PDF Vision + Text Fusion:** Automatically extracts full text from PDFs while simultaneously rendering the first 3 pages at 140 DPI as PNG images via `PyMuPDF` so Gemma 4 inspects both visual diagrams/charts and body copy.
- **Human-in-the-Loop Startup Passport:** Founders review and edit every extracted field and interactive capability/need/market/goal chip before partner matching runs.
- **Deterministic 30/30/20/20 Partner Matching Engine:** Pure-Python scoring engine (`backend/app/matching_service.py`) combining sector cluster alignment (30%), bidirectional capability-to-need coverage + Szymkiewicz–Simpson overlap coefficient (30%), target market overlap (20%), and partnership goal alignment (20%). Zero LLM hallucination in rankings.
- **Interactive HTML5 Canvas ASEAN Ecosystem Graph:** Custom force-directed network visualization (`frontend/src/components/EcosystemGraph.jsx`) with spring-embedder physics, retina DPR scaling, node degree sizing, top-3 match pulse illumination, country/type color coding, relationship filtering (`complements`, `same market`, `same sector`), search, and hover tooltips.
- **Interactive 4-Column 30-Day POC Roadmap:** Breaks the 30-day pilot into 4 weekly sprints (Days 1–7, 8–14, 15–21, 22–30) with interactive checkable to-do items and inline editing for every dashboard card.
- **Boardroom-Ready Multi-Format Exports:** One-click client-side export to **Microsoft Word (`.doc`)**, **Vector PDF (`.pdf`)** (generated via a native PDF 1.4 stream writer with zero pop-up blockers), **Markdown (`.md`)**, **Plain Text (`.txt`)**, **JSON (`.json`)**, clipboard copy, and Web Share.
- **Hover Pre-Fetch for Near-Instant 30-Day POC Briefs:** Hovering over a partner card on Step 3 starts generating that partner's brief in the background, so by the time you click **"Generate Partnership Brief →"** it is already done or well underway. Only hovered partners are generated, so no API quota is wasted on partners you never look at.
- **Fast Matches & Graph:** `demo_ecosystem.json` and the default ecosystem graph are cached in memory (auto-invalidated when the file's modification time changes), the frontend fetches the graph once per session, and API calls target `127.0.0.1` to avoid the Windows `localhost` IPv6 fallback delay.
- **Instant Offline Demo & `MOCK_MODE`:** Works out-of-the-box without an internet connection or API key via `MOCK_MODE=true` and the pre-calibrated **SmartTONG (Malaysia → Vietnam)** demo dataset.

---

## Tech Stack

| Layer | Technology | Details |
|---|---|---|
| **AI Model** | Google Gemma 4 (`gemma-4-26b-a4b-it`) | Open-weight multimodal model via `google-genai` SDK (`models/gemma-4-26b-a4b-it`) |
| **Backend Framework** | Python 3.11+ & FastAPI | Async REST API with CORS middleware, multipart file handling, and OpenAPI docs |
| **Schema & Validation** | Pydantic v2 | Strict request/response contracts (`StartupProfile`, `PartnerMatch`, `PartnershipBrief`, `EcosystemGraph`) |
| **Document Parsing** | PyMuPDF (`fitz`) + Python `zipfile`/`xml` | Multimodal PDF text + 140 DPI page rendering; native `.docx`, `.pptx`, `.xlsx` XML text extraction |
| **Matching Engine** | Pure Python (`matching_service.py`) | Deterministic 30/30/20/20 weighted scoring with morphological token normalization |
| **Graph Engine** | Pure Python (`graph_service.py`) | Builds ASEAN ecosystem nodes and weighted affinity edges (`complements`, `same sector`, `same market`) |
| **Frontend Framework** | React 18 & Vite | Component-driven 4-step workflow with hooks, toast notifications, and inline editors |
| **Visualizations** | HTML5 Canvas 2D | Custom force-directed network graph physics simulation, animated SVG score rings, canvas confetti |
| **Export Engine** | Client-side JS (`exportUtils.js`) | Native PDF 1.4 binary stream builder, MSO Word `.doc` generator, Markdown, TXT, and JSON exporters |

---

## Prerequisites

- **Python:** Version 3.11 or higher (3.11–3.13 recommended).
- **Node.js & npm:** Node.js 18+ and npm 9+.
- **Git:** For cloning the repository.
- **Google Gemini API Key** *(Optional for offline demo; required for live Gemma 4 calls)*:
  - Get a free API key from [Google AI Studio](https://aistudio.google.com/apikey).
  - If evaluating offline without an API key, set `MOCK_MODE=true` in `.env`.

---

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/joepro0118-create/MLH.git
cd MLH
```

### 2. Create a Virtual Environment

On Windows (PowerShell):
```powershell
py -m venv .venv
.\.venv\Scripts\Activate.ps1
```

On macOS / Linux:
```bash
python3 -m venv .venv
source .venv/bin/activate
```

### 3. Install Backend Dependencies

```bash
pip install --upgrade pip
pip install -r backend/requirements.txt
```

### 4. Configure Environment Variables

Copy the example configuration file in the project root:

```bash
cp .env.example .env
```

Open `.env` and add your Google AI Studio API key (or set `MOCK_MODE=true` for offline evaluation):

```dotenv
# Required for live Gemma 4 inference (get a free key at https://aistudio.google.com/apikey)
GEMINI_API_KEY=your_gemini_api_key_here

# Target open-weight Gemma 4 model
GEMMA_MODEL=gemma-4-26b-a4b-it

# Set to true to run completely offline with instant canned SmartTONG responses
MOCK_MODE=false
```

### 5. Start the Backend Server

```bash
cd backend
python run.py
```

*Expected console output:*
```text
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     Started reloader process [12345] using WatchFiles
INFO:app.gemma_service:GemmaService ready (model=models/gemma-4-26b-a4b-it)
INFO:     Application startup complete.
```

Verify the backend health endpoint at `http://127.0.0.1:8000/health` (or interactive Swagger UI at `http://127.0.0.1:8000/docs`).

### 6. Install & Start the Frontend Application

Open a **second terminal** in the repository root:

```bash
cd frontend
npm install
npm run dev
```

*Expected console output:*
```text
  VITE v6.4.5  ready in 320 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: http://192.168.1.x:5173/
```

Open your browser to **`http://localhost:5173`**.

### 7. Judge Evaluation Walkthrough (Under 3 Minutes)

1. **Step 0 — One-Click Demo Sign-In:**
   - On the login screen, click **"One-Click Demo Login"** in the top banner (or sign in with `alex@smarttong.my` / `demo1234`).
2. **Step 1 — Pitch Material Intake:**
   - **Option A (Live Gemma 4 PDF Analysis):** Click **"📕 Load Sample PDF Deck"** to attach `SmartTONG_Pitch_Deck.pdf` (`data/sample_pitch_deck.pdf`) and pre-fill the Vietnam expansion goal, then click **"🤖 Analyze with Gemma 4 & Build Passport"**.
   - **Option B (Upload or `Ctrl+V` Paste):** Drag and drop any PDF, Word `.docx`, PowerPoint `.pptx`, or image slide — or press `Ctrl+V` to paste a screenshot or text from your clipboard.
   - **Option C (Instant Demo Bypass):** Click **"🚀 Use SmartTONG Demo"** to jump straight to the extracted Startup Passport.
3. **Step 2 — Startup Passport (Human-in-the-Loop):**
   - Inspect the structured `StartupProfile` extracted by Gemma 4 (`SmartTONG`, Malaysia, `smart-city`).
   - Try adding or removing a capability or need chip in the interactive chip editor, then click **"🤝 Confirm & Find Top Partners →"**.
4. **Step 3 — Top 3 ASEAN Matches & Interactive Network Graph:**
   - Review the Top 3 deterministically scored partners:
     1. **Saigon Green Urban Waste Board (illustrative)** — Vietnam (`83/100`)
     2. **Mekong Green Horizons Accelerator (illustrative)** — Vietnam (`71/100`)
     3. **VinaFleet EcoLogistics (illustrative)** — Vietnam (`67/100`)
   - Scroll down to the **ASEAN Ecosystem Network Graph**: drag nodes, toggle color mode (`By Country` vs `By Type`), filter edges (`complements`, `same market`, `same sector`), or search entities.
   - Hover over a partner card for a moment (this pre-fetches its brief in the background), then click **"Generate Partnership Brief →"**.
5. **Step 4 — Partnership Action Dashboard & 30-Day POC Plan:**
   - Explore the generated **Strategic Objective**, **Collaboration Concept**, **Proposed 30-Day POC**, **4-Column Interactive Weekly To-Do Roadmap**, and **Measurable Success Metrics**.
   - Click any weekly task item to check/uncheck it, or click **"✏️ Edit"** on any card to customize the brief inline.
   - Test the export toolbar: click **"📘 Word"** (`.doc`), **"📕 PDF"** (`.pdf`), **"💾 .md"**, **"📄 .txt"**, **"📦 JSON"**, or **"📋 Copy"**.

---

## Architecture & System Design

### Directory Structure

```text
BridgeWise/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                 # FastAPI app, CORS middleware, MOCK_MODE, all 5 API routes
│   │   ├── schemas.py              # Shared Pydantic v2 data contracts (v2 grounded fields)
│   │   ├── gemma_service.py        # Centralised Gemma 4 wrapper (PDF/DOCX/image vision + JSON retry)
│   │   ├── matching_service.py     # Pure-Python 30/30/20/20 deterministic partner scoring engine
│   │   └── graph_service.py        # Pure-Python ASEAN ecosystem network graph builder
│   ├── tests/
│   │   ├── __init__.py
│   │   └── test_api.py             # Offline unit tests for matching, schemas, guardrails & mocks
│   ├── requirements.txt            # Backend Python dependencies
│   └── run.py                      # Uvicorn server entrypoint (loads root .env, port 8000)
├── frontend/
│   ├── public/
│   │   ├── sample_pitch_deck.pdf   # Multi-page SmartTONG sample pitch deck for live PDF testing
│   │   └── sample_pitch_deck.png   # Sample SmartTONG pitch slide image
│   ├── src/
│   │   ├── components/
│   │   │   ├── EcosystemGraph.jsx  # Interactive HTML5 Canvas force-directed ASEAN network graph
│   │   │   ├── EcosystemGraph.css  # Dark glassmorphic styling & controls for network graph
│   │   │   └── mockEcosystemData.js# Offline fallback graph topology
│   │   ├── App.jsx                 # Main 4-step application (Auth → Upload → Passport → Matches → Brief)
│   │   ├── api.js                  # Fetch client for all 5 endpoints (graph cache + brief hover pre-fetch)
│   │   ├── exportUtils.js          # Client-side Word (.doc), Vector PDF (.pdf), and Markdown exporters
│   │   ├── index.css               # Violet SaaS design system, animations, responsive layout
│   │   └── main.jsx                # React DOM root mounting
│   ├── index.html                  # App shell
│   ├── package.json                # Frontend dependencies & Vite scripts
│   └── vite.config.js              # Vite configuration (port 5173)
├── data/
│   ├── demo_ecosystem.json         # 12 calibrated illustrative ASEAN partner records across 6 countries
│   ├── sample_pitch_deck.pdf       # Canonical SmartTONG sample PDF deck
│   └── sample_pitch_deck.png       # Canonical SmartTONG sample PNG slide
├── docs/
│   ├── api_contract.md             # Canonical API specification & Pydantic v2 schema reference
│   └── data_sources.md             # Illustrative dataset documentation & 3-tier calibration design
├── tests/
│   └── test_graph_service.py       # Offline unit test suite for ASEAN graph topology & edge weights
├── .do/
│   └── app.yaml                    # DigitalOcean App Platform deployment specification
├── .dockerignore                   # Excludes local caches & node_modules from container builds
├── .env.example                    # Environment variable template
├── .gitignore                      # Excludes .env, node_modules, .venv, __pycache__, dist
├── Dockerfile                      # Multi-stage Node 20 + Python 3.11 unified production image
├── LICENSE                         # MIT Open-Source License
├── SUBMISSION.md                   # Complete hackathon challenge submission evidence
└── README.md                       # Project documentation
```

### The 5-Stage Outcome Conversion Pipeline

```text
Founder Materials (PDF / DOCX / PPTX / XLSX / Images / `Ctrl+V` Paste / Founder Notes)
                                      │
                                      ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│ 1. Multi-Format Document Preprocessor (backend/app/gemma_service.py)         │
│    - Images (PNG/JPG/WebP/GIF) → raw bytes wrapped as Multimodal Vision Part │
│    - PDFs → PyMuPDF extracts full page text + renders up to 3 pages at       │
│      140 DPI as PNG Vision Parts so Gemma 4 reads charts & slide layouts     │
│    - Office Open XML (.docx, .pptx, .xlsx) → stdlib zipfile + XML parser     │
└─────────────────────────────────────┬────────────────────────────────────────┘
                                      │ Multimodal Parts + Founder Intent
                                      ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│ 2. Gemma 4 Pitch Synthesizer (gemma-4-26b-a4b-it via Google GenAI SDK)       │
│    - Synthesizes all slides/documents into a single StartupProfile JSON      │
│    - Strict fact-grounding: never guesses revenue, customers, or markets     │
│    - Populates missing_fields[] and confidence ("high" | "medium" | "low")   │
└─────────────────────────────────────┬────────────────────────────────────────┘
                                      │ Validated StartupProfile
                                      ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│ 3. Human-in-the-Loop Startup Passport (frontend/src/App.jsx)                 │
│    - Founder reviews and edits company metadata, solution statement,         │
│      capabilities, operational needs, target markets, and partnership goals  │
└─────────────────────────────────────┬────────────────────────────────────────┘
                                      │ Confirmed StartupProfile
                                      ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│ 4. Deterministic Matching & Ecosystem Graph (matching_service + graph_service│
│    - Pure Python 30/30/20/20 weighted scoring against demo_ecosystem.json    │
│    - Morphological token normalization + item coverage + overlap coefficient │
│    - Builds 12-node, 74-edge ASEAN network graph across 3 affinity relations │
└─────────────────────────────────────┬────────────────────────────────────────┘
                                      │ Top 3 Matches + Selected Partner ID
                                      ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│ 5. Grounded Partnership Brief & 30-Day POC Generator (Gemma 4 + exportUtils) │
│    - Generates Objective, Collaboration Concept, 30-Day POC, 4-Week Bulleted │
│      To-Do Roadmap, and Quantified Success Metrics with Deadlines            │
│    - Audits output for ungrounded organisation names → appends to assumptions│
│    - Inline editing + 1-click export to Word (.doc), PDF (.pdf), .md, .json  │
└──────────────────────────────────────────────────────────────────────────────┘
```

### Data Flow Diagram

```text
React Client (Browser :5173)         FastAPI Server (:8000)                Gemma 4 (Gemini API)
            │                                  │                                    │
            │── 1. POST /api/pitch/analyze ───>│                                    │
            │   (files[] + notes + goal)       │── 2. Parse PDF/DOCX/Images         │
            │                                  │   (Local PyMuPDF & XML)            │
            │                                  │── 3. generate_content() ──────────>│ gemma-4-26b-a4b-it
            │                                  │<── Structured StartupProfile JSON ─│
            │<── 4. Return StartupProfile ─────│   (Validated via Pydantic v2)      │
            │                                  │                                    │
            │── [Founder edits Passport chips] │                                    │
            │                                  │                                    │
            │── 5. POST /api/matches ─────────>│                                    │
            │   (Confirmed StartupProfile)     │── 6. Deterministic 30/30/20/20     │
            │<── 7. Top 3 PartnerMatch[] ──────│   (Local Python - Zero LLM)        │
            │                                  │                                    │
            │── 8. GET /api/ecosystem/graph ──>│                                    │
            │<── 9. EcosystemGraph (12N, 74E) ─│   (Local graph_service.py)         │
            │                                  │                                    │
            │── 10. POST /api/partnership/brief│                                    │
            │   (StartupProfile + partner_id)  │── 11. Lookup Partner Record        │
            │                                  │── 12. generate_content() ─────────>│ gemma-4-26b-a4b-it
            │                                  │<── PartnershipBrief + 4-Wk Plan ───│
            │                                  │── 13. Regex Org Grounding Audit    │
            │<── 14. Grounded PartnershipBrief │                                    │
            │                                  │                                    │
            │── 15. Inline Edit & Export ──────┼──> [Local .doc / .pdf / .md / .json]
```

### Core Subsystems

#### 1. Centralised Gemma 4 Service (`backend/app/gemma_service.py`)
Encapsulates all interactions with `models/gemma-4-26b-a4b-it` via the `google-genai` SDK:
- **Multi-Format Ingestion:** Handles raw image bytes (`image/png`, `image/jpeg`, `image/webp`, `image/gif`), PDF documents (`_extract_pdf_text_and_images` via `PyMuPDF`), Office Open XML documents (`_extract_office_xml_text` for `.docx`, `.pptx`, `.xlsx`), and plain-text/CSV/Markdown files.
- **Self-Healing JSON Parser (`_call_with_retry`):** Strips markdown code blocks, extracts the root JSON object, validates against Pydantic v2 models, and retries once with an explicit JSON-only enforcement prompt if the first response fails validation.
- **Non-Blocking Execution & Brief Caching:** All Gemma 4 calls and document parsing run via `asyncio.to_thread`; `generate_brief()` caches results by `SHA-256(StartupProfile + partner_id)` and deduplicates concurrent requests for the same brief.
- **Hallucination & Assumption Guardrails:** In `generate_brief()`, computes `grounded_in` from non-empty startup fields, enforces the standard illustrative `disclaimer`, and scans the generated text for any capitalized multi-word organisation names not present in either the startup or partner record — automatically logging and appending them to `brief.assumptions`.

#### 2. Deterministic Matching Service (`backend/app/matching_service.py`)
Executes 100% in Python with zero LLM calls so rankings are fast (`< 5 ms`), reproducible, and auditable:
- **Morphological Token Normalization (`_tokenize`):** Normalizes hyphens, underscores, US/UK spelling (`optimization` / `optimisation` $\rightarrow$ `optim`), and plurals (`sensors` / `sensor` $\rightarrow$ `sensor`, `routes` / `routing` $\rightarrow$ `route`, `cities` / `city` $\rightarrow$ `city`).
- **Bidirectional Complementarity (`_complementary_score` & `_item_coverage`):** Evaluates both how well the startup's `capabilities` satisfy the partner's `needs` and how well the partner's `capabilities` satisfy the startup's `needs`, blending item-level coverage (65%) with the Szymkiewicz–Simpson overlap coefficient (35%).
- **In-Memory Dataset Cache (`_load_partners`):** Loads `data/demo_ecosystem.json` once and reuses it across requests, reloading automatically when the file's modification time changes.
- **Explainable Match Reasons (`_build_reasons`):** Generates human-readable bullet points explaining the exact sector alignment, capability-to-need matches, and shared target markets for each recommended partner.

#### 3. ASEAN Ecosystem Graph Builder (`backend/app/graph_service.py`)
Builds a regional relationship graph from `data/demo_ecosystem.json` (and optionally injects the active startup node):
- Computes pairwise affinity edges across three relationship types:
  - `complements`: Capability $\leftrightarrow$ Need intersection ($\text{weight} = \min(1.0, 0.4 + 0.15 \times \text{matches})$).
  - `same sector`: Shared sector domain ($\text{weight} = \min(1.0, 0.3 + 0.1 \times \text{shared})$).
  - `same market`: Shared ASEAN target market ($\text{weight} = \min(1.0, 0.3 + 0.1 \times \text{shared})$).

#### 4. Executive Document Export Suite (`frontend/src/exportUtils.js`)
Generates downloadable executive artifacts directly in the browser without external server dependencies or print-dialog pop-up blockers:
- **Microsoft Word (`exportBriefToWord`):** Produces an MSO-compatible HTML/XML `.doc` document with styled indigo/violet headers, two-column concept/POC layout, 4-week timeline table, and KPI checklist.
- **Vector PDF (`exportBriefToPdf`):** Constructs a raw `%PDF-1.4` binary file with Type1 Helvetica/Helvetica-Bold fonts, RGB vector banners, color-coded weekly timeline blocks, and automatic line wrapping.

---

## Deterministic Matching Matrix & ASEAN Network Graph

### The 30 / 30 / 20 / 20 Scoring Formula

Every partner in `data/demo_ecosystem.json` is scored from `0` to `100` using four explicit weights:

$$\text{Score} = \text{round}\Big(\big(0.30 \times S_{\text{industry}} + 0.30 \times S_{\text{complementary}} + 0.20 \times S_{\text{market}} + 0.20 \times S_{\text{goals}}\big) \times 100\Big)$$

| Component | Weight | How It Is Calculated |
|---|---|---|
| **Industry Compatibility** ($S_{\text{industry}}$) | **30%** | Token Jaccard similarity across `sector` and `sectors[]`, plus cross-border innovation cluster bonuses (`smart-city` $\leftrightarrow$ `smart_waste` / `cleantech` / `govtech` / `sustainability`) |
| **Bidirectional Complementarity** ($S_{\text{complementary}}$) | **30%** | Average of: (1) Startup `capabilities` covering Partner `needs`, and (2) Partner `capabilities` covering Startup `needs` |
| **Target Market Overlap** ($S_{\text{market}}$) | **20%** | Overlap between Startup `target_markets` + `target_country` and Partner `target_markets` + `country` + `city` |
| **Partnership Goal Alignment** ($S_{\text{goals}}$) | **20%** | Coverage of Startup `partnership_goals` + `goal` against Partner `partnership_goals` and operational profile |

### 3-Tier Dataset Calibration (`data/demo_ecosystem.json`)

The 12 illustrative ASEAN entities are calibrated across 3 tiers (using **SmartTONG**, a Malaysian smart-waste IoT startup targeting Vietnam, as the benchmark):

| Tier | Partner ID | Partner Name | Country | Score | Role in Ecosystem |
|---|---|---|---|---|---|
| **Tier 1 (Top 3)** | `partner-vn-01` | Saigon Green Urban Waste Board *(illustrative)* | Vietnam | **83** | Municipal waste concession holder in Ho Chi Minh City seeking IoT bin sensors & dynamic routing |
| **Tier 1 (Top 3)** | `partner-vn-03` | Mekong Green Horizons Accelerator *(illustrative)* | Vietnam | **71** | Bilateral cleantech accelerator offering Vietnam pilot subsidies & regulatory fast-tracking |
| **Tier 1 (Top 3)** | `partner-vn-02` | VinaFleet EcoLogistics *(illustrative)* | Vietnam | **67** | Electric waste truck fleet operator in Vietnam seeking route optimization & sensor telematics |
| **Tier 2** | `partner-sg-01` | LionCity Urban Solutions *(illustrative)* | Singapore | **49** | Regional GovTech integrator bundling edge IoT sensors into ASEAN smart city tenders |
| **Tier 2** | `partner-my-01` | CradleEco Cross-Border Hub *(illustrative)* | Malaysia | **42** | Malaysian export grant & ASEAN soft-landing programme |
| **Tier 2** | `partner-th-01` | Siam Sensortech Robotics *(illustrative)* | Thailand | **41** | Ruggedized ultrasonic hardware manufacturer in Bangkok |
| **Tier 3 (Contrast)** | `partner-id-01` | Nusantara FastHaul Logistics *(illustrative)* | Indonesia | **10** | Jakarta e-commerce 2-wheeler courier (low sector & market overlap) |

---

## API Reference

Full API specification: **[`docs/api_contract.md`](docs/api_contract.md)**.

### 1. `GET /health`
Liveness check reporting whether `MOCK_MODE` is active.

**Response (`200 OK`):**
```json
{
  "status": "ok",
  "mock_mode": false
}
```

---

### 2. `POST /api/pitch/analyze`
Accepts 1–10 uploaded files (`files`, `images`, or `image`) of any supported format (`.pdf`, `.docx`, `.pptx`, `.xlsx`, `.csv`, `.txt`, `.md`, `.png`, `.jpg`, `.webp`) and/or founder `notes`, `goal`, and `target_country`. Synthesizes a unified `StartupProfile` via Gemma 4.

**Form Parameters (`multipart/form-data`):**
- `files` (*file[], optional*): Up to 10 pitch documents or slide images (max 20 MB per file).
- `notes` (*string, optional*): Founder free-text description or prompt (can be used standalone without files).
- `goal` (*string, optional*): Primary objective (`cross-border POC`, `market expansion`, `commercial partnership`).
- `target_country` (*string, optional*): Target ASEAN country (e.g., `Vietnam`).

**Response (`200 OK` — `StartupProfile`):**
```json
{
  "company_name": "SmartTONG",
  "country": "Malaysia",
  "sector": "smart-city",
  "solution": "IoT-enabled smart bins that optimise municipal waste collection routes in real time.",
  "capabilities": [
    "iot-sensors",
    "route-optimisation",
    "real-time-dashboard",
    "waste-analytics"
  ],
  "needs": [
    "municipal-pilot",
    "government-procurement",
    "local-distribution-network"
  ],
  "target_markets": ["Vietnam", "Ho Chi Minh City", "Hanoi"],
  "partnership_goals": ["pilot", "distribution", "market-access"],
  "goal": "cross_border_poc",
  "target_country": "Vietnam",
  "missing_fields": [],
  "confidence": "high"
}
```

---

### 3. `POST /api/matches`
Runs deterministic 30/30/20/20 Python matching against `data/demo_ecosystem.json` and returns the Top 3 `PartnerMatch` records.

**Request Body (`application/json` — `StartupProfile`):**
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

**Response (`200 OK` — `MatchResponse`):**
```json
{
  "matches": [
    {
      "partner_id": "partner-vn-01",
      "partner_name": "Saigon Green Urban Waste Board (illustrative)",
      "country": "Vietnam",
      "score": 83,
      "reasons": [
        "Sector alignment: smart-city ↔ circular-economy, cleantech, govtech, smart-waste",
        "Your capabilities match their needs: iot fill level sensors, route optimization software",
        "They can fulfill your needs: municipal waste concessions, vietnam local distribution"
      ],
      "opportunity": "Partnering with Saigon Green Urban Waste Board (illustrative) accelerates SmartTONG's cross-border market validation in Vietnam via local deployment and pilot synergy."
    }
  ]
}
```

---

### 4. `POST /api/partnership/brief`
Uses Gemma 4 to generate a fact-grounded `PartnershipBrief` and 4-week actionable POC roadmap from the confirmed `StartupProfile` and selected `partner_id`.

**Request Body (`application/json` — `BriefRequest`):**
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
  "partner_id": "partner-vn-01"
}
```

**Response (`200 OK` — `PartnershipBrief`):**
```json
{
  "objective": "SmartTONG and Saigon Green Urban Waste Board will jointly pilot IoT smart-bin route optimisation across Ho Chi Minh City District 1 and District 3 to demonstrate a >=20% reduction in collection vehicle diesel emissions and eliminate bin overflow complaints (RECOMMENDATION).",
  "collaboration_concept": "SmartTONG deploys 50 solar-assisted IoT ultrasonic fill-level sensors and provides live access to its route-optimisation telematics dashboard. Saigon Green Urban Waste Board provides municipal bin concession sites, coordinates driver route dispatch, and provides local maintenance personnel.",
  "proposed_poc": "Deploy 50 IoT smart bin sensor nodes across commercial corridors in District 1 and District 3 over Days 1-7. Run live route-optimisation for municipal collection trucks from Days 8-28. Measure fuel savings, overflow incident reduction, and sensor reliability in a final joint audit on Day 30 (ILLUSTRATIVE).",
  "timeline": [
    "Week 1 (Days 1–7): Governance & Field Telemetry Deployment\n• Execute bilateral Pilot MOU and municipal safety protocol compliance agreements\n• Conduct joint on-site bin infrastructure survey across District 1 and 3 transfer corridors\n• Mount 50 ruggedized IP68 ultrasonic fill-level sensors across high-density civic bins\n• Verify NB-IoT signal connectivity and real-time telemetry stream ingestion into cloud console",
    "Week 2 (Days 8–14): Baseline Calibration & Dispatcher Onboarding\n• Onboard Saigon Green municipal dispatchers onto dynamic route management dashboard\n• Capture 7-day baseline fuel consumption, truck idle hours, and bin fill cycle patterns",
    "Week 3 (Days 15–21): Live Dynamic Route Execution & Fleet Sync\n• Activate dynamic routing algorithms across 12 municipal collection compactors\n• Execute real-time automated dispatch triggered by 80% bin fill sensor telemetry alerts",
    "Week 4 (Days 22–30): Performance Audit & Scale-Up LOI\n• Complete joint sensor reliability, battery endurance, and diesel savings audit (target: >=20% reduction)\n• Secure signed tri-party Letter of Intent (LOI) with local concessionaires for 500-bin commercial rollout"
  ],
  "success_metrics": [
    ">=20% reduction in collection truck trip miles and diesel consumption vs. baseline",
    ">=90% fill-rate telemetry accuracy across all 50 pilot bins over 30 days",
    "Formal Letter of Intent from Saigon Green Urban Waste Board for municipal-wide expansion"
  ],
  "outcome_type": "cross_border_poc",
  "assumptions": [],
  "grounded_in": ["company_name", "country", "sector", "solution", "capabilities", "needs", "target_markets", "partnership_goals"],
  "disclaimer": "Illustrative demo data. Recommendations are AI-generated suggestions, not verified facts."
}
```

---

### 5. `GET /api/ecosystem/graph`
Returns the ASEAN ecosystem network graph (`nodes` and `edges`) built from `data/demo_ecosystem.json`.

**Response (`200 OK` — `EcosystemGraph`):**
```json
{
  "nodes": [
    {
      "id": "partner-vn-01",
      "label": "Saigon Green Urban Waste Board (illustrative)",
      "type": "organisation",
      "country": "Vietnam"
    }
  ],
  "edges": [
    {
      "source": "partner-vn-01",
      "target": "partner-vn-02",
      "relation": "complements",
      "weight": 0.55
    }
  ]
}
```

---

## Environment Variables

Configure backend settings in `.env` (project root) and optional frontend settings in `frontend/.env`:

| Variable | Location | Type | Default | Description |
|---|---|---|---|---|
| `GEMINI_API_KEY` | Root `.env` | String | *(None)* | **Required for live AI.** Free API key from [Google AI Studio](https://aistudio.google.com/apikey). |
| `GEMMA_MODEL` | Root `.env` | String | `gemma-4-26b-a4b-it` | Open-weight Gemma 4 model identifier on the Gemini API. |
| `MOCK_MODE` | Root `.env` | Boolean | `false` | When `true`, skips remote LLM calls and returns instant canned SmartTONG responses. |
| `VITE_API_URL` | `frontend/.env` | URL | `http://127.0.0.1:8000` (dev) / same-origin (prod build) | Base URL for the FastAPI backend server. |

---

## Available Scripts

### Start Backend Development Server
```bash
cd backend
python run.py
```
Starts FastAPI with Uvicorn on `http://0.0.0.0:8000` with auto-reload enabled.

### Start Frontend Development Server
```bash
cd frontend
npm run dev
```
Starts Vite on `http://localhost:5173` with Hot Module Replacement (HMR).

### Build Frontend Production Bundle
```bash
cd frontend
npm run build
```
Compiles and minifies production assets into `frontend/dist/`.

### Run Automated Offline Test Suite
```bash
pytest backend/tests/ tests/ -v
```
Executes all 23 offline unit and schema tests in `< 2 seconds` with zero network calls or API keys required.

---

## Testing Guide

The automated test suite runs completely offline:

```bash
# Run all 23 backend & graph unit tests
py -m pytest backend/tests/ tests/ -v

# Or run unittest directly on the graph service suite
py -m unittest discover -s tests -v
```

### Test Suites Overview

1. **`backend/tests/test_api.py` (18 tests):**
   - **Token & Jaccard Math:** Validates `_jaccard` for identical, disjoint, and partial token sets.
   - **Deterministic Matching Engine:** Verifies `score_partner` bounds (`0 <= score <= 100`), `get_top_matches` cardinality (`top_n=3`), descending sort order, and required `PartnerMatch` schema fields.
   - **Dataset Integrity:** Confirms `data/demo_ecosystem.json` exists and asserts that every partner record carries `"illustrative": true`.
   - **Schema v2 Grounding Contracts:** Tests `StartupProfile` defaults, `missing_fields` population, valid/invalid `confidence` literals (`high` | `medium` | `low`), `PartnershipBrief` `outcome_type` literals, mandatory `disclaimer` text, and `MOCK_MODE` profile/brief compliance.

2. **`tests/test_graph_service.py` (5 tests):**
   - **Ecosystem Loader:** Confirms all 12 ASEAN records load with valid `id`, `name`, `type`, `country`, `sector`, and `(illustrative)` suffixes.
   - **Graph Topology Without Startup:** Verifies node and edge generation, valid relation types (`complements`, `same sector`, `same market`), and normalized edge weights (`0.0 < weight <= 1.0`).
   - **Graph Topology With Startup Injection:** Verifies dynamic injection of a `StartupProfile` (both Pydantic model and `dict`) into the graph and asserts complementary edge creation with `partner-vn-01` (*Saigon Green Urban Waste Board*).

---

## Deployment

### Local Area Network (LAN) Access

Both `backend/run.py` (`host="0.0.0.0"`) and `frontend/vite.config.js` (`host: true`) bind to all network interfaces by default. Any device on the same Wi-Fi network can access the frontend at `http://<YOUR_LAN_IP>:5173`.

---

### Docker Container (Unified Frontend + Backend)

The repository includes a multi-stage [`Dockerfile`](Dockerfile) (and [`.do/app.yaml`](.do/app.yaml) for DigitalOcean App Platform) that builds the React production bundle (`frontend/dist`) and serves both the SPA and FastAPI endpoints from a single container on port `8080`:

```dockerfile
# Stage 1: Build React Frontend
FROM node:20-alpine AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# Stage 2: Python FastAPI Backend + Static Frontend
FROM python:3.11-slim
WORKDIR /app
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1 PORT=8080
COPY backend/requirements.txt ./backend/requirements.txt
RUN pip install --no-cache-dir -r backend/requirements.txt
COPY data/ ./data/
COPY backend/ ./backend/
COPY --from=frontend-build /app/frontend/dist ./frontend/dist
WORKDIR /app/backend
EXPOSE 8080
CMD ["python", "run.py"]
```

#### Build and Run:
```bash
docker build -t bridgewise:latest .
docker run -d --name bridgewise -p 8080:8080 --env-file .env bridgewise:latest
```

---

### Production Reverse Proxy (Nginx / Caddy)

```nginx
server {
    listen 80;
    server_name bridgewise.example.com;

    root /var/www/bridgewise/frontend/dist;
    index index.html;

    client_max_body_size 25M;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:8000/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    location /health {
        proxy_pass http://127.0.0.1:8000/health;
    }
}
```

---

## Troubleshooting

### 1. `API 502: GEMINI_API_KEY is not set`
- **Cause:** The backend is running with `MOCK_MODE=false`, but `GEMINI_API_KEY` is missing or empty in `.env`.
- **Solution:**
  - Add a valid Google AI Studio key to `.env` (`GEMINI_API_KEY=AIza...`) and restart `python run.py`, **OR**
  - Set `MOCK_MODE=true` in `.env` to test the entire workflow offline with canned responses, **OR**
  - Click **"🚀 Use SmartTONG Demo"** on Step 1 in the UI.

### 2. `Gemma failed to produce valid JSON` or Quota / Timeout Errors
- **Cause:** Free-tier Gemini API rate limits or transient network latency when uploading many high-resolution files at once.
- **Solution:** `GemmaService._call_with_retry` automatically retries once with a stricter prompt. If your API key hits per-minute quota limits, wait 30 seconds or switch `MOCK_MODE=true` for uninterrupted live demos. If a brief is ever cut off mid-JSON, raise `max_output_tokens` in `generate_brief()` (currently `2048`).

### 3. Matches or Briefs Feel Slow on Windows
- **Cause:** Browsers on Windows resolve `localhost` to IPv6 (`::1`) first, while Uvicorn binds IPv4 (`0.0.0.0`), adding a connection fallback delay to every request.
- **Solution:** The frontend defaults to `http://127.0.0.1:8000`. If you set `VITE_API_URL` yourself, use `127.0.0.1` rather than `localhost`. For the fastest brief, hover a partner card briefly before clicking it.

### 4. `CORS Policy Blocked Request` in Browser Console
- **Cause:** Accessing the frontend from an origin other than `http://localhost:5173` or `http://127.0.0.1:5173`.
- **Solution:** Open the app via `http://localhost:5173`, or add your custom origin to `allow_origins` in [`backend/app/main.py`](backend/app/main.py).

### 5. `PyMuPDF extraction unavailable` Warning in Logs
- **Cause:** `pymupdf` is not installed in the active Python environment.
- **Solution:** Run `pip install pymupdf>=1.24.0`. Even without `PyMuPDF`, `gemma_service.py` gracefully falls back to passing raw `application/pdf` bytes to Gemma 4.

---

## Privacy, Security & Grounding Guardrails

- **No Persistent User Database or Tracking:** Uploaded pitch decks and founder notes are processed in-memory strictly for the duration of the API request and are never written to disk or external analytics services.
- **Strict File Size & Count Bounds:** `POST /api/pitch/analyze` enforces a maximum of 10 files and `20 MB` per file (`HTTP 413` on overflow) on both client and server.
- **Fact-Grounded AI & Anti-Hallucination Design:**
  - Partner rankings are computed 100% deterministically in Python (`backend/app/matching_service.py`).
  - Unstated startup attributes are isolated into `missing_fields` rather than fabricated.
  - Generated briefs undergo a post-generation regex audit that flags any ungrounded organisation names into `assumptions`.
  - Every partner record and generated brief carries an explicit illustrative disclaimer.
- **Secret Hygiene:** `.env` is gitignored; only `.env.example` with placeholder values is committed to version control.

---

## Team BridgeWise & Contributing

| Team Member | Role & Focus Area |
|---|---|
| **Yap En Thong** | Backend Architecture, Gemma 4 Integration (`gemma_service.py`), Deterministic Matching Engine, API Contract & Guardrails |
| **Joe Vei Xiang Zu** | Frontend Application (`App.jsx`), Multi-Format Intake & `Ctrl+V` Paste, POC Dashboard, Word/PDF Export Suite (`exportUtils.js`) |
| **Manjishtha Chakma** | Illustrative ASEAN Ecosystem Dataset (`demo_ecosystem.json`), Graph Service (`graph_service.py`), Interactive Canvas Network Graph |
| **Tan Yong Hung** | Full-Stack Architecture Integration, Interactive 4-Column 30-Day To-Do Roadmap, QA & Pitch Presentation |

### Contributing

1. **Fork the repository** and create a feature branch (`git checkout -b feature/asean-connector`).
2. **Run the offline test suite** and ensure all tests pass before committing:
   ```bash
   pytest backend/tests/ tests/ -v
   ```
3. **Verify frontend production build**:
   ```bash
   cd frontend && npm run build
   ```
4. **Open a Pull Request** describing your changes and test results.

---

## License

This project is open-source under the **[MIT License](LICENSE)** © 2026 Team BridgeWise.
