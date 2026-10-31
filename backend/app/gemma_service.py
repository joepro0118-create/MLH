# backend/app/gemma_service.py
# GemmaService — single centralised class for all Gemma 4 calls.
# Model: gemma-4-26b-a4b-it by default; override with GEMMA_MODEL env var.
# NEVER substitute a Gemini (non-Gemma) model silently.
import os
import json
import re
import logging
from typing import Any, Dict, List, Optional, Tuple, Union

from google import genai
from google.genai import types
from pydantic import ValidationError

from .schemas import StartupProfile, PartnershipBrief

logger = logging.getLogger(__name__)

# Default model — configurable but must stay a Gemma model.
DEFAULT_MODEL = "gemma-4-26b-a4b-it"


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
        max_output_tokens: Optional[int] = 4096,
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
            config_kwargs["max_output_tokens"] = max_output_tokens

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

    async def analyze_pitch(
        self,
        image_bytes: Any,
        mime_type: str = "image/png",
        notes: Optional[str] = None,
        goal: Optional[str] = None,
        target_country: Optional[str] = None,
    ) -> StartupProfile:
        """
        Multimodal: analyze 1 to 3 pitch deck / flyer images with Gemma 4,
        fusing them and founder context into a single unified StartupProfile.
        Supports passing single image_bytes (bytes) or a list of (bytes, mime_type) tuples.
        Strict fact-grounded extraction: never guesses missing fields.
        """
        # Normalize files list
        if isinstance(image_bytes, (bytes, bytearray)):
            files = [(bytes(image_bytes), mime_type)]
        elif isinstance(image_bytes, list):
            files = []
            for item in image_bytes:
                if isinstance(item, tuple) and len(item) == 2:
                    files.append(item)
                elif isinstance(item, (bytes, bytearray)):
                    files.append((bytes(item), mime_type))
        else:
            raise ValueError("image_bytes must be bytes or list of (bytes, mime_type) tuples")

        extra_context = []
        if notes and notes.strip():
            extra_context.append(f"- Founder Note: {notes.strip()}")
        if goal and goal.strip():
            extra_context.append(f"- Primary Partnership Objective: {goal.strip()}")
        if target_country and target_country.strip():
            extra_context.append(f"- Preferred Target Country: {target_country.strip()}")

        context_str = "\n".join(extra_context)
        if context_str:
            context_str = f"\n\nAdditional Founder Intent:\n{context_str}\n"

        prompt = (
            "You are an ASEAN startup ecosystem analyst.\n"
            "Analyse the uploaded startup document(s) (pitch deck slide, brochure, or proposal) "
            "and synthesize them into a single consolidated Startup Profile.\n"
            f"{context_str}\n"
            "STRICT RULES:\n"
            "- Use ONLY information clearly visible in the uploaded images or the founder note provided.\n"
            "- If a field is not stated in the materials, set it to an empty string or empty list "
            "and include its field name in missing_fields.\n"
            "- Do NOT infer funding amounts, revenue, customer names, or partner organisations.\n"
            "- Do NOT guess or hallucinate any field.\n"
            "- Output ONLY a valid JSON object — no markdown, no prose, no code fences.\n\n"
            "Return this JSON schema exactly:\n"
            "{\n"
            '  "company_name": "string",\n'
            '  "country": "string (country where the startup is based)",\n'
            '  "sector": "string — one of: smart-city, sustainability, fintech, agritech, '
            'logistics, healthtech, edtech, govtech, other",\n'
            '  "solution": "string (one concise sentence; leave empty if not in the documents)",\n'
            '  "capabilities": ["list of core capabilities visible in documents; empty list if none"],\n'
            '  "needs": ["list of operational needs visible in documents; empty list if none"],\n'
            '  "target_markets": ["list of ASEAN countries/cities visible in documents; empty list if none"],\n'
            '  "partnership_goals": ["list of goals visible in documents; empty list if none"],\n'
            f'  "goal": "{goal or ""}",\n'
            f'  "target_country": "{target_country or ""}",\n'
            '  "missing_fields": ["list of field names above that were not found in the documents"],\n'
            '  "confidence": "high|medium|low — high if most fields found, low if few fields found"\n'
            "}\n"
        )

        parts = []
        for f_bytes, f_mime in files:
            parts.append(types.Part.from_bytes(data=f_bytes, mime_type=f_mime))
        parts.append(prompt)

        def _parse(raw: str) -> StartupProfile:
            data = self._extract_json(raw)
            return StartupProfile(**data)  # Pydantic validates

        return self._call_with_retry(
            parts,
            parse_fn=_parse,
            temperature=0.2,
            max_output_tokens=3072,
        )

    async def generate_brief(
        self, startup: StartupProfile, partner: dict
    ) -> PartnershipBrief:
        """
        Generate a partnership brief + 30-day POC plan from startup x partner context.
        Strict fact-grounding: only uses the two supplied records.
        Adds assumptions list for anything inferred beyond the records.
        Disclaimer is always overridden in Python after generation.
        """
        # Build the grounded_in list from non-empty startup fields
        startup_data = startup.model_dump()
        grounded_fields = [
            k for k, v in startup_data.items()
            if v and k not in ("missing_fields", "confidence", "goal", "target_country")
        ]

        # Determine outcome_type from startup goal or default
        goal_raw = (startup.goal or "cross_border_poc").lower().replace(" ", "_")
        valid_outcomes = {"commercial_partnership", "market_expansion", "cross_border_poc"}
        outcome_type = goal_raw if goal_raw in valid_outcomes else "cross_border_poc"

        startup_json = json.dumps(startup_data, indent=2)
        partner_json = json.dumps(partner, indent=2)

        prompt = (
            "You are an ASEAN cross-border partnership strategist.\n"
            "You are given exactly two records: a startup profile and one partner record.\n\n"
            "STRICT RULES:\n"
            "- Use ONLY these two records below. Do NOT add new organisations, statistics, "
            "funding amounts, government regulations, or any claims not present in the records.\n"
            "- If you make any assumption beyond the records, add it to the assumptions list.\n"
            "- success_metrics must each contain a specific number AND a deadline "
            "(e.g. '1 discovery meeting by Day 7', '>=20% reduction by Day 30').\n"
            "- Do NOT invent partner names other than the one provided.\n"
            "- Output ONLY a valid JSON object — no markdown, no prose, no code fences.\n\n"
            f"=== STARTUP PROFILE ===\n{startup_json}\n\n"
            f"=== PARTNER RECORD ===\n{partner_json}\n\n"
            "Return this JSON schema exactly:\n"
            "{\n"
            '  "objective": "One sentence shared goal of this partnership",\n'
            '  "collaboration_concept": "2-3 sentences how they work together, grounded in the records",\n'
            '  "proposed_poc": "2-3 sentences specific 30-day proof-of-concept pilot",\n'
            '  "timeline": ["Week 1: ...", "Week 2: ...", "Week 3: ...", "Week 4: ..."],\n'
            '  "success_metrics": [\n'
            '    "metric with specific number and deadline, e.g. 1 joint demo by Day 14",\n'
            '    "metric with specific number and deadline",\n'
            '    "metric with specific number and deadline"\n'
            "  ],\n"
            f'  "outcome_type": "{outcome_type}",\n'
            '  "assumptions": ["list any inferences made beyond the two records above"],\n'
            f'  "grounded_in": {json.dumps(grounded_fields)},\n'
            '  "disclaimer": "Illustrative demo data. Recommendations are AI-generated suggestions, not verified facts."\n'
            "}\n"
        )

        def _parse(raw: str) -> PartnershipBrief:
            data = self._extract_json(raw)
            brief = PartnershipBrief(**data)
            # Always override disclaimer in Python — never trust model output for legal text
            brief.disclaimer = (
                "Illustrative demo data. "
                "Recommendations are AI-generated suggestions, not verified facts."
            )
            return brief

        contents = [
            types.Content(
                role="user",
                parts=[types.Part.from_text(text=prompt)],
            )
        ]

        brief = self._call_with_retry(
            contents,
            parse_fn=_parse,
            temperature=0.3,
            max_output_tokens=3072,
        )

        # Post-generation guardrail: check brief only mentions the chosen partner
        chosen_partner_name = partner.get("name", "")
        if chosen_partner_name:
            brief_text = " ".join([
                brief.objective,
                brief.collaboration_concept,
                brief.proposed_poc,
            ])
            # Detect any organisation-like capitalized names that are NOT the chosen partner
            # (simple heuristic: multi-word capitalized phrases not in partner or startup name)
            startup_name = startup.company_name
            other_orgs = re.findall(
                r"\b([A-Z][a-z]+(?: [A-Z][a-z]+)+)\b", brief_text
            )
            for org in other_orgs:
                if org not in chosen_partner_name and org not in startup_name:
                    if org not in brief.assumptions:
                        logger.warning(
                            "Brief mentions organisation '%s' not in records; adding to assumptions.", org
                        )
                        brief.assumptions.append(
                            f"'{org}' mentioned in brief but not present in the two input records."
                        )

        return brief
