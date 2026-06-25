import uuid
from datetime import datetime, timezone

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.refresh_token import RefreshToken
from app.models.user import User
from app.schemas.auth import RegisterRequest, TokenResponse
from app.services import jwt_service


async def register_user(db: AsyncSession, data: RegisterRequest) -> User:
    existing = await db.scalar(select(User).where(User.email == data.email))
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")

    user = User(
        name=data.name,
        email=data.email,
        password_hash=jwt_service.hash_password(data.password),
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user


async def authenticate_user(db: AsyncSession, email: str, password: str) -> User:
    user = await db.scalar(select(User).where(User.email == email))
    if not user or not jwt_service.verify_password(password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")
    return user


async def issue_tokens(db: AsyncSession, user: User) -> TokenResponse:
    access_token = jwt_service.create_access_token(user.id, user.token_version)
    raw_refresh, expires_at = jwt_service.create_refresh_token(user.id, user.token_version)

    db.add(
        RefreshToken(
            user_id=user.id,
            token_hash=jwt_service.hash_token(raw_refresh),
            expires_at=expires_at,
        )
    )
    await db.commit()

    return TokenResponse(access_token=access_token, refresh_token=raw_refresh)


async def refresh_tokens(db: AsyncSession, raw_refresh_token: str) -> TokenResponse:
    try:
        payload = jwt_service.decode_refresh_token(raw_refresh_token)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(exc)) from exc

    token_hash = jwt_service.hash_token(raw_refresh_token)
    stored = await db.scalar(select(RefreshToken).where(RefreshToken.token_hash == token_hash))

    if not stored or stored.revoked:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Refresh token revoked")
    if stored.expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Refresh token expired")

    user = await db.get(User, uuid.UUID(payload["sub"]))
    if not user or user.token_version != payload["token_version"]:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token has been revoked")

    # Rotate: revoke old, issue new
    stored.revoked = True
    await db.commit()

    return await issue_tokens(db, user)


async def revoke_refresh_token(db: AsyncSession, raw_refresh_token: str) -> None:
    token_hash = jwt_service.hash_token(raw_refresh_token)
    stored = await db.scalar(select(RefreshToken).where(RefreshToken.token_hash == token_hash))
    if stored:
        stored.revoked = True
        await db.commit()


async def revoke_all_sessions(db: AsyncSession, user: User) -> None:
    """Logout from all devices by bumping token_version."""
    user.token_version += 1
    await db.commit()
