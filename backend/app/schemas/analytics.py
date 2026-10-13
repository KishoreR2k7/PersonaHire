from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel


class ActivityItem(BaseModel):
    id: str
    action_type: str
    title: str
    details: Dict[str, Any]
    created_at: datetime

    class Config:
        from_attributes = True


class DashboardStatsResponse(BaseModel):
    # Key Metrics
    latest_resume_score: Optional[int] = None
    resume_score_change: Optional[int] = 0
    interviews_completed: int = 0
    average_interview_score: Optional[int] = None
    job_matches_count: int = 0
    tasks_completed_count: int = 0
    total_tasks_count: int = 0
    readiness_percentage: int = 0  # Explainable calculated readiness index

    # Readiness Dimensions (Radar chart data)
    readiness_dimensions: Dict[str, int] = {
        "resume_quality": 0,
        "technical_skills": 0,
        "communication": 0,
        "project_depth": 0,
        "ats_readiness": 0,
        "interview_acumen": 0
    }

    # Best next action
    next_best_action: Dict[str, Any]

    # Recent activities
    recent_activities: List[ActivityItem] = []
    interview_trends: List[Dict[str, Any]] = []
