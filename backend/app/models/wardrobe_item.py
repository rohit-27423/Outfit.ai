import uuid
from datetime import datetime, timezone
from sqlalchemy import String, Float, DateTime, ForeignKey, ARRAY
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column
from app.models.base import Base

class WardrobeItem(Base):
    __tablename__ = "wardrobe_items"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    image_url: Mapped[str] = mapped_column(String, nullable=False)
    cloudinary_public_id: Mapped[str] = mapped_column(String(255), nullable=False)
    
    category: Mapped[str | None] = mapped_column(String(50), index=True, nullable=True)
    subcategory: Mapped[str | None] = mapped_column(String(50), nullable=True)
    dominant_color: Mapped[str | None] = mapped_column(String(30), index=True, nullable=True)
    secondary_colors: Mapped[list[str]] = mapped_column(ARRAY(String), default=list)
    formality: Mapped[str | None] = mapped_column(String(20), index=True, nullable=True)
    season: Mapped[list[str]] = mapped_column(ARRAY(String), default=list)
    tags: Mapped[list[str]] = mapped_column(ARRAY(String), default=list)
    
    status: Mapped[str] = mapped_column(String(20), default="processing")
    ai_confidence: Mapped[float | None] = mapped_column(Float, nullable=True)
    
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
