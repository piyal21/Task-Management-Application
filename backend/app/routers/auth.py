from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import secrets
import httpx
from authlib.integrations.fastapi_oauth2 import GoogleOAuth2, GitHubOAuth2

from app.database import get_db
from app.models.user import User
from app.models.auth import RefreshToken, Session
from app.schemas.auth import Token, TokenData, RefreshTokenRequest, PasswordReset, PasswordResetConfirm
from app.schemas.user import UserCreate, UserLogin, UserOAuth
from app.core.security import (
    verify_password, 
    get_password_hash, 
    create_access_token, 
    create_refresh_token,
    verify_token
)
from app.core.config import settings

router = APIRouter()
security = HTTPBearer()

# OAuth providers
google_oauth = GoogleOAuth2(
    client_id=settings.GOOGLE_CLIENT_ID,
    client_secret=settings.GOOGLE_CLIENT_SECRET,
    redirect_uri="http://localhost:3000/auth/callback/google"
)

github_oauth = GitHubOAuth2(
    client_id=settings.GITHUB_CLIENT_ID,
    client_secret=settings.GITHUB_CLIENT_SECRET,
    redirect_uri="http://localhost:3000/auth/callback/github"
)

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    """Get current authenticated user."""
    token = credentials.credentials
    payload = verify_token(token)
    user_id = payload.get("user_id")
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive"
        )
    return user

@router.post("/register", response_model=Token)
async def register(user_data: UserCreate, db: Session = Depends(get_db)):
    """Register a new user."""
    # Check if user already exists
    existing_user = db.query(User).filter(
        (User.email == user_data.email) | (User.username == user_data.username)
    ).first()
    
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email or username already registered"
        )
    
    # Create new user
    hashed_password = get_password_hash(user_data.password)
    user = User(
        email=user_data.email,
        username=user_data.username,
        full_name=user_data.full_name,
        hashed_password=hashed_password,
        provider="local"
    )
    
    db.add(user)
    db.commit()
    db.refresh(user)
    
    # Create tokens
    access_token = create_access_token({"user_id": user.id, "email": user.email})
    refresh_token = create_refresh_token({"user_id": user.id})
    
    # Store refresh token
    refresh_token_obj = RefreshToken(
        token=refresh_token,
        user_id=user.id,
        expires_at=datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    )
    db.add(refresh_token_obj)
    db.commit()
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }

@router.post("/login", response_model=Token)
async def login(user_data: UserLogin, db: Session = Depends(get_db)):
    """Login user with email and password."""
    user = db.query(User).filter(User.email == user_data.email).first()
    
    if not user or not user.hashed_password or not verify_password(user_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Account is deactivated"
        )
    
    # Update last login
    user.last_login = datetime.utcnow()
    db.commit()
    
    # Create tokens
    access_token = create_access_token({"user_id": user.id, "email": user.email})
    refresh_token = create_refresh_token({"user_id": user.id})
    
    # Store refresh token
    refresh_token_obj = RefreshToken(
        token=refresh_token,
        user_id=user.id,
        expires_at=datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    )
    db.add(refresh_token_obj)
    db.commit()
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }

@router.post("/refresh", response_model=Token)
async def refresh_token(token_data: RefreshTokenRequest, db: Session = Depends(get_db)):
    """Refresh access token using refresh token."""
    payload = verify_token(token_data.refresh_token, "refresh")
    user_id = payload.get("user_id")
    
    # Check if refresh token exists and is not revoked
    refresh_token_obj = db.query(RefreshToken).filter(
        RefreshToken.token == token_data.refresh_token,
        RefreshToken.user_id == user_id,
        RefreshToken.is_revoked == False,
        RefreshToken.expires_at > datetime.utcnow()
    ).first()
    
    if not refresh_token_obj:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )
    
    # Revoke old refresh token
    refresh_token_obj.is_revoked = True
    
    # Create new tokens
    user = db.query(User).filter(User.id == user_id).first()
    access_token = create_access_token({"user_id": user.id, "email": user.email})
    new_refresh_token = create_refresh_token({"user_id": user.id})
    
    # Store new refresh token
    new_refresh_token_obj = RefreshToken(
        token=new_refresh_token,
        user_id=user.id,
        expires_at=datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    )
    db.add(new_refresh_token_obj)
    db.commit()
    
    return {
        "access_token": access_token,
        "refresh_token": new_refresh_token,
        "token_type": "bearer"
    }

