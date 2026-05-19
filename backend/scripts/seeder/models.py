from sqlalchemy import Column, String, Integer, Boolean, ForeignKey, DateTime, Text, Numeric, Table, JSON, Enum
from sqlalchemy.dialects.postgresql import UUID, ARRAY, JSONB
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
import uuid
import datetime

Base = declarative_base()

class User(Base):
    __tablename__ = 'users'
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), nullable=False, unique=True)
    name = Column(String(255), nullable=False)
    role = Column(String(50), nullable=False, default='intern')
    status = Column(String(50), nullable=False, default='invited')
    phone = Column(String(20))
    avatar_url = Column(String(500))
    department = Column(String(100))
    employee_id = Column(String(50), unique=True)
    password_hash = Column(String(255))
    created_at = Column(DateTime(timezone=True), default=datetime.datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.datetime.utcnow)

class Job(Base):
    __tablename__ = 'jobs'
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(255), nullable=False)
    department = Column(String(100), nullable=False)
    description = Column(Text)
    tech_stack = Column(ARRAY(String))
    stipend = Column(Integer)
    duration_months = Column(Integer, nullable=False, default=6)
    mode = Column(String(50))
    location = Column(String(100))
    is_open = Column(Boolean, nullable=False, default=True)
    max_referrals = Column(Integer, default=20)
    created_by = Column(UUID(as_uuid=True), ForeignKey('users.id'))
    created_at = Column(DateTime(timezone=True), default=datetime.datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.datetime.utcnow)

