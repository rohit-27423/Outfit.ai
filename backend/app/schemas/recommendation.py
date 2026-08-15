from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import datetime
import uuid
from app.schemas.wardrobe import WardrobeItemResponse

class RecommendationGenerateRequest(BaseModel):
    occasion: str
    location: str

class RecommendationItemResponse(BaseModel):
    id: uuid.UUID
    role: str
    wardrobe_item: WardrobeItemResponse
    
    model_config = ConfigDict(from_attributes=True)

class RecommendationResponse(BaseModel):
    id: uuid.UUID
    occasion: str
    weather_snapshot: Optional[dict]
    explanation: Optional[str]
    created_at: datetime
    items: List[RecommendationItemResponse]
    
    model_config = ConfigDict(from_attributes=True)
