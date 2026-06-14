from pydantic import BaseModel
from typing import List, Dict, Any

class TelemetryLogSchema(BaseModel):
    agent: str
    action: str
    metrics: Dict[str, Any]
    time: str

class DashboardMetrics(BaseModel):
    total_students_allocated: int
    average_travel_distance_km: float
    overcrowded_centers_flagged: int
    system_coordination_score: str

class AnalyticsOverviewResponse(BaseModel):
    metrics: DashboardMetrics
    agent_telemetry_stream: List[TelemetryLogSchema]