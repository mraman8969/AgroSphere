import os
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_name: str = "AgroSphere AI Service"
    app_version: str = "0.1.0"
    app_env: str = "development"
    host: str = "0.0.0.0"
    port: int = 8000
    cors_origins: list[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:8080",
        "http://127.0.0.1:8080",
    ]

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
