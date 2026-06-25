import enum
import uuid
from datetime import datetime

from sqlalchemy import Boolean, DateTime, Enum, Float, ForeignKey, Index, String, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class AlertType(str, enum.Enum):
    CRY = "cry"
    URINATION = "urination"
    FEEDING = "feeding"
    EMERGENCY = "emergency"


class CryReason(str, enum.Enum):
    HUNGER = "hunger"
    TIRED = "tired"
    PAIN = "pain"
    DISCOMFORT = "discomfort"
    UNKNOWN = "unknown"


class Alert(Base):
    __tablename__ = "alerts"
    __table_args__ = (
        Index("ix_alerts_baby_timestamp", "baby_id", "timestamp"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    baby_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("babies.id", ondelete="CASCADE"), nullable=False
    )
    type: Mapped[AlertType] = mapped_column(Enum(AlertType), nullable=False)
    reason: Mapped[str | None] = mapped_column(String(50), nullable=True)
    confidence: Mapped[float | None] = mapped_column(Float, nullable=True)
    read: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    timestamp: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    baby: Mapped["Baby"] = relationship(back_populates="alerts")
