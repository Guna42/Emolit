import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

def test_db():
    uri = os.getenv("MONGODB_URI")
    db_name = os.getenv("MONGODB_DB", "emolit")
    print(f"Testing URI: {uri}")
    print(f"Database: {db_name}")
    
    try:
        client = MongoClient(uri, serverSelectionTimeoutMS=5000)
        # Force a connection
        client.admin.command('ping')
        print("✅ MongoDB connection successful.")
        
        db = client[db_name]
        collections = db.list_collection_names()
        print(f"Collections: {collections}")
        
    except Exception as e:
        print(f"❌ MongoDB connection failed: {e}")

if __name__ == "__main__":
    test_db()
