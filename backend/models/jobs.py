from sqlalchemy import Column, String, Float, Boolean, DateTime, text, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB
from db.database import Base

class Job(Base):
    __tablename__ = "jobs"

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    title = Column(String, index=True)
    description = Column(String)
    requirements = Column(JSONB) # {required_skills: [], experience_level: ""}
    target_skills = Column(JSONB)
    cutoff_score = Column(Float, default=70.0)
    mentor_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"))
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"))
    is_active = Column(Boolean, server_default=text("true"))
    created_at = Column(DateTime(timezone=True), server_default=text("now()"))
    updated_at = Column(DateTime(timezone=True), server_default=text("now()"))
