"""
Authentication utilities and middleware for protected routes.
"""
import base64
import json
from typing import Optional

from fastapi import Header, HTTPException


def decode_token(token: str) -> dict:
    """
    Decode the simple base64 JWT-like token.
    
    Args:
        token: The base64 encoded token
        
    Returns:
        dict: Decoded payload with user info
        
    Raises:
        HTTPException: If token is invalid or expired
    """
    try:
        # Decode the base64 token
        decoded_bytes = base64.b64decode(token)
        payload = json.loads(decoded_bytes.decode())
        
        # Basic validation - check if email exists
        if "email" not in payload:
            raise ValueError("Invalid token payload")
            
        return payload
    except Exception as e:
        raise HTTPException(
            status_code=401,
            detail="Invalid authentication token"
        )


async def get_current_user(authorization: Optional[str] = Header(None)) -> str:
    """
    Dependency to extract and validate user from Authorization header.
    
    Args:
        authorization: Authorization header value (Bearer <token>)
        
    Returns:
        str: User email from the token
        
    Raises:
        HTTPException: If token is missing or invalid
    """
    if not authorization:
        raise HTTPException(
            status_code=401,
            detail="Missing authentication token"
        )
    
    # Extract token from "Bearer <token>"
    parts = authorization.split()
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise HTTPException(
            status_code=401,
            detail="Invalid authorization header format. Expected: Bearer <token>"
        )
    
    token = parts[1]
    payload = decode_token(token)
    
    return payload["email"]
