from sqlalchemy import Column, String, Float, Integer, ForeignKey, DateTime, text
from sqlalchemy.dialects.postgresql import UUID, JSONB
from db.database import Base

class AIEvaluation(Base):
    __tablename__ = "ai_evaluations"

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    application_id = Column(UUID(as_uuid=True), ForeignKey("applications.id", ondelete="CASCADE"))
    model_used = Column(String)
    semantic_score = Column(Float)
    skill_score = Column(Float)
    experience_score = Column(Float)
    overall_score = Column(Float)
    confidence_score = Column(String)
    evaluation_version = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=text("now()"))

class AIExplanation(Base):
    __tablename__ = "ai_explanations"

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    application_id = Column(UUID(as_uuid=True), ForeignKey("applications.id", ondelete="CASCADE"))
    strengths = Column(JSONB)
    gaps = Column(JSONB)
    improvements = Column(JSONB)
    confidence_rationale = Column(String)
    generated_by = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=text("now()"))

class Embedding(Base):
    __tablename__ = "embeddings"

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    application_id = Column(UUID(as_uuid=True), ForeignKey("applications.id", ondelete="CASCADE"))
    embedding = Column(JSONB)
    created_at = Column(DateTime(timezone=True), server_default=text("now()"))

class AILog(Base):
    __tablename__ = "ai_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    application_id = Column(UUID(as_uuid=True), ForeignKey("applications.id", ondelete="CASCADE"))
    model_used = Column(String)
    input_tokens = Column(Integer)
    output_tokens = Column(Integer)
    latency_ms = Column(Integer)
    status = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=text("now()"))
