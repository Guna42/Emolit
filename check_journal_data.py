"""
Quick script to check journal entries in MongoDB.
Run this to see all stored journal entries.
"""
import os
from dotenv import load_dotenv
from pymongo import MongoClient

load_dotenv()

# Connect to MongoDB
uri = os.getenv("MONGODB_URI", "").strip()
db_name = os.getenv("MONGODB_DB", "emolit").strip()

if not uri:
    print("❌ MONGODB_URI not found in .env")
    exit(1)

client = MongoClient(uri)
db = client[db_name]
collection = db["journal_entries"]

# Count total entries
total_count = collection.count_documents({})
print(f"\n{'='*60}")
print(f"📊 Total Journal Entries in Database: {total_count}")
print(f"{'='*60}\n")

if total_count == 0:
    print("❌ No journal entries found yet.")
    print("💡 Try submitting a journal entry from the app first!\n")
else:
    print("✅ Found journal entries! Here they are:\n")
    
    # Get all entries, sorted by newest first
    entries = collection.find().sort("created_at", -1).limit(10)
    
    for i, entry in enumerate(entries, 1):
        print(f"{'─'*60}")
        print(f"Entry #{i}")
        print(f"{'─'*60}")
        print(f"📧 User Email: {entry.get('user_email')}")
        print(f"📅 Created At: {entry.get('created_at')}")
        print(f"📝 Entry Text: {entry.get('entry_text')[:100]}...")
        
        # Show detected emotions
        emotions = entry.get('ai_analysis', {}).get('detected_emotions', [])
        if emotions:
            emotion_words = [e.get('word', 'N/A') for e in emotions]
            print(f"😊 Detected Emotions: {', '.join(emotion_words)}")
        
        print(f"💭 Observation: {entry.get('ai_analysis', {}).get('emotional_observation', 'N/A')[:80]}...")
        print()
    
    if total_count > 10:
        print(f"\n📌 Showing latest 10 of {total_count} total entries\n")

print(f"{'='*60}\n")

# Show entries grouped by user
print("\n📊 Entries by User:")
print(f"{'─'*60}")
pipeline = [
    {"$group": {"_id": "$user_email", "count": {"$sum": 1}}},
    {"$sort": {"count": -1}}
]
user_stats = list(collection.aggregate(pipeline))

for stat in user_stats:
    print(f"  👤 {stat['_id']}: {stat['count']} entries")

print(f"{'─'*60}\n")
