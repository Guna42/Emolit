from pydantic import BaseModel
from typing import List, Optional


class EmotionMetadata(BaseModel):
    intensity: int
    definition: str
    synonyms: List[str]
    example: str
    reflection_prompt: str
    growth_tip: str
    body_signal: str


class WordDetail(BaseModel):
    word: str
    core: str
    category: str
    metadata: EmotionMetadata


class WordSummary(BaseModel):
    word: str
    core: str
    category: str


class DailyWordResponse(BaseModel):
    word: str
    core: str
    category: str
    metadata: EmotionMetadata


class SearchResponse(BaseModel):
    word: str
    core: str
    category: str
