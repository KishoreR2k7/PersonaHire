import os
import uuid
import json
from datetime import datetime, timezone
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_user
from app.core.config import settings
from app.models.user import User
from app.models.resume import Resume, ResumeVersion, ResumeAnalysis
from app.models.roadmap import UserActivity
from app.schemas.resume import (
    ResumeResponse, ResumeCreate, ResumeUpdate, ResumeAnalysisResponse,
    AIBulletRewriteRequest, AIBulletRewriteResponse, AISummaryImproveRequest, AISummaryImproveResponse
)
from app.services.doc_parser import DocumentParserService
from app.services.ai_service import AIService

router = APIRouter(prefix="/resumes", tags=["Resumes"])


@router.post("/upload", response_model=ResumeResponse)
async def upload_resume(
    file: UploadFile = File(...),
    title: Optional[str] = Form(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Validate extension
    filename = file.filename or "resume.pdf"
    ext = filename.lower().split(".")[-1]
    if ext not in ["pdf", "docx", "doc", "txt"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unsupported file format. Please upload a PDF or DOCX resume."
        )

    content = await file.read()
    if len(content) > settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File exceeds maximum size of {settings.MAX_UPLOAD_SIZE_MB}MB."
        )

    # Save to disk
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    saved_filename = f"{current_user.id}_{uuid.uuid4().hex[:8]}_{filename}"
    file_path = os.path.join(settings.UPLOAD_DIR, saved_filename)
    with open(file_path, "wb") as f:
        f.write(content)

    # Parse document
    parsed = DocumentParserService.parse_document(content, filename)
    raw_text = parsed.get("raw_text", "")
    structured_data = parsed.get("structured_data", {})
    file_type = "scanned_pdf" if parsed.get("is_scanned") else ext

    # Auto-title if not provided
    resume_title = title or f"{filename.rsplit('.', 1)[0].replace('_', ' ').title()}"

    resume = Resume(
        user_id=current_user.id,
        title=resume_title,
        file_path=file_path,
        file_name=filename,
        file_size_bytes=len(content),
        file_type=file_type,
        raw_text=raw_text,
        is_primary=len(current_user.resumes) == 0,
        structured_data=structured_data
    )
    db.add(resume)
    db.flush()

    # Create initial version
    version = ResumeVersion(
        resume_id=resume.id,
        version_number=1,
        version_name="Initial Extracted Version",
        structured_data=structured_data
    )
    db.add(version)

    # Activity log
    activity = UserActivity(
        user_id=current_user.id,
        action_type="resume_uploaded",
        title=f"Uploaded and parsed resume '{resume_title}'"
    )
    db.add(activity)

    db.commit()
    db.refresh(resume)

    return resume


@router.post("/create-blank", response_model=ResumeResponse)
def create_blank_resume(
    title: str = "My New Resume",
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    blank_data = {
        "contact": {
            "full_name": current_user.full_name,
            "email": current_user.email,
            "phone": "+1 (555) 019-2834",
            "location": "San Francisco, CA",
            "linkedin": "https://linkedin.com/in/profile",
            "github": "https://github.com/profile",
            "portfolio": ""
        },
        "summary": "Motivated software engineer with experience developing performant web applications and distributed systems.",
        "skills": [
            {"category": "Languages", "items": ["Python", "TypeScript", "JavaScript", "SQL"]},
            {"category": "Frameworks", "items": ["FastAPI", "React", "Node.js", "Tailwind CSS"]},
            {"category": "Tools & Cloud", "items": ["Docker", "Git", "PostgreSQL", "Redis"]}
        ],
        "experience": [
            {
                "id": "exp-1",
                "company": "Tech Corp",
                "position": "Software Engineering Intern",
                "location": "San Francisco, CA",
                "start_date": "Jun 2024",
                "end_date": "Aug 2024",
                "current": False,
                "bullets": [
                    "Engineered asynchronous REST APIs using FastAPI, improving request throughput by 35%.",
                    "Collaborated with cross-functional product teams to design responsive frontend components in React."
                ],
                "tech_stack": ["FastAPI", "Python", "React", "PostgreSQL"]
            }
        ],
        "projects": [
            {
                "id": "proj-1",
                "title": "Cloud Resume Analyzer",
                "description": "AI-powered platform parsing candidate credentials and generating ATS rubrics.",
                "role": "Lead Developer",
                "live_url": "https://personahire.com",
                "repo_url": "https://github.com/user/project",
                "bullets": [
                    "Architected full-stack career preparation portal serving 500+ active student sessions.",
                    "Implemented document extraction pipeline with PyMuPDF and vision-language fallback."
                ],
                "tech_stack": ["FastAPI", "React", "Docker", "Tailwind"]
            }
        ],
        "education": [
            {
                "id": "edu-1",
                "institution": current_user.profile.college if current_user.profile and current_user.profile.college else "State University of Technology",
                "degree": current_user.profile.degree if current_user.profile and current_user.profile.degree else "B.S. in Computer Science",
                "field_of_study": current_user.profile.branch if current_user.profile and current_user.profile.branch else "Computer Science",
                "start_date": "2022",
                "end_date": str(current_user.profile.graduation_year) if current_user.profile and current_user.profile.graduation_year else "2026",
                "gpa": "3.85 / 4.0",
                "highlights": ["Dean's Honor List", "President of ACM Student Chapter"]
            }
        ],
        "certifications": [],
        "achievements": [
            "1st Place in National University Hackathon (50+ teams)",
            "Published technical article on scalable microservice communication"
        ]
    }

    resume = Resume(
        user_id=current_user.id,
        title=title,
        file_type="builder",
        is_primary=len(current_user.resumes) == 0,
        structured_data=blank_data
    )
    db.add(resume)
    db.flush()

    version = ResumeVersion(
        resume_id=resume.id,
        version_number=1,
        version_name="Initial Studio Draft",
        structured_data=blank_data
    )
    db.add(version)
    db.commit()
    db.refresh(resume)
    return resume


@router.get("/", response_model=List[ResumeResponse])
def get_user_resumes(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    resumes = db.query(Resume).filter(Resume.user_id == current_user.id).order_by(Resume.created_at.desc()).all()
    # Populate latest score for listing
    for r in resumes:
        latest = r.analyses[0] if r.analyses else None
        setattr(r, "latest_score", latest.overall_score if latest else None)
        setattr(r, "latest_analysis", latest)
    return resumes


@router.get("/{resume_id}", response_model=ResumeResponse)
def get_resume(resume_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    resume = db.query(Resume).filter(Resume.id == resume_id, Resume.user_id == current_user.id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    latest = resume.analyses[0] if resume.analyses else None
    setattr(resume, "latest_score", latest.overall_score if latest else None)
    setattr(resume, "latest_analysis", latest)
    return resume


@router.put("/{resume_id}", response_model=ResumeResponse)
def update_resume(
    resume_id: str,
    update_data: ResumeUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    resume = db.query(Resume).filter(Resume.id == resume_id, Resume.user_id == current_user.id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")

    if update_data.title is not None:
        resume.title = update_data.title
    if update_data.is_primary is not None:
        if update_data.is_primary:
            # Unset others
            db.query(Resume).filter(Resume.user_id == current_user.id).update({"is_primary": False})
        resume.is_primary = update_data.is_primary

    if update_data.structured_data is not None:
        resume.structured_data = update_data.structured_data
        resume.updated_at = datetime.now(timezone.utc)

        # Increment version
        last_version = db.query(ResumeVersion).filter(ResumeVersion.resume_id == resume.id).order_by(ResumeVersion.version_number.desc()).first()
        next_ver_num = (last_version.version_number + 1) if last_version else 1
        new_version = ResumeVersion(
            resume_id=resume.id,
            version_number=next_ver_num,
            version_name=f"Revision {next_ver_num}",
            structured_data=update_data.structured_data
        )
        db.add(new_version)

    db.commit()
    db.refresh(resume)
    latest = resume.analyses[0] if resume.analyses else None
    setattr(resume, "latest_score", latest.overall_score if latest else None)
    setattr(resume, "latest_analysis", latest)
    return resume


@router.delete("/{resume_id}")
def delete_resume(resume_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    resume = db.query(Resume).filter(Resume.id == resume_id, Resume.user_id == current_user.id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    
    # Delete file from disk if exists
    if resume.file_path and os.path.exists(resume.file_path):
        try:
            os.remove(resume.file_path)
        except Exception:
            pass

    db.delete(resume)
    db.commit()
    return {"message": "Resume deleted successfully"}


@router.post("/{resume_id}/analyze", response_model=ResumeAnalysisResponse)
async def analyze_resume_endpoint(
    resume_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    resume = db.query(Resume).filter(Resume.id == resume_id, Resume.user_id == current_user.id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")

    structured_data = resume.structured_data or {}
    raw_text = resume.raw_text or json.dumps(structured_data)

    # Perform analysis with AIService
    analysis_result = await AIService.analyze_resume(structured_data, raw_text)

    # Save analysis in database
    db_analysis = ResumeAnalysis(
        resume_id=resume.id,
        user_id=current_user.id,
        overall_score=analysis_result["overall_score"],
        category_scores=analysis_result["category_scores"],
        strengths=analysis_result.get("strengths", []),
        missing_sections=analysis_result.get("missing_sections", []),
        weak_bullet_rewrites=analysis_result.get("weak_bullet_rewrites", []),
        missing_measurable_achievements=analysis_result.get("missing_measurable_achievements", []),
        skill_gaps=analysis_result.get("skill_gaps", []),
        ats_concerns=analysis_result.get("ats_concerns", []),
        actionable_recommendations=analysis_result.get("actionable_recommendations", []),
        prioritized_checklist=analysis_result.get("prioritized_checklist", []),
        verified_facts=analysis_result.get("verified_facts", {})
    )
    db.add(db_analysis)

    # Log activity
    activity = UserActivity(
        user_id=current_user.id,
        action_type="resume_analyzed",
        title=f"Analyzed resume '{resume.title}' — Score: {analysis_result['overall_score']}/100",
        details={"score": analysis_result["overall_score"], "resume_id": resume.id}
    )
    db.add(activity)

    db.commit()
    db.refresh(db_analysis)
    return db_analysis


@router.get("/{resume_id}/analyses/latest", response_model=ResumeAnalysisResponse)
def get_latest_resume_analysis(
    resume_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    analysis = db.query(ResumeAnalysis).filter(
        ResumeAnalysis.resume_id == resume_id,
        ResumeAnalysis.user_id == current_user.id
    ).order_by(ResumeAnalysis.created_at.desc()).first()

    if not analysis:
        raise HTTPException(status_code=404, detail="No analysis found for this resume. Click 'Analyze Resume' to generate one.")

    return analysis


@router.post("/rewrite-bullet", response_model=AIBulletRewriteResponse)
async def rewrite_bullet_point(
    req: AIBulletRewriteRequest,
    current_user: User = Depends(get_current_user)
):
    result = await AIService.rewrite_bullet_point(
        bullet_point=req.bullet_point,
        role_or_project=req.role_or_project,
        context_details=req.context_details,
        target_role=req.target_role
    )
    return result


@router.post("/improve-summary", response_model=AISummaryImproveResponse)
async def improve_summary(
    req: AISummaryImproveRequest,
    current_user: User = Depends(get_current_user)
):
    role = req.target_role or "Software Engineer"
    skills_str = ", ".join(req.skills[:5]) if req.skills else "modern software engineering and cloud systems"
    improved = (
        f"Results-oriented {role} skilled in {skills_str}. Experienced in engineering scalable web solutions, "
        f"optimizing database performance, and building responsive user experiences. Passionate about solving complex problems with clean, maintainable code."
    )
    return AISummaryImproveResponse(
        improved_summary=improved,
        key_highlights=["Action-driven opening", "Clear skill integration", "Impact and scale focus"],
        explanation="Enhanced clarity and targeted active engineering keywords for automated screening."
    )
