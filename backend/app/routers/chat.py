from fastapi import APIRouter, Header, HTTPException
from app.schemas.chat import ChatRequest, ChatResponse
from app.services.ai_service import get_ai_response
from app.services.finance_service import calculate_summary
from datetime import date
import time
import httpx

router = APIRouter(prefix="/chat", tags=["Chat"])

from app.core.config import supabase

def safe_db_insert(table: str, data: dict):
    for attempt in range(3):
        try:
            supabase.table(table).insert(data).execute()
            break
        except (httpx.ReadError, httpx.ConnectError, httpx.RemoteProtocolError):
            if attempt == 2:
                raise
            time.sleep(0.5)

@router.get("/history")
def get_chat_history(authorization: str | None = Header(default=None)):
    from app.services.auth_service import get_user_by_token
    user_id = get_user_by_token(authorization) if authorization else None
    if not user_id:
         raise HTTPException(status_code=401, detail="Login required")
    
    # Fetch last 50 messages
    response = supabase.table("chat_history").select("*").eq("user_id", user_id).order("created_at", desc=False).limit(50).execute()
    return response.data

@router.delete("/history")
def clear_chat_history(authorization: str | None = Header(default=None)):
    from app.services.auth_service import get_user_by_token
    user_id = get_user_by_token(authorization) if authorization else None
    if not user_id:
         raise HTTPException(status_code=401, detail="Login required")
    
    supabase.table("chat_history").delete().eq("user_id", user_id).execute()
    return {"message": "Chat history cleared"}

@router.post("/generate", response_model=ChatResponse)
def chat_endpoint(request: ChatRequest, authorization: str | None = Header(default=None)):
    from app.services.auth_service import get_user_by_token
    
    user_id = get_user_by_token(authorization) if authorization else None
    if not user_id:
        context_str = "User is not logged in."
    else:
        # Fetch context (current month's summary)
        current_month = date.today().strftime("%Y-%m")
        summary = calculate_summary(user_id, current_month)
        context_str = f"User's Financial Status for {current_month}: {summary.model_dump_json()}"
        
        # Save User Message
        safe_db_insert("chat_history", {
            "user_id": user_id,
            "role": "user",
            "content": request.message
        })
    
    response_text = get_ai_response(request.message, context=context_str)
    
    if user_id:
        # Save AI Response
        safe_db_insert("chat_history", {
            "user_id": user_id,
            "role": "assistant",
            "content": response_text
        })

    return ChatResponse(response=response_text)
