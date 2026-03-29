from datetime import datetime
from fastapi import APIRouter, Depends, Request, HTTPException, File, UploadFile
from pydantic import BaseModel
from app.auth import get_current_user
from app.database import get_collection
from app.services.ai_service import get_journal_service
from bson import ObjectId
import logging
import httpx
import os

logger = logging.getLogger("emolit.journal")
router = APIRouter(tags=["journal"])

class JournalEntryRequest(BaseModel):
    entry: str

class TrackWordRequest(BaseModel):
    word_data: dict

@router.post("/journal")
@router.post("/api/journal")
async def submit_journal(request: JournalEntryRequest, user: dict = Depends(get_current_user)):
    """Analyze and store structured journal entry."""
    logger.info(f"📥 Received journal entry from {user.get('email')}")
    try:
        service = get_journal_service()
        analysis = service.analyze_entry(request.entry)
        
        if "error" in analysis:
            return analysis

        # Robust User Identification
        user_id_str = user.get("user_id")
        try:
            user_oid = ObjectId(user_id_str)
        except Exception:
            # If for some reason user_id is not a valid ObjectId (e.g. integer or legacy string)
            # we use it as-is or handle as error. But Atlas expects _id to be ObjectId usually.
            logger.warning(f"⚠️ Non-standard user_id format: {user_id_str}")
            user_oid = user_id_str

        journal_doc = {
            "user_id": user_oid,
            "user_email": user.get("email"),
            "entry_text": request.entry,
            "ai_response": {
                "detected_emotions": analysis["detected_emotions"],
                "recognize": analysis["recognize"],
                "understand": analysis["understand"],
                "label": analysis["label"],
                "express": analysis["express"],
                "regulate": analysis["regulate"],
                "growth_action": analysis["growth_action"]
            },
            "entry_type": "journal_entry",
            "created_at": datetime.utcnow()
        }
        
        journals_col = get_collection("journal_entries")
        result = journals_col.insert_one(journal_doc)
        
        return {
            "entry_id": str(result.inserted_id),
            **analysis
        }
    except HTTPException as he:
        # Re-raise HTTPExceptions as-is so FastAPI handles them correctly (400, 401, 502, etc.)
        raise he
    except Exception as e:
        logger.error(f"❌ submit_journal failed: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/journal/voice")
@router.post("/api/journal/voice")
async def submit_voice_journal(file: UploadFile = File(...), user: dict = Depends(get_current_user)):
    """Convert voice to text via Sarvam AI and then analyze."""
    sarvam_api_key = os.getenv("SARVAM_API_KEY")
    if not sarvam_api_key:
        logger.error("❌ SARVAM_API_KEY not found in environment")
        raise HTTPException(status_code=500, detail="Sarvam API key not configured")

    try:
        # 1. Read the audio file
        audio_content = await file.read()
        logger.info(f"🎙️ Processing voice entry ({len(audio_content)} bytes) for {user.get('email')}")
        
        # 2. Call Sarvam AI Speech-to-Text-Translate
        async with httpx.AsyncClient() as client:
            files = {'file': (file.filename, audio_content, file.content_type)}
            headers = {'api-subscription-key': sarvam_api_key}
            
            # Sarvam API requires 'model' = 'saaras:v2.5' for translation/transcription
            data = {'model': 'saaras:v2.5'}
            
            response = await client.post(
                "https://api.sarvam.ai/speech-to-text-translate",
                headers=headers,
                data=data,
                files=files,
                timeout=30.0
            )
            
            if response.status_code != 200:
                logger.error(f"❌ Sarvam API error: {response.text}")
                raise HTTPException(status_code=502, detail=f"Sarvam AI error: {response.text}")
            
            transcription_data = response.json()
            transcript = transcription_data.get("transcript")
            
            if not transcript:
                logger.warning("⚠️ No transcript returned from Sarvam AI")
                raise HTTPException(status_code=400, detail="No speech detected in audio")

        # 3. Reuse the existing journal analysis logic
        logger.info(f"✨ Transcribed: \"{transcript[:100]}...\"")
        
        service = get_journal_service()
        analysis = service.analyze_entry(transcript)
        
        if "error" in analysis:
            return analysis

        # 4. Store in DB
        user_id_str = user.get("user_id")
        try:
            user_oid = ObjectId(user_id_str)
        except Exception:
            user_oid = user_id_str

        journal_doc = {
            "user_id": user_oid,
            "user_email": user.get("email"),
            "entry_text": transcript,
            "ai_response": {
                "detected_emotions": analysis["detected_emotions"],
                "recognize": analysis["recognize"],
                "understand": analysis["understand"],
                "label": analysis["label"],
                "express": analysis["express"],
                "regulate": analysis["regulate"],
                "growth_action": analysis["growth_action"]
            },
            "entry_type": "voice_journal",
            "created_at": datetime.utcnow()
        }
        
        journals_col = get_collection("journal_entries")
        result = journals_col.insert_one(journal_doc)
        
        return {
            "entry_id": str(result.inserted_id),
            "transcript": transcript,
            **analysis
        }

    except Exception as e:
        import traceback
        error_trace = traceback.format_exc()
        logger.error(f"❌ submit_voice_journal failed: {str(e)}\n{error_trace}")
        raise HTTPException(status_code=500, detail=f"Voice Engine Error: {str(e)}")

