import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, DateTime, Boolean, ForeignKey, JSON, Text
from sqlalchemy.orm import relationship
from app.core.database import Base


def generate_uuid():
    return str(uuid.uuid4())


class PreparationTask(Base):
    __tablename__ = "preparation_tasks"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    # Categories:
    # - resume_improvements
    # - technical_skills
    # - dsa_coding
    # - project_explanations
    # - hr_behavioral
    # - communication_practice
    # - role_specific
    category = Column(String(50), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    priority = Column(String(20), default="medium")  # high, medium, low
    estimated_duration_minutes = Column(Integer, default=30)
    is_completed = Column(Boolean, default=False)
    completed_at = Column(DateTime, nullable=True)
    supporting_resources = Column(JSON, default=list)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="roadmap_tasks")


class UserActivity(Base):
    __tablename__ = "user_activities"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    action_type = Column(String(50), nullable=False)  # resume_analyzed, resume_edited, mock_interview_finished, job_matched, task_completed
    title = Column(String(255), nullable=False)
    details = Column(JSON, default=dict)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="activities")
