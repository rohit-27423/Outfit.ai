from pydantic import BaseModel
from typing import Optional
import uuid

class UserPreferencesBase(BaseModel):
    preferred_style: Optional[str] = None
    default_location: Optional[str] = None
    units: str = "metric"
    color_preferences: dict = {}

class UserPreferencesUpdate(BaseModel):
    preferred_style: Optional[str] = None
    default_location: Optional[str] = None
    units: Optional[str] = None
    color_preferences: Optional[dict] = None

class UserPreferencesResponse(UserPreferencesBase):
    id: uuid.UUID
    user_id: uuid.UUID

    class Config:
        from_attributes = True
