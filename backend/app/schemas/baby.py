import uuid
from datetime import date, datetime

from pydantic import BaseModel, Field


class BabyCreate(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    birth_date: date


class BabyOut(BaseModel):
    id: uuid.UUID
    name: str
    birth_date: date
    created_at: datetime

    class Config:
        from_attributes = True


class BabyStatus(BaseModel):
    """Aggregated dashboard snapshot for the Home screen."""

    baby: BabyOut
    latest_temperature: float | None = None
    latest_humidity: float | None = None
    latest_moisture: float | None = None
    is_crying: bool = False
    cry_reason: str | None = None
    cry_confidence: float | None = None
    swing_on: bool = False
    music_on: bool = False
    feeding_active: bool = False
    unread_alerts: int = 0
