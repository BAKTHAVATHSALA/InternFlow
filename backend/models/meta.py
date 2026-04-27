from sqlalchemy import Column, String, Boolean, ForeignKey, DateTime, text, Integer
from sqlalchemy.dialects.postgresql import UUID, JSONB
from db.database import Base

class SLATracking(Base):
    __tablename__ = "sla_tracking"

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    application_id = Column(UUID(as_uuid=True), ForeignKey("applications.id", ondelete="CASCADE"))
    stage = Column(String)
    expires_at = Column(DateTime(timezone=True))
    reminder_at = Column(DateTime(timezone=True))
    is_expired = Column(Boolean, server_default=text("false"))
    is_reminder_sent = Column(Boolean, server_default=text("false"))
    created_at = Column(DateTime(timezone=True), server_default=text("now()"))

class Certificate(Base):
    __tablename__ = "certificates"

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    application_id = Column(UUID(as_uuid=True), ForeignKey("applications.id", ondelete="CASCADE"))
    certificate_url = Column(String)
    issued_at = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=text("now()"))

class MagicLinkToken(Base):
    __tablename__ = "magic_link_tokens"

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"))
    application_id = Column(UUID(as_uuid=True), ForeignKey("applications.id", ondelete="CASCADE"))
    token = Column(String, unique=True, nullable=False)
    expires_at = Column(DateTime(timezone=True))
    is_used = Column(Boolean, server_default=text("false"))
    created_at = Column(DateTime(timezone=True), server_default=text("now()"))

class AccessControl(Base):
    __tablename__ = "access_control"

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    application_id = Column(UUID(as_uuid=True), ForeignKey("applications.id", ondelete="CASCADE"))
    access_type = Column(String)
    is_active = Column(Boolean, server_default=text("true"))
    expires_at = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=text("now()"))

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    application_id = Column(UUID(as_uuid=True), ForeignKey("applications.id", ondelete="SET NULL"))
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"))
    action = Column(String)
    from_status = Column(String)
    to_status = Column(String)
    entity_type = Column(String)
    entity_id = Column(UUID(as_uuid=True))
    details = Column(JSONB)
    created_at = Column(DateTime(timezone=True), server_default=text("now()"))

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"))
    application_id = Column(UUID(as_uuid=True), ForeignKey("applications.id", ondelete="CASCADE"))
    type = Column(String)
    message = Column(String)
    is_read = Column(Boolean, server_default=text("false"))
    sent_at = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=text("now()"))

class OTPVerification(Base):
    __tablename__ = "otp_verifications"
    
    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    email = Column(String, nullable=False)
    otp = Column(String, nullable=False)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    is_used = Column(Boolean, server_default=text("false"))
    created_at = Column(DateTime(timezone=True), server_default=text("now()"))
