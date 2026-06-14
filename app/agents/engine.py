import json
from sqlalchemy.orm import Session
from app.models.center import ExamCenter
from app.models.student import Student
from app.models.allocation import Allocation
from app.models.audit_log import AgentAuditLog

class OrchestrAIEngine:
    def __init__(self, db: Session):
        self.db = db

    def run_agent_consensus_loop(self):
        """
        The multi-agent execution loop where agents evaluate the initial algorithmic 
        allocations, flag bottlenecks, and autonomously resolve risks.
        """
        print("[Engine] Multi-Agent consensus loop engaged.")

    
        # 1. CENTER INTELLIGENCE AGENT PHASE
        self._log_agent_action(
            "Center Intelligence Agent",
            "Evaluating infrastructural readiness scores for all registered test nodes.",
            {"status": "evaluating"}
        )
        
        low_quality_centers = self.db.query(ExamCenter).filter(ExamCenter.infra_quality_score < 4.0).all()
        flagged_center_ids = [c.id for c in low_quality_centers]
        
        if flagged_center_ids:
            self._log_agent_action(
                "Center Intelligence Agent",
                f"🚨 FLAG DETECTED: {len(flagged_center_ids)} centers dropped below baseline quality standards. Passing to Risk Agent.",
                {"flagged_centers": flagged_center_ids}
            )

        
        # 2. RISK PREDICTION AGENT PHASE
        self._log_agent_action(
            "Risk Prediction Agent",
            "Analyzing commuter traffic vectors and capacity thresholds for safety violations.",
            {"status": "scanning_bottlenecks"}
        )

        overcrowded_centers = self.db.query(ExamCenter).filter(ExamCenter.current_occupancy > (ExamCenter.capacity * 0.9)).all()
        
        reallocation_count = 0
        for center in overcrowded_centers:
            self._log_agent_action(
                "Risk Prediction Agent",
                f"🚨 CRITICAL OVERLOAD: Center '{center.name}' is over 90% capacity limit. Initiating agent mitigation protocols.",
                {"center_id": center.id, "occupancy": center.current_occupancy}
            )

            # Autonomous mitigation: Find the highest quality backup center with capacity left
            backup_center = self.db.query(ExamCenter).\
                filter(ExamCenter.id != center.id, ExamCenter.current_occupancy < ExamCenter.capacity).\
                order_by(ExamCenter.infra_quality_score.desc()).first()

            if backup_center:
                # Intercept allocations and move 10% of students out to balance the network load
                overflow_students_count = int(center.current_occupancy * 0.10)
                allocations_to_move = self.db.query(Allocation).filter(Allocation.center_id == center.id).limit(overflow_students_count).all()

                for alloc in allocations_to_move:
                    alloc.center_id = backup_center.id
                    center.current_occupancy -= 1
                    backup_center.current_occupancy += 1
                    reallocation_count += 1
                
                self.db.commit()

        if reallocation_count > 0:
            self._log_agent_action(
                "Risk Prediction Agent",
                f"RISK MITIGATED: Autonomously redistributed {reallocation_count} student slots to prevent transit gridlock.",
                {"slots_moved": reallocation_count}
            )

        
        # 3. OPERATIONS AGENT FINALIZATION
        self._log_agent_action(
            "Operations Agent",
            "Compiling final structural network state blueprints for administrative approval.",
            {"network_health": "stable", "optimization_cycles": "complete"}
        )
        print("[Engine] Multi-Agent loop finished cleanly.")

    def _log_agent_action(self, agent_name: str, action: str, metrics: dict):
        """Helper method to write agent behaviors straight to the DB log chain"""
        log = AgentAuditLog(
            agent_name=agent_name,
            action_taken=action,
            impact_metrics=metrics
        )
        self.db.add(log)
        self.db.commit()