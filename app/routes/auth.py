from datetime import datetime, timedelta
from typing import Optional
import os

from fastapi import APIRouter, HTTPException
from passlib.context import CryptContext
from pydantic import BaseModel, EmailStr, Field

from app.auth_db import get_users_collection


router = APIRouter(prefix="/auth", tags=["auth"])

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT settings
SECRET_KEY = os.getenv("JWT_SECRET_KEY", "your-secret-key-change-this-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_DAYS = 30


class RegisterRequest(BaseModel):
  email: EmailStr = Field(..., description="User email")
  password: str = Field(..., min_length=8, description="Password (min 8 characters)")
  full_name: Optional[str] = Field(default=None, description="Optional display name")


class LoginRequest(BaseModel):
  email: EmailStr
  password: str


class AuthUser(BaseModel):
  email: EmailStr
  full_name: Optional[str] = None


class AuthResponse(BaseModel):
  message: str
  user: AuthUser
  token: str


def _hash_password(password: str) -> str:
  return pwd_context.hash(password)


def _verify_password(plain_password: str, hashed_password: str) -> bool:
  return pwd_context.verify(plain_password, hashed_password)


def _create_access_token(email: str) -> str:
  """Create a simple JWT-like token (base64 encoded email with timestamp)"""
  import base64
  import json
  
  payload = {
    "email": email,
    "exp": (datetime.utcnow() + timedelta(days=ACCESS_TOKEN_EXPIRE_DAYS)).isoformat()
  }
  
  # Simple token: base64 encode the payload
  token_data = json.dumps(payload)
  token = base64.b64encode(token_data.encode()).decode()
  
  return token


@router.post("/register", response_model=AuthResponse)
def register_user(payload: RegisterRequest):
  try:
    users = get_users_collection()
    email = payload.email.lower()

    if users.find_one({"email": email}):
      raise HTTPException(status_code=400, detail="An account with this email already exists.")

    password_hash = _hash_password(payload.password)

    doc = {
      "email": email,
      "password_hash": password_hash,
      "full_name": payload.full_name,
      "created_at": datetime.utcnow(),
    }

    users.insert_one(doc)
    
    # Generate access token
    token = _create_access_token(email)

    return AuthResponse(
      message="Account created successfully.",
      user=AuthUser(email=email, full_name=payload.full_name),
      token=token,
    )
  except HTTPException:
    # Re-raise HTTP exceptions (like 400 for duplicate email)
    raise
  except Exception as e:
    # Log and return a more helpful error for debugging
    print(f"❌ Registration error: {type(e).__name__}: {str(e)}")
    import traceback
    traceback.print_exc()
    raise HTTPException(
      status_code=500, 
      detail=f"Registration failed: {type(e).__name__}: {str(e)}"
    )


@router.post("/login", response_model=AuthResponse)
def login_user(payload: LoginRequest):
  try:
    users = get_users_collection()
    email = payload.email.lower()

    user = users.find_one({"email": email})
    if not user or not _verify_password(payload.password, user.get("password_hash", "")):
      raise HTTPException(status_code=401, detail="Invalid email or password.")
    
    # Generate access token
    token = _create_access_token(email)

    return AuthResponse(
      message="Login successful.",
      user=AuthUser(email=email, full_name=user.get("full_name")),
      token=token,
    )
  except HTTPException:
    # Re-raise HTTP exceptions (like 401 for invalid credentials)
    raise
  except Exception as e:
    # Log and return a more helpful error for debugging
    print(f"❌ Login error: {type(e).__name__}: {str(e)}")
    import traceback
    traceback.print_exc()
    raise HTTPException(
      status_code=500, 
      detail=f"Login failed: {type(e).__name__}: {str(e)}"
    )

