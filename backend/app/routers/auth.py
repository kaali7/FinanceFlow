from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel
from app.services.auth_service import signup, login, get_user_by_token
from app.core.config import supabase
from app.schemas.profile import ProfileData

router = APIRouter(prefix="/auth", tags=["Auth"])

class SignupRequest(BaseModel):
    username: str
    password: str

class LoginRequest(BaseModel):
    username: str
    password: str

@router.post("/signup")
def signup_endpoint(req: SignupRequest):
    created = signup(req.username, req.password)
    # If signup failed, it likely means username exists
    if not created:
        raise HTTPException(status_code=400, detail="Username already exists")
    return {"message": "Account created"}

@router.post("/login")
def login_endpoint(req: LoginRequest):
    token_data = login(req.username, req.password)
    if not token_data:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return token_data

@router.get("/profile")
def get_profile(authorization: str | None = Header(default=None)):
    user_id = get_user_by_token(authorization) if authorization else None
    if not user_id:
        raise HTTPException(status_code=401, detail="Login required")
    res = supabase.table("profiles").select("*").eq("user_id", user_id).execute().data
    if not res:
        return {"monthly_income": 0, "savings_rate": 0.2}
    return {"monthly_income": float(res[0].get("monthly_income") or 0), "savings_rate": float(res[0].get("savings_rate") or 0.2)}

@router.put("/profile")
def update_profile(data: ProfileData, authorization: str | None = Header(default=None)):
    user_id = get_user_by_token(authorization) if authorization else None
    if not user_id:
        raise HTTPException(status_code=401, detail="Login required")
    existing = supabase.table("profiles").select("*").eq("user_id", user_id).execute().data
    payload = {"user_id": user_id, "monthly_income": data.monthly_income or 0, "savings_rate": data.savings_rate or 0.2}
    if existing:
        supabase.table("profiles").update(payload).eq("user_id", user_id).execute()
    else:
        supabase.table("profiles").insert(payload).execute()
    return {"message": "Profile saved"}
