import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, DateTime, Boolean, ForeignKey, JSON, Text, Float
from sqlalchemy.orm import relationship
from app.core.database import Base


def generate_uuid():
    return str(uuid.uuid4())


class Resume(Base):
    __tablename__ = "resumes"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False, default="Untitled Resume")
    file_path = Column(String(512), nullable=True)
    file_name = Column(String(255), nullable=True)
    file_size_bytes = Column(Integer, nullable=True)
    file_type = Column(String(50), nullable=True)  # pdf, docx, scanned_pdf
    raw_text = Column(Text, nullable=True)
    is_primary = Column(Boolean, default=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Structured resume data (contact, summary, education, experience, projects, skills, certifications)
    structured_data = Column(JSON, default=dict)

    # Relationships
    user = relationship("User", back_populates="resumes")
    versions = relationship("ResumeVersion", back_populates="resume", cascade="all, delete-orphan", order_by="desc(ResumeVersion.version_number)")
    analyses = relationship("ResumeAnalysis", back_populates="resume", cascade="all, delete-orphan", order_by="desc(ResumeAnalysis.created_at)")
    job_matches = relationship("JobMatch", back_populates="resume", cascade="all, delete-orphan")
    interviews = relationship("InterviewSession", back_populates="resume", cascade="all, delete-orphan")


class ResumeVersion(Base):
    __tablename__ = "resume_versions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    resume_id = Column(String(36), ForeignKey("resumes.id", ondelete="CASCADE"), nullable=False, index=True)
    version_number = Column(Integer, nullable=False, default=1)
    version_name = Column(String(255), nullable=False, default="Initial Version")
    structured_data = Column(JSON, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    resume = relationship("Resume", back_populates="versions")


class ResumeAnalysis(Base):
    __tablename__ = "resume_analyses"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    resume_id = Column(String(36), ForeignKey("resumes.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    
    overall_score = Column(Integer, nullable=False)  # 0-100
    
    # 6 Configurable Weighted Category Scores (0-100 each)
    # - skills_relevance (20%)
    # - projects_experience (25%)
    # - work_achievements (20%)
    # - education_certs (10%)
    # - ats_readability (15%)
    # - writing_impact (10%)
    category_scores = Column(JSON, nullable=False)

    strengths = Column(JSON, default=list)  # list of strings
    missing_sections = Column(JSON, default=list)  # list of strings
    weak_bullet_rewrites = Column(JSON, default=list)  # list of {original, improved, reason}
    missing_measurable_achievements = Column(JSON, default=list)  # list of items
    skill_gaps = Column(JSON, default=list)  # list of skills
    ats_concerns = Column(JSON, default=list)  # list of ATS issues
    actionable_recommendations = Column(JSON, default=list)  # list of actionable recommendations
    prioritized_checklist = Column(JSON, default=list)  # list of {id, task, priority, impact}
    verified_facts = Column(JSON, default=dict)  # extracted confirmed facts

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    resume = relationship("Resume", back_populates="analyses")
