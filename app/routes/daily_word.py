import json
import os
import random
import logging
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from app.auth import get_current_user
from app.database import get_collection
from bson import ObjectId

logger = logging.getLogger("emolit.daily_word")
router = APIRouter(tags=["daily-word"])

# Path to emotion database
DATA_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data", "emotion_database.json")

def load_emotions_full():
    with open(DATA_PATH, "r", encoding="utf-8") as f:
        return json.load(f)

@router.get("/daily-word")
@router.get("/api/daily-word")
@router.get("/words/daily")
@router.get("/api/words/daily")
async def get_daily_word(user: dict = Depends(get_current_user)):
    """Get or generate the unique daily word for the user (Bulletproof Mapping)."""
    try:
        today = datetime.utcnow().strftime("%Y-%m-%d")
        user_id = ObjectId(user["user_id"])
        daily_col = get_collection("daily_words_seen")
        
        # 1. Check if exists for today
        existing = daily_col.find_one({"user_id": user_id, "date": today})
        
        emotions_data = load_emotions_full()
        
        if existing:
            # Re-fetch metadata for frontend compatibility
            core = existing["core"]
            cat = existing["category"]
            word = existing["word"]
            metadata = emotions_data.get(core, {}).get(cat, {}).get(word, {})
            
            return {
                "word": word,
                "core": core,
                "category": cat,
                "date": today,
                "metadata": metadata
            }
        
        # 2. Pick random
        cores = list(emotions_data.keys())
        core = random.choice(cores)
        categories = list(emotions_data[core].keys())
        category = random.choice(categories)
        words = list(emotions_data[core][category].keys())
        word = random.choice(words)
        metadata = emotions_data[core][category][word]
        
        # 3. Store
        new_record = {
            "user_id": user_id,
            "word": word,
            "core": core,
            "category": category,
            "date": today
        }
        daily_col.insert_one(new_record)
        
        return {
            "word": word,
            "core": core,
            "category": category,
            "date": today,
            "metadata": metadata
        }
    except Exception as e:
        logger.error(f"❌ get_daily_word failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
