from sqlalchemy import Column, String, ForeignKey, DateTime, text
from sqlalchemy.dialects.postgresql import UUID
from db.database import Base

class TaskAssignment(Base):
    __tablename__ = "task_assignments"

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    application_id = Column(UUID(as_uuid=True), ForeignKey("applications.id", ondelete="CASCADE"))
    mentor_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    status = Column(String)
    assigned_at = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=text("now()"))
    updated_at = Column(DateTime(timezone=True), server_default=text("now()"))

class Task(Base):
    __tablename__ = "tasks"

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    task_assignment_id = Column(UUID(as_uuid=True), ForeignKey("task_assignments.id", ondelete="CASCADE"))
    title = Column(String)
    description = Column(String)
    type = Column(String)
    resource_url = Column(String)
    status = Column(String, server_default=text("'pending'")) # pending, completed
    created_at = Column(DateTime(timezone=True), server_default=text("now()"))
    updated_at = Column(DateTime(timezone=True), server_default=text("now()"))

class ProjectSubmission(Base):
    __tablename__ = "project_submissions"

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    application_id = Column(UUID(as_uuid=True), ForeignKey("applications.id", ondelete="CASCADE"))
    task_assignment_id = Column(UUID(as_uuid=True), ForeignKey("task_assignments.id", ondelete="CASCADE"))
    title = Column(String)
    github_link = Column(String)
    description = Column(String)
    status = Column(String, server_default=text("'submitted'")) # submitted, approved, rework
    reviewed_by = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    reviewed_at = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=text("now()"))
    updated_at = Column(DateTime(timezone=True), server_default=text("now()"))
