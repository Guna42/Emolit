from fastapi import APIRouter, Depends, Query
from typing import List, Optional
from ..services.emotion_service import EmotionService, get_emotion_service

router = APIRouter(prefix="/cores", tags=["emotions"])


@router.get("", response_model=List[str])
async def get_cores(emotion_service: EmotionService = Depends(get_emotion_service)):
    """
    Get all unique core emotions.
    
    Returns:
        List[str]: List of core emotion names
    """
    return emotion_service.get_cores()


@router.get("/{core}/categories", response_model=List[str])
async def get_categories(
    core: str,
    emotion_service: EmotionService = Depends(get_emotion_service)
):
    """
    Get all categories for a specific core emotion.
    
    Args:
        core: The core emotion name
        
    Returns:
        List[str]: List of category names for the given core
    """
    return emotion_service.get_categories(core)
