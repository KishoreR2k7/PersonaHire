import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, DateTime, Boolean, ForeignKey, JSON, Text, Float
from sqlalchemy.orm import relationship
from app.core.database import Base


def generate_uuid():
    return str(uuid.uuid4())


class InterviewSession(Base):
    __tablename__ = "interview_sessions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    resume_id = Column(String(36), ForeignKey("resumes.id", ondelete="SET NULL"), nullable=True)

    target_role = Column(String(255), nullable=False)
    interview_type = Column(String(50), nullable=False, default="mixed")  # hr, behavioral, technical, project, mixed
    difficulty = Column(String(50), nullable=False, default="intermediate")  # beginner, intermediate, advanced
    duration_minutes = Column(Integer, default=15)
    total_questions = Column(Integer, default=5)
    interaction_mode = Column(String(50), default="text")  # text, voice

    status = Column(String(50), default="in_progress")  # setup, in_progress, completed, abandoned
    current_question_index = Column(Integer, default=0)
    overall_score = Column(Integer, nullable=True)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    completed_at = Column(DateTime, nullable=True)

    user = relationship("User", back_populates="interviews")
    resume = relationship("Resume", back_populates="interviews")
    questions = relationship("InterviewQuestion", back_populates="session", cascade="all, delete-orphan", order_by="InterviewQuestion.order_index")
    evaluation = relationship("InterviewEvaluation", back_populates="session", uselist=False, cascade="all, delete-orphan")


class InterviewQuestion(Base):
    __tablename__ = "interview_questions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    session_id = Column(String(36), ForeignKey("interview_sessions.id", ondelete="CASCADE"), nullable=False, index=True)
    order_index = Column(Integer, nullable=False)
    question_text = Column(Text, nullable=False)
    category = Column(String(50), default="technical")
    context_topic = Column(String(255), nullable=True)  # e.g., "Resume Project: E-Commerce Microservices"
    is_follow_up = Column(Boolean, default=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    session = relationship("InterviewSession", back_populates="questions")
    answers = relationship("InterviewAnswer", back_populates="question", cascade="all, delete-orphan")


class InterviewAnswer(Base):
    __tablename__ = "interview_answers"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    question_id = Column(String(36), ForeignKey("interview_questions.id", ondelete="CASCADE"), nullable=False, index=True)
    answer_text = Column(Text, nullable=False)
    time_taken_seconds = Column(Integer, default=0)
    
    # Per-answer assessment
    score = Column(Integer, nullable=True)  # 0-100
    technical_accuracy = Column(Integer, nullable=True)
    clarity_communication = Column(Integer, nullable=True)
    depth_of_explanation = Column(Integer, nullable=True)
    star_format_score = Column(Integer, nullable=True)
    feedback = Column(Text, nullable=True)
    key_strengths = Column(JSON, default=list)
    areas_for_improvement = Column(JSON, default=list)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    question = relationship("InterviewQuestion", back_populates="answers")


class InterviewEvaluation(Base):
    __tablename__ = "interview_evaluations"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    session_id = Column(String(36), ForeignKey("interview_sessions.id", ondelete="CASCADE"), unique=True, nullable=False)

    overall_performance_score = Column(Integer, nullable=False)  # 0-100
    communication_clarity_score = Column(Integer, nullable=False)
    technical_correctness_score = Column(Integer, nullable=False)
    relevance_score = Column(Integer, nullable=False)
    depth_score = Column(Integer, nullable=False)
    problem_solving_score = Column(Integer, nullable=False)
    star_method_adherence = Column(Integer, nullable=False)

    summary_verdict = Column(Text, nullable=False)
    strong_answers = Column(JSON, default=list)  # list of {question, answer_snippet, highlight}
    weak_answers = Column(JSON, default=list)  # list of {question, reason, suggestion}
    improved_sample_answers = Column(JSON, default=list)  # list of {question, improved_response}
    personalized_exercises = Column(JSON, default=list)  # list of exercises
    recommended_next_interview = Column(String(255), nullable=True)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    session = relationship("InterviewSession", back_populates="evaluation")
