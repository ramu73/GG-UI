import os
from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    APP_NAME: str = "Godavari Grown API"
    APP_ENV: str = "development"
    PORT: int = 8000
    HOST: str = "0.0.0.0"
    
    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:5174",
        "https://godavarigrown.com"
    ]
    
    # WhatsApp Meta Cloud API
    WHATSAPP_PHONE_NUMBER_ID: str = ""
    WHATSAPP_ACCESS_TOKEN: str = ""
    WHATSAPP_VERIFY_TOKEN: str = "godavari_grown_verify_secret_2026"
    WHATSAPP_BUSINESS_PHONE: str = "+919876543210"
    
    # LLM / Gemini / OpenAI
    GEMINI_API_KEY: str = ""
    LLM_MODEL: str = "gemini-2.5-flash"

    class Config:
        env_file = "backend/.env"
        extra = "ignore"

settings = Settings()
