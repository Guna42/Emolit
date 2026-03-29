"""
rag.py  —  Retrieval-Augmented Generation engine.

Pipeline:
  1. Embed the user query (sentence-transformers, local)
  2. Retrieve top-K chunks from both ChromaDB collections
  3. Build a prompt with inline source citations
  4. Call Claude (Anthropic) and return the grounded response
"""

from typing import List, Dict, Tuple
import os
from openai import OpenAI
from google import genai
from google.genai import types
import chromadb
from chromadb.utils import embedding_functions

from config import (
    GEMINI_API_KEY, GROQ_API_KEY, LLM_MODEL, GROQ_MODEL, LLM_MAX_TOKENS,
    CHROMA_DIR, COLLECTION_EMOTIONS, COLLECTION_TASK,
    EMBED_MODEL, TOP_K,
)


# ── ChromaDB setup ─────────────────────────────────────────────────────────

def _get_collection(name: str):
    client = chromadb.PersistentClient(path=CHROMA_DIR)
    ef     = embedding_functions.SentenceTransformerEmbeddingFunction(
                 model_name=EMBED_MODEL
             )
    return client.get_collection(name=name, embedding_function=ef)


# ── Retrieval ──────────────────────────────────────────────────────────────

def retrieve(query: str, top_k: int = TOP_K) -> List[Dict]:
    """
    Query both collections and return merged, de-duplicated results
    sorted by relevance distance (lower = more similar).
    """
    results: List[Dict] = []

    for col_name in (COLLECTION_EMOTIONS,):
        try:
            col = _get_collection(col_name)
            res = col.query(query_texts=[query], n_results=top_k)
        except Exception as e:
            print(f"[rag] Warning: could not query '{col_name}': {e}")
            continue

        for doc, meta, dist in zip(
            res["documents"][0],
            res["metadatas"][0],
            res["distances"][0],
        ):
            results.append({
                "text":       doc,
                "metadata":   meta,
                "distance":   dist,
                "collection": col_name,
            })

    # Sort by cosine distance (ascending = most relevant first)
    results.sort(key=lambda x: x["distance"])
    return results[:top_k * 2]   # return top results across both collections


# ── Citation builder ───────────────────────────────────────────────────────

def _format_citation(chunk: Dict, index: int) -> str:
    """Format a retrieved chunk as a numbered citation block."""
    meta        = chunk["metadata"]
    source      = meta.get("source", "unknown")
    source_type = meta.get("source_type", "general")

    if source == "emotions_vocabulary_xlsx":
        header = (
            f"[{index}] SOURCE: Emotions Vocabulary — "
            f"Word: '{meta.get('word','')}' | "
            f"Category: {meta.get('category','')} | "
            f"Level: {meta.get('level','')}"
        )
    else:
        header = (
            f"[{index}] SOURCE: Task Document ({source_type}) — "
            f"Section: \"{meta.get('heading','')}\" "
            f"(idx: {meta.get('section_index','')})"
        )

    return f"{header}\n{chunk['text']}\n"


# ── Prompt construction ────────────────────────────────────────────────────
SYSTEM_PROMPT = """You are an emotionally intelligent assistant.

Your tone should be clear, structured, and human — not too casual and not too academic.

STRICT FORMAT (must follow exactly):

Emotion:
Recognize:
Understand:
Label:
Express:
Regulate:
What can be done:

RULES:
- Emotion must be ONLY ONE word
- Keep each section short (1–2 lines)
- Use simple, clear language
- No long or complex sentences
- Do not repeat the same idea again and again

WHAT CAN BE DONE RULES:
- Give 3–4 practical steps
- Steps should feel real and usable in daily life
- Use simple psychology ideas like:
  - focusing on one task
  - taking small steps
  - calming thoughts
  - maintaining small habits
- Do NOT mention psychology terms
- Avoid vague advice like “take a break” without context
- Each step should feel specific and helpful

STYLE:
- Make it suitable for a 20-year-old student under pressure
- Keep it calm and supportive
- Avoid robotic or overly emotional tone

IMPORTANT:
If the format is not followed exactly, the answer is incorrect.
"""
def build_prompt(query: str, chunks: List[Dict]) -> str:
    citation_blocks = "\n".join(
        _format_citation(c, i + 1) for i, c in enumerate(chunks)
    )
    return (
        f"USER QUERY:\n{query}\n\n"
        f"RETRIEVED CITATIONS:\n{citation_blocks}\n"
       f"Analyze the user's emotional state and respond using the required format."
    )


# ── Generation ─────────────────────────────────────────────────────────────

def _generate_groq(prompt: str, system_msg: str) -> str:
    """Ultra-fast generation via Groq."""
    client = OpenAI(base_url="https://api.groq.com/openai/v1", api_key=GROQ_API_KEY)
    response = client.chat.completions.create(
        model=GROQ_MODEL,
        messages=[
            {"role": "system", "content": system_msg},
            {"role": "user", "content": prompt}
        ],
        max_tokens=LLM_MAX_TOKENS,
        temperature=0.2
    )
    return response.choices[0].message.content

def _generate_gemini(prompt: str, system_msg: str) -> str:
    """Fallback generation via Gemini."""
    client = genai.Client(api_key=GEMINI_API_KEY)
    response = client.models.generate_content(
        model=LLM_MODEL,
        contents=prompt,
        config=types.GenerateContentConfig(
            system_instruction=system_msg,
            max_output_tokens=LLM_MAX_TOKENS,
        ),
    )
    return response.text

def generate(query: str, chunks: List[Dict]) -> str:
    """Grounded generation. Tries Groq first for speed, then Gemini."""
    prompt = build_prompt(query, chunks)
    
    if GROQ_API_KEY:
        try:
            print("[rag] Using Groq (Llama3-70b) for fast inference...")
            return _generate_groq(prompt, SYSTEM_PROMPT)
        except Exception as e:
            print(f"[rag] Groq failed, falling back to Gemini: {e}")
    
    return _generate_gemini(prompt, SYSTEM_PROMPT)


# ── Public API ─────────────────────────────────────────────────────────────

def answer(query: str) -> Tuple[str, List[Dict]]:
    """
    Full RAG pipeline.

    Returns
    -------
    (response_text, retrieved_chunks)
    """
    chunks   = retrieve(query)
    response = generate(query, chunks)
    return response, chunks


def answer_with_sources(query: str) -> str:
    """Convenience wrapper that appends a source list to the response."""
    response, chunks = answer(query)

    source_list = "\n".join(
        f"  [{i+1}] {c['metadata'].get('source','')} — "
        + (
            f"Word: {c['metadata'].get('word','')}"
            if c["metadata"].get("source") == "emotions_vocabulary_xlsx"
            else f"Section: {c['metadata'].get('heading','')}"
        )
        for i, c in enumerate(chunks)
    )

    return f"{response}\n\n── Sources ──\n{source_list}"
