# OrchestrAI — Multi-Agent Exam Center Allocation & Risk Mitigation Platform

OrchestrAI is a full-stack system that solves a real logistics problem: assigning thousands of exam candidates (NEET / JEE / CUET) to the nearest available exam center while keeping every center within safe capacity limits. A geospatial allocation engine performs the initial assignment, and a rule-based multi-agent layer then audits the result, flags overcrowded or low-quality centers, and autonomously rebalances candidates to restore network stability — with every decision written to a live audit log that streams to the dashboard.

## How it works

**1. Allocation Engine** (`app/routers/orchestrate.py`)
For every student, the engine calculates the haversine distance to every exam center with remaining capacity and assigns them to the nearest one. Runs as a FastAPI background task so the API stays responsive during a full batch run.

**2. Multi-Agent Consensus Loop** (`app/agents/engine.py`)
Once initial allocation completes, three agents inspect the result and act on it:
- **Center Intelligence Agent** — flags centers below an infrastructure quality threshold.
- **Risk Prediction Agent** — detects centers over 90% capacity and autonomously reroutes 10% of their assigned students to the best available backup center, reducing overcrowding in real time.
- **Operations Agent** — finalizes and reports the resulting network state.

Every action taken by every agent is written to an `AgentAuditLog` table, giving a full, inspectable trail of *why* the system made each decision.

**3. Live Dashboard** (`frontend/`)
A React + Vite interface (Three.js/drei for the 3D "Intelligence Core" visualization, Framer Motion for animation) presents allocation results, per-center capacity, and a real-time agent activity feed over WebSockets.

## Tech Stack

- **Backend:** FastAPI, SQLAlchemy, SQLite (zero-config for local/demo use; schema is Postgres/Supabase-ready)
- **Frontend:** React 19, Vite, React Router, Three.js + @react-three/drei, Framer Motion
- **Realtime:** WebSockets for live telemetry to the dashboard

## Project Structure

```text
orchestrai-backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # <--- The entry point (where you initialize FastAPI)
│   ├── core/
│   │   ├── __init__.py
│   │   └── database.py      # <--- Supabase/PostgreSQL connection engine
│   ├── models/
│   │   ├── __init__.py
│   │   ├── center.py        # ExamCenter model
│   │   ├── student.py       # Student model
│   │   ├── allocation.py    # Allocation model
│   │   └── audit_log.py     # AgentAuditLog model
│   └── routers/
│       ├── __init__.py
│       ├── orchestrate.py   # /api/v1/orchestrate routes
│       ├── analytics.py     # /api/v1/analytics routes
│       └── stream.py        # /api/v1/stream (WebSocket) routes
├── .env                     # Supabase URL and Database secrets
├── requirements.txt         # Your project dependencies
└── .github/
    └── workflows/
        └── pipeline.yaml    # CI/CD Pipeline

```

## Quick Start

**Backend**
```bash
pip install -r requirements.txt
python seed_data.py          # one-time: populate SQLite with demo centers & students
uvicorn app.main:app --reload
```

**Frontend**
```bash
cd frontend
npm install
npm run dev
```

Then hit `POST /api/v1/orchestrate/run` to trigger an allocation pass and watch the dashboard update via the telemetry WebSocket.

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/orchestrate/run` | Runs the allocation pipeline + agent consensus loop (async) |
| `GET`  | `/api/v1/analytics/overview` | Dashboard summary metrics + recent agent audit logs |
| `WS`   | `/api/v1/stream/ws/telemetry` | Live agent activity stream |

## Roadmap

- Implement `risk_agent.py` and `allocation_agent.py` as standalone, independently testable agent modules
- Replace simulated WebSocket telemetry with live events sourced from the audit log
- Swap SQLite for the included Postgres/Supabase schema for multi-user deployment
- Add LLM-based reasoning (LangChain is already a dependency) for natural-language decision summaries

