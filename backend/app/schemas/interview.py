from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field


class InterviewCreate(BaseModel):
    resume_id: Optional[str] = None
    target_role: str = "Software Engineer"
    interview_type: str = "mixed"  # hr, behavioral, technical, project, mixed
    difficulty: str = "intermediate"  # beginner, intermediate, advanced
    duration_minutes: int = 15
    total_questions: int = 5
    interaction_mode: str = "text"  # text, voice


class InterviewQuestionResponse(BaseModel):
    id: str
    session_id: str
    order_index: int
    question_text: str
    category: str
    context_topic: Optional[str] = None
    is_follow_up: bool

    class Config:
        from_attributes = True


class AnswerSubmit(BaseModel):
    question_id: str
    answer_text: str = Field(..., min_length=2)
    time_taken_seconds: int = 0


class AnswerFeedbackResponse(BaseModel):
    id: str
    question_id: str
    score: int
    technical_accuracy: int
    clarity_communication: int
    depth_of_explanation: int
    star_format_score: int
    feedback: str
    key_strengths: List[str]
    areas_for_improvement: List[str]
    is_interview_complete: bool
    next_question: Optional[InterviewQuestionResponse] = None
    interviewer_thought: Optional[str] = None
    interviewer_reply: Optional[str] = None


class InterviewEvaluationResponse(BaseModel):
    id: str
    session_id: str
    overall_performance_score: int
    communication_clarity_score: int
    technical_correctness_score: int
    relevance_score: int
    depth_score: int
    problem_solving_score: int
    star_method_adherence: int
    summary_verdict: str
    strong_answers: List[Dict[str, Any]]
    weak_answers: List[Dict[str, Any]]
    improved_sample_answers: List[Dict[str, Any]]
    personalized_exercises: List[str]
    recommended_next_interview: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class InterviewSessionListItem(BaseModel):
    id: str
    target_role: str
    interview_type: str
    difficulty: str
    duration_minutes: int
    total_questions: int
    interaction_mode: str
    status: str
    current_question_index: int
    overall_score: Optional[int] = None
    created_at: datetime
    completed_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class InterviewSessionDetail(InterviewSessionListItem):
    questions: List[InterviewQuestionResponse] = []
    evaluation: Optional[InterviewEvaluationResponse] = None
