# backend/app/gemma_service.py
# GemmaService — single centralised class for all Gemma 4 calls.
# Model: gemma-4-26b-a4b-it by default; override with GEMMA_MODEL env var.
# NEVER substitute a Gemini (non-Gemma) model silently.
import io
import os
import base64
import json
import re
import logging
import zipfile
import xml.etree.ElementTree as ET
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple, Union

from dotenv import load_dotenv
from google import genai
from google.genai import types
from pydantic import ValidationError

from .schemas import StartupProfile, PartnershipBrief

load_dotenv(dotenv_path=Path(__file__).resolve().parent.parent.parent / ".env")

logger = logging.getLogger(__name__)

# Default model — configurable but must stay a Gemma model.
DEFAULT_MODEL = "gemma-4-26b-a4b-it"

IMAGE_MIMES = {"image/png", "image/jpeg", "image/jpg", "image/webp", "image/gif"}


def _extract_office_xml_text(file_bytes: bytes, ext: str) -> str:
    """Extract text from .docx, .pptx, or .xlsx using Python stdlib zipfile + ElementTree."""
    texts: List[str] = []
    try:
        with zipfile.ZipFile(io.BytesIO(file_bytes)) as zf:
            names = zf.namelist()
            target_xmls = []
            if ext == ".docx":
                target_xmls = [n for n in names if n.startswith("word/") and n.endswith(".xml")]
            elif ext == ".pptx":
                target_xmls = sorted(
                    [n for n in names if n.startswith("ppt/slides/slide") and n.endswith(".xml")]
                )
            elif ext == ".xlsx":
                target_xmls = [
                    n for n in names if (n == "xl/sharedStrings.xml" or n.startswith("xl/worksheets/")) and n.endswith(".xml")
                ]
            else:
                target_xmls = [n for n in names if n.endswith(".xml")]

            for xml_name in target_xmls:
                xml_bytes = zf.read(xml_name)
                root = ET.fromstring(xml_bytes)
                chunk = " ".join(t.strip() for t in root.itertext() if t and t.strip())
                if chunk:
                    texts.append(chunk)
    except Exception as exc:
        logger.warning("Failed to parse Office XML (%s): %s", ext, exc)
    return "\n".join(texts)


def _extract_pdf_text_and_images(pdf_bytes: bytes, max_pages_vision: int = 3) -> Tuple[str, List[Tuple[bytes, str]]]:
    """
    Extract text and rendered page PNGs from a PDF using PyMuPDF (if installed),
    with a graceful fallback if PyMuPDF is not present.
    """
    extracted_text = []
    page_images: List[Tuple[bytes, str]] = []
    try:
        try:
            import pymupdf as fitz_mod
        except ImportError:
            import fitz as fitz_mod

        doc = fitz_mod.open(stream=pdf_bytes, filetype="pdf")
        for idx, page in enumerate(doc):
            page_txt = page.get_text("text")
            if page_txt and page_txt.strip():
                extracted_text.append(f"[Page {idx + 1}]\n{page_txt.strip()}")
            if idx < max_pages_vision:
                pix = page.get_pixmap(dpi=140)
                page_images.append((pix.tobytes("png"), "image/png"))
        doc.close()
    except Exception as exc:
        logger.info("PyMuPDF extraction unavailable or failed (%s); falling back to raw PDF handling.", exc)

    return "\n\n".join(extracted_text), page_images


