import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.middleware.auth_middleware import get_current_user
from app.models.baby import Baby
from app.models.sensor import SensorReading
from app.models.user import User
from app.schemas.sensor import SensorReadingCreate, SensorReadingOut
from app.websocket.live import manager

router = APIRouter(prefix="/api/baby/{baby_id}/sensors", tags=["sensors"])


@router.post("", response_model=SensorReadingOut, status_code=status.HTTP_201_CREATED)
async def ingest_reading(
    baby_id: uuid.UUID,
    data: SensorReadingCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    baby = await db.get(Baby, baby_id)
    if not baby or baby.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Baby not found")

    reading = SensorReading(baby_id=baby_id, type=data.type, value=data.value)
    db.add(reading)
    await db.commit()
    await db.refresh(reading)

    await manager.broadcast(
        baby_id,
        {
            "type": "sensor_update",
            "data": {
                "sensor_type": reading.type.value,
                "value": reading.value,
                "timestamp": reading.timestamp.isoformat(),
            },
        },
    )

    return reading


@router.get("", response_model=list[SensorReadingOut])
async def get_readings(
    baby_id: uuid.UUID,
    type: str | None = None,
    limit: int = 100,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    baby = await db.get(Baby, baby_id)
    if not baby or baby.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Baby not found")

    query = select(SensorReading).where(SensorReading.baby_id == baby_id)
    if type:
        query = query.where(SensorReading.type == type)
    query = query.order_by(SensorReading.timestamp.desc()).limit(limit)

    result = await db.scalars(query)
    return list(result.all())
