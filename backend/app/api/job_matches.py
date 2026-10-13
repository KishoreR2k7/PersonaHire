import json
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_user
from app.models.user import User
from app.models.resume import Resume
from app.models.job_match import JobMatch, JobDescription
from app.models.roadmap import UserActivity
from app.schemas.job_match import JobMatchRequest, JobMatchResponse
from app.services.ai_service import AIService

router = APIRouter(prefix="/job-matches", tags=["Job Description Matcher"])


@router.post("/match", response_model=JobMatchResponse)
async def match_resume_with_job(
    req: JobMatchRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    resume = db.query(Resume).filter(Resume.id == req.resume_id, Resume.user_id == current_user.id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Selected resume not found.")

    structured_data = resume.structured_data or {}
    raw_text = resume.raw_text or json.dumps(structured_data)

    # Run AI Matching
    result = await AIService.match_job_description(
        resume_data=structured_data,
        raw_resume_text=raw_text,
        job_title=req.job_title,
        job_text=req.job_text
    )

    # Save JobDescription
    jd_record = JobDescription(
        title=req.job_title,
        company=req.company_name,
        raw_text=req.job_text,
        extracted_skills=result.get("matched_skills", []) + result.get("missing_skills", [])
    )
    db.add(jd_record)
    db.flush()

    # Save JobMatch
    job_match = JobMatch(
        user_id=current_user.id,
        resume_id=resume.id,
        job_description_id=jd_record.id,
        job_title=req.job_title,
        company_name=req.company_name,
        job_text=req.job_text,
        match_score=result["match_score"],
        rubric_breakdown=result.get("rubric_breakdown", {}),
        matched_skills=result.get("matched_skills", []),
        missing_skills=result.get("missing_skills", []),
        required_vs_preferred=result.get("required_vs_preferred", {}),
        relevant_projects=result.get("relevant_projects", []),
        keyword_coverage=result.get("keyword_coverage", 0.0),
        sections_to_improve=result.get("sections_to_improve", []),
        recommended_topics=result.get("recommended_topics", []),
        suggested_interview_questions=result.get("suggested_interview_questions", []),
        tailored_resume_suggestions=result.get("tailored_resume_suggestions", {})
    )
    db.add(job_match)

    # Activity log
    activity = UserActivity(
        user_id=current_user.id,
        action_type="job_matched",
        title=f"Matched resume with '{req.job_title}' at {req.company_name or 'Company'} — {result['match_score']}% Match",
        details={"match_score": result["match_score"], "role": req.job_title}
    )
    db.add(activity)

    db.commit()
    db.refresh(job_match)

    return job_match


@router.get("/", response_model=List[JobMatchResponse])
def get_user_matches(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    matches = db.query(JobMatch).filter(JobMatch.user_id == current_user.id).order_by(JobMatch.created_at.desc()).all()
    return matches


@router.get("/{match_id}", response_model=JobMatchResponse)
def get_match_detail(match_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    match = db.query(JobMatch).filter(JobMatch.id == match_id, JobMatch.user_id == current_user.id).first()
    if not match:
        raise HTTPException(status_code=404, detail="Job match record not found.")
    return match
