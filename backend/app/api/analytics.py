from typing import Dict, Any, List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_user
from app.models.user import User
from app.models.resume import Resume, ResumeAnalysis
from app.models.interview import InterviewSession
from app.models.job_match import JobMatch
from app.models.roadmap import PreparationTask, UserActivity
from app.schemas.analytics import DashboardStatsResponse, ActivityItem

router = APIRouter(prefix="/analytics", tags=["Dashboard Analytics"])


@router.get("/dashboard", response_model=DashboardStatsResponse)
def get_dashboard_stats(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # 1. Resume analyses
    analyses = db.query(ResumeAnalysis).filter(ResumeAnalysis.user_id == current_user.id).order_by(ResumeAnalysis.created_at.desc()).all()
    latest_resume_score = analyses[0].overall_score if analyses else None
    score_change = (analyses[0].overall_score - analyses[1].overall_score) if len(analyses) > 1 else 0

    # 2. Interviews
    interviews = db.query(InterviewSession).filter(
        InterviewSession.user_id == current_user.id,
        InterviewSession.status == "completed"
    ).order_by(InterviewSession.created_at.desc()).all()
    interviews_completed = len(interviews)
    avg_interview_score = int(sum(i.overall_score for i in interviews if i.overall_score) / max(1, interviews_completed)) if interviews_completed else None

    # 3. Job matches
    job_matches_count = db.query(JobMatch).filter(JobMatch.user_id == current_user.id).count()

    # 4. Roadmap tasks
    tasks = db.query(PreparationTask).filter(PreparationTask.user_id == current_user.id).all()
    total_tasks_count = len(tasks)
    tasks_completed_count = sum(1 for t in tasks if t.is_completed)

    # 5. Explainable Readiness Index (0-100)
    # Weights: Resume (40%), Mock Interviews (40%), Roadmap (20%)
    res_factor = (latest_resume_score or 50) * 0.4
    int_factor = ((avg_interview_score or 55) if interviews_completed else 45) * 0.4
    task_factor = ((tasks_completed_count / max(1, total_tasks_count)) * 100) * 0.2 if total_tasks_count else 10
    readiness_percentage = min(100, int(res_factor + int_factor + task_factor))

    # 6. Dimensions for Radar Chart
    latest_cat = analyses[0].category_scores if analyses else {}
    dimensions = {
        "resume_quality": int((latest_cat.get("projects_experience", 16) / 25) * 100) if analyses else 60,
        "technical_skills": int((latest_cat.get("skills_relevance", 14) / 20) * 100) if analyses else 65,
        "communication": avg_interview_score or 70,
        "project_depth": int((latest_cat.get("work_achievements", 14) / 20) * 100) if analyses else 62,
        "ats_readiness": int((latest_cat.get("ats_readability", 12) / 15) * 100) if analyses else 75,
        "interview_acumen": (avg_interview_score - 5) if avg_interview_score else 58
    }

    # 7. Next best action logic
    if not analyses:
        next_action = {
            "title": "Analyze Your Resume First",
            "description": "Upload your PDF or DOCX resume to get an instant ATS score, category-level breakdown, and actionable fix checklist.",
            "cta_label": "Upload Resume",
            "cta_route": "/resumes/analyze",
            "priority": "urgent"
        }
    elif interviews_completed == 0:
        target_role = current_user.profile.target_role if current_user.profile and current_user.profile.target_role else "Software Engineer"
        next_action = {
            "title": f"Practice Your First AI Mock Interview for {target_role}",
            "description": "Experience dynamic questions based on your actual resume projects and receive instant feedback on clarity and technical depth.",
            "cta_label": "Start Mock Interview",
            "cta_route": "/interviews/setup",
            "priority": "high"
        }
    elif tasks_completed_count < 3:
        next_action = {
            "title": "Tackle Your Top Roadmap Improvement Tasks",
            "description": "Strengthen your technical foundation and practice behavioral STAR responses from your personalized roadmap.",
            "cta_label": "View Preparation Roadmap",
            "cta_route": "/roadmap",
            "priority": "medium"
        }
    else:
        next_action = {
            "title": "Tailor Your Resume Against a Live Job Description",
            "description": "Paste a target company JD to compare keyword coverage, identify missing competencies, and practice targeted questions.",
            "cta_label": "Match Job Description",
            "cta_route": "/job-matcher",
            "priority": "medium"
        }

    # 8. Recent activities
    activities = db.query(UserActivity).filter(UserActivity.user_id == current_user.id).order_by(UserActivity.created_at.desc()).limit(8).all()

    # 9. Interview trends
    trends = [
        {
            "session_id": i.id,
            "date": i.created_at.strftime("%b %d"),
            "score": i.overall_score or 70,
            "role": i.target_role
        }
        for i in reversed(interviews[:6])
    ]

    return DashboardStatsResponse(
        latest_resume_score=latest_resume_score,
        resume_score_change=score_change,
        interviews_completed=interviews_completed,
        average_interview_score=avg_interview_score,
        job_matches_count=job_matches_count,
        tasks_completed_count=tasks_completed_count,
        total_tasks_count=total_tasks_count,
        readiness_percentage=readiness_percentage,
        readiness_dimensions=dimensions,
        next_best_action=next_action,
        recent_activities=[ActivityItem.model_validate(a) for a in activities],
        interview_trends=trends
    )
