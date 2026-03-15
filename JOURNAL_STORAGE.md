# Journal Storage System Documentation

## Overview
The Emolit journal storage system saves user journal entries with AI analysis for future predictions and pattern analysis.

## Features

### ✅ **What's Implemented:**

1. **User-Specific Storage**
   - Each journal entry is linked to a user via their email
   - Complete data isolation between users
   - No cross-user data leakage

2. **Timestamp Tracking**
   - Every entry has `created_at` timestamp (UTC)
   - Enables time-series analysis
   - Shows progression over time

3. **AI Analysis Storage**
   - Detected emotions (words, cores, categories)
   - Emotional observations
   - Pattern insights
   - Reflection questions
   - Regulation suggestions

4. **Database Optimization**
   - Indexed on user_email for fast queries
   - Indexed on created_at for date sorting
   - Compound index for user+date queries
   - Efficient pagination support

## Database Schema

### Collection: `journal_entries`

```json
{
  "_id": "ObjectId(...)",
  "user_email": "user@example.com",
  "entry_text": "Today I felt overwhelmed with work...",
  "ai_analysis": {
    "detected_emotions": [
      {
        "word": "overwhelmed",
        "core": "fear",
        "category": "anxious"
      }
    ],
    "emotional_observation": "You seem to be experiencing...",
    "pattern_insight": "This is a recurring theme...",
    "reflection_question": "What triggered this feeling?",
    "regulation_suggestion": "Try taking a 5-minute break..."
  },
  "created_at": "2026-02-14T06:00:00.000Z",
  "updated_at": "2026-02-14T06:00:00.000Z"
}
```

## API Endpoints

### 1. Submit Journal Entry (with storage)
**POST** `/journal`

**Headers:**
```
Authorization: Bearer <token>
```

**Request:**
```json
{
  "entry": "Your journal text here (min 10 characters)"
}
```

**Response:**
```json
{
  "detected_emotions": [...],
  "emotional_observation": "...",
  "pattern_insight": "...",
  "reflection_question": "...",
  "regulation_suggestion": "...",
  "saved": true,
  "entry_id": "65d3f..."
}
```

### 2. Get Journal History
**GET** `/journal/history?page=1&page_size=10`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "entries": [
    {
      "entry_id": "65d3f...",
      "entry_text": "...",
      "detected_emotions": [...],
      "emotional_observation": "...",
      "pattern_insight": "...",
      "reflection_question": "...",
      "regulation_suggestion": "...",
      "created_at": "2026-02-14T06:00:00Z"
    }
  ],
  "total_count": 25,
  "page": 1,
  "page_size": 10
}
```

### 3. Get Journal Statistics
**GET** `/journal/stats`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "total_entries": 25,
  "date_range_start": "2026-01-01T00:00:00Z",
  "date_range_end": "2026-02-14T06:00:00Z",
  "top_emotions": [
    {
      "emotion_word": "grateful",
      "core_emotion": "joy",
      "count": 15
    },
    {
      "emotion_word": "anxious",
      "core_emotion": "fear",
      "count": 10
    }
  ]
}
```

## Files Created/Modified

### New Files:
1. **`app/journal_db.py`** - Database utilities for journal storage
2. **`app/auth_utils.py`** - Authentication middleware
3. **`app/routes/journal_history.py`** - History and stats endpoints

### Modified Files:
1. **`app/routes/journal.py`** - Added authentication and storage
2. **`app/main.py`** - Registered journal_history router

## Future Prediction Capabilities

### Data Available for Predictions:

1. **Emotional Patterns Over Time**
   - Frequency of specific emotions
   - Trends in emotional states
   - Trigger identification

2. **Text Analysis**
   - Common themes and topics
   - Language patterns
   - Sentiment progression

3. **Time-Based Insights**
   - Day of week patterns
   - Time of day patterns
   - Seasonal variations

4. **Correlation Analysis**
   - Emotion combinations
   - Cause-effect relationships
   - Coping strategy effectiveness

## Usage Examples

### Save and Retrieve Entries:

```python
# In your ML model (future):
from app.journal_db import get_user_journal_entries, get_journal_entries_by_date_range
from datetime import datetime, timedelta

# Get last 30 days of entries
thirty_days_ago = datetime.utcnow() - timedelta(days=30)
entries = get_journal_entries_by_date_range(
    user_email="user@example.com",
    start_date=thirty_days_ago,
    end_date=datetime.utcnow()
)

# Analyze patterns
for entry in entries:
    emotions = entry["ai_analysis"]["detected_emotions"]
    # Your ML prediction logic here
```

## Testing

### Manual Testing:

1. **Login to get token:**
```bash
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

2. **Submit journal entry:**
```bash
curl -X POST http://localhost:8000/journal \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"entry":"Today I felt really happy and grateful for my friends."}'
```

3. **Get history:**
```bash
curl -X GET "http://localhost:8000/journal/history?page=1&page_size=10" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

4. **Get stats:**
```bash
curl -X GET http://localhost:8000/journal/stats \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Database Indexes

Automatically created for optimal performance:

1. `user_email` - Fast user lookups
2. `created_at` (descending) - Fast date sorting
3. `(user_email, created_at)` - Fast user+date queries

## Security

✅ **Authentication Required** - All journal endpoints require valid JWT token
✅ **User Isolation** - Users can only access their own data
✅ **Token Validation** - Invalid/expired tokens are rejected
✅ **Data Privacy** - No cross-user data exposure

## Next Steps for ML Integration

1. **Create ML model** to analyze patterns
2. **Add prediction endpoint** using stored data
3. **Implement trend analysis** over time periods
4. **Add emotion forecasting** based on history
5. **Create visualization** of emotional journey

## MongoDB Connection

Make sure your `.env` file has:

```env
MONGODB_URI=mongodb://localhost:27017/
MONGODB_DB=emolit
```

Or use MongoDB Atlas for cloud storage.
