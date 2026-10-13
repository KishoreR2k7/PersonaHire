import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, DateTime, Boolean, ForeignKey, JSON, Text, Float
from sqlalchemy.orm import relationship
from app.core.database import Base


def generate_uuid():
    return str(uuid.uuid4())


class JobDescription(Base):
    __tablename__ = "job_descriptions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    title = Column(String(255), nullable=False)
    company = Column(String(255), nullable=True)
    raw_text = Column(Text, nullable=False)
    extracted_skills = Column(JSON, default=list)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    matches = relationship("JobMatch", back_populates="job_description", cascade="all, delete-orphan")


class JobMatch(Base):
    __tablename__ = "job_matches"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    resume_id = Column(String(36), ForeignKey("resumes.id", ondelete="CASCADE"), nullable=False, index=True)
    job_description_id = Column(String(36), ForeignKey("job_descriptions.id", ondelete="CASCADE"), nullable=True, index=True)

    job_title = Column(String(255), nullable=False)
    company_name = Column(String(255), nullable=True)
    job_text = Column(Text, nullable=False)

    match_score = Column(Integer, nullable=False)  # 0-100 rubric match
    rubric_breakdown = Column(JSON, default=dict)
    matched_skills = Column(JSON, default=list)
    missing_skills = Column(JSON, default=list)
    required_vs_preferred = Column(JSON, default=dict)
    relevant_projects = Column(JSON, default=list)
    keyword_coverage = Column(Float, default=0.0)
    sections_to_improve = Column(JSON, default=list)
    recommended_topics = Column(JSON, default=list)
    suggested_interview_questions = Column(JSON, default=list)
    tailored_resume_suggestions = Column(JSON, default=dict)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="job_matches")
    resume = relationship("Resume", back_populates="job_matches")
    job_description = relationship("JobDescription", back_populates="matches")
