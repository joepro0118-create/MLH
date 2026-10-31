# backend/app/gemma_service.py
# GemmaService — single centralised class for all Gemma 4 calls.
# Model: gemma-4-26b-a4b-it by default; override with GEMMA_MODEL env var.
# NEVER substitute a Gemini (non-Gemma) model silently.
import os
import json
import re
import logging
from pathlib import Path
from typing import Optional

from dotenv import load_dotenv
from google import genai
from google.genai import types
from pydantic import ValidationError

from .schemas import StartupProfile, PartnershipBrief

load_dotenv(dotenv_path=Path(__file__).resolve().parent.parent.parent / ".env")

logger = logging.getLogger(__name__)

# Default model — configurable but must stay a Gemma model.
DEFAULT_MODEL = "gemma-4-26b-a4b-it"


class GemmaService:
    """
    Centralised wrapper for all Gemma 4 API calls.
    Instantiate once at app startup; reuses a single genai.Client.
    """

    def __init__(self) -> None:
        self.model = os.environ.get("GEMMA_MODEL", DEFAULT_MODEL)
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
        text = re.sub(r"```(?:json)?\s*", "", text)
        match = re.search(r"\{.*\}", text, re.DOTALL)
        if not match:
            raise ValueError(f"No JSON object in model output:\n{text[:400]}")
        return json.loads(match.group())

    def _call(
        self,
        contents,
        *,
        temperature: float = 0.3,
        max_output_tokens: int = 2048,
        use_thinking: bool = False,
    ) -> str:
        """
        Thin wrapper around generate_content.
        Returns response.text; raises on safety blocks or empty responses.
        """
        client = self._require_client()

        config_kwargs: dict = {
            "temperature": temperature,
            "max_output_tokens": max(max_output_tokens, 2048) if use_thinking else max_output_tokens,
        }

        response = client.models.generate_content(
            model=self.model,
            contents=contents,
            config=types.GenerateContentConfig(**config_kwargs),
        )

        # Guard against safety blocks
        if not response.candidates:
            raise RuntimeError("Gemma returned no candidates (possible safety block).")
        candidate = response.candidates[0]
        if candidate.finish_reason and candidate.finish_reason.name == "SAFETY":
            raise RuntimeError("Gemma blocked the request due to safety filters.")

        text = response.text
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
                    if isinstance(contents, list):
                        contents = contents + [
                            types.Content(
                                role="user",
                                parts=[
                                    types.Part(
                                        text=(
                                            "Your previous response could not be parsed as JSON. "
                                            "Output ONLY the raw JSON object with no markdown, "
                                            "no prose, no code fences."
                                        )
                                    )
                                ],
                            )
                        ]
                    else:
                        contents = (
                            contents
                            + "\n\nIMPORTANT: Output ONLY the raw JSON object. "
                            "No markdown, no prose, no code fences."
                        )
                else:
                    raise RuntimeError(
                        f"Gemma output could not be parsed after 2 attempts: {exc}"
                    ) from exc

    # ------------------------------------------------------------------
    # Public methods
    # ------------------------------------------------------------------

    async def analyze_pitch(self, image_bytes: bytes, mime_type: str) -> StartupProfile:
        """
        Multimodal: send pitch deck image to Gemma 4 and extract StartupProfile.
        Retries once if the model returns malformed JSON.
        Raises RuntimeError with a human-readable message on failure.
        """
        prompt = (
            "You are an ASEAN startup ecosystem analyst.\n"
            "Analyse this pitch deck image and extract the startup's profile.\n\n"
            "Return ONLY a single valid JSON object — no markdown, no prose, no code fences:\n"
            "{\n"
            '  "company_name": "string",\n'
            '  "country": "string (country where the startup is based)",\n'
            '  "sector": "string — one of: smart-city, sustainability, fintech, agritech, '
            'logistics, healthtech, edtech, govtech, other",\n'
            '  "solution": "string (one sentence: core product/service)",\n'
            '  "capabilities": ["3–5 capabilities the startup brings"],\n'
            '  "needs": ["3–5 things the startup seeks from partners"],\n'
            '  "target_markets": ["2–4 ASEAN countries or cities"],\n'
            '  "partnership_goals": ["2–4 goals e.g. pilot, distribution, co-development"]\n'
            "}\n\n"
            "If a field cannot be determined from the image, use a sensible placeholder. "
            "All output is illustrative."
        )

        contents = [
            types.Content(
                role="user",
                parts=[
                    types.Part.from_bytes(data=image_bytes, mime_type=mime_type),
                    types.Part.from_text(text=prompt),
                ],
            )
        ]

        def _parse(raw: str) -> StartupProfile:
            data = self._extract_json(raw)
            return StartupProfile(**data)  # Pydantic validates

        return self._call_with_retry(
            contents,
            parse_fn=_parse,
            temperature=0.2,
            max_output_tokens=2048,
        )

    async def generate_brief(
        self, startup: StartupProfile, partner: dict
    ) -> PartnershipBrief:
        """
        Generate a partnership brief + 30-day POC plan from startup × partner context.
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

        return self._call_with_retry(
            prompt,
            parse_fn=_parse,
            temperature=0.4,
            max_output_tokens=2048,
            use_thinking=True,
        )
