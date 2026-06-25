import uuid

from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.ml import cry_model
from app.models.alert import Alert, AlertType
from app.schemas.device import CryDetectResponse


async def run_cry_detection(
    db: AsyncSession,
    baby_id: uuid.UUID,
    features: list[float] | None = None,
    audio_ref: str | None = None,
) -> CryDetectResponse:
    prediction = cry_model.predict(features=features, audio_ref=audio_ref)

    result = CryDetectResponse(
        cry=prediction.cry,
        reason=prediction.reason,
        confidence=prediction.confidence,
    )

    if result.cry and result.confidence >= settings.cry_model_confidence_threshold:
        db.add(
            Alert(
                baby_id=baby_id,
                type=AlertType.CRY,
                reason=result.reason,
                confidence=result.confidence,
            )
        )
        await db.commit()

    return result
