from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.config import settings
from sqlalchemy import select
from app.db.session import get_db
from app.models.user import User
from app.models.session import Session
from app.models.user_preferences import UserPreferences
from app.schemas.auth import UserCreate, UserLogin, Token, UserResponse, TokenRefresh, AuthResponse
from app.core.security import get_password_hash, verify_password, create_access_token, create_refresh_token, get_token_hash
from app.api.v1.deps import get_current_user
import uuid
from jose import jwt
from datetime import datetime
import secrets
import string

router = APIRouter()

@router.post("/signup", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
async def signup(user_in: UserCreate, db: AsyncSession = Depends(get_db)):
    # Check if user exists
    stmt = select(User).where(User.email == user_in.email)
    result = await db.execute(stmt)
    if result.scalar_one_or_none():
        raise HTTPException(status_code=409, detail="Email already registered")
        
    # Create user
    user = User(
        email=user_in.email,
        password_hash=get_password_hash(user_in.password),
        full_name=user_in.full_name
    )
    db.add(user)
    await db.flush() # flush to get user.id
    
    # Create user preferences
    prefs = UserPreferences(user_id=user.id)
    db.add(prefs)
    
    # Generate tokens
    access_token = create_access_token(subject=str(user.id))
    refresh_token = create_refresh_token(subject=str(user.id))
    
    # Save session
    session = Session(
        user_id=user.id,
        refresh_token_hash=get_token_hash(refresh_token),
        expires_at=datetime.utcfromtimestamp(jwt.decode(refresh_token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])["exp"])
    )
    db.add(session)
    await db.commit()
    await db.refresh(user)
    
    return {
        "user": user,
        "access_token": access_token,
        "refresh_token": refresh_token
    }

@router.post("/guest", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
async def guest_login(db: AsyncSession = Depends(get_db)):
    guest_id = uuid.uuid4()
    email = f"guest_{guest_id.hex[:8]}@outfit.ai"
    password = "".join(secrets.choice(string.ascii_letters + string.digits) for _ in range(32))
    
    # Create user
    user = User(
        email=email,
        password_hash=get_password_hash(password),
        full_name="Guest User"
    )
    db.add(user)
    await db.flush() # flush to get user.id
    
    # Create user preferences
    prefs = UserPreferences(user_id=user.id)
    db.add(prefs)
    
    # Generate tokens
    access_token = create_access_token(subject=str(user.id))
    refresh_token = create_refresh_token(subject=str(user.id))
    
    # Save session
    session = Session(
        user_id=user.id,
        refresh_token_hash=get_token_hash(refresh_token),
        expires_at=datetime.utcfromtimestamp(jwt.decode(refresh_token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])["exp"])
    )
    db.add(session)
    await db.commit()
    await db.refresh(user)
    
    return {
        "user": user,
        "access_token": access_token,
        "refresh_token": refresh_token
    }

@router.post("/login", response_model=Token)
async def login(user_in: UserLogin, db: AsyncSession = Depends(get_db)):
    stmt = select(User).where(User.email == user_in.email)
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()
    
    if not user or not verify_password(user_in.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Incorrect email or password")
        
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Inactive user")
        
    access_token = create_access_token(subject=str(user.id))
    refresh_token = create_refresh_token(subject=str(user.id))
    
    # Save session (skipping detail hash implementation here for brevity, assuming standard JWT expiry)
    session = Session(
        user_id=user.id,
        refresh_token_hash=get_token_hash(refresh_token),
        expires_at=datetime.utcfromtimestamp(jwt.decode(refresh_token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])["exp"])
    )
    db.add(session)
    await db.commit()
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }

@router.get("/me", response_model=UserResponse)
async def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user
