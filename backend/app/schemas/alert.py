import uuid
from datetime import datetime

from pydantic import BaseModel

from app.models.alert import AlertType


class AlertOut(BaseModel):
    id: uuid.UUID
    type: AlertType
    reason: str | None = None
    confidence: float | None = None
    read: bool
    timestamp: datetime

    class Config:
        from_attributes = True


class MarkReadRequest(BaseModel):
    alert_ids: list[uuid.UUID]
