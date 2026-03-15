"""
Database utilities for journal entries storage.
"""
import os
from datetime import datetime

from dotenv import load_dotenv
from pymongo import MongoClient, DESCENDING


load_dotenv()


def get_journal_collection():
    """Get the journal entries collection from MongoDB."""
    uri = os.getenv("MONGODB_URI", "").strip()
    if not uri:
        raise RuntimeError("MONGODB_URI is not configured.")

    db_name = os.getenv("MONGODB_DB", "emolit").strip() or "emolit"

    client = MongoClient(uri)
    db = client[db_name]
    journal_entries = db["journal_entries"]

    # Create indexes for efficient querying
    # Index on user_email for fast user-specific queries
    journal_entries.create_index("user_email")
    # Index on created_at for date-based sorting/filtering
    journal_entries.create_index([("created_at", DESCENDING)])
    # Compound index for user + date queries
    journal_entries.create_index([("user_email", 1), ("created_at", DESCENDING)])

    return journal_entries


def save_journal_entry(
    user_email: str,
    entry_text: str,
    detected_emotions: list,
    emotional_observation: str,
    pattern_insight: str,
    reflection_question: str,
    regulation_suggestion: str,
):
    """
    Save a journal entry with AI analysis to the database.
    
    Args:
        user_email: Email of the user who created the entry
        entry_text: The original journal entry text
        detected_emotions: List of detected emotions from AI analysis
        emotional_observation: AI's emotional observation
        pattern_insight: AI's pattern insight
        reflection_question: AI's reflection question
        regulation_suggestion: AI's regulation suggestion
    
    Returns:
        str: The inserted document ID
    """
    collection = get_journal_collection()
    
    document = {
        "user_email": user_email,
        "entry_text": entry_text,
        "ai_analysis": {
            "detected_emotions": detected_emotions,
            "emotional_observation": emotional_observation,
            "pattern_insight": pattern_insight,
            "reflection_question": reflection_question,
            "regulation_suggestion": regulation_suggestion,
        },
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
    }
    
    result = collection.insert_one(document)
    return str(result.inserted_id)


def get_user_journal_entries(user_email: str, limit: int = 50, skip: int = 0):
    """
    Get journal entries for a specific user, sorted by most recent first.
    
    Args:
        user_email: Email of the user
        limit: Maximum number of entries to return
        skip: Number of entries to skip (for pagination)
    
    Returns:
        list: List of journal entry documents
    """
    collection = get_journal_collection()
    
    entries = collection.find(
        {"user_email": user_email}
    ).sort("created_at", DESCENDING).skip(skip).limit(limit)
    
    return list(entries)


def get_user_journal_count(user_email: str):
    """Get the total count of journal entries for a user."""
    collection = get_journal_collection()
    return collection.count_documents({"user_email": user_email})


def get_journal_entries_by_date_range(user_email: str, start_date: datetime, end_date: datetime):
    """
    Get journal entries for a user within a specific date range.
    Useful for analyzing patterns over time.
    
    Args:
        user_email: Email of the user
        start_date: Start date (inclusive)
        end_date: End date (inclusive)
    
    Returns:
        list: List of journal entry documents
    """
    collection = get_journal_collection()
    
    entries = collection.find({
        "user_email": user_email,
        "created_at": {
            "$gte": start_date,
            "$lte": end_date
        }
    }).sort("created_at", DESCENDING)
    
    return list(entries)
