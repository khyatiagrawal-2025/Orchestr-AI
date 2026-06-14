from pydantic import BaseModel
from typing import Optional, List

class CenterSchema(BaseModel):
    id: int
    name: str
    location: str
    capacity: int
    current_occupancy: int
    infra_quality_score: float
    accessibility_score: float

    class Config:
        from_attributes = True

class StudentSchema(BaseModel):
    id: int
    name: str
    location: str
    exam_type: str

    class Config:
        from_attributes = True