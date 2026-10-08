import os
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List


class Settings(BaseSettings):
    PROJECT_NAME: str = "VectorShield"
    VERSION: str = "1.0.0"
    ENVIRONMENT: str = "development"
    PORT: int = 8000
    HOST: str = "0.0.0.0"

    # CORS
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:8000",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:8000",
        "*"
    ]

    # Database
    DATABASE_URL: str = "sqlite:///./vectorshield.db"

    # Vector DB
    VECTOR_DB_BACKEND: str = "chroma"
    CHROMA_PERSIST_DIR: str = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../data/chroma_db"))
    EMBEDDING_MODEL: str = "all-MiniLM-L6-v2"

    # Defense Thresholds
    BLOCK_RISK_THRESHOLD: float = 65.0
    QUARANTINE_THRESHOLD: float = 80.0
    SIMILARITY_OUTLIER_SIGMA: float = 2.2
    CANARY_TOKEN: str = "VS-CANARY-SEC-9981-SECRET"
    ALLOWED_DOMAINS: str = "wikipedia.org,github.com,arxiv.org,huggingface.co"

    # LLM Settings
    OPENAI_API_KEY: str = ""
    OLLAMA_BASE_URL: str = "http://localhost:11434"
    LLM_PROVIDER: str = "simulated" # simulated, openai, ollama

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()
