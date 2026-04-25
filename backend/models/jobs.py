from sqlalchemy import Column, Integer, String, Text, JSON
from db.database import Base

class Job(Base):
    __tablename__ = "jobs"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(Text)
    requirements = Column(JSON)  # List of required skills and their weightage
    experience_level = Column(String)  # e.g., Beginner, Intermediate, Advanced
