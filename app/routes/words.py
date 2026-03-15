from fastapi import APIRouter, Depends, Query
from typing import List, Optional
from ..services.emotion_service import EmotionService, get_emotion_service
from ..models.emotion_model import WordSummary, WordDetail, DailyWordResponse, SearchResponse

router = APIRouter(prefix="/words", tags=["words"])


@router.get("", response_model=List[WordSummary])
async def get_words(
    core: Optional[str] = Query(None, description="Filter by core emotion"),
    category: Optional[str] = Query(None, description="Filter by category (requires core)"),
    emotion_service: EmotionService = Depends(get_emotion_service)
):
    """
    Get filtered list of words.
    
    Args:
        core: Optional filter by core emotion
        category: Optional filter by category (requires core parameter)
        
    Returns:
        List[WordSummary]: List of words with basic info
    """
    return emotion_service.get_words(core=core, category=category)


@router.get("/daily", response_model=DailyWordResponse)
async def get_daily_word(emotion_service: EmotionService = Depends(get_emotion_service)):
    """
    Get a random word from the entire dataset.
    
    Returns:
        DailyWordResponse: Random word with full metadata
    """
    return emotion_service.get_daily_word()


@router.get("/search", response_model=List[SearchResponse])
async def search_words(
    q: str = Query(..., min_length=1, description="Search query (case-insensitive)"),
    emotion_service: EmotionService = Depends(get_emotion_service)
):
    """
    Search words with case-insensitive partial matching.
    
    Args:
        q: Search query string
        
    Returns:
        List[SearchResponse]: List of matching words
    """
    return emotion_service.search_words(q)


@router.get("/{word_name}", response_model=WordDetail)
async def get_word_details(
    word_name: str,
    emotion_service: EmotionService = Depends(get_emotion_service)
):
    """
    Get full metadata for a specific word.
    
    Args:
        word_name: The word to look up
        
    Returns:
        WordDetail: Complete word information with metadata
    """
    return emotion_service.get_word_details(word_name)
