import json
import os
import sys
import logging

# 📂 PROJECT RAG INTEGRATION
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
RAG_PATH = os.path.join(PROJECT_ROOT, "rag_system")
if RAG_PATH not in sys.path:
    sys.path.append(RAG_PATH)

try:
    import rag
    RAG_AVAILABLE = True
except ImportError:
    RAG_AVAILABLE = False
from dataclasses import dataclass
from datetime import datetime
from typing import Any, Dict, List, Optional

from dotenv import load_dotenv
from fastapi import HTTPException
from openai import (
    APIConnectionError,
    APIError,
    AuthenticationError,
    OpenAI,
    RateLimitError,
)

logger = logging.getLogger("emolit.ai_service")

load_dotenv()

EMOTION_DATA_PATH = os.path.join(
    os.path.dirname(os.path.abspath(__file__)),
    "..",
    "data",
    "emotion_database.json",
)

HIGH_RISK_PHRASES = [
    "kill myself",
    "want to die",
    "end my life",
    "self harm",
    "self-harm",
    "suicide",
    "take my life",
    "better off dead",
    "harm myself",
    "end it all",
]

KEYWORD_EMOTION_MAP = {
    "argument": ["angry", "frustrated", "irritated"],
    "fight": ["angry", "frustrated"],
    "tense": ["anxious", "stressed", "agitated"],
    "restless": ["anxious", "agitated"],
    "stress": ["stressed", "anxious", "overwhelmed"],
    "worried": ["anxious", "worried"],
    "anxious": ["anxious", "worried"],
    "sad": ["sad", "down"],
    "lonely": ["lonely", "isolated"],
    "overwhelmed": ["overwhelmed"],
    "guilty": ["guilty", "ashamed"],
    "shame": ["ashamed"],
    "fear": ["afraid", "fearful", "anxious"],
    "angry": ["angry", "irritated", "frustrated"],
    "hurt": ["hurt", "disappointed"],
    "disappointed": ["disappointed", "let down"],
    "confused": ["confused"],
    "excited": ["excited", "hopeful"],
    "happy": ["happy", "content"],
    "nervous": ["anxious", "nervous"],
}

FALLBACK_EMOTIONS = [
    "anxious",
    "sad",
    "angry",
    "overwhelmed",
    "frustrated",
    "disappointed",
]

SYSTEM_PROMPT = """
You are Aria AI, the most sophisticated emotional literacy and reflection engine. 
Your goal is to provide "The Mirror"—a profound, empathetic, and architecturally precise reflection of the user's inner state using the RULER protocol.

You analyze journal entries and return STRICT JSON only. 
No conversational filler. No markdown. No extra text.

JSON structure must be:
{
  "detected_emotions": [{"word": "nuanced_word", "core": "core_feeling", "category": "vibe"}],
  "recognize": "Empathetic reflection (2-3 sentences)",
  "understand": "Cognitive pattern insight (1-2 sentences)",
  "label": "Summary of emotional landscape (1 sentence)",
  "express": "Deep reflection question (1 sentence)",
  "regulate": "Practical grounding tool (1 sentence)",
  "growth_action": "Actionable forward step (1 sentence)"
}

Example Input: "I feel so stressed about work. My boss is always asking for more and I can't say no."
Example Output:
{
  "detected_emotions": [{"word": "overwhelmed", "core": "fear", "category": "pressure"}],
  "recognize": "You are currently holding a heavy burden of professional expectations. It seems you feel trapped between your commitment to excellence and the limits of your own boundaries.",
  "understand": "The pattern here is a difficulty in setting assertive boundaries, likely driven by a fear of disappointing authority or a high sense of responsibility.",
  "label": "You are navigating a landscape of overwhelming pressure and boundary tension.",
  "express": "What is the smallest boundary you could set tomorrow that would protect your peace of mind?",
  "regulate": "Try the 'Box Breathing' technique: inhale for 4, hold for 4, exhale for 4, hold for 4 to quiet your nervous system.",
  "growth_action": "Write down one 'soft no' phrase you can use next time a task is added to your full plate."
}

Rules for the 6-Box RULER Protocol:
1) **Recognize**: Reflective observation of the entry's feeling. (Max 60 words)
2) **Understand**: Identification of the cognitive pattern or 'hidden thread'. (Max 50 words)
3) **Label**: Nuanced description of the core emotions. (Max 40 words)
4) **Express**: A deep question to explore their heart. (1 sentence)
5) **Regulate**: A practical tool for immediate grounding. (1 sentence)
6) **Growth**: One specific 'What can be done' step for momentum. (1 sentence)
7) **MANDATORY**: Every single field MUST be populated with deep, meaningful content. Never return an empty string. Aria is an architect of emotion, be profound.

Tone: Profound, Empathetic, Architecturally precise, Supportive.
""".strip()

