from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.session import get_db
from app.models.user import User
from app.models.wardrobe_item import WardrobeItem
from app.schemas.wardrobe import WardrobeItemResponse, WardrobeItemUpdate, WardrobeListResponse
from app.api.v1.deps import get_current_user
from app.services.wardrobe_service import create_wardrobe_item
from app.models.saved_outfit import SavedOutfit
from sqlalchemy import func
import uuid

router = APIRouter()

@router.post("/items", response_model=WardrobeItemResponse, status_code=status.HTTP_202_ACCEPTED)
async def upload_item(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=415, detail="Unsupported media type")
        
    item = await create_wardrobe_item(db, current_user.id, file)
    return item

@router.get("/items", response_model=WardrobeListResponse)
async def list_items(
    page: int = 1,
    page_size: int = 20,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(WardrobeItem).where(WardrobeItem.user_id == current_user.id).offset((page - 1) * page_size).limit(page_size)
    result = await db.execute(stmt)
    items = result.scalars().all()
    
    # In a real app we'd also count total items for pagination
    return {
        "items": items,
        "total": len(items), # Simplified
        "page": page,
        "page_size": page_size
    }

@router.patch("/items/{item_id}", response_model=WardrobeItemResponse)
async def update_item(
    item_id: uuid.UUID,
    item_in: WardrobeItemUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(WardrobeItem).where(WardrobeItem.id == item_id, WardrobeItem.user_id == current_user.id)
    result = await db.execute(stmt)
    item = result.scalar_one_or_none()
    
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
        
    update_data = item_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(item, field, value)
        
    item.status = "ready" # If updated manually, mark ready
    await db.commit()
    await db.refresh(item)
    return item

@router.delete("/items/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_item(
    item_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(WardrobeItem).where(WardrobeItem.id == item_id, WardrobeItem.user_id == current_user.id)
    result = await db.execute(stmt)
    item = result.scalar_one_or_none()
    
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
        
    await db.delete(item)
    await db.commit()

@router.get("/stats")
async def get_stats(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Total wardrobe items
    items_stmt = select(func.count(WardrobeItem.id)).where(WardrobeItem.user_id == current_user.id)
    items_result = await db.execute(items_stmt)
    total_items = items_result.scalar() or 0

    # Total saved outfits
    outfits_stmt = select(func.count(SavedOutfit.id)).where(SavedOutfit.user_id == current_user.id)
    outfits_result = await db.execute(outfits_stmt)
    total_outfits = outfits_result.scalar() or 0
    
    # Category distribution
    cat_stmt = select(WardrobeItem.category, func.count(WardrobeItem.id)).where(
        WardrobeItem.user_id == current_user.id
    ).group_by(WardrobeItem.category)
    cat_result = await db.execute(cat_stmt)
    distribution = {row[0]: row[1] for row in cat_result.all() if row[0]}
    
    return {
        "items": total_items,
        "outfits": total_outfits,
        "distribution": distribution
    }