class GemmaService:
    """
    Centralised wrapper for all Gemma 4 API calls.
    Instantiate once at app startup; reuses a single genai.Client.
    """

    def __init__(self) -> None:
        raw_model = os.environ.get("GEMMA_MODEL", DEFAULT_MODEL)
        self.model = f"models/{raw_model}" if not raw_model.startswith("models/") else raw_model
        api_key = os.environ.get("GEMINI_API_KEY", "")
        if not api_key:
            logger.warning(
                "GEMINI_API_KEY not set. GemmaService calls will fail unless MOCK_MODE=true."
            )
            self._client: Optional[genai.Client] = None
        else:
            self._client = genai.Client(api_key=api_key)
        logger.info("GemmaService ready (model=%s)", self.model)

    # ------------------------------------------------------------------
    # Internal helpers
    # ------------------------------------------------------------------

    def _require_client(self) -> genai.Client:
        if self._client is None:
            api_key = os.environ.get("GEMINI_API_KEY", "")
            if api_key:
                self._client = genai.Client(api_key=api_key)
            else:
                raise RuntimeError(
                    "GEMINI_API_KEY is not set. "
                    "Add it to .env or set MOCK_MODE=true for canned responses."
                )
        return self._client

    @staticmethod
    def _extract_json(text: str) -> dict:
        """
        Extract the first JSON object from model output.
        Strips markdown fences (```json ... ```) before parsing.
        """
        # Remove optional markdown code fences
        text = re.sub(r"```(?:json)?\s*", "", text)
        match = re.search(r"\{.*\}", text, re.DOTALL)
        if not match:
            raise ValueError(f"No JSON object in model output:\n{text[:400]}")
        return json.loads(match.group())

    def _call(
        self,
        contents,
        *,
        temperature: float = 0.2,
        max_output_tokens: Optional[int] = 8192,
        use_thinking: bool = False,
    ) -> str:
        """
        Thin wrapper around generate_content.
        Returns response.text; raises on safety blocks or empty responses.
        """
        client = self._require_client()

        config_kwargs: dict = {
            "temperature": temperature,
        }
        if max_output_tokens:
            config_kwargs["max_output_tokens"] = max(max_output_tokens, 8192)

        try:
            response = client.models.generate_content(
                model=self.model,
                contents=contents,
                config=types.GenerateContentConfig(**config_kwargs),
            )
        except Exception as exc:
            logger.warning("generate_content with config failed (%s); retrying with basic config.", exc)
            response = client.models.generate_content(
                model=self.model,
                contents=contents,
            )

        # Guard against safety blocks
        if not response.candidates:
            raise RuntimeError("Gemma returned no candidates (possible safety block).")
        candidate = response.candidates[0]
        if candidate.finish_reason and candidate.finish_reason.name == "SAFETY":
            raise RuntimeError("Gemma blocked the request due to safety filters.")

        text = response.text
        if not text or not text.strip():
            if candidate.content and candidate.content.parts:
                for part in reversed(candidate.content.parts):
                    if hasattr(part, "text") and part.text and not getattr(part, "thought", False):
                        text = part.text
                        break

        if not text or not text.strip():
            raise RuntimeError("Gemma returned an empty response.")
        return text

    def _call_with_retry(self, contents, *, parse_fn, **call_kwargs):
        """
        Call Gemma once; if JSON parsing/validation fails, retry once with a
        stricter 'output JSON only' reminder appended to the prompt.
        """
        for attempt in (1, 2):
            try:
                raw = self._call(contents, **call_kwargs)
                logger.debug("Gemma raw (attempt %d): %.300s", attempt, raw)
                return parse_fn(raw)
            except (json.JSONDecodeError, ValidationError, ValueError) as exc:
                if attempt == 1:
                    logger.warning(
                        "Gemma parse failed on attempt 1 (%s); retrying with stricter prompt.",
                        exc,
                    )
                    # Append a hard reminder to the last user part
                    if isinstance(contents, list):
                        contents = contents + [
                            types.Content(
                                role="user",
                                parts=[
                                    types.Part.from_text(
                                        text="IMPORTANT: Respond with ONLY a raw JSON object. "
                                        "No markdown fences, no commentary, no trailing text."
                                    )
                                ],
                            )
                        ]
                    else:
                        contents = (
                            str(contents)
                            + "\n\nIMPORTANT: Respond with ONLY a raw JSON object. "
                            "No markdown fences, no commentary."
                        )
                else:
                    raise RuntimeError(
                        f"Gemma failed to produce valid JSON after 2 attempts: {exc}"
                    ) from exc

    # ------------------------------------------------------------------
    # Public methods
    # ------------------------------------------------------------------

    async def analyze_pitch(
        self,
        image_bytes: Any,
        mime_type: str = "image/png",
        notes: Optional[str] = None,
        goal: Optional[str] = None,
        target_country: Optional[str] = None,
    ) -> StartupProfile:
        """
        Multimodal + Multi-Format Document Analyzer:
        Accepts any combination of PDFs, Word (.docx/.doc), PowerPoint (.pptx),
        Excel/CSV, Markdown/Text, and Images (PNG/JPG/WebP/GIF), plus founder notes/goals,
        fusing them into a single unified StartupProfile via Gemma 4.
        """
        # Normalize files list into (bytes, mime_type, filename) tuples
        files: List[Tuple[bytes, str, str]] = []
        if isinstance(image_bytes, (bytes, bytearray)):
            files = [(bytes(image_bytes), mime_type, "document")]
        elif isinstance(image_bytes, list):
            for idx, item in enumerate(image_bytes):
                if isinstance(item, tuple):
                    if len(item) >= 3:
                        files.append((bytes(item[0]), str(item[1]), str(item[2])))
                    elif len(item) == 2:
                        files.append((bytes(item[0]), str(item[1]), f"document_{idx + 1}"))
                elif isinstance(item, (bytes, bytearray)):
                    files.append((bytes(item), mime_type, f"document_{idx + 1}"))
        elif image_bytes is None:
            files = []
        else:
            raise ValueError("image_bytes must be bytes or list of file tuples")

        parts: List[Any] = []
        extracted_doc_texts: List[str] = []

        for f_bytes, f_mime, f_name in files:
            lower_name = (f_name or "").lower()
            ext = Path(lower_name).suffix.lower()
            norm_mime = (f_mime or "").lower()

            # 1. Image files -> send directly as multimodal vision part
            if norm_mime in IMAGE_MIMES or ext in {".png", ".jpg", ".jpeg", ".webp", ".gif"}:
                actual_mime = norm_mime if norm_mime in IMAGE_MIMES else "image/png"
                if actual_mime == "image/jpg":
                    actual_mime = "image/jpeg"
                parts.append(types.Part.from_bytes(data=f_bytes, mime_type=actual_mime))

            # 2. PDF files -> extract full text + render pages as vision PNGs (or fallback to application/pdf part)
            elif norm_mime == "application/pdf" or ext == ".pdf":
                pdf_text, pdf_page_imgs = _extract_pdf_text_and_images(f_bytes, max_pages_vision=3)
                if pdf_text:
                    extracted_doc_texts.append(f"--- PDF Document ({f_name}) ---\n{pdf_text[:15000]}")
                for img_bytes, img_mime in pdf_page_imgs:
                    parts.append(types.Part.from_bytes(data=img_bytes, mime_type=img_mime))
                if not pdf_text and not pdf_page_imgs:
                    # Fallback: pass raw PDF bytes to Gemini/Gemma API
                    parts.append(types.Part.from_bytes(data=f_bytes, mime_type="application/pdf"))

            # 3. Office Open XML (.docx, .pptx, .xlsx)
            elif ext in {".docx", ".pptx", ".xlsx"} or "officedocument" in norm_mime:
                office_text = _extract_office_xml_text(f_bytes, ext or ".docx")
                if office_text:
                    extracted_doc_texts.append(f"--- Office Document ({f_name}) ---\n{office_text[:15000]}")

            # 4. Any text/markdown/CSV/JSON/HTML/legacy doc file
            else:
                decoded = f_bytes.decode("utf-8", errors="ignore").strip()
                if not decoded:
                    decoded = f_bytes.decode("latin-1", errors="ignore").strip()
                # Filter out excessive binary noise if a binary file was uploaded
                printable = "".join(ch for ch in decoded if ch.isprintable() or ch in "\n\r\t")
                if printable.strip():
                    extracted_doc_texts.append(f"--- Attached File ({f_name}) ---\n{printable[:15000]}")

        extra_context = []
        if notes and notes.strip():
            extra_context.append(f"- Founder Prompt / Notes: {notes.strip()}")
        if goal and goal.strip():
            extra_context.append(f"- Primary Partnership Objective: {goal.strip()}")
        if target_country and target_country.strip():
            extra_context.append(f"- Preferred Target Country: {target_country.strip()}")

        context_str = "\n".join(extra_context)
        if context_str:
            context_str = f"\n\nAdditional Founder Intent:\n{context_str}\n"

        docs_str = "\n\n".join(extracted_doc_texts)
        if docs_str:
            docs_str = f"\n\nExtracted Document Contents:\n{docs_str}\n"

        prompt = (
            "You are an ASEAN startup ecosystem analyst.\n"
            "Analyse the uploaded startup document(s) (pitch deck slides, PDFs, Word docs, spreadsheets, images, or notes) "
            "and synthesize them into a single consolidated Startup Profile.\n"
            f"{docs_str}"
            f"{context_str}\n"
            "Return ONLY a single valid JSON object — no markdown, no prose, no code fences:\n"
            "{\n"
            '  "company_name": "string",\n'
            '  "country": "string (country where the startup is based)",\n'
            '  "sector": "string — one of: smart-city, sustainability, fintech, agritech, '
            'logistics, healthtech, edtech, govtech, other",\n'
            '  "solution": "string (one concise sentence describing the core product/service)",\n'
            '  "capabilities": ["3–5 core capabilities the startup brings"],\n'
            '  "needs": ["3–5 operational things the startup seeks from partners"],\n'
            '  "target_markets": ["2–4 ASEAN countries or cities to expand into"],\n'
            '  "partnership_goals": ["2–4 actionable goals e.g. pilot, distribution, co-development"]\n'
            "}\n\n"
            "If a field cannot be determined from the inputs, infer a realistic placeholder. "
            "All output is illustrative."
        )

        parts.append(prompt)

        def _parse(raw: str) -> StartupProfile:
            data = self._extract_json(raw)
            return StartupProfile(**data)  # Pydantic validates

        return self._call_with_retry(
            parts,
            parse_fn=_parse,
            temperature=0.2,
            max_output_tokens=8192,
        )

    async def generate_brief(
        self, startup: StartupProfile, partner: dict
    ) -> PartnershipBrief:
        """
        Generate a partnership brief + 30-day POC plan from startup × partner context.
        Uses thinking_level="high" for deeper reasoning.
        All generated content is grounded only on the supplied records.
        Recommendations are explicitly labelled as RECOMMENDATIONS.
        """
        prompt = (
            "You are an ASEAN cross-border partnership strategist.\n"
            "Generate a partnership brief grounded ONLY on the two profiles below.\n"
            "Do not invent organisations, data, or claims not present in the profiles.\n"
            "All recommendations must be clearly labelled '(RECOMMENDATION)'.\n\n"
            f"Startup Profile (ILLUSTRATIVE):\n"
            f"- Name: {startup.company_name}\n"
            f"- Country: {startup.country}\n"
            f"- Sector: {startup.sector}\n"
            f"- Solution: {startup.solution}\n"
            f"- Capabilities: {', '.join(startup.capabilities)}\n"
            f"- Needs: {', '.join(startup.needs)}\n"
            f"- Target Markets: {', '.join(startup.target_markets)}\n"
            f"- Partnership Goals: {', '.join(startup.partnership_goals)}\n\n"
            f"Partner Profile (ILLUSTRATIVE):\n"
            f"- Name: {partner['name']}\n"
            f"- Country: {partner['country']}\n"
            f"- Type: {partner['type']}\n"
            f"- Sector: {partner['sector']}\n"
            f"- Description: {partner['description']}\n"
            f"- Capabilities: {', '.join(partner['capabilities'])}\n"
            f"- Target Markets: {', '.join(partner['target_markets'])}\n\n"
            "Return ONLY a single valid JSON object — no markdown, no prose, no code fences:\n"
            "{\n"
            '  "objective": "One sentence: shared goal of this partnership",\n'
            '  "collaboration_concept": "2–3 sentences: how they work together",\n'
            '  "proposed_poc": "2–3 sentences: specific 30-day proof-of-concept pilot",\n'
            '  "timeline": ["Week 1: ...", "Week 2: ...", "Week 3: ...", "Week 4: ..."],\n'
            '  "success_metrics": ["metric 1", "metric 2", "metric 3"]\n'
            "}"
        )

        def _parse(raw: str) -> PartnershipBrief:
            data = self._extract_json(raw)
            return PartnershipBrief(**data)

        contents = [
            types.Content(
                role="user",
                parts=[types.Part.from_text(text=prompt)],
            )
        ]

        return self._call_with_retry(
            contents,
            parse_fn=_parse,
            temperature=0.3,
            max_output_tokens=8192,
        )
