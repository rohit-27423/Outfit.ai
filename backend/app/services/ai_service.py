import json
import google.generativeai as genai
from app.config import settings

if settings.GEMINI_API_KEY:
    genai.configure(api_key=settings.GEMINI_API_KEY)

async def analyze_clothing_image(image_url: str) -> dict:
    if not settings.GEMINI_API_KEY:
        # Fallback if no API key
        return {
            "status": "needs_review",
            "metadata": {}
        }
        
    try:
        import httpx
        # Download the image
        async with httpx.AsyncClient() as client:
            resp = await client.get(image_url)
            resp.raise_for_status()
            image_bytes = resp.content
            mime_type = resp.headers.get("content-type", "image/jpeg")

        model = genai.GenerativeModel('gemini-1.5-pro')
        
        prompt = """
        Analyze this clothing image and output a strict JSON object with the following schema:
        {
          "category": "string (enum: shirt, t-shirt, trousers, jeans, shorts, jacket, dress, skirt, sweater, shoes, sneakers, accessory, other)",
          "subcategory": "string",
          "dominant_color": "string",
          "secondary_colors": ["string"],
          "formality": "string (enum: casual, business, formal, athletic)",
          "season": ["string (subset of: spring, summer, autumn, winter)"],
          "tags": ["string"],
          "confidence": float (0.0 to 1.0)
        }
        Only output the JSON object, without markdown blocks.
        """
        
        image_part = {
            "mime_type": mime_type,
            "data": image_bytes
        }
        
        response = await model.generate_content_async([prompt, image_part])
        
        response_text = response.text.strip()
        if response_text.startswith("```json"):
            response_text = response_text[7:]
        if response_text.endswith("```"):
            response_text = response_text[:-3]
            
        metadata = json.loads(response_text)
        
        return {
            "status": "ready",
            "metadata": metadata
        }
    except Exception as e:
        print(f"AI Analysis failed: {e}")
        return {
            "status": "failed",
            "metadata": {}
        }

