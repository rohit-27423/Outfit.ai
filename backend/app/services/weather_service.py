import httpx
from datetime import datetime, timezone, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.weather_cache import WeatherCache
from app.config import settings

async def get_weather_for_location(location: str, db: AsyncSession) -> dict:
    if not settings.OPENWEATHER_API_KEY:
        # Fallback for local dev without key
        return {
            "temp_c": 22.0,
            "condition": "Clear",
            "is_raining": False,
            "is_snowing": False,
            "is_windy": False
        }
        
    location_key = location.lower().strip()
    
    # Check cache
    stmt = select(WeatherCache).where(WeatherCache.location_key == location_key, WeatherCache.expires_at > datetime.now(timezone.utc))
    result = await db.execute(stmt)
    cache_entry = result.scalar_one_or_none()
    
    if cache_entry:
        return cache_entry.weather_data
        
    # Fetch from API
    try:
        async with httpx.AsyncClient() as client:
            res = await client.get(
                "https://api.openweathermap.org/data/2.5/weather",
                params={
                    "q": location,
                    "appid": settings.OPENWEATHER_API_KEY,
                    "units": "metric"
                }
            )
            res.raise_for_status()
            data = res.json()
            
            weather_data = {
                "temp_c": data["main"]["temp"],
                "condition": data["weather"][0]["main"],
                "is_raining": "Rain" in data["weather"][0]["main"] or "Drizzle" in data["weather"][0]["main"],
                "is_snowing": "Snow" in data["weather"][0]["main"],
                "is_windy": data["wind"]["speed"] > 10.0 # simple heuristic
            }
            
            # Save to cache
            new_cache = WeatherCache(
                location_key=location_key,
                weather_data=weather_data,
                expires_at=datetime.now(timezone.utc) + timedelta(minutes=settings.WEATHER_CACHE_MINUTES)
            )
            db.add(new_cache)
            await db.commit()
            
            return weather_data
    except Exception as e:
        print(f"Weather API failed: {e}")
        return {
            "temp_c": 20.0,
            "condition": "Unknown",
            "is_raining": False,
            "is_snowing": False,
            "is_windy": False
        }
