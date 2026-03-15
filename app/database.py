import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

class Database:
    client: MongoClient = None
    db = None

    @classmethod
    def connect(cls):
        mongo_uri = os.getenv("MONGODB_URI")
        if not mongo_uri:
            raise RuntimeError("MONGODB_URI not found in environment variables")
        
        db_name = os.getenv("MONGODB_DB", "emolit")
        cls.client = MongoClient(mongo_uri)
        cls.db = cls.client[db_name]
        print(f"✅ Connected to MongoDB: {db_name}")

    @classmethod
    def get_db(cls):
        if cls.db is None:
            cls.connect()
        return cls.db

    @classmethod
    def close(cls):
        if cls.client:
            cls.client.close()
            print("❌ MongoDB connection closed")

# Convenience functions
def get_db():
    return Database.get_db()

def get_collection(name: str):
    return Database.get_db()[name]
