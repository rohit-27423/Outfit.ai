from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import datetime
import uuid
from app.schemas.wardrobe import WardrobeItemResponse

class SavedOutfitCreate(BaseModel):
    name: Optional[str] = None
    notes: Optional[str] = None
    wardrobe_item_ids: List[uuid.UUID]

class SavedOutfitItemResponse(BaseModel):
    id: uuid.UUID
    wardrobe_item: WardrobeItemResponse
    
    model_config = ConfigDict(from_attributes=True)

class SavedOutfitUpdate(BaseModel):
    is_favorite: Optional[bool] = None
    name: Optional[str] = None
    notes: Optional[str] = None

class SavedOutfitResponse(BaseModel):
    id: uuid.UUID
    name: Optional[str]
    notes: Optional[str]
    is_favorite: bool
    created_at: datetime
    items: List[SavedOutfitItemResponse]
    
    model_config = ConfigDict(from_attributes=True)
