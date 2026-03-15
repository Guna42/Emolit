import os

from dotenv import load_dotenv
from pymongo import MongoClient


load_dotenv()

# Module-level MongoDB client (singleton pattern)
_mongo_client = None
_users_collection = None


def _get_mongo_client():
    """Get or create MongoDB client instance."""
    global _mongo_client
    
    if _mongo_client is None:
        uri = os.getenv("MONGODB_URI", "").strip()
        if not uri:
            raise RuntimeError("MONGODB_URI is not configured.")
        
        try:
            _mongo_client = MongoClient(uri, serverSelectionTimeoutMS=5000)
            # Test the connection
            _mongo_client.admin.command('ping')
            print(f"✅ MongoDB connected successfully")
        except Exception as e:
            print(f"❌ MongoDB connection failed: {e}")
            raise RuntimeError(f"Failed to connect to MongoDB: {e}")
    
    return _mongo_client


def get_users_collection():
    """Get the users collection from MongoDB."""
    global _users_collection
    
    if _users_collection is None:
        client = _get_mongo_client()
        db_name = os.getenv("MONGODB_DB", "emolit").strip() or "emolit"
        
        db = client[db_name]
        _users_collection = db["users"]
        
        # Ensure unique index on email (only created once)
        try:
            _users_collection.create_index("email", unique=True)
        except Exception as e:
            print(f"⚠️ Warning: Could not create index: {e}")
    
    return _users_collection

