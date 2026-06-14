import asyncio
import json
import random
from fastapi import APIRouter, WebSocket, WebSocketDisconnect

router = APIRouter()

# Dynamic simulation logs to feed the front-end Mission Control interface
AGENT_THOUGHT_POOL = [
    {"agent": "Allocation Agent", "message": "Evaluating spatial distribution arrays for student clusters..."},
    {"agent": "Risk Prediction Agent", "message": "Analyzing metro transit capacity and expected commuter load patterns."},
    {"agent": "Center Intelligence Agent", "message": "Verifying backup server availability and power-grid stability scores."},
    {"agent": "Risk Prediction Agent", "message": "WARNING: High student density detected along sector 62 transit corridor."},
    {"agent": "Allocation Agent", "message": "Re-routing 14 student slots to lower load auxiliary assessment facility."},
    {"agent": "Operations Agent", "message": "Generating proactive contingency deployment report for administrative review."}
]

websocket_router = APIRouter()

@router.websocket("/ws/telemetry")
async def websocket_telemetry_endpoint(websocket: WebSocket):
    """
    Establishes a continuous, bi-directional persistent socket state to push
    live engine telemetry messages directly onto the frontend dashboard widgets.
    """
    await websocket.accept()
    print("Frontend Mission Control terminal connected to Telemetry stream.")
    
    try:
        # Initial handshake alert packet
        await websocket.send_json({
            "agent": "System Core",
            "message": "OrchestrAI multi-agent telemetry stream linked successfully.",
            "type": "system"
        })
        
        # Infinite event stream loop simulating active agent multi-threaded cooperation
        while True:
            # Choose a random thought event from our system pool
            log_packet = random.choice(AGENT_THOUGHT_POOL)
            
            # Inject a random metric shift to make graphs bounce dynamically on screen
            log_packet["telemetry_shift"] = {
                "efficiency_delta": round(random.uniform(-0.5, 0.8), 2),
                "risk_index": round(random.uniform(1.2, 4.8), 1)
            }
            
            # Push payload directly to client browser through the pipe
            await websocket.send_json(log_packet)
            
            # Wait 2 seconds before throwing the next agent processing milestone event
            await asyncio.sleep(2.0)
            
    except WebSocketDisconnect:
        print("Frontend Mission Control terminal dropped connection socket safely.")
    except Exception as e:
        print(f"Stream interrupted unexpectedly: {e}")