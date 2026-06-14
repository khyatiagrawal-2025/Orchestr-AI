from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.database import Base, engine
from app.routers import orchestrate, analytics, stream

# Import ALL models cleanly so SQLAlchemy registers them
from app.models.center import ExamCenter
from app.models.student import Student
from app.models.allocation import Allocation
from app.models.audit_log import AgentAuditLog

# Deploy schemas directly into your Supabase project instance
Base.metadata.create_all(bind=engine)

app = FastAPI(title="OrchestrAI Command Center Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(orchestrate.router, prefix="/api/v1/orchestrate", tags=["Orchestration"])
app.include_router(analytics.router, prefix="/api/v1/analytics", tags=["Analytics"])
app.include_router(stream.router, prefix="/api/v1/stream", tags=["Telemetry Stream"])

@app.get("/")
def health_check():
    return {"status": "online", "system": "OrchestrAI Core"}