from sqlalchemy import Column, Integer, String, Float
from app.core.database import Base

class ExamCenter(Base):
    __tablename__ = "exam_centers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    # Changed from Geometry to String for SQLite compatibility
    location = Column(String, nullable=False) 
    capacity = Column(Integer, nullable=False)
    current_occupancy = Column(Integer, default=0)
    infra_quality_score = Column(Float, default=5.0)
    accessibility_score = Column(Float, default=5.0)