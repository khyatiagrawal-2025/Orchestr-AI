from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

# SWITCH TO LOCAL SQLITE FILE (Zero Internet Required, Completely Bulletproof for Hackathons)
DATABASE_URL = "sqlite:///./orchestrai.db"

# Create the engine (with special argument required only for SQLite)
engine = create_engine(
    DATABASE_URL, 
    connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()