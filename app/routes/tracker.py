from fastapi import APIRouter, Depends, Request
from app.auth_utils import get_current_user
from app.journal_db import get_journal_collection
from datetime import datetime
import os

router = APIRouter(prefix="/tracker")

@router.post("/save")
async def save_activity(request: Request, user_email: str = Depends(get_current_user)):
    """Unified save for words and reflections."""
    data = await request.json()
    collection = get_journal_collection()
    
    # Store with a YYYY-MM-DD key for perfect matching
    activity_type = data.get("type") # 'word' or 'reflection'
    payload = data.get("payload")
    
    # We use local date key provided by frontend for 100% accuracy
    date_key = data.get("date_key", datetime.now().strftime("%Y-%m-%d"))

    document = {
        "user_email": user_email,
        "entry_type": f"tracker_{activity_type}",
        "data": payload,
        "date_key": date_key,
        "created_at": datetime.utcnow()
    }
    
    collection.insert_one(document)
    print(f"✅ TRACKER SAVED: {activity_type} for {date_key}")
    return {"status": "ok"}

@router.get("/history")
async def get_tracker_history(user_email: str = Depends(get_current_user)):
    """Fetch everything in one list."""
    collection = get_journal_collection()
    entries = collection.find({"user_email": user_email}).sort("created_at", -1).limit(500)
    
    formatted = []
    for e in entries:
        t = e.get("entry_type")
        formatted.append({
            "id": str(e["_id"]),
            "type": "learned_word" if "word" in t else "journal",
            "date_key": e.get("date_key"),
            "content": e.get("data")
        })
    return {"entries": formatted}
