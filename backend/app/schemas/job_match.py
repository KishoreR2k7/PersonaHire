from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field


class JobMatchRequest(BaseModel):
    resume_id: str
    job_title: str
    company_name: Optional[str] = "Target Company"
    job_text: str = Field(..., min_length=20)


class JobMatchResponse(BaseModel):
    id: str
    user_id: str
    resume_id: str
    job_title: str
    company_name: Optional[str] = None
    job_text: str
    match_score: int
    rubric_breakdown: Dict[str, Any]
    matched_skills: List[str]
    missing_skills: List[str]
    required_vs_preferred: Dict[str, List[str]]
    relevant_projects: List[Dict[str, Any]]
    keyword_coverage: float
    sections_to_improve: List[str]
    recommended_topics: List[str]
    suggested_interview_questions: List[Dict[str, Any]]
    tailored_resume_suggestions: Dict[str, Any]
    created_at: datetime

    class Config:
        from_attributes = True
