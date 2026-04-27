from sqlalchemy import Column, String, Boolean, Date, ForeignKey, DateTime, text
from sqlalchemy.dialects.postgresql import UUID
from db.database import Base

class JoiningForm(Base):
    __tablename__ = "joining_forms"

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    application_id = Column(UUID(as_uuid=True), ForeignKey("applications.id", ondelete="CASCADE"))
    address = Column(String)
    emergency_contact = Column(String)
    start_date = Column(Date)
    end_date = Column(Date)
    is_completed = Column(Boolean, server_default=text("false"))
    submitted_at = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=text("now()"))

class NDARecord(Base):
    __tablename__ = "nda_records"

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    application_id = Column(UUID(as_uuid=True), ForeignKey("applications.id", ondelete="CASCADE"))
    status = Column(String)
    document_url = Column(String)
    signed_at = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=text("now()"))

class Onboarding(Base):
    __tablename__ = "onboarding"

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    application_id = Column(UUID(as_uuid=True), ForeignKey("applications.id", ondelete="CASCADE"))
    status = Column(String)
    onboarded_at = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=text("now()"))
