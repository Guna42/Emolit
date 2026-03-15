from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from app.auth import get_current_user
from datetime import datetime, timedelta
from app.database import get_collection
from bson import ObjectId
from app.services.pdf_service import generate_monthly_report
import logging

logger = logging.getLogger("emolit.export")
router = APIRouter(tags=["export"])

@router.get("/export/monthly-report")
@router.get("/api/export/monthly-report")
async def export_monthly_report(user: dict = Depends(get_current_user)):
    """
    Generate and stream a premium emotional literacy report for the last 30 days.
    Bypasses history_db to prevent circular import hangs.
    """
    try:
        user_email = user.get("email")
        user_id_str = user.get("user_id")
        logger.info(f"📄 Engineering Monthly Neural Report for {user_email}")
        
        # 1. Fetch last 30 days of data directly
        try:
            user_id = ObjectId(user_id_str)
        except:
            user_id = user_id_str

        thirty_days_ago = datetime.utcnow() - timedelta(days=30)
        
        # Fetch Journals
        journals_col = get_collection("journal_entries")
        journals = list(journals_col.find({
            "$or": [{"user_id": user_id}, {"user_email": user_email}],
            "created_at": {"$gte": thirty_days_ago}
        }))
        
        for j in journals: 
            j['entry_type'] = 'journal_entry'

        # Helper to safely get datetime
        def to_dt(val):
            if isinstance(val, datetime): return val
            if isinstance(val, str):
                try:
                    # Handle common ISO formats
                    return datetime.fromisoformat(val.replace("Z", "+00:00"))
                except: pass
            return None

        # Fetch Learned Words (Timeline activity tracking)
        learned_col = get_collection("learned_words")
        learned_words = list(learned_col.find({
            "$or": [{"user_id": user_id}, {"user_email": user_email}],
            "created_at": {"$gte": thirty_days_ago}
        }))
        
        # Fetch ALL Saved Words (For Vocabulary Audit - No 30-day limit here)
        saved_col = get_collection("saved_words")
        saved_words = list(saved_col.find({
            "$or": [{"user_id": user_id}, {"user_email": user_email}]
        }))
        
        processed_entries = []
        seen_word_names = set()

        # 1. Process Saved Words (EXCLUSIVELY for Vocabulary Audit)
        for w in saved_words:
            w_name = w.get("word", "").lower()
            if not w_name or w_name in seen_word_names:
                continue
            seen_word_names.add(w_name)
            
            dt = to_dt(w.get('created_at')) or datetime.utcnow()
            
            # Type 'learned_word' is the hook for the PDF Service Vocabulary Audit
            processed_entries.append({
                'entry_type': 'learned_word', 
                'created_at': dt,
                'word_details': {
                    'word': w.get('word'),
                    'core': w.get('core'),
                    'category': w.get('category'),
                    'metadata': w.get('metadata', {})
                }
            })

        # 2. Process Learned (Searched) Words as 'seen_word' (Activity Grid only)
        for w in learned_words:
            # If already added as a saved word, skip to avoid double activity weight
            if w.get("word", "").lower() in seen_word_names:
                continue
                
            dt = to_dt(w.get('created_at')) or datetime.utcnow()
            processed_entries.append({
                'entry_type': 'seen_word',
                'created_at': dt
            })
        
        combined_entries = journals + processed_entries
        # Robust sort using the parsed datetimes
        combined_entries.sort(key=lambda x: x.get('created_at') or datetime.min)
        
        # 2. Generate PDF
        pdf_buffer = generate_monthly_report(user_email, combined_entries)
        
        # 3. Stream back
        return StreamingResponse(
            pdf_buffer,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f"attachment; filename=emolit_monthly_{user_email.split('@')[0]}.pdf"
            }
        )
    except Exception as e:
        logger.error(f"❌ Monthly Export failed: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Neural Engine Error: {str(e)}")
