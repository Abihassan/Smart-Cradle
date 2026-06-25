import uuid
from datetime import datetime

from pydantic import BaseModel, Field


class SwingRequest(BaseModel):
    on: bool
    intensity: int | None = Field(default=None, ge=0, le=100)


class MusicRequest(BaseModel):
    on: bool
    track: str | None = None


class FeedRequest(BaseModel):
    trigger: bool


class AutoModeRequest(BaseModel):
    auto_mode: bool


class DeviceStateOut(BaseModel):
    id: uuid.UUID
    baby_id: uuid.UUID
    swing_on: bool
    swing_intensity: int
    music_on: bool
    music_track: str | None
    feeding_active: bool
    auto_mode: bool
    updated_at: datetime

    class Config:
        from_attributes = True


class CryDetectRequest(BaseModel):
    """Sent by hardware/audio pipeline with extracted features or raw audio ref."""

    audio_ref: str | None = None
    features: list[float] | None = None


class CryDetectResponse(BaseModel):
    cry: bool
    reason: str | None = None
    confidence: float


class DecisionResponse(BaseModel):
    actions_taken: list[str]
    alert_created: bool
