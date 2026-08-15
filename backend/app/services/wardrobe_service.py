import cloudinary
import cloudinary.uploader
from fastapi import UploadFile
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.wardrobe_item import WardrobeItem
from app.config import settings
from app.services.ai_service import analyze_clothing_image
import uuid

if settings.CLOUDINARY_CLOUD_NAME:
    cloudinary.config(
        cloud_name=settings.CLOUDINARY_CLOUD_NAME,
        api_key=settings.CLOUDINARY_API_KEY,
        api_secret=settings.CLOUDINARY_API_SECRET
    )

async def upload_image_to_cloudinary(file: UploadFile) -> dict:
    if not settings.CLOUDINARY_CLOUD_NAME:
        return {"url": "https://fake-url.com/image.jpg", "public_id": "fake_id"}
        
    # Read file content
    contents = await file.read()
    
    # Upload to Cloudinary
    # We would run this in a threadpool in production for async compatibility
    response = cloudinary.uploader.upload(contents, folder="outfit_ai/wardrobe")
    return {
        "url": response.get("secure_url"),
        "public_id": response.get("public_id")
    }

async def create_wardrobe_item(db: AsyncSession, user_id: uuid.UUID, file: UploadFile):
    # Upload image
    upload_res = await upload_image_to_cloudinary(file)
    
    # Create DB record in processing state
    item = WardrobeItem(
        user_id=user_id,
        image_url=upload_res["url"],
        cloudinary_public_id=upload_res["public_id"],
        status="processing"
    )
    db.add(item)
    await db.commit()
    await db.refresh(item)
    
    # Trigger AI analysis
    ai_result = await analyze_clothing_image(item.image_url)
    
    # Update DB record with AI result
    item.status = ai_result["status"]
    if ai_result["status"] == "ready":
        meta = ai_result["metadata"]
        item.category = meta.get("category")
        item.subcategory = meta.get("subcategory")
        item.dominant_color = meta.get("dominant_color")
        item.secondary_colors = meta.get("secondary_colors", [])
        item.formality = meta.get("formality")
        item.season = meta.get("season", [])
        item.tags = meta.get("tags", [])
        item.ai_confidence = meta.get("confidence")
        
    await db.commit()
    await db.refresh(item)
    return item