class ReferralQuota(Base):
    __tablename__ = 'referral_quotas'
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    employee_id = Column(UUID(as_uuid=True), ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    cycle_label = Column(String(20), nullable=False)
    total_slots = Column(Integer, nullable=False, default=5)
    used_slots = Column(Integer, nullable=False, default=0)
    resets_at = Column(DateTime(timezone=True), nullable=False)
    created_at = Column(DateTime(timezone=True), default=datetime.datetime.utcnow)

class Referral(Base):
    __tablename__ = 'referrals'
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    employee_id = Column(UUID(as_uuid=True), ForeignKey('users.id'), nullable=False)
    intern_id = Column(UUID(as_uuid=True), ForeignKey('users.id'), nullable=False)
    job_id = Column(UUID(as_uuid=True), ForeignKey('jobs.id'), nullable=False)
    status = Column(String(50), nullable=False, default='pending')
    invite_token = Column(String(500))
    invite_token_expires_at = Column(DateTime(timezone=True))
    note_to_hr = Column(Text)
    intern_name = Column(String(255), nullable=False)
    intern_email = Column(String(255), nullable=False)
    intern_college = Column(String(255))
    intern_degree = Column(String(100))
    intern_grad_year = Column(Integer)
    resume_url = Column(String(500))
    created_at = Column(DateTime(timezone=True), default=datetime.datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.datetime.utcnow)

class Application(Base):
    __tablename__ = 'applications'
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    intern_id = Column(UUID(as_uuid=True), ForeignKey('users.id'), nullable=False)
    job_id = Column(UUID(as_uuid=True), ForeignKey('jobs.id'), nullable=False)
    referral_id = Column(UUID(as_uuid=True), ForeignKey('referrals.id'))
    status = Column(String(50), nullable=False, default='applied')
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    phone = Column(String(20))
    city = Column(String(100))
    college = Column(String(255))
    degree = Column(String(100))
    cgpa = Column(Numeric(3,1))
    grad_year = Column(Integer)
    resume_url = Column(String(500), nullable=False)
    github_url = Column(String(255))
    portfolio_url = Column(String(255))
    skills = Column(ARRAY(String))
    checklist = Column(JSONB)
    hr_note = Column(Text)
    rejection_reason = Column(Text)
    applied_at = Column(DateTime(timezone=True), default=datetime.datetime.utcnow)
    screened_at = Column(DateTime(timezone=True))
    offered_at = Column(DateTime(timezone=True))
    onboarded_at = Column(DateTime(timezone=True))
    updated_at = Column(DateTime(timezone=True), default=datetime.datetime.utcnow)

class AIScore(Base):
    __tablename__ = 'ai_scores'
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    application_id = Column(UUID(as_uuid=True), ForeignKey('applications.id', ondelete='CASCADE'), nullable=False, unique=True)
    overall_score = Column(Integer, nullable=False)
    skills_match = Column(Integer)
    experience_fit = Column(Integer)
    strengths = Column(ARRAY(String))
    gaps = Column(ARRAY(String))
    improvement_tips = Column(ARRAY(String))
    recommendation = Column(String(50), nullable=False)
    raw_ai_response = Column(JSONB)
    processing_time_ms = Column(Integer)
    processed_at = Column(DateTime(timezone=True), default=datetime.datetime.utcnow)

class Document(Base):
    __tablename__ = 'documents'
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    intern_id = Column(UUID(as_uuid=True), ForeignKey('users.id'), nullable=False)
    application_id = Column(UUID(as_uuid=True), ForeignKey('applications.id'), nullable=False)
    type = Column(String(50), nullable=False)
    signature_text = Column(String(255))
    signed_at = Column(DateTime(timezone=True))
    ip_address = Column(String(45))
    form_data = Column(JSONB)
    pdf_url = Column(String(500))
    created_at = Column(DateTime(timezone=True), default=datetime.datetime.utcnow)

class MentorAssignment(Base):
    __tablename__ = 'mentor_assignments'
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    mentor_id = Column(UUID(as_uuid=True), ForeignKey('users.id'), nullable=False)
    intern_id = Column(UUID(as_uuid=True), ForeignKey('users.id'), nullable=False, unique=True)
    application_id = Column(UUID(as_uuid=True), ForeignKey('applications.id'), nullable=False)
    assigned_at = Column(DateTime(timezone=True), default=datetime.datetime.utcnow)
    is_active = Column(Boolean, nullable=False, default=True)

class LMSModule(Base):
    __tablename__ = 'lms_modules'
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    job_id = Column(UUID(as_uuid=True), ForeignKey('jobs.id'))
    title = Column(String(255), nullable=False)
    type = Column(String(50), nullable=False)
    description = Column(Text)
    file_url = Column(String(500))
    duration_minutes = Column(Integer)
    sort_order = Column(Integer, nullable=False, default=1)
    is_active = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime(timezone=True), default=datetime.datetime.utcnow)

class LMSProgress(Base):
    __tablename__ = 'lms_progress'
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    intern_id = Column(UUID(as_uuid=True), ForeignKey('users.id'), nullable=False)
    module_id = Column(UUID(as_uuid=True), ForeignKey('lms_modules.id'), nullable=False)
    completed = Column(Boolean, nullable=False, default=False)
    progress_pct = Column(Integer, default=0)
    completed_at = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), default=datetime.datetime.utcnow)

class Project(Base):
    __tablename__ = 'projects'
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    intern_id = Column(UUID(as_uuid=True), ForeignKey('users.id'), nullable=False, unique=True)
    application_id = Column(UUID(as_uuid=True), ForeignKey('applications.id'), nullable=False)
    github_url = Column(String(500), nullable=False)
    demo_url = Column(String(500))
    description = Column(Text, nullable=False)
    features = Column(ARRAY(String))
    status = Column(String(50), nullable=False, default='pending_review')
    mentor_feedback = Column(Text)
    reviewed_by = Column(UUID(as_uuid=True), ForeignKey('users.id'))
    reviewed_at = Column(DateTime(timezone=True))
    submitted_at = Column(DateTime(timezone=True), default=datetime.datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.datetime.utcnow)

