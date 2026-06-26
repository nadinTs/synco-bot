from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional

class EventCreateSchema(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=1000)
    event_date: datetime
    color_tag: str = Field("#3b82f6", min_length=7, max_length=7)
    creator_name: str = Field(..., max_length=100)

class EventResponseSchema(EventCreateSchema):
    id: int
    
    class Config:
        from_attributes = True
