import pymongo
import os
from dotenv import load_dotenv

load_dotenv()

def dump_users():
    uri = os.getenv("MONGODB_URI")
    db_name = os.getenv("MONGODB_DB", "emolit")
    client = pymongo.MongoClient(uri)
    db = client[db_name]
    
    print(f"Dumping User Metadata for Debug...")
    users = list(db["users"].find())
    for u in users:
        email = u.get("email")
        # Check password fields
        pw_field = "hashed_password" if "hashed_password" in u else ("password" if "password" in u else "NONE")
        pw_val = str(u.get(pw_field, ""))
        
        # Identity hash type by prefix
        pw_info = "Unknown"
        if pw_val.startswith("$2b$") or pw_val.startswith("$2a$"):
            pw_info = "BCRYPT"
        elif pw_val:
            pw_info = "PLAIN or Other"
            
        print(f"User: {email} | Field: {pw_field} | Type: {pw_info} | Length: {len(pw_val)}")

if __name__ == "__main__":
    dump_users()
