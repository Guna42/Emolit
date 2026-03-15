"""
Quick test script to verify MongoDB connection
"""
import os
from dotenv import load_dotenv

load_dotenv()

# Import after loading .env
from app.auth_db import get_users_collection

def test_connection():
    print("🔍 Testing MongoDB connection...")
    print(f"MONGODB_URI: {os.getenv('MONGODB_URI', 'NOT SET')[:50]}...")
    print(f"MONGODB_DB: {os.getenv('MONGODB_DB', 'NOT SET')}")
    
    try:
        users = get_users_collection()
        count = users.count_documents({})
        print(f"✅ Successfully connected to MongoDB!")
        print(f"📊 Total users in database: {count}")
        
        # List some users (without passwords)
        if count > 0:
            print("\n👥 Existing users:")
            for user in users.find().limit(5):
                print(f"  - {user.get('email')} (Name: {user.get('full_name', 'N/A')})")
        else:
            print("\n📝 No users found. You'll need to register first.")
            
    except Exception as e:
        print(f"❌ Connection failed: {type(e).__name__}")
        print(f"   Error: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_connection()
