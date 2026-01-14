from app.core.config import supabase, settings
from app.core.security import verify_password, get_password_hash, create_access_token
from jose import jwt, JWTError

def signup(username: str, password: str):
    existing = supabase.table("users").select("id").eq("username", username).execute().data
    if existing:
        return None
    hashed_pw = get_password_hash(password)
    # We no longer need salt column, but schema might still have it. We just store hash.
    created = supabase.table("users").insert({
        "username": username,
        "password_hash": hashed_pw,
        "salt": "" # Schema compatibility if strict, otherwise ignore
    }).execute().data
    
    if not created:
        return None
    return created[0]

def login(username: str, password: str):
    res = supabase.table("users").select("*").eq("username", username).execute().data
    if not res:
        return None
    user = res[0]
    if not verify_password(password, user["password_hash"]):
        return None
    
    access_token = create_access_token(subject=user["id"])
    return {"access_token": access_token, "token_type": "bearer", "user_id": user["id"]}

def get_user_by_token(token: str | None):
    if not token:
        return None
    try:
        # Remove 'Bearer ' prefix if present
        if token.lower().startswith("bearer "):
            token = token[7:]
            
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id: str = payload.get("sub")
        return user_id
    except JWTError:
        return None
