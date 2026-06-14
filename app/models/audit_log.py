from sqlalchemy import Column, Integer, String, TEXT, TIMESTAMP, JSON
import datetime
from app.core.database import Base

class AgentAuditLog(Base):
    __tablename__ = "agent_logs"

    id = Column(Integer, primary_key=True, index=True)
    agent_name = Column(String, nullable=False) # e.g., "Risk Prediction Agent"
    action_taken = Column(TEXT, nullable=False)
    impact_metrics = Column(JSON, nullable=True) # {"overcrowding_metric": "reduced"}
    timestamp = Column(TIMESTAMP, default=datetime.datetime.utcnow)