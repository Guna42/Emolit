"""
Final Simplified History & Stats 
"""
from fastapi import APIRouter, Depends, Request
from app.auth_utils import get_current_user
from app.journal_db import get_user_journal_count, get_user_journal_entries
from app.history_db import get_user_history_combined
from datetime import datetime

router = APIRouter()

@router.get("/journal/history")
async def get_journal_history(request: Request, user_email: str = Depends(get_current_user)):
    try:
        page = int(request.query_params.get("page", 1))
        page_size = int(request.query_params.get("page_size", 100))
        
        skip = (page - 1) * page_size
        raw_entries = get_user_history_combined(user_email, limit=page_size, skip=skip)
        
        formatted = []
        for entry in raw_entries:
            eid = str(entry.get("_id", ""))
            created_at = entry.get("created_at")
            
            # Ensure we export a string date that JS can parse reliably
            if isinstance(created_at, datetime):
                created_at = created_at.isoformat() + "Z"
            
            if entry.get("entry_type") == "learned_word":
                formatted.append({
                    "type": "learned_word",
                    "data": {
                        "entry_id": eid,
                        "word_details": entry.get("word_details", {}),
                        "created_at": created_at
                    }
                })
            else:
                analysis = entry.get("ai_analysis", {})
                formatted.append({
                    "type": "journal",
                    "data": {
                        "entry_id": eid,
                        "entry_text": entry.get("entry_text", ""),
                        "detected_emotions": analysis.get("detected_emotions", []),
                        "pattern_insight": analysis.get("pattern_insight", "Thinking..."),
                        "created_at": created_at
                    }
                })
        
        return {"entries": formatted, "total_count": len(formatted)}
    except Exception as e:
        print(f"HISTORY ERROR: {e}")
        return {"entries": [], "total_count": 0}

@router.get("/journal/stats")
async def get_journal_stats(user_email: str = Depends(get_current_user)):
    """Calculate REAL stats from the database."""
    try:
        total_count = get_user_journal_count(user_email)
        all_entries = get_user_journal_entries(user_email, limit=1000)
        
        emotion_counts = {}
        for entry in all_entries:
            analysis = entry.get("ai_analysis", {})
            for em in analysis.get("detected_emotions", []):
                word = em.get("word", "Unknown")
                emotion_counts[word] = emotion_counts.get(word, 0) + 1
                
        top_emotions = sorted([{"emotion_word": k, "count": v, "core_emotion": "Emotion"} for k,v in emotion_counts.items()], 
                            key=lambda x: x["count"], reverse=True)[:4]
                            
        return {
            "total_entries": total_count,
            "top_emotions": top_emotions
        }
    except Exception as e:
        print(f"STATS ERROR: {e}")
        return {"total_entries": 0, "top_emotions": []}

@router.post("/journal/track-word")
async def track_word(request: Request, user_email: str = Depends(get_current_user)):
    try:
        data = await request.json()
        from app.history_db import log_word_learned
        word_data = data.get("word_data", {})
        if word_data:
            log_word_learned(user_email, word_data)
            print(f"✅ LOGGED WORD: {word_data.get('word')} for {user_email}")
        return {"status": "ok"}
@router.get("/journal/weekly-analysis")
async def get_weekly_analysis(user_email: str = Depends(get_current_user)):
    """Analyze the last 7 days of entries."""
    try:
        from app.history_db import get_user_weekly_entries
        from app.services.ai_service import get_journal_service
        
        entries = get_user_weekly_entries(user_email)
        service = get_journal_service()
        report = service.analyze_week(entries)
        
        return report
    except Exception as e:
        print(f"WEEKLY ANALYSIS ERROR: {e}")
        return {"error": "analysis_failed", "message": str(e)}
