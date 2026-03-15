import json
import random
import os
from typing import List, Dict, Optional, Any
from fastapi import HTTPException
from ..models.emotion_model import WordDetail, WordSummary, DailyWordResponse, SearchResponse, EmotionMetadata


class EmotionService:
    def __init__(self):
        self.emotion_data: Dict[str, Any] = {}
        self._load_data()
    
    def _load_data(self) -> None:
        """Load emotion database once at startup."""
        try:
            base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            file_path = os.path.join(base_dir, "data", "emotion_database.json")
            
            with open(file_path, "r", encoding="utf-8") as file:
                self.emotion_data = json.load(file)
                
            # Flatten the nested structure for easier access
            self._flatten_data()
        except FileNotFoundError:
            raise HTTPException(status_code=500, detail="Emotion database file not found")
        except json.JSONDecodeError:
            raise HTTPException(status_code=500, detail="Invalid JSON format in emotion database")
    
    def _flatten_data(self) -> None:
        """Create flattened lookup structures for efficient access."""
        self.word_lookup: Dict[str, WordDetail] = {}
        self.core_categories: Dict[str, List[str]] = {}
        self.all_words: List[WordSummary] = []
        
        for core, categories in self.emotion_data.items():
            self.core_categories[core] = []
            
            for category, words in categories.items():
                self.core_categories[core].append(category)
                
                for word, metadata in words.items():
                    word_detail = WordDetail(
                        word=word,
                        core=core,
                        category=category,
                        metadata=EmotionMetadata(**metadata)
                    )
                    
                    self.word_lookup[word.lower()] = word_detail
                    self.all_words.append(WordSummary(
                        word=word,
                        core=core,
                        category=category
                    ))
    
    def get_cores(self) -> List[str]:
        """Get list of all core emotions."""
        return list(self.core_categories.keys())
    
    def get_categories(self, core: str) -> List[str]:
        """Get categories for a specific core emotion."""
        if core not in self.core_categories:
            raise HTTPException(status_code=404, detail=f"Core emotion '{core}' not found")
        return self.core_categories[core]
    
    def get_words(self, core: Optional[str] = None, category: Optional[str] = None) -> List[WordSummary]:
        """Get filtered list of words."""
        filtered_words = self.all_words
        
        if core:
            if core not in self.core_categories:
                raise HTTPException(status_code=404, detail=f"Core emotion '{core}' not found")
            filtered_words = [w for w in filtered_words if w.core == core]
        
        if category:
            if not core:
                raise HTTPException(status_code=400, detail="Core parameter required when filtering by category")
            if category not in self.core_categories[core]:
                raise HTTPException(status_code=404, detail=f"Category '{category}' not found in core '{core}'")
            filtered_words = [w for w in filtered_words if w.category == category]
        
        return filtered_words
    
    def get_word_details(self, word_name: str) -> WordDetail:
        """Get full metadata for a specific word."""
        word_lower = word_name.lower()
        if word_lower not in self.word_lookup:
            raise HTTPException(status_code=404, detail=f"Word '{word_name}' not found")
        return self.word_lookup[word_lower]
    
    def get_daily_word(self) -> DailyWordResponse:
        """Get a random word from the entire dataset."""
        if not self.all_words:
            raise HTTPException(status_code=500, detail="No words available in database")
        
        random_word = random.choice(self.all_words)
        word_detail = self.word_lookup[random_word.word.lower()]
        
        return DailyWordResponse(
            word=word_detail.word,
            core=word_detail.core,
            category=word_detail.category,
            metadata=word_detail.metadata
        )
    
    def search_words(self, query: str) -> List[SearchResponse]:
        """Search words with case-insensitive partial matching."""
        if not query or len(query.strip()) < 1:
            raise HTTPException(status_code=400, detail="Search query must be at least 1 character long")
        
        query_lower = query.lower().strip()
        results = []
        seen_words = set()
        
        for word_lower, word_detail in self.word_lookup.items():
            if query_lower in word_lower and word_detail.word not in seen_words:
                results.append(SearchResponse(
                    word=word_detail.word,
                    core=word_detail.core,
                    category=word_detail.category
                ))
                seen_words.add(word_detail.word)
        
        return results


# Dependency injection function
def get_emotion_service() -> EmotionService:
    """Create and return emotion service instance."""
    return EmotionService()
