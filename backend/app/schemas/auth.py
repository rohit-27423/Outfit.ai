import uuid
from pydantic import BaseModel, EmailStr, Field
from typing import Optional

class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8)
    full_name: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"

class UserResponse(BaseModel):
    id: uuid.UUID
    email: EmailStr
    full_name: Optional[str]
    avatar_url: Optional[str]
    is_verified: bool

    class Config:
        from_attributes = True

class TokenRefresh(BaseModel):
    refresh_token: str

class AuthResponse(BaseModel):
    user: UserResponse
    access_token: str
    refresh_token: str
