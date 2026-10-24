import os
from pydantic_settings import BaseSettings, SettingsConfigDict
from dotenv import load_dotenv

# Load variables from .env file explicitly
load_dotenv()

class Settings(BaseSettings):
    PROJECT_NAME: str = "Chat with Your Data API"
    VERSION: str = "2.0.0"
    
    # Cloud Credentials (optional — users provide their own DB creds via the UI)
    AZURE_CONNECTION_STRING: str = os.getenv("AZURE_CONNECTION_STRING", "")
    AWS_CONNECTION_STRING: str = os.getenv("AWS_CONNECTION_STRING", "")
    GCP_CONNECTION_STRING: str = os.getenv("GCP_CONNECTION_STRING", "")
    
    # LLM & AI Provider Settings
    AI_PROVIDER: str = os.getenv("AI_PROVIDER", "gemini")
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "") or os.getenv("GOOGLE_API_KEY", "")
    GEMINI_MODEL: str = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    OPENAI_MODEL: str = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
    
    # Application configuration
    ALLOWED_ORIGINS: list = ["http://localhost:5173", "http://localhost:5174", "http://localhost:3000", "http://127.0.0.1:5173", "http://127.0.0.1:5174"]
    MAX_DB_ROWS_LIMIT: int = 1000
    
    # Database connection settings
    DB_POOL_SIZE: int = 5
    DB_MAX_OVERFLOW: int = 10
    DB_POOL_TIMEOUT: int = 30
    DB_CONNECTION_TIMEOUT: int = 30

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()
