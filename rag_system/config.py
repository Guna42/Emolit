"""
config.py  —  Central configuration for the Unified Data Spine RAG system.
Set ANTHROPIC_API_KEY via environment variable or directly here.
"""

import os

# ── Gemini / Google GenAI ─────────────────────────────────────────────────
# Set GEMINI_API_KEY from env variable.
GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
# Models
LLM_MODEL: str = "gemini-1.5-flash"
GROQ_MODEL: str = "llama-3.3-70b-versatile"
LLM_MAX_TOKENS: int = 1024

# ── Embedding model (runs locally via sentence-transformers) ───────────────
EMBED_MODEL: str = "all-MiniLM-L6-v2"

# ── ChromaDB ───────────────────────────────────────────────────────────────
CHROMA_DIR: str = os.path.join(os.path.dirname(__file__), "chroma_db")
COLLECTION_EMOTIONS: str = "emotions_vocabulary"
COLLECTION_TASK: str = "task_documents"

# ── Source files (place in data/ folder) ──────────────────────────────────
DATA_DIR: str = os.path.join(os.path.dirname(__file__), "data")
XLSX_FILE: str = os.path.join(DATA_DIR, "Emotions_vocabulary_final.xlsx")
DOCX_FILE: str = os.path.join(DATA_DIR, "Task_1-_Neha.docx")

# ── Retrieval ──────────────────────────────────────────────────────────────
TOP_K: int = 5          # number of chunks to retrieve per query

# ── RULER framework dimensions ─────────────────────────────────────────────
RULER_DIMENSIONS = {
    "Recognize":  "Identify and notice an emotion in oneself or others",
    "Understand": "Know the causes and consequences of an emotion",
    "Label":      "Accurately name the emotion with a precise vocabulary word",
    "Express":    "Communicate the emotion appropriately to the context",
    "Regulate":   "Manage and modulate the emotion effectively",
}
