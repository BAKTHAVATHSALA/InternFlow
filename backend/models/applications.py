from sqlalchemy import Column, String, ForeignKey, DateTime, text
from sqlalchemy.dialects.postgresql import UUID, JSONB
from db.database import Base

class Application(Base):
    __tablename__ = "applications"

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"))
    job_id = Column(UUID(as_uuid=True), ForeignKey("jobs.id", ondelete="CASCADE"))
    referral_id = Column(UUID(as_uuid=True), ForeignKey("referrals.id", ondelete="SET NULL"))
    status = Column(String, server_default=text("'applied'")) 
    resume_url = Column(String)
    resume_data = Column(JSONB)
    applied_at = Column(DateTime(timezone=True), server_default=text("now()"))
    reviewed_at = Column(DateTime(timezone=True))
    selected_at = Column(DateTime(timezone=True))
    rejected_at = Column(DateTime(timezone=True))
    completed_at = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=text("now()"))
    updated_at = Column(DateTime(timezone=True), server_default=text("now()"))
