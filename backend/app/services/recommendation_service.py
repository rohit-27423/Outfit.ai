import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.wardrobe_item import WardrobeItem
from app.models.recommendation import Recommendation, RecommendationItem
from app.services.weather_service import get_weather_for_location

async def generate_recommendation(db: AsyncSession, user_id: uuid.UUID, location: str, occasion: str) -> Recommendation:
    # 1. Get weather
    weather = await get_weather_for_location(location, db)
    
    # 2. Get user's wardrobe (ready items)
    stmt = select(WardrobeItem).where(
        WardrobeItem.user_id == user_id,
        WardrobeItem.status == "ready"
    )
    result = await db.execute(stmt)
    items = result.scalars().all()
    
    # 3. Simple rule-based scoring (in a real app, this would use a ML model or Gemini to compose)
    # Filter by season based on temp
    temp = weather.get("temp_c", 20.0)
    target_season = "summer"
    if temp < 10:
        target_season = "winter"
    elif temp < 18:
        target_season = "autumn" # or spring
        
    # Group items by category
    tops = [i for i in items if i.category in ["shirt", "t-shirt", "sweater"]]
    bottoms = [i for i in items if i.category in ["trousers", "jeans", "shorts", "skirt"]]
    shoes = [i for i in items if i.category in ["shoes", "sneakers"]]
    jackets = [i for i in items if i.category in ["jacket"]]
    
    # Map occasions to formalities
    occasion_lower = occasion.lower()
    target_formality = "casual"
    if "office" in occasion_lower or "interview" in occasion_lower:
        target_formality = "business"
    elif "wedding" in occasion_lower or "formal" in occasion_lower:
        target_formality = "formal"
    elif "gym" in occasion_lower or "workout" in occasion_lower:
        target_formality = "athletic"
    
    # Select best (logic: match formality first, then season)
    def pick_best(category_items):
        if not category_items: return None
        formality_match = [i for i in category_items if i.formality == target_formality]
        candidates = formality_match if formality_match else category_items
        season_match = [i for i in candidates if i.season and target_season in i.season]
        return season_match[0] if season_match else candidates[0]
        
    selected_top = pick_best(tops)
    selected_bottom = pick_best(bottoms)
    selected_shoes = pick_best(shoes)
    
    outfit_items = []
    if selected_top: outfit_items.append((selected_top, "top"))
    if selected_bottom: outfit_items.append((selected_bottom, "bottom"))
    if selected_shoes: outfit_items.append((selected_shoes, "shoes"))
    
    if weather.get("is_raining") or temp < 15:
        selected_jacket = pick_best(jackets)
        if selected_jacket:
            outfit_items.append((selected_jacket, "outerwear"))
            
    # Check if we have enough items
    if not outfit_items:
        explanation = "You don't have enough wardrobe items to generate an outfit. Add more clothes!"
    else:
        explanation = f"Selected {target_formality} items for {temp}°C {weather.get('condition')} weather."

    # 4. Save recommendation
    rec = Recommendation(
        user_id=user_id,
        occasion=occasion,
        weather_snapshot=weather,
        explanation=explanation
    )
    db.add(rec)
    await db.flush() # get rec.id
    
    for w_item, role in outfit_items:
        rec_item = RecommendationItem(
            recommendation_id=rec.id,
            wardrobe_item_id=w_item.id,
            role=role
        )
        db.add(rec_item)
        
    await db.commit()
    await db.refresh(rec)
    return rec
