import uuid
from datetime import datetime, timezone
from sqlalchemy import String, DateTime, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base

class SavedOutfit(Base):
    __tablename__ = "saved_outfits"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    name: Mapped[str | None] = mapped_column(String(100), nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    items: Mapped[list["SavedOutfitItem"]] = relationship(back_populates="saved_outfit", cascade="all, delete-orphan")

class SavedOutfitItem(Base):
    __tablename__ = "saved_outfit_items"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    saved_outfit_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("saved_outfits.id", ondelete="CASCADE"), nullable=False)
    wardrobe_item_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("wardrobe_items.id", ondelete="CASCADE"), nullable=False)
    
    saved_outfit: Mapped["SavedOutfit"] = relationship(back_populates="items")
