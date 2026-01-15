"""
Configuration module for the Finance Assistant application.
This module manages all application settings including database connections,
API keys, and security configurations.
"""

from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    """
    Application settings loaded from environment variables.
    Uses Pydantic for validation and type checking.
    """
    
    # Application metadata
    PROJECT_NAME: str = "Finance Assistant"
    PROJECT_VERSION: str = "1.0.0"
    
    # Supabase configuration - Database and authentication backend
    SUPABASE_URL: str  # URL of your Supabase project
    SUPABASE_KEY: str  # Supabase anon/public API key
    
    # Google Gemini AI configuration
    GOOGLE_API_KEY: str  # API key for Google's Gemini AI model
    
    # JWT (JSON Web Token) Configuration for user authentication
    SECRET_KEY: str = "CHANGE_THIS_TO_A_SECURE_SECRET_KEY_IN_PRODUCTION"  # Must be changed in production!
    ALGORITHM: str = "HS256"  # Algorithm used for JWT encoding
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # Token validity: 1 day

    class Config:
        """Pydantic configuration - loads settings from .env file"""
        env_file = ".env"

# Global settings instance - used throughout the application
settings = Settings()

# Initialize Supabase client for database operations
from supabase import create_client, Client
supabase: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
