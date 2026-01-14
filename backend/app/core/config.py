from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Finance Assistant"
    PROJECT_VERSION: str = "1.0.0"
    SUPABASE_URL: str
    SUPABASE_KEY: str
    GOOGLE_API_KEY: str
    
    # JWT Config
    SECRET_KEY: str = "CHANGE_THIS_TO_A_SECURE_SECRET_KEY_IN_PRODUCTION" 
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 # 1 day

    class Config:
        env_file = ".env"

settings = Settings()

from supabase import create_client, Client
supabase: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
