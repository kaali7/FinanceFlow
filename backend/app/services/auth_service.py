"""
Authentication service module.
Handles user registration, login, and token verification.
"""

from app.core.config import supabase, settings
from app.core.security import verify_password, get_password_hash, create_access_token
from jose import jwt, JWTError

def signup(username: str, password: str):
    """
    Register a new user in the system.
    
    Args:
        username: Unique username for the new user
        password: Plain text password (will be hashed before storage)
        
    Returns:
        dict: Created user object if successful, None if username already exists
    """
    # Check if username already exists
    existing = supabase.table("users").select("id").eq("username", username).execute().data
    if existing:
        return None  # Username taken
    
    # Hash the password for secure storage
    hashed_pw = get_password_hash(password)
    
    # Create new user record
    # Note: salt field kept for schema compatibility (Argon2 handles salt internally)
    created = supabase.table("users").insert({
        "username": username,
        "password_hash": hashed_pw,
        "salt": ""  # Schema compatibility if strict, otherwise ignore
    }).execute().data
    
    if not created:
        return None
    return created[0]

def login(username: str, password: str):
    """
    Authenticate a user and generate access token.
    
    Args:
        username: Username to authenticate
        password: Plain text password to verify
        
    Returns:
        dict: Contains access_token, token_type, and user_id if successful
        None: If authentication fails
    """
    # Fetch user from database
    res = supabase.table("users").select("*").eq("username", username).execute().data
    if not res:
        return None  # User not found
    
    user = res[0]
    
    # Verify password against stored hash
    if not verify_password(password, user["password_hash"]):
        return None  # Invalid password
    
    # Generate JWT access token
    access_token = create_access_token(subject=user["id"])
    return {"access_token": access_token, "token_type": "bearer", "user_id": user["id"]}

def get_user_by_token(token: str | None):
    """
    Extract and verify user ID from JWT token.
    
    Args:
        token: JWT token (with or without 'Bearer ' prefix)
        
    Returns:
        str: User ID if token is valid
        None: If token is invalid or expired
    """
    if not token:
        return None
    
    try:
        # Remove 'Bearer ' prefix if present
        if token.lower().startswith("bearer "):
            token = token[7:]
        
        # Decode and verify JWT token
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id: str = payload.get("sub")
        return user_id
    except JWTError:
        return None  # Invalid or expired token
