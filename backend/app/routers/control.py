import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.middleware.auth_middleware import get_current_user
from app.models.baby import Baby
from app.models.device import DeviceState
from app.models.user import User
from app.schemas.device import (
    AutoModeRequest,
    DeviceStateOut,
    FeedRequest,
    MusicRequest,
    SwingRequest,
)
from app.websocket.live import manager

router = APIRouter(prefix="/api/baby/{baby_id}/device", tags=["control"])


async def _get_device(db: AsyncSession, baby_id: uuid.UUID, user: User) -> DeviceState:
    baby = await db.get(Baby, baby_id)
    if not baby or baby.user_id != user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Baby not found")

    device = await db.scalar(select(DeviceState).where(DeviceState.baby_id == baby_id))
    if not device:
        device = DeviceState(baby_id=baby_id)
        db.add(device)
        await db.commit()
        await db.refresh(device)
    return device


async def _broadcast_state(baby_id: uuid.UUID, device: DeviceState) -> None:
    await manager.broadcast(
        baby_id,
        {
            "type": "device_state",
            "data": {
                "swing_on": device.swing_on,
                "swing_intensity": device.swing_intensity,
                "music_on": device.music_on,
                "music_track": device.music_track,
                "feeding_active": device.feeding_active,
                "auto_mode": device.auto_mode,
            },
        },
    )


@router.get("", response_model=DeviceStateOut)
async def get_device_state(
    baby_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await _get_device(db, baby_id, current_user)


@router.post("/swing", response_model=DeviceStateOut)
async def set_swing(
    baby_id: uuid.UUID,
    data: SwingRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    device = await _get_device(db, baby_id, current_user)
    device.swing_on = data.on
    if data.intensity is not None:
        device.swing_intensity = data.intensity
    await db.commit()
    await db.refresh(device)
    await _broadcast_state(baby_id, device)
    return device


@router.post("/music", response_model=DeviceStateOut)
async def set_music(
    baby_id: uuid.UUID,
    data: MusicRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    device = await _get_device(db, baby_id, current_user)
    device.music_on = data.on
    if data.track is not None:
        device.music_track = data.track
    await db.commit()
    await db.refresh(device)
    await _broadcast_state(baby_id, device)
    return device


@router.post("/feed", response_model=DeviceStateOut)
async def trigger_feed(
    baby_id: uuid.UUID,
    data: FeedRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    device = await _get_device(db, baby_id, current_user)
    device.feeding_active = data.trigger
    await db.commit()
    await db.refresh(device)
    await _broadcast_state(baby_id, device)
    return device


@router.post("/auto-mode", response_model=DeviceStateOut)
async def set_auto_mode(
    baby_id: uuid.UUID,
    data: AutoModeRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Toggles the decision engine's ability to take automatic actions
    (swing/music/feed) for this baby. Emergency alerts are still raised
    regardless of this setting.
    """
    device = await _get_device(db, baby_id, current_user)
    device.auto_mode = data.auto_mode
    await db.commit()
    await db.refresh(device)
    await _broadcast_state(baby_id, device)
    return device
