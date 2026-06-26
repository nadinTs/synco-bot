from sqlalchemy import Column, Integer, String, DateTime
from backend.database.connection import Base

class DbEvent(Base):
    __tablename__ = "events"
    
    id = Column(Integer, primary_key=True, index=True)
    family_id = Column(Integer, index=True, default=1)
    creator_name = Column(String(100), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(String(1000), nullable=True)
    event_date = Column(DateTime, nullable=False)
    color_tag = Column(String(7), nullable=False, default="#3b82f6")
