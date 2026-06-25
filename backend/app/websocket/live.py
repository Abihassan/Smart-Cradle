import uuid
from collections import defaultdict

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

router = APIRouter()


class ConnectionManager:
    """Tracks active WebSocket connections per baby_id for targeted broadcasts."""

    def __init__(self) -> None:
        self._connections: dict[uuid.UUID, set[WebSocket]] = defaultdict(set)

    async def connect(self, baby_id: uuid.UUID, websocket: WebSocket) -> None:
        await websocket.accept()
        self._connections[baby_id].add(websocket)

    def disconnect(self, baby_id: uuid.UUID, websocket: WebSocket) -> None:
        self._connections[baby_id].discard(websocket)
        if not self._connections[baby_id]:
            del self._connections[baby_id]

    async def broadcast(self, baby_id: uuid.UUID, message: dict) -> None:
        dead: list[WebSocket] = []
        for ws in self._connections.get(baby_id, set()):
            try:
                await ws.send_json(message)
            except Exception:
                dead.append(ws)
        for ws in dead:
            self.disconnect(baby_id, ws)


manager = ConnectionManager()


@router.websocket("/ws/live/{baby_id}")
async def live_endpoint(websocket: WebSocket, baby_id: uuid.UUID):
    """
    Streams sensor updates, alerts, and device state changes for a given baby.

    Auth: pass the access token as a query param, e.g. /ws/live/{baby_id}?token=...
    Token validation is intentionally lightweight here (decode only) since the
    websocket handshake doesn't support standard Authorization headers from
    most RN websocket clients.
    """
    token = websocket.query_params.get("token")

    if token:
        from app.services.jwt_service import decode_access_token

        try:
            decode_access_token(token)
        except ValueError:
            await websocket.close(code=4401)
            return
    else:
        await websocket.close(code=4401)
        return

    await manager.connect(baby_id, websocket)
    try:
        while True:
            # Keep connection alive; clients may send pings.
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(baby_id, websocket)
