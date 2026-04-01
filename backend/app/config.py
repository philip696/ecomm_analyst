"""
App-wide settings loaded from .env via pydantic-settings.
"""
from typing import List

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    ENVIRONMENT: str = "development"
    DATABASE_URL: str = "sqlite:///./ecommerce.db"
    SECRET_KEY: str = "dev-secret-change-me"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    OPENAI_API_KEY: str = ""
    FRONTEND_URL: str = "http://localhost:3000"
    CORS_ORIGINS: str = ""

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    @property
    def allowed_origins(self) -> List[str]:
        configured = [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]
        origins = configured + [self.FRONTEND_URL]
        if self.ENVIRONMENT != "production":
            origins.append("http://localhost:3000")
        return list(dict.fromkeys(origins))


settings = Settings()
