import math
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.student import Student
from app.models.center import ExamCenter
from app.models.allocation import Allocation
from app.models.audit_log import AgentAuditLog

router = APIRouter()

def calculate_haversine_distance(coord1: str, coord2: str) -> float:
    """
    Calculates the great-circle distance between two points on a sphere 
    given their long-lat string coordinates format "lat,lng"
    """
    try:
        lat1, lon1 = map(float, coord1.split(","))
        lat2, lon2 = map(float, coord2.split(","))
        
        # Radius of Planet Earth in kilometers
        R = 6371.0 
        
        dlat = math.radians(lat2 - lat1)
        dlon = math.radians(lon2 - lon1)
        
        a = (math.sin(dlat / 2) ** 2 + 
             math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2) ** 2)
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
        
        return round(R * c, 2)
    except Exception:
        return 999.0 # Fallback high distance if coordinate parsing breaks

def run_allocation_pipeline(db: Session):
    """
    Background worker that optimizes student assignments to closest centers 
    while observing maximum capacity metrics.
    """
    # 1. Initialize Audit entry for the UI Mission Control feed
    start_log = AgentAuditLog(
        agent_name="Allocation Agent",
        action_taken="Initiating batch geospatial routing optimization.",
        impact_metrics={"status": "started"}
    )
    db.add(start_log)
    db.commit()

    # Clear previous allocations to reset the dashboard state safely
    db.query(Allocation).delete()
    db.commit()
    
    # Reset center capacities tracker counters locally
    centers = db.query(ExamCenter).all()
    center_capacity_map = {c.id: {"capacity": c.capacity, "filled": 0, "model": c} for c in centers}
    
    students = db.query(Student).all()
    successful_allocations = 0
    total_travel_distance = 0.0

    # 2. Iterate and match each student profile
    for student in students:
        best_center_id = None
        min_distance = float('inf')
        
        for c_id, info in center_capacity_map.items():
            # Check if center has room left
            if info["filled"] < info["capacity"]:
                distance = calculate_haversine_distance(student.location, info["model"].location)
                if distance < min_distance:
                    min_distance = distance
                    best_center_id = c_id
                    
        # 3. Commit allocation link if a match is found
        if best_center_id:
            allocation = Allocation(
                student_id=student.id,
                center_id=best_center_id,
                distance_km=min_distance
            )
            db.add(allocation)
            
            # Increment current occupancy counters
            center_capacity_map[best_center_id]["filled"] += 1
            center_capacity_map[best_center_id]["model"].current_occupancy += 1
            
            successful_allocations += 1
            total_travel_distance += min_distance

    # 4. Finalize calculations & update logs
    avg_distance = round(total_travel_distance / successful_allocations, 1) if successful_allocations > 0 else 0
    
    end_log = AgentAuditLog(
        agent_name="Allocation Agent",
        action_taken="Batch optimization loop finalized successfully.",
        impact_metrics={
            "students_allocated": successful_allocations,
            "average_travel_distance_km": avg_distance,
            "status": "completed"
        }
    )
    db.add(end_log)
    db.commit()
    print("Allocation pipeline optimization phase complete.")

@router.post("/run")
def trigger_orchestration_engine(background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    """
    Triggers OrchestrAI allocation processes asynchronously so the UI 
    doesn't freeze during execution.
    """
    background_tasks.add_task(run_allocation_pipeline, db)
    return {
        "status": "processing",
        "message": "OrchestrAI spatial multi-agent allocation matrix initiated."
    }