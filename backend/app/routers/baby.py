import uuid
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.middleware.auth_middleware import get_current_user
from app.models.alert import Alert, AlertType
from app.models.baby import Baby
from app.models.device import DeviceState
from app.models.sensor import SensorReading, SensorType
from app.models.user import User
from app.schemas.baby import BabyCreate, BabyOut, BabyStatus
from app.schemas.sensor import ReportSummary

router = APIRouter(prefix="/api/baby", tags=["baby"])


async def _get_owned_baby(db: AsyncSession, baby_id: uuid.UUID, user: User) -> Baby:
    baby = await db.get(Baby, baby_id)
    if not baby or baby.user_id != user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Baby not found")
    return baby


@router.post("", response_model=BabyOut, status_code=status.HTTP_201_CREATED)
async def create_baby(
    data: BabyCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    baby = Baby(user_id=current_user.id, name=data.name, birth_date=data.birth_date)
    db.add(baby)
    await db.flush()
    db.add(DeviceState(baby_id=baby.id))
    await db.commit()
    await db.refresh(baby)
    return baby


@router.get("", response_model=list[BabyOut])
async def list_babies(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.scalars(select(Baby).where(Baby.user_id == current_user.id))
    return list(result.all())


@router.get("/{baby_id}/status", response_model=BabyStatus)
async def get_status(
    baby_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    baby = await _get_owned_baby(db, baby_id, current_user)

    async def latest_value(sensor_type: SensorType) -> float | None:
        reading = await db.scalar(
            select(SensorReading)
            .where(SensorReading.baby_id == baby_id, SensorReading.type == sensor_type)
            .order_by(SensorReading.timestamp.desc())
            .limit(1)
        )
        return reading.value if reading else None

    device = await db.scalar(select(DeviceState).where(DeviceState.baby_id == baby_id))

    latest_cry = await db.scalar(
        select(Alert)
        .where(Alert.baby_id == baby_id, Alert.type == AlertType.CRY)
        .order_by(Alert.timestamp.desc())
        .limit(1)
    )
    # Consider "currently crying" if the most recent cry alert is < 2 minutes old.
    is_crying = False
    if latest_cry and (datetime.now(timezone.utc) - latest_cry.timestamp) < timedelta(minutes=2):
        is_crying = True

    unread_alerts = len(
        list((await db.scalars(select(Alert).where(Alert.baby_id == baby_id, Alert.read.is_(False)))).all())
    )

    return BabyStatus(
        baby=baby,
        latest_temperature=await latest_value(SensorType.TEMPERATURE),
        latest_humidity=await latest_value(SensorType.HUMIDITY),
        latest_moisture=await latest_value(SensorType.MOISTURE),
        is_crying=is_crying,
        cry_reason=latest_cry.reason if is_crying and latest_cry else None,
        cry_confidence=latest_cry.confidence if is_crying and latest_cry else None,
        swing_on=device.swing_on if device else False,
        music_on=device.music_on if device else False,
        feeding_active=device.feeding_active if device else False,
        unread_alerts=unread_alerts,
    )


@router.get("/{baby_id}/reports", response_model=ReportSummary)
async def get_reports(
    baby_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await _get_owned_baby(db, baby_id, current_user)

    since = datetime.now(timezone.utc) - timedelta(hours=24)

    async def series(sensor_type: SensorType):
        result = await db.scalars(
            select(SensorReading)
            .where(
                SensorReading.baby_id == baby_id,
                SensorReading.type == sensor_type,
                SensorReading.timestamp >= since,
            )
            .order_by(SensorReading.timestamp.asc())
        )
        return list(result.all())

    cry_events = await db.scalars(
        select(Alert)
        .where(
            Alert.baby_id == baby_id,
            Alert.type == AlertType.CRY,
            Alert.timestamp >= since,
        )
        .order_by(Alert.timestamp.asc())
    )

    return ReportSummary(
        temperature_series=await series(SensorType.TEMPERATURE),
        humidity_series=await series(SensorType.HUMIDITY),
        moisture_series=await series(SensorType.MOISTURE),
        cry_events=list(cry_events.all()),
        sleep_minutes_today=0,  # Phase 3: derive from sleep-tracking model
    )
