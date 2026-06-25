import uuid
from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class DeviceState(Base):
    __tablename__ = "device_states"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    baby_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("babies.id", ondelete="CASCADE"), unique=True, nullable=False
    )

    swing_on: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    swing_intensity: Mapped[int] = mapped_column(Integer, default=0, nullable=False)  # 0-100

    music_on: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    music_track: Mapped[str | None] = mapped_column(String(120), nullable=True)

    feeding_active: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    # When False, the decision engine still raises alerts (e.g. emergency)
    # but skips automatic swing/music/feed actions — the Control screen's
    # "Manual override" toggle.
    auto_mode: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    baby: Mapped["Baby"] = relationship(back_populates="device_state")
