from sqlalchemy import Column, Integer, String, Float, ForeignKey, Enum, JSON, DateTime
from sqlalchemy.orm import relationship
from db.database import Base
import enum
from datetime import datetime

class ApplicationStatus(str, enum.Enum):
    APPLIED = "applied"
    REVIEWED = "reviewed"
    SELECTED = "selected"
    ONBOARDED = "onboarded"
    CLOSED = "closed"

class Application(Base):
    __tablename__ = "applications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    job_id = Column(Integer, ForeignKey("jobs.id"))
    status = Column(Enum(ApplicationStatus), default=ApplicationStatus.APPLIED)
    
    # Scoring fields
    overall_score = Column(Float, default=0.0)
    semantic_score = Column(Float, default=0.0)
    skill_score = Column(Float, default=0.0)
    experience_score = Column(Float, default=0.0)
    confidence_score = Column(String)  # High, Medium, Low
    
    # AI Analysis
    resume_data = Column(JSON)  # Extracted skills, experience, etc.
    explanation = Column(JSON)  # Structured reasoning
    improvement_suggestions = Column(JSON)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User")
    job = relationship("Job")
