from sqlalchemy import Column, Integer, String, Text, JSON, ForeignKey
from sqlalchemy.orm import relationship
from db.database import Base

class Job(Base):
    __tablename__ = "jobs"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(Text)
    requirements = Column(JSON)  # List of required skills and their weightage
    experience_level = Column(String)  # e.g., Low, Medium, High
    cutoff_score = Column(Integer, default=70)
    created_by = Column(Integer, ForeignKey("users.id"))
    
    owner = relationship("User", backref="jobs")
