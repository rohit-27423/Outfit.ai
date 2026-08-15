from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from app.db.session import get_db
from app.models.user import User
from app.models.recommendation import Recommendation
from app.schemas.recommendation import RecommendationGenerateRequest, RecommendationResponse
from app.api.v1.deps import get_current_user
from app.services.recommendation_service import generate_recommendation
import uuid

router = APIRouter()

@router.post("/", response_model=RecommendationResponse, status_code=status.HTTP_201_CREATED)
async def create_recommendation(
    req: RecommendationGenerateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    rec = await generate_recommendation(db, current_user.id, req.location, req.occasion)
    
    # Reload with relationships
    stmt = select(Recommendation).where(Recommendation.id == rec.id).options(
        selectinload(Recommendation.items).selectinload("wardrobe_item")
    )
    result = await db.execute(stmt)
    full_rec = result.scalar_one()
    return full_rec

@router.get("/", response_model=list[RecommendationResponse])
async def list_recommendations(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Recommendation).where(Recommendation.user_id == current_user.id).order_by(Recommendation.created_at.desc()).options(
        selectinload(Recommendation.items).selectinload("wardrobe_item")
    )
    result = await db.execute(stmt)
    return result.scalars().all()

@router.delete("/{rec_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_recommendation(
    rec_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Recommendation).where(Recommendation.id == rec_id, Recommendation.user_id == current_user.id)
    result = await db.execute(stmt)
    rec = result.scalar_one_or_none()
    
    if not rec:
        raise HTTPException(status_code=404, detail="Recommendation not found")
        
    await db.delete(rec)
    await db.commit()
