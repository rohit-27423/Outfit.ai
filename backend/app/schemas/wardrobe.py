from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
from datetime import datetime
import uuid

class WardrobeItemBase(BaseModel):
    category: Optional[str] = None
    subcategory: Optional[str] = None
    dominant_color: Optional[str] = None
    secondary_colors: List[str] = Field(default_factory=list)
    formality: Optional[str] = None
    season: List[str] = Field(default_factory=list)
    tags: List[str] = Field(default_factory=list)

class WardrobeItemUpdate(WardrobeItemBase):
    pass

class WardrobeItemResponse(WardrobeItemBase):
    id: uuid.UUID
    user_id: uuid.UUID
    image_url: str
    status: str
    ai_confidence: Optional[float]
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

class WardrobeListResponse(BaseModel):
    items: List[WardrobeItemResponse]
    total: int
    page: int
    page_size: int
