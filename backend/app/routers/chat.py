from fastapi import APIRouter
from app.schemas.chat import ChatRequest, ChatResponse
from app.services.ai_service import get_ai_response
from app.services.finance_service import calculate_summary
from datetime import date

router = APIRouter(prefix="/chat", tags=["Chat"])

@router.post("/", response_model=ChatResponse)
def chat_endpoint(request: ChatRequest):
    # Fetch context (current month's summary) to give AI some financial awareness
    current_month = date.today().strftime("%Y-%m")
    # Mock user_id
    user_id = "00000000-0000-0000-0000-000000000000"
    
    summary = calculate_summary(user_id, current_month)
    context_str = f"User's Financial Status for {current_month}: {summary.model_dump_json()}"
    
    response_text = get_ai_response(request.message, context=context_str)
    return ChatResponse(response=response_text)