@router.post("/journal/track-word")
@router.post("/api/journal/track-word")
async def track_word_learned(request: TrackWordRequest, user: dict = Depends(get_current_user)):
    """
    User Plan Implementation: Sync the same data sent to frontend to MongoDB.
    Saves the daily word 'learned' by the user into the database with a timestamp.
    """
    try:
        user_id = ObjectId(user["user_id"])
        word_data = request.word_data
        
        tracking_doc = {
            "user_id": user_id,
            "word": word_data.get("word"),
            "core": word_data.get("core"),
            "category": word_data.get("category"),
            "metadata": word_data.get("metadata"),
            "created_at": datetime.utcnow(),
            "date": datetime.utcnow().strftime("%Y-%m-%d")
        }
        
        # Save to a dedicated 'learned_history' collection to keep timeline clean
        # Or reuse 'daily_words_seen' if you want to track which ones were actually learned vs just seen
        get_collection("learned_words").insert_one(tracking_doc)
        
        logger.info(f"✅ User Sync: Saved learned word '{word_data.get('word')}' to MongoDB for {user['email']}")
        return {"status": "ok", "message": "Word saved to MongoDB with timestamp"}
    except Exception as e:
        logger.error(f"❌ User Sync Failed: {str(e)}")
        return {"status": "error", "message": str(e)}

@router.get("/journal/history")
@router.get("/api/journal/history")
async def get_legacy_history(user: dict = Depends(get_current_user)):
    try:
        user_id = ObjectId(user["user_id"])
        journals_col = get_collection("journal_entries")
        learned_col = get_collection("learned_words")
        
        journals = list(journals_col.find({"user_id": user_id}).sort("created_at", -1).limit(50))
        learned = list(learned_col.find({"user_id": user_id}).sort("created_at", -1).limit(50))
        saved_col = get_collection("saved_words")
        saved = list(saved_col.find({"user_id": user_id}).sort("created_at", -1).limit(50))
        
        combined = []
        for j in journals:
            combined.append({
                "type": "journal",
                "data": {
                    "entry_id": str(j["_id"]),
                    "entry_text": j["entry_text"],
                    "detected_emotions": j["ai_response"]["detected_emotions"],
                    "recognize": j["ai_response"]["recognize"],
                    "understand": j["ai_response"]["understand"],
                    "label": j["ai_response"]["label"],
                    "express": j["ai_response"]["express"],
                    "regulate": j["ai_response"]["regulate"],
                    "growth_action": j["ai_response"]["growth_action"],
                    "created_at": j["created_at"].isoformat() + "Z" if isinstance(j["created_at"], datetime) else j["created_at"]
                }
            })
        for w in learned:
            combined.append({
                "type": "learned_word",
                "data": {
                    "entry_id": str(w["_id"]),
                    "word_details": {
                        "word": w["word"],
                        "core": w["core"],
                        "category": w["category"]
                    },
                    "created_at": w["created_at"].isoformat() + "Z" if isinstance(w["created_at"], datetime) else datetime.utcnow().isoformat() + "Z"
                }
            })
        for s in saved:
            combined.append({
                "type": "saved_word",
                "data": {
                    "entry_id": str(s["_id"]),
                    "word": s["word"],
                    "core": s["core"],
                    "category": s["category"],
                    "created_at": s["created_at"].isoformat() + "Z" if isinstance(s["created_at"], datetime) else datetime.utcnow().isoformat() + "Z"
                }
            })
        
        combined.sort(key=lambda x: str(x["data"]["created_at"]), reverse=True)
        return {"entries": combined}
    except Exception as e:
        logger.error(f"❌ history failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/journal/stats")
@router.get("/api/journal/stats")
async def get_stats(user: dict = Depends(get_current_user)):
    journals_col = get_collection("journal_entries")
    total = journals_col.count_documents({"user_id": ObjectId(user["user_id"])})
    return {"total_entries": total, "top_emotions": []}

@router.get("/journal/weekly-analysis")
@router.get("/api/journal/weekly-analysis")
async def get_weekly_analysis(user: dict = Depends(get_current_user)):
    """Weekly analysis is deprecated. Please use the Monthly Neural Report."""
    return {"message": "Weekly analysis has been upgraded to a Monthly Neural Protocol. Please use the Download button."}
