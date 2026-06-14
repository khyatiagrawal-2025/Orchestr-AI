from sqlalchemy import Column, Integer, String
from app.core.database import Base

class Student(Base):
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    # Changed from Geometry to String for SQLite compatibility
    location = Column(String, nullable=False) 
    exam_type = Column(String, nullable=False) # NEET, CUET, JEE