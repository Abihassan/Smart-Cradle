from pydantic_settings import BaseSettings, SettingsConfigDict
import json


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore",
    )

    # Database
    database_url: str = "postgresql+asyncpg://postgres:abi123@localhost:5432/nurseeye"

    # JWT
    jwt_secret: str = "a3f8c2e1d4b7a9f0e6c5d2b1a4f7e3c8d1b4a7f0e9c6d3b0a4f7e2c5d8b1a4f7"
    refresh_token_secret: str = "kba3f8c2e1d4b7a9f0e6c5d2b1a4f7e3c8d1b4a7f0e9c6d3b0a4f7e2c5d8b1a4f7ia"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 15
    refresh_token_expire_days: int = 30

    # Read directly from .env
    allowed_origins: str = "*"

    @property
    def cors_origins(self) -> list[str]:
        v = self.allowed_origins.strip()

        if v == "*":
            return ["*"]

        if v.startswith("["):
            return json.loads(v)

        return [origin.strip() for origin in v.split(",")]

    cry_model_confidence_threshold: float = 0.6

    mqtt_broker_host: str = "localhost"
    mqtt_broker_port: int = 1883


settings = Settings()