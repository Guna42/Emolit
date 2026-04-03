import sys
import os

PROJECT_ROOT = os.path.dirname(os.path.abspath(__file__))
sys.path.append(PROJECT_ROOT)
sys.path.append(os.path.join(PROJECT_ROOT, "rag_system"))

from app.services.ai_service import get_journal_service
from rag_system.rag import answer

test_entry = "I feel so stressed about work. My boss is always asking for more and I can't say no."

try:
    print("Testing rag.answer()...")
    rag_text, chunks = answer(test_entry)
    print("\n--- RAW RAG OUTPUT ---")
    print(rag_text)
    print("----------------------\n")
    
    print("Testing get_journal_service().analyze_entry()...")
    service = get_journal_service()
    analysis = service.analyze_entry(test_entry)
    print("\n--- FINAL ANALYSIS JSON ---")
    import json
    print(json.dumps(analysis, indent=2))
    print("---------------------------\n")
    
except Exception as e:
    import traceback
    traceback.print_exc()
