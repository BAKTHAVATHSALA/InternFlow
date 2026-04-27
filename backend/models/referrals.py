from sqlalchemy import Column, String, DateTime, text, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from db.database import Base

class Referral(Base):
    __tablename__ = "referrals"

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    referrer_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    job_id = Column(UUID(as_uuid=True), ForeignKey("jobs.id"))
    candidate_name = Column(String)
    candidate_email = Column(String)
    candidate_phone = Column(String)
    resume_url = Column(String)
    notes = Column(String)
    status = Column(String, server_default=text("'referred'")) # referred, expired, converted
    expires_at = Column(DateTime(timezone=True))
    reminder_sent_at = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=text("now()"))
    updated_at = Column(DateTime(timezone=True), server_default=text("now()"))
