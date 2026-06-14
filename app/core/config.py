from pydantic_settings import BaseSettings
from typing import Optional

from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    # If Pydantic can't read the file, this hardcoded default acts as a direct fallback
    DATABASE_URL: str = "postgresql://postgres:dyY7G*3X$XY9Z3v@db.chxwczsskfcjmhtlepvq.supabase.co:5432/postgres"
    
    OPENAI_API_KEY: Optional[str] = None
    SUPABASE_URL: Optional[str] = None
    SUPABASE_KEY: Optional[str] = None
    SUPABASE_SERVICE_ROLE_KEY: Optional[str] = None

    class Config:
        env_file = ".env"
        extra = "ignore" 

settings = Settings()