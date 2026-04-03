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

_chroma_client = None
_embed_fn = None

def _get_collection(name: str):
    global _chroma_client, _embed_fn
    if _chroma_client is None:
        print("[rag] Initializing ChromaDB PersistentClient...")
        _chroma_client = chromadb.PersistentClient(path=CHROMA_DIR)
    if _embed_fn is None:
        print("[rag] Loading SentenceTransformer Embedding Model into memory...")
        _embed_fn = embedding_functions.SentenceTransformerEmbeddingFunction(
            model_name=EMBED_MODEL
        )
    return _chroma_client.get_collection(name=name, embedding_function=_embed_fn)


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

Your MUST output ONLY the following exact keys, with no bolding, no asterisks, no markdown, and no conversational intro.

Emotion:
Recognize:
Understand:
Label:
Express:
Regulate:
What can be done:

RULES:
- "Emotion" must be 1 to 2 words only. (e.g. Overwhelmed, Disappointed)
- "Recognize" through "Regulate" must EACH be EXACTLY ONE short, powerful, empathetic sentence.
- Example Recognize: You felt humiliated in front of others.
- Example Understand: Your manager's scolding affected your self-esteem.
- Example Label: It's a normal feeling after a public criticism.
- "What can be done" must be 2-3 short, highly actionable bullet points.
- Do NOT use ANY markdown. DO NOT wrap keys in **. No introduction text.
- If the format is not followed exactly, the system will crash.
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

_groq_client = None

def _generate_groq(prompt: str, system_msg: str) -> str:
    """Ultra-fast generation via Groq."""
    global _groq_client
    if _groq_client is None:
        _groq_client = OpenAI(base_url="https://api.groq.com/openai/v1", api_key=GROQ_API_KEY)
        
    response = _groq_client.chat.completions.create(
        model=GROQ_MODEL,
        messages=[
            {"role": "system", "content": system_msg},
            {"role": "user", "content": prompt}
        ],
        max_tokens=LLM_MAX_TOKENS,
        temperature=0.2
    )
    return response.choices[0].message.content

_gemini_client = None

def _generate_gemini(prompt: str, system_msg: str) -> str:
    """Fallback generation via Gemini."""
    global _gemini_client
    if _gemini_client is None:
        _gemini_client = genai.Client(api_key=GEMINI_API_KEY)
        
    response = _gemini_client.models.generate_content(
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
    Full RAG pipeline. Optimized for Render to prevent hangs and auto-heals empty DBs.
    """
    import time
    from ingest import run_ingestion
    start_time = time.time()
    chunks = []
    
    # 🏃 1. RETRIEVE (With auto-healing for empty databases)
    try:
        print(f"[rag] Starting retrieval for: {query[:50]}...")
        chunks = retrieve(query)
        
        # 🧪 AUTO-HEALING: If DB is empty, run ingestion once and retry
        if not chunks:
            print("[rag] 🏗️ Database seems empty. Triggering auto-ingestion...")
            run_ingestion()
            chunks = retrieve(query) # Retry once
            
        print(f"[rag] Retrieval complete in {time.time() - start_time:.2f}s (found {len(chunks)} chunks)")
    except Exception as e:
        print(f"[rag] ⚠️ Retrieval skipped due to error: {e}")
        chunks = []

    # 🤖 2. GENERATE (Using the chunks if found, or simple AI if not)
    gen_start = time.time()
    try:
        response = generate(query, chunks)
        print(f"[rag] Generation complete in {time.time() - gen_start:.2f}s")
        return response, chunks
    except Exception as e:
        print(f"[rag] ❌ Generation failed: {e}")
        # Final emergency fallback string that matches the user's required RULER format
        err_response = (
            "Emotion: Overwhelmed\n"
            "Recognize: You are currently experiencing a period of high intensity.\n"
            "Understand: This is a natural reaction to the current environment.\n"
            "Label: Overwhelmed\n"
            "Express: This feeling is valid and understandable.\n"
            "Regulate: Focus on your breathing for just 30 seconds.\n"
            "What can be done:\n"
            "1. Focus on only one small task for the next hour.\n"
            "2. Take three deep breaths right now.\n"
            "3. Step away from the screen for 5 minutes."
        )
        return err_response, []


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
