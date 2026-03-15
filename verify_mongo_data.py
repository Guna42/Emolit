import pymongo
import os
from dotenv import load_dotenv
from pprint import pprint

load_dotenv()

def verify_mongo():
    uri = os.getenv("MONGODB_URI")
    db_name = os.getenv("MONGODB_DB", "emolit")
    
    print(f"📡 Probing MongoDB: {db_name}")
    try:
        # 5 second timeout to avoid hanging
        client = pymongo.MongoClient(uri, serverSelectionTimeoutMS=5000)
        client.server_info() # Trigger connection check
        db = client[db_name]
        
        print("\n--- 📚 COLLECTIONS ---")
        collections = db.list_collection_names()
        print(collections if collections else "No collections found.")
        
        for col_name in ["learned_words", "journal_entries"]:
            print(f"\n--- ✨ {col_name.upper()} ---")
            docs = list(db[col_name].find().sort("created_at", -1).limit(3))
            if not docs:
                print(f"❌ No data in '{col_name}'.")
            for doc in docs:
                pprint(doc)
    except Exception as e:
        print(f"❌ CONNECTION ERROR: {str(e)}")
        print("\n💡 TIP: Check if your local IP is whitelisted in MongoDB Atlas Network Access.")

if __name__ == "__main__":
    verify_mongo()
