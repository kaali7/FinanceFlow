"""
AI service module using Google's Gemini AI.
Provides financial literacy education through conversational AI.
"""

from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from app.core.config import settings
import os

# Validate API key availability
if not settings.GOOGLE_API_KEY:
    print("Warning: GOOGLE_API_KEY not found.")

# Initialize Gemini AI model
# Using gemini-2.5-flash for fast, cost-effective responses
# convert_system_message_to_human=True ensures compatibility with Gemini's message format
llm = ChatGoogleGenerativeAI(
    model="models/gemini-2.5-flash", 
    google_api_key=settings.GOOGLE_API_KEY, 
    convert_system_message_to_human=True
)

# System prompt template for the AI assistant
# This defines the AI's personality, boundaries, and behavior
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

# Create prompt template for LangChain
prompt = ChatPromptTemplate.from_template(system_template)

def get_ai_response(question: str, context: str = ""):
    """
    Generate an AI response to a user's financial literacy question.
    
    The AI is configured to provide educational content only, not financial advice.
    It can use the user's financial context to personalize educational insights.
    
    Args:
        question: The user's question about finance
        context: Optional financial context (e.g., current budget status)
        
    Returns:
        str: AI-generated educational response
    """
    try:
        # Verify API key is configured
        if not settings.GOOGLE_API_KEY:
            return "AI service is not configured (Missing API Key)."
        
        # Create LangChain chain: prompt -> LLM
        chain = prompt | llm
        
        # Invoke the chain with user question and context
        response = chain.invoke({"question": question, "context": context})
        return response.content
    except Exception as e:
        # Return error message if AI service fails
        return f"Error communicating with AI: {str(e)}"
