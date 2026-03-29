"""
main.py  —  Interactive CLI for the Unified Data Spine RAG system.

Usage:
    python main.py                    # interactive chat mode
    python main.py --ingest           # (re)ingest source files, then chat
    python main.py --query "..."      # single one-shot query

Example queries:
    "What does 'stressed' mean in the RULER framework?"
    "List moderate-level emotions in the Fearful category."
    "How does the RAG system preserve source metadata?"
    "What are the Phase 1 deliverables in the task document?"
"""

import argparse
import os
import sys
from pathlib import Path

# ── Preflight checks ───────────────────────────────────────────────────────

from google import genai
from rag import answer
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
def check_files() -> bool:
    from config import XLSX_FILE, DOCX_FILE
    missing = []
    if not Path(XLSX_FILE).exists():
        missing.append(XLSX_FILE)
    if not Path(DOCX_FILE).exists():
        missing.append(DOCX_FILE)
    if missing:
        print("\n[ERROR] Missing source files:")
        for f in missing:
            print(f"  • {f}")
        print("\nPlace both files in the data/ folder and try again.\n")
        return False
    return True


def check_api_key() -> bool:
    from config import GEMINI_API_KEY
    if not GEMINI_API_KEY:
        print("\n[ERROR] GEMINI_API_KEY is not set.")
        print("  Option 1: export GEMINI_API_KEY=your_key")
        print("  Option 2: edit config.py and set GEMINI_API_KEY directly.\n")
        return False
    return True


def check_ingested() -> bool:
    """Check if ChromaDB collections exist."""
    from config import CHROMA_DIR, COLLECTION_EMOTIONS, COLLECTION_TASK
    import chromadb
    if not Path(CHROMA_DIR).exists():
        return False
    try:
        client = chromadb.PersistentClient(path=CHROMA_DIR)
        cols   = {c.name for c in client.list_collections()}
        return COLLECTION_EMOTIONS in cols and COLLECTION_TASK in cols
    except Exception:
        return False


# ── CLI ────────────────────────────────────────────────────────────────────

BANNER = """
╔══════════════════════════════════════════════════════════╗
║        Unified Data Spine — RAG + RULER Framework        ║
║          Citation-Backed Emotional Intelligence AI       ║
╚══════════════════════════════════════════════════════════╝
Type your question and press Enter.
Commands:  /help  /sources  /ruler  /quit
"""

HELP_TEXT = """
Commands
────────
  /help      Show this help
  /sources   Show sources loaded into the vector DB
  /ruler     Explain the RULER framework
  /quit      Exit

Example queries
───────────────
  What does 'stressed' mean in the RULER framework?
  List moderate-level emotions in the Happy category.
  What are the Phase 1 deliverables?
  How does the retrieval logic work in the RAG system?
  What emotion words relate to regulation and calm?
"""

RULER_TEXT = """
RULER Framework (Yale Center for Emotional Intelligence)
────────────────────────────────────────────────────────
  R – Recognize  : Identify emotions in oneself and others
  U – Understand : Know causes and consequences of emotions
  L – Label      : Use precise vocabulary to name emotions
  E – Express    : Communicate emotions appropriately
  R – Regulate   : Manage and modulate emotional responses

Every vocabulary word in the system is mapped to all 5 dimensions.
"""


def show_sources():
    from config import CHROMA_DIR, COLLECTION_EMOTIONS, COLLECTION_TASK
    import chromadb
    client = chromadb.PersistentClient(path=CHROMA_DIR)
    for col_name in (COLLECTION_EMOTIONS, COLLECTION_TASK):
        try:
            col = client.get_collection(col_name)
            print(f"\n  Collection: '{col_name}'  ({col.count()} documents)")
        except Exception as e:
            print(f"\n  Collection '{col_name}': not found ({e})")


def interactive_loop():
    from rag import answer_with_sources

    print(BANNER)
    while True:
        try:
            query = input("\nYou: ").strip()
        except (EOFError, KeyboardInterrupt):
            print("\nGoodbye!")
            break

        if not query:
            continue
        if query.lower() in ("/quit", "quit", "exit"):
            print("Goodbye!")
            break
        if query.lower() == "/help":
            print(HELP_TEXT)
            continue
        if query.lower() == "/ruler":
            print(RULER_TEXT)
            continue
        if query.lower() == "/sources":
            show_sources()
            continue

        print("\nAI: (retrieving & generating...)\n")
        try:
            response = answer_with_sources(query)
            print(f"AI:\n{response}\n")
        except Exception as e:
            print(f"[ERROR] {e}\n")


def one_shot(query: str):
    print(f"\nQuery: {query}\n")
    response, _ = answer(query)
    print(response)


# ── Entry point ────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="Unified Data Spine RAG CLI")
    parser.add_argument("--ingest", action="store_true",
                        help="(Re)ingest source files before starting")
    parser.add_argument("--query", type=str, default=None,
                        help="Run a single query and exit")
    args = parser.parse_args()

    # Validate
    if not check_files():
        sys.exit(1)
    if not check_api_key():
        sys.exit(1)

    # Ingest if requested or not yet done
    if args.ingest or not check_ingested():
        print("[main] Running ingestion...")
        from ingest import run_ingestion
        run_ingestion()

    # Run
    if args.query:
        one_shot(args.query)
    else:
        interactive_loop()


if __name__ == "__main__":
    main()
