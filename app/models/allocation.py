from sqlalchemy import Column, Integer, Float, ForeignKey, TIMESTAMP
import datetime
from app.core.database import Base

class Allocation(Base):
    __tablename__ = "allocations"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id", ondelete="CASCADE"), unique=True)
    center_id = Column(Integer, ForeignKey("exam_centers.id", ondelete="CASCADE"))
    distance_km = Column(Float, nullable=False)
    allocated_at = Column(TIMESTAMP, default=datetime.datetime.utcnow)