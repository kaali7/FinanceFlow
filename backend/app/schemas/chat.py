from pydantic import BaseModel

class ChatRequest(BaseModel):
    message: str
    user_id: str # For context retrieval

class ChatResponse(BaseModel):
    response: str
