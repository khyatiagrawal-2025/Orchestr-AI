import random
from sqlalchemy.orm import Session
from app.core.database import SessionLocal, engine, Base
from app.models.student import Student
from app.models.center import ExamCenter

# Ensure tables exist before trying to add data
Base.metadata.create_all(bind=engine)

def seed_database():
    db: Session = SessionLocal()
    try:
        # Check if data already exists to avoid duplicate entries
        if db.query(ExamCenter).count() > 0 or db.query(Student).count() > 0:
            print("Database already contains data. Skipping seed sequence.")
            return

        print("Initializing data seed sequence for OrchestrAI...")

        # Base center coordinates for Delhi NCR
        base_lat, base_lng = 28.6139, 77.2090

        # 1. Generate 10 Mock Exam Centers
        centers = []
        center_names = [
            "Alpha Digital Zone, Noida", "Brainwave Assessment Center, Rohini", 
            "Core Infrastructure Lab, Gurugram", "Delta Public School, Dwarka", 
            "Elite Tech Institute, Okhla", "Future Systems Lab, Faridabad",
            "Global Online Testing, Ghaziabad", "Horizon Academy, Saket",
            "Infinity Valuation Center, Janakpuri", "Apex Informatics, Karol Bagh"
        ]

        for i, name in enumerate(center_names):
            # Create a localized coordinate offset within roughly 15-20km
            lat_offset = random.uniform(-0.15, 0.15)
            lng_offset = random.uniform(-0.15, 0.15)
            
            center = ExamCenter(
                name=name,
                location=f"{base_lat + lat_offset:.4f},{base_lng + lng_offset:.4f}",
                capacity=random.choice([200, 300, 500, 800]),
                current_occupancy=0,
                infra_quality_score=round(random.uniform(3.5, 5.0), 1),
                accessibility_score=round(random.uniform(3.8, 5.0), 1)
            )
            centers.append(center)
            db.add(center)

        # 2. Generate 100 Mock Students across different exams
        exams = ["NEET", "JEE", "CUET"]
        first_names = ["Ravi", "Amit", "Priya", "Rahul", "Anjali", "Vikram", "Sneha", "Gaurav", "Neha", "Arjun"]
        last_names = ["Ranjan", "Sharma", "Verma", "Kumar", "Singh", "Gupta", "Joshi", "Das", "Mishra", "Patel"]

        for _ in range(100):
            lat_offset = random.uniform(-0.25, 0.25)
            lng_offset = random.uniform(-0.25, 0.25)
            full_name = f"{random.choice(first_names)} {random.choice(last_names)}"
            
            student = Student(
                name=full_name,
                location=f"{base_lat + lat_offset:.4f},{base_lng + lng_offset:.4f}",
                exam_type=random.choice(exams)
            )
            db.add(student)

        db.commit()
        print(f"Successfully injected {len(center_names)} Exam Centers and 100 Student profiles into the local database engine.")
        
    except Exception as e:
        db.rollback()
        print(f"Seed process aborted due to error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()