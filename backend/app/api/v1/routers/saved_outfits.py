from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from app.db.session import get_db
from app.models.user import User
from app.models.saved_outfit import SavedOutfit, SavedOutfitItem
from app.schemas.saved_outfit import SavedOutfitCreate, SavedOutfitResponse, SavedOutfitUpdate
from app.api.v1.deps import get_current_user
import uuid

router = APIRouter()

@router.post("/", response_model=SavedOutfitResponse, status_code=status.HTTP_201_CREATED)
async def create_saved_outfit(
    req: SavedOutfitCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    outfit = SavedOutfit(
        user_id=current_user.id,
        name=req.name,
        notes=req.notes
    )
    db.add(outfit)
    await db.flush()
    
    for item_id in req.wardrobe_item_ids:
        so_item = SavedOutfitItem(
            saved_outfit_id=outfit.id,
            wardrobe_item_id=item_id
        )
        db.add(so_item)
        
    await db.commit()
    
    stmt = select(SavedOutfit).where(SavedOutfit.id == outfit.id).options(
        selectinload(SavedOutfit.items).selectinload("wardrobe_item")
    )
    result = await db.execute(stmt)
    return result.scalar_one()

@router.get("/", response_model=list[SavedOutfitResponse])
async def list_saved_outfits(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(SavedOutfit).where(SavedOutfit.user_id == current_user.id).order_by(SavedOutfit.created_at.desc()).options(
        selectinload(SavedOutfit.items).selectinload("wardrobe_item")
    )
    result = await db.execute(stmt)
    return result.scalars().all()

@router.delete("/{outfit_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_saved_outfit(
    outfit_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(SavedOutfit).where(SavedOutfit.id == outfit_id, SavedOutfit.user_id == current_user.id)
    result = await db.execute(stmt)
    outfit = result.scalar_one_or_none()
    
    if not outfit:
        raise HTTPException(status_code=404, detail="Outfit not found")
        
    await db.delete(outfit)
    await db.commit()

@router.patch("/{outfit_id}", response_model=SavedOutfitResponse)
async def update_saved_outfit(
    outfit_id: uuid.UUID,
    outfit_in: SavedOutfitUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(SavedOutfit).where(SavedOutfit.id == outfit_id, SavedOutfit.user_id == current_user.id).options(
        selectinload(SavedOutfit.items).selectinload("wardrobe_item")
    )
    result = await db.execute(stmt)
    outfit = result.scalar_one_or_none()
    
    if not outfit:
        raise HTTPException(status_code=404, detail="Outfit not found")
        
    update_data = outfit_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(outfit, field, value)
        
    await db.commit()
    await db.refresh(outfit)
    return outfit
