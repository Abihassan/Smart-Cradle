import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.alert import Alert, AlertType
from app.models.device import DeviceState
from app.schemas.device import CryDetectResponse, DecisionResponse
from app.websocket.live import manager


async def evaluate_and_act(
    db: AsyncSession,
    baby_id: uuid.UUID,
    cry_result: CryDetectResponse,
) -> DecisionResponse:
    """
    Rule-based decision system, executed after cry detection:

      hunger     -> trigger feeding sequence
      tired      -> swing ON + music ON
      pain       -> emergency alert
      discomfort -> swing ON + notify
    """
    actions: list[str] = []
    alert_created = False

    if not cry_result.cry:
        return DecisionResponse(actions_taken=actions, alert_created=alert_created)

    device = await db.scalar(select(DeviceState).where(DeviceState.baby_id == baby_id))
    if device is None:
        device = DeviceState(baby_id=baby_id)
        db.add(device)

    reason = cry_result.reason
    device_changed = False

    # Pain/emergency alerts fire regardless of auto_mode — safety first.
    if reason == "pain":
        db.add(
            Alert(
                baby_id=baby_id,
                type=AlertType.EMERGENCY,
                reason="pain",
                confidence=cry_result.confidence,
            )
        )
        alert_created = True
        actions.append("emergency_alert_sent")

    elif not device.auto_mode:
        # Manual override is on — log the detection but don't act on the device.
        actions.append(f"auto_mode_off_no_action_for_{reason}")

    elif reason == "hunger":
        device.feeding_active = True
        device_changed = True
        actions.append("feeding_sequence_triggered")

    elif reason == "tired":
        device.swing_on = True
        device.swing_intensity = device.swing_intensity or 40
        device.music_on = True
        device_changed = True
        actions.append("swing_on")
        actions.append("music_on")

    elif reason == "discomfort":
        device.swing_on = True
        device.swing_intensity = device.swing_intensity or 30
        device_changed = True
        actions.append("swing_on")
        actions.append("notify")

    await db.commit()
    await db.refresh(device)

    # Broadcast updated device state only if it actually changed.
    if device_changed:
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

    if cry_result.cry:
        await manager.broadcast(
            baby_id,
            {
                "type": "cry_event",
                "data": {
                    "reason": cry_result.reason,
                    "confidence": cry_result.confidence,
                },
            },
        )

    return DecisionResponse(actions_taken=actions, alert_created=alert_created)
