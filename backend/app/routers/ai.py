import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.middleware.auth_middleware import get_current_user
from app.models.baby import Baby
from app.models.user import User
from app.schemas.device import CryDetectRequest, CryDetectResponse, DecisionResponse
from app.services import cry_service, decision_engine

router = APIRouter(prefix="/api/baby/{baby_id}/ai", tags=["ai"])


async def _verify_ownership(db: AsyncSession, baby_id: uuid.UUID, user: User) -> None:
    baby = await db.get(Baby, baby_id)
    if not baby or baby.user_id != user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Baby not found")


@router.post("/cry-detect", response_model=CryDetectResponse)
async def cry_detect(
    baby_id: uuid.UUID,
    data: CryDetectRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await _verify_ownership(db, baby_id, current_user)
    return await cry_service.run_cry_detection(
        db, baby_id, features=data.features, audio_ref=data.audio_ref
    )


@router.post("/decision", response_model=DecisionResponse)
async def decision(
    baby_id: uuid.UUID,
    cry_result: CryDetectResponse,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Runs the decision engine against a cry-detection result.

    Typically called immediately after /cry-detect, but accepts an
    explicit CryDetectResponse body so it can also be triggered manually
    (e.g. for testing) or chained from a different detection source.
    """
    await _verify_ownership(db, baby_id, current_user)
    return await decision_engine.evaluate_and_act(db, baby_id, cry_result)
