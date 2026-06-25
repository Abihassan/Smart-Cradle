import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.middleware.auth_middleware import get_current_user
from app.models.alert import Alert
from app.models.baby import Baby
from app.models.user import User
from app.schemas.alert import AlertOut, MarkReadRequest

router = APIRouter(prefix="/api/baby/{baby_id}/alerts", tags=["alerts"])


async def _verify_ownership(db: AsyncSession, baby_id: uuid.UUID, user: User) -> None:
    baby = await db.get(Baby, baby_id)
    if not baby or baby.user_id != user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Baby not found")


@router.get("", response_model=list[AlertOut])
async def list_alerts(
    baby_id: uuid.UUID,
    type: str | None = None,
    unread_only: bool = False,
    limit: int = 50,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await _verify_ownership(db, baby_id, current_user)

    query = select(Alert).where(Alert.baby_id == baby_id)
    if type:
        query = query.where(Alert.type == type)
    if unread_only:
        query = query.where(Alert.read.is_(False))
    query = query.order_by(Alert.timestamp.desc()).limit(limit)

    result = await db.scalars(query)
    return list(result.all())


@router.post("/mark-read", status_code=status.HTTP_204_NO_CONTENT)
async def mark_read(
    baby_id: uuid.UUID,
    data: MarkReadRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await _verify_ownership(db, baby_id, current_user)

    await db.execute(
        update(Alert)
        .where(Alert.baby_id == baby_id, Alert.id.in_(data.alert_ids))
        .values(read=True)
    )
    await db.commit()
