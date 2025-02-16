from sqlalchemy import create_engine, Column, Integer, Float, String
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.config import config

Base = declarative_base()

class HealthRecordDB(Base):
    """
    Database model for storing health records.
    """
    __tablename__ = "health_records"
    id = Column(Integer, primary_key=True, index=True)
    ppg_signal = Column(String, nullable=False)  # Storing as JSON string
    heart_rate = Column(Float, nullable=True)
    systolic_bp = Column(Integer, nullable=True)
    diastolic_bp = Column(Integer, nullable=True)
    ecg_signal = Column(String, nullable=True)

# Database connection setup
db_engine = create_engine(config.DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=db_engine)

# Create tables
Base.metadata.create_all(bind=db_engine)

def get_db():
    """Dependency to get a new database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