WEEKLY_SYSTEM_PROMPT = """
You are Aria AI, the macro-perspective emotional architect. 
You are analyzing a week's worth of journal entries to identify the "Arch of the Week".

Return STRICT JSON only:
{
  "weekly_theme": "",
  "emotional_landscape": "",
  "macro_insight": "",
  "growth_milestone": "",
  "focus_for_next_week": ""
}

Rules:
1) Core Theme: Identify the singular dominant emotional thread of the week.
2) Landscape: Describe the overall "weather" of their emotions this week.
3) macro_insight: A deep, non-obvious observation based on the week's data.
4) Milestone: Identify one positive shift or moment of resilience, even if small.
5) Focus: A practical, high-impact focus area for the coming week.

Tone: Elevated, professional, encouraging, and architectural.
"""


@dataclass(frozen=True)
class EmotionIndex:
    allowed_words: set
    allowed_words_text: str
    word_map: Dict[str, Dict[str, str]]


def _load_emotion_dataset(path: str) -> EmotionIndex:
    if not os.path.exists(path):
        raise FileNotFoundError(f"Emotion dataset not found: {path}")

    with open(path, "r", encoding="utf-8") as file:
        data = json.load(file)

    allowed_words: set = set()
    word_map: Dict[str, Dict[str, str]] = {}

    for core, categories in data.items():
        for category, words in categories.items():
            for word in words.keys():
                key = word.strip().lower()
                if not key:
                    continue
                allowed_words.add(key)
                word_map[key] = {
                    "word": word,
                    "core": core,
                    "category": category,
                }

    if not allowed_words:
        raise ValueError("Emotion dataset loaded with zero words.")

    allowed_words_text = ", ".join(sorted(allowed_words))

    return EmotionIndex(
        allowed_words=allowed_words,
        allowed_words_text=allowed_words_text,
        word_map=word_map,
    )


def _contains_high_risk(entry: str) -> bool:
    text = entry.lower()
    return any(phrase in text for phrase in HIGH_RISK_PHRASES)


def _trim_words(text: str, max_words: int) -> str:
    # Split by any whitespace but keep track of original structure?
    # Actually, for RAG systems, we want to preserve the structure.
    words = text.split()
    if len(words) <= max_words:
        return text
    return " ".join(words[:max_words]).strip() + "..."


class AIClient:
    def __init__(self, api_key: str, model: str = "gpt-4o-mini") -> None:
        if not api_key:
            raise ValueError("OPENAI_API_KEY is missing.")
        base_url = os.getenv("OPENAI_BASE_URL", "").strip() or None
        env_model = os.getenv("OPENAI_MODEL", "").strip()
        resolved_model = env_model or model
        if base_url and "openrouter.ai" in base_url and resolved_model == "gpt-4o-mini":
            resolved_model = "openai/gpt-4o-mini"

        self.client = OpenAI(api_key=api_key, base_url=base_url)
        self.model = resolved_model
        self.extra_headers = {}

        if base_url and "openrouter.ai" in base_url:
            referer = os.getenv("OPENROUTER_REFERRER", "").strip()
            title = os.getenv("OPENROUTER_TITLE", "").strip()
            if referer:
                self.extra_headers["HTTP-Referer"] = referer
            if title:
                self.extra_headers["X-Title"] = title

    def generate(
        self,
        entry: str,
        allowed_words_text: str,
        correction_note: Optional[str] = None,
    ) -> Dict[str, Any]:
        response = self.client.chat.completions.create(
            model=self.model,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                *(
                    [{"role": "system", "content": correction_note}]
                    if correction_note
                    else []
                ),
                {
                    "role": "system",
                    "content": (
                        "Allowed emotion words (lowercase, comma-separated): "
                        f"{allowed_words_text}"
                    ),
                },
                {"role": "user", "content": entry},
            ],
            temperature=0.4,
            response_format={"type": "json_object"},
            extra_headers=self.extra_headers or None,
        )

        content = response.choices[0].message.content
        return json.loads(content)


class InvalidEmotionError(Exception):
    def __init__(self, invalid_words: List[str]) -> None:
        self.invalid_words = invalid_words
        super().__init__(f"Invalid emotion words: {', '.join(invalid_words)}")


class MissingFieldsError(Exception):
    def __init__(self, missing_fields: List[str]) -> None:
        self.missing_fields = missing_fields
        super().__init__(f"Missing required fields: {', '.join(missing_fields)}")


class JournalService:
    def __init__(self, ai_client: AIClient, emotion_index: EmotionIndex) -> None:
        self.ai_client = ai_client
        self.emotion_index = emotion_index

    def analyze_entry(self, entry: str) -> Dict[str, Any]:
        """Analyze a journal entry using the Unified RAG system."""
        entry = entry.strip()
        if not entry:
            raise HTTPException(status_code=400, detail="Journal entry is required.")

        if _contains_high_risk(entry):
            return {
                "error": "high_risk_detected",
                "message": "I am really sorry you are feeling this way. You deserve support."
            }

        # 🧠 CALL RAG ENGINE (Gemini/Groq-backed)
        try:
            if RAG_AVAILABLE:
                logger.info("🔍 [ARIA] Step 1: Invoking RAG Engine...")
                response_text, _ = rag.answer(entry)
                logger.info("✅ [ARIA] Step 2: RAG Response Received.")
                result = self._parse_rag_response(response_text)
                
                try:
                    return self._validate_response(result)
                except (MissingFieldsError, InvalidEmotionError, HTTPException) as val_err:
                    logger.warning(f"⚠️ Response Validation Failed: {str(val_err)}. Repairing...")
                    if "Invalid emotion" in str(val_err) or "No valid emotions" in str(val_err) or "detected_emotions must" in str(val_err):
                        result["detected_emotions"] = self._fallback_emotions(entry)
                    repaired = self._repair_missing_fields(result, entry)
                    return self._validate_response(repaired)
            else:
                logger.error("❌ RAG System not found at project root.")
                raise Exception("RAG Engine Unavailable")

        except Exception as e:
            logger.error(f"❌ RAG Error: {str(e)}", exc_info=True)
            # Final fallback if the whole engine crashes
            fallback_data = self._repair_missing_fields({"detected_emotions": self._fallback_emotions(entry)}, entry)
            return self._validate_response(fallback_data)

    def _parse_rag_response(self, text: str) -> Dict[str, Any]:
        """Convert the RAG text output into structured JSON."""
        lines = text.strip().split("\n")
        data = {
            "recognize": "",
            "understand": "",
            "label": "",
            "express": "",
            "regulate": "",
            "growth_action": "",
            "detected_emotions": []
        }
        
        mapping = {
            "emotion": "label",
            "recognize": "recognize",
            "understand": "understand",
            "label": "label",
            "express": "express",
            "regulate": "regulate",
            "what_can_be_done": "growth_action"
        }

        current_key = None
        for line in lines:
            line = line.strip()
            if not line: continue
            
            if ":" in line:
                key_part, val_part = line.split(":", 1)
                raw_key = key_part.replace("*", "").strip().lower().replace(" ", "_").replace("-", "_")
                if raw_key in mapping:
                    current_key = mapping[raw_key]
                    data[current_key] = val_part.strip().replace("*", "")
                    # Special handling for emotion word list
                    if raw_key == "emotion":
                        word = val_part.strip().replace("*", "").strip("'\"")
                        data["detected_emotions"] = [{"word": word, "core": word, "category": "Identified"}]
                else:
                    current_key = None
            elif current_key:
                data[current_key] += "\n" + line

        return data

    def analyze_week(self, entries: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Synthesize a week of journal data.
        High-speed synthesis of past entries.
        """
        if not entries:
            return {
                "error": "insufficient_data",
                "message": "Archive empty. Log at least one journal entry to unlock your protocol."
            }

        # 🛡️ DETERMINISTIC SYNTHESIS
        all_emotions = []
        all_insights = []
        for e in entries:
            analysis = e.get("ai_response", {})
            for em in analysis.get("detected_emotions", []):
                all_emotions.append(em.get("core", "Neutral"))
            insight = analysis.get("pattern_insight")
            if insight: all_insights.append(insight)

        from collections import Counter
        counts = Counter(all_emotions)
        dominant = counts.most_common(1)[0][0] if counts else "Equilibrium"
        
        THEME_MAP = {
            "Happy": ("Emotional Resonance", "A landscape of high psychological alignment and clarity."),
            "Angry": ("Intensity Phase", "A phase of intense emotional discharge and boundary defining."),
            "Sad": ("Introspective Processing", "A deep-dive period of recalibration."),
            "Fear": ("Focus Vigilance", "Navigating high-entropy environments with sustained conscious focus."),
            "Bad": ("Emotional Maintenance", "A recalibration phase focused on psychological preservation.")
        }
        theme, landscape = THEME_MAP.get(dominant, ("Emotional Equilibrium", "A sustained state of baseline stability and core focus."))

        return {
            "weekly_theme": theme,
            "emotional_landscape": landscape,
            "macro_insight": all_insights[-1] if all_insights else "Data patterns are stabilizing in your journal.",
            "growth_milestone": f"Maintained emotional documentation across {len(entries)} entries.",
            "focus_for_next_week": "Sustained daily emotional tracking.",
            "is_ai_generated": False,
            "entry_count": len(entries),
            "timestamp": datetime.utcnow().isoformat()
        }

    def _validate_response(self, result: Dict[str, Any]) -> Dict[str, Any]:
        required_keys = {
            "detected_emotions",
            "recognize",
            "understand",
            "label",
            "express",
            "regulate",
            "growth_action",
        }

        missing_fields = [key for key in required_keys if key not in result or not str(result.get(key, "")).strip()]
        if missing_fields:
            raise MissingFieldsError(missing_fields)

        detected = result.get("detected_emotions")
        if not isinstance(detected, list):
            raise HTTPException(status_code=502, detail="detected_emotions must be a list.")

        if not (1 <= len(detected) <= 4):
            raise HTTPException(status_code=502, detail="detected_emotions must contain 1-4 items.")

        normalized_emotions: List[Dict[str, str]] = []
        invalid_words: List[str] = []

        for item in detected:
            if not isinstance(item, dict):
                continue
            word = str(item.get("word", "")).strip()
            key = word.lower()
            if not key or key not in self.emotion_index.allowed_words:
                if word:
                    invalid_words.append(word)
                continue

            mapped = self.emotion_index.word_map[key]
            normalized_emotions.append({
                "word": mapped["word"],
                "core": mapped["core"],
                "category": mapped["category"],
            })

        if invalid_words:
            raise InvalidEmotionError(invalid_words)

        if not normalized_emotions:
            raise HTTPException(status_code=502, detail="No valid emotions returned by AI.")

        recognize = _trim_words(str(result.get("recognize", "")).strip(), 200)
        understand = _trim_words(str(result.get("understand", "")).strip(), 200)
        label = _trim_words(str(result.get("label", "")).strip(), 200)
        express = _trim_words(str(result.get("express", "")).strip(), 200)
        regulate = _trim_words(str(result.get("regulate", "")).strip(), 150)
        growth_action = str(result.get("growth_action", "")).strip()

        total_words = sum(
            len(text.split())
            for text in [recognize, understand, label, express, regulate, growth_action]
        )
        if total_words > 350:
            raise HTTPException(status_code=502, detail="AI response exceeded word limit.")

        return {
            "detected_emotions": normalized_emotions,
            "recognize": recognize,
            "understand": understand,
            "label": label,
            "express": express,
            "regulate": regulate,
            "growth_action": growth_action,
        }

    def _repair_missing_fields(self, result: Dict[str, Any], entry: str) -> Dict[str, Any]:
        repaired = dict(result)
        if "detected_emotions" not in repaired or not isinstance(repaired.get("detected_emotions"), list):
            repaired["detected_emotions"] = self._fallback_emotions(entry)
        
        # Warm placeholders instead of empty strings
        fallbacks = {
            "recognize": "Reflecting on your inner state...",
            "understand": "Analyzing the patterns beneath...",
            "label": "Identifying core emotional signatures...",
            "express": "What is this moment trying to tell you?",
            "regulate": "Take a slow, deep breath.",
            "growth_action": "Let's move forward one step at a time."
        }

        for key, default in fallbacks.items():
            if key not in repaired or not isinstance(repaired.get(key), str) or not repaired.get(key).strip():
                repaired[key] = default
        return repaired

    def _fallback_emotions(self, entry: str) -> List[Dict[str, str]]:
        entry_lower = entry.lower()
        candidates: List[str] = []

        for keyword, emotions in KEYWORD_EMOTION_MAP.items():
            if keyword in entry_lower:
                for emotion in emotions:
                    if emotion in self.emotion_index.allowed_words and emotion not in candidates:
                        candidates.append(emotion)

        for emotion in FALLBACK_EMOTIONS:
            if emotion in self.emotion_index.allowed_words and emotion not in candidates:
                candidates.append(emotion)
            if len(candidates) >= 4:
                break

        if len(candidates) < 2:
            # Ensure minimum of 2
            for emotion in sorted(self.emotion_index.allowed_words):
                if emotion not in candidates:
                    candidates.append(emotion)
                if len(candidates) >= 2:
                    break

        normalized: List[Dict[str, str]] = []
        for emotion in candidates[:4]:
            mapped = self.emotion_index.word_map.get(emotion)
            if mapped:
                normalized.append({
                    "word": mapped["word"],
                    "core": mapped["core"],
                    "category": mapped["category"],
                })

        return normalized


_emotion_index = _load_emotion_dataset(EMOTION_DATA_PATH)
_journal_service: Optional[JournalService] = None


def get_journal_service() -> JournalService:
    global _journal_service
    if _journal_service is None:
        api_key = os.getenv("OPENAI_API_KEY", "")
        if not api_key:
            raise HTTPException(status_code=500, detail="OPENAI_API_KEY is missing.")
        ai_client = AIClient(api_key=api_key)
        _journal_service = JournalService(ai_client=ai_client, emotion_index=_emotion_index)
    return _journal_service
