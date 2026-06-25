import uuid
from datetime import datetime

from pydantic import BaseModel

from app.models.sensor import SensorType


class SensorReadingCreate(BaseModel):
    type: SensorType
    value: float


class SensorReadingOut(BaseModel):
    id: uuid.UUID
    type: SensorType
    value: float
    timestamp: datetime

    class Config:
        from_attributes = True


class ReportSummary(BaseModel):
    """Used by /baby/reports — chart-ready time series + aggregates."""

    temperature_series: list[SensorReadingOut] = []
    humidity_series: list[SensorReadingOut] = []
    moisture_series: list[SensorReadingOut] = []
    cry_events: list["AlertOut"] = []
    sleep_minutes_today: int = 0


from app.schemas.alert import AlertOut  # noqa: E402

ReportSummary.model_rebuild()
