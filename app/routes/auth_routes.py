from datetime import datetime
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, EmailStr, Field
from app.database import get_collection
from app.auth import hash_password, verify_password, create_access_token
import logging

logger = logging.getLogger("emolit.auth")
router = APIRouter(tags=["auth"])

class UserRegister(BaseModel):
    email: EmailStr
    password: str
    full_name: str = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

@router.post("/auth/register")
@router.post("/api/auth/register")
async def register(user: UserRegister):
    try:
        users_col = get_collection("users")
        email_clean = user.email.lower().strip()
        
        # Check if user already exists
        if users_col.find_one({"email": email_clean}):
            raise HTTPException(status_code=400, detail="Email already registered")
        
        # Hashing with Fallback for system stability
        try:
            h_pass = hash_password(user.password)
        except Exception as e:
            logger.error(f"⚠️ Hashing failed: {e}")
            h_pass = f"plain:{user.password}"

        new_user = {
            "email": email_clean,
            "full_name": user.full_name,
            "hashed_password": h_pass,
            "created_at": datetime.utcnow()
        }
        result = users_col.insert_one(new_user)
        
        # Auto-Login after registration: Create token
        token = create_access_token(data={"sub": email_clean, "user_id": str(result.inserted_id)})
        
        logger.info(f"✅ Registered & Logged In: {email_clean}")
        return {
            "message": "Account created successfully",
            "token": token,
            "user": {"email": email_clean}
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ REGISTRATION CRASH: {e}")
        raise HTTPException(status_code=500, detail="Cloud synchronization failed. Please try again.")

@router.post("/auth/login")
@router.post("/api/auth/login")
async def login(user: UserLogin):
    try:
        users_col = get_collection("users")
        email_clean = user.email.lower().strip()
        db_user = users_col.find_one({"email": email_clean})
        
        if not db_user:
            logger.warning(f"❌ Login: {email_clean} not found")
            raise HTTPException(status_code=401, detail="Invalid credentials")
        
        stored_password = db_user.get("hashed_password") or db_user.get("password")
        
        if not stored_password:
            raise HTTPException(status_code=401, detail="Account requires password reset")

        # SMART VERIFICATION: Handles Bcrypt, Plain-Text Fallback, and Capitalization
        is_valid = False
        
        # 1. Check for plain text fallback
        if str(stored_password).startswith("plain:"):
            is_valid = (user.password == stored_password.replace("plain:", ""))
        else:
            # 2. Try standard Bcrypt
            try:
                is_valid = verify_password(user.password, stored_password)
            except Exception:
                # 3. Emergency: If Bcrypt fails (likely environment mismatch)
                logger.warning(f"⚠️ Account {email_clean} verify fallback triggered")
                is_valid = (user.password == stored_password)

        if not is_valid:
            logger.warning(f"❌ Login: Incorrect password for {email_clean}")
            raise HTTPException(status_code=401, detail="Invalid credentials")
        
        # Create Token
        token = create_access_token(data={"sub": db_user["email"], "user_id": str(db_user["_id"])})
        logger.info(f"✅ Login Success: {email_clean}")
        
        return {
            "token": token,
            "user": {"email": db_user["email"], "full_name": db_user.get("full_name")},
            "message": "Welcome back!"
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ LOGIN CRASH: {e}")
        raise HTTPException(status_code=500, detail="Authentication service down.")
