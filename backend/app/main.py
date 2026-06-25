from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import init_db
from app.routers import ai, alerts, auth, baby, control, sensors
from app.websocket import live


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Auto-create tables for prototyping. Replace with Alembic migrations in production.
    await init_db()
    yield


app = FastAPI(title="NurseEye API", version="0.1.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(baby.router)
app.include_router(sensors.router)
app.include_router(alerts.router)
app.include_router(control.router)
app.include_router(ai.router)
app.include_router(live.router)


@app.get("/health")
async def health():
    return {"status": "ok"}