class Certificate(Base):
    __tablename__ = 'certificates'
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    intern_id = Column(UUID(as_uuid=True), ForeignKey('users.id'), nullable=False, unique=True)
    application_id = Column(UUID(as_uuid=True), ForeignKey('applications.id'), nullable=False)
    cert_number = Column(String(50), nullable=False, unique=True)
    pdf_url = Column(String(500), nullable=False)
    issued_at = Column(DateTime(timezone=True), default=datetime.datetime.utcnow)

class Reward(Base):
    __tablename__ = 'rewards'
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    employee_id = Column(UUID(as_uuid=True), ForeignKey('users.id'), nullable=False)
    referral_id = Column(UUID(as_uuid=True), ForeignKey('referrals.id'), nullable=False)
    amount = Column(Integer, nullable=False, default=5000)
    status = Column(String(50), nullable=False, default='pending')
    credited_at = Column(DateTime(timezone=True))
    paid_at = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), default=datetime.datetime.utcnow)

class Feedback(Base):
    __tablename__ = 'feedback'
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    mentor_id = Column(UUID(as_uuid=True), ForeignKey('users.id'), nullable=False)
    intern_id = Column(UUID(as_uuid=True), ForeignKey('users.id'), nullable=False)
    category = Column(String(100))
    message = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), default=datetime.datetime.utcnow)

class Notification(Base):
    __tablename__ = 'notifications'
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    type = Column(String(50), nullable=False, default='general')
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    link = Column(String(500))
    is_read = Column(Boolean, nullable=False, default=False)
    created_at = Column(DateTime(timezone=True), default=datetime.datetime.utcnow)

class AuditTrail(Base):
    __tablename__ = 'audit_trail'
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.id'))
    user_email = Column(String(255))
    user_role = Column(String(50))
    action = Column(String(100), nullable=False)
    entity_type = Column(String(100))
    entity_id = Column(UUID(as_uuid=True))
    module = Column(String(50))
    old_value = Column(JSONB)
    new_value = Column(JSONB)
    ip_address = Column(String(45))
    user_agent = Column(Text)
    created_at = Column(DateTime(timezone=True), default=datetime.datetime.utcnow)

class OTPToken(Base):
    __tablename__ = 'otp_tokens'
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    token_hash = Column(String(255), nullable=False)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    used = Column(Boolean, nullable=False, default=False)
    ip_address = Column(String(45))
    created_at = Column(DateTime(timezone=True), default=datetime.datetime.utcnow)

class Session(Base):
    __tablename__ = 'sessions'
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    token_hash = Column(String(255), nullable=False)
    ip_address = Column(String(45))
    user_agent = Column(Text)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    created_at = Column(DateTime(timezone=True), default=datetime.datetime.utcnow)

class Closure(Base):
    __tablename__ = 'closures'
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    intern_id = Column(UUID(as_uuid=True), ForeignKey('users.id'), nullable=False, unique=True)
    application_id = Column(UUID(as_uuid=True), ForeignKey('applications.id'), nullable=False)
    exit_survey_sent = Column(Boolean, nullable=False, default=False)
    exit_survey_sent_at = Column(DateTime(timezone=True))
    exit_survey_completed = Column(Boolean, nullable=False, default=False)
    rating = Column(Numeric(2,1))
    exit_feedback = Column(Text)
    performance_review_done = Column(Boolean, nullable=False, default=False)
    equipment_returned = Column(Boolean, nullable=False, default=False)
    access_revoked = Column(Boolean, nullable=False, default=False)
    payroll_finalised = Column(Boolean, nullable=False, default=False)
    record_archived = Column(Boolean, nullable=False, default=False)
    nda_post_reminder_sent = Column(Boolean, nullable=False, default=False)
    manager_signoff = Column(Boolean, nullable=False, default=False)
    return_offer = Column(Boolean)
    closed_by = Column(UUID(as_uuid=True), ForeignKey('users.id'))
    closed_at = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), default=datetime.datetime.utcnow)
