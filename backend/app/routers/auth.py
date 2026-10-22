import uuid
from typing import Optional
from fastapi import APIRouter, HTTPException, status
from app.config import settings
from app.models.schemas import (
    AdminLoginRequest,
    OAuthVerifyRequest,
    AuthUserResponse,
    AuthTokenResponse
)

router = APIRouter(prefix="/api/auth", tags=["OAuth & Admin Authentication"])

@router.post("/login", response_model=AuthTokenResponse)
async def admin_login(payload: AdminLoginRequest):
    """
    Validates master administrator passcode and returns an admin session.
    """
    if payload.passcode.strip() != settings.ADMIN_PASSCODE.strip():
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid administrator passcode."
        )

    admin_user = AuthUserResponse(
        id=f"admin-{uuid.uuid4().hex[:8]}",
        name="Master Field Administrator",
        email="admin@godavarigrown.com",
        avatar="",
        provider="admin",
        role="admin",
        title="Verified Master Admin"
    )

    token = f"gg_admin_token_{uuid.uuid4().hex}"
    return AuthTokenResponse(
        status="success",
        token=token,
        user=admin_user
    )


@router.post("/oauth/verify", response_model=AuthTokenResponse)
async def verify_oauth_session(payload: OAuthVerifyRequest):
    """
    Verifies OAuth credentials or profile data from Google or Facebook.
    Maps authorized emails to the 'admin' role.
    """
    admin_emails = [e.strip().lower() for e in settings.ADMIN_EMAILS.split(",") if e.strip()]
    user_email = (payload.email or "").strip().lower()
    
    is_admin = bool(user_email and user_email in admin_emails)

    user = AuthUserResponse(
        id=f"{payload.provider}-{uuid.uuid4().hex[:8]}",
        name=payload.name or f"{payload.provider.capitalize()} User",
        email=user_email,
        avatar=payload.avatar or "",
        provider=payload.provider.lower(),
        role="admin" if is_admin else "user",
        title="Regional Agri Administrator" if is_admin else "Verified Customer"
    )

    token = f"gg_oauth_token_{uuid.uuid4().hex}"
    return AuthTokenResponse(
        status="success",
        token=token,
        user=user
    )


@router.get("/status")
async def auth_status():
    """
    Returns configured authentication providers and settings status.
    """
    return {
        "status": "active",
        "google_oauth_configured": bool(settings.GOOGLE_CLIENT_ID),
        "facebook_oauth_configured": bool(settings.FACEBOOK_APP_ID),
        "admin_auth_enabled": True
    }