@router.post("/logout")
async def logout(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Logout user and revoke refresh tokens."""
    # Revoke all refresh tokens for the user
    db.query(RefreshToken).filter(
        RefreshToken.user_id == current_user.id,
        RefreshToken.is_revoked == False
    ).update({"is_revoked": True})
    
    # Revoke all sessions for the user
    db.query(Session).filter(
        Session.user_id == current_user.id,
        Session.is_active == True
    ).update({"is_active": False})
    
    db.commit()
    return {"message": "Successfully logged out"}

@router.get("/google")
async def google_login():
    """Initiate Google OAuth login."""
    return {"url": google_oauth.get_authorize_url()}

@router.get("/google/callback")
async def google_callback(request: Request, db: Session = Depends(get_db)):
    """Handle Google OAuth callback."""
    code = request.query_params.get("code")
    if not code:
        raise HTTPException(status_code=400, detail="Authorization code not provided")
    
    # Exchange code for token
    token = await google_oauth.get_access_token(code)
    
    # Get user info from Google
    async with httpx.AsyncClient() as client:
        response = await client.get(
            "https://www.googleapis.com/oauth2/v2/userinfo",
            headers={"Authorization": f"Bearer {token['access_token']}"}
        )
        user_info = response.json()
    
    # Check if user exists
    user = db.query(User).filter(User.email == user_info["email"]).first()
    
    if not user:
        # Create new user
        user = User(
            email=user_info["email"],
            username=user_info["email"].split("@")[0],
            full_name=user_info.get("name"),
            avatar_url=user_info.get("picture"),
            provider="google",
            provider_id=user_info["id"],
            is_verified=True
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    
    # Create tokens
    access_token = create_access_token({"user_id": user.id, "email": user.email})
    refresh_token = create_refresh_token({"user_id": user.id})
    
    # Store refresh token
    refresh_token_obj = RefreshToken(
        token=refresh_token,
        user_id=user.id,
        expires_at=datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    )
    db.add(refresh_token_obj)
    db.commit()
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }

@router.get("/github")
async def github_login():
    """Initiate GitHub OAuth login."""
    return {"url": github_oauth.get_authorize_url()}

@router.get("/github/callback")
async def github_callback(request: Request, db: Session = Depends(get_db)):
    """Handle GitHub OAuth callback."""
    code = request.query_params.get("code")
    if not code:
        raise HTTPException(status_code=400, detail="Authorization code not provided")
    
    # Exchange code for token
    token = await github_oauth.get_access_token(code)
    
    # Get user info from GitHub
    async with httpx.AsyncClient() as client:
        response = await client.get(
            "https://api.github.com/user",
            headers={"Authorization": f"Bearer {token['access_token']}"}
        )
        user_info = response.json()
    
    # Check if user exists
    user = db.query(User).filter(User.email == user_info["email"]).first()
    
    if not user:
        # Create new user
        user = User(
            email=user_info["email"],
            username=user_info["login"],
            full_name=user_info.get("name"),
            avatar_url=user_info.get("avatar_url"),
            provider="github",
            provider_id=str(user_info["id"]),
            is_verified=True
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    
    # Create tokens
    access_token = create_access_token({"user_id": user.id, "email": user.email})
    refresh_token = create_refresh_token({"user_id": user.id})
    
    # Store refresh token
    refresh_token_obj = RefreshToken(
        token=refresh_token,
        user_id=user.id,
        expires_at=datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    )
    db.add(refresh_token_obj)
    db.commit()
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }
