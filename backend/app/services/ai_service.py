from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from langchain.memory import ConversationBufferMemory
from langchain.chains import LLMChain
from app.core.config import GOOGLE_API_KEY
import os

# Initialize Gemini
# Ensure GOOGLE_API_KEY is set
if not GOOGLE_API_KEY:
    print("Warning: GOOGLE_API_KEY not found.")

llm = ChatGoogleGenerativeAI(model="gemini-pro", google_api_key=GOOGLE_API_KEY, convert_system_message_to_human=True)

# System Prompt
system_template = """
You are a helpful and ethical Financial Literacy Assistant. 
Your goal is to educate users about budgeting, saving, and managing their finances responsibly.

IMPORTANT RULES:
1. DO NOT give financial advice (investment, trading, crypto, specific stocks).
2. If asked for advice, politely decline and explain you are an educational tool.
3. Focus on concepts: budgeting methods (50/30/20), saving tips, explaining terms (APR, compound interest).
4. Be encouraging and beginner-friendly.
5. Use the user's provided financial context if available to give personalized *educational* insights, not advice.

Current Context:
{context}

User Question: {question}
"""

prompt = ChatPromptTemplate.from_template(system_template)

# Simple chain for now, can be expanded with memory
# In a real API, memory handling usually requires storing session_id and history in DB
def get_ai_response(question: str, context: str = ""):
    try:
        if not GOOGLE_API_KEY:
            return "AI service is not configured (Missing API Key)."
            
        chain = prompt | llm
        response = chain.invoke({"question": question, "context": context})
        return response.content
    except Exception as e:
        return f"Error communicating with AI: {str(e)}"
