from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field


class ContactInfo(BaseModel):
    full_name: str = ""
    email: str = ""
    phone: str = ""
    location: str = ""
    linkedin: Optional[str] = ""
    github: Optional[str] = ""
    portfolio: Optional[str] = ""


class EducationItem(BaseModel):
    id: Optional[str] = None
    institution: str = ""
    degree: str = ""
    field_of_study: str = ""
    start_date: str = ""
    end_date: str = ""
    gpa: Optional[str] = ""
    highlights: List[str] = []


class ExperienceItem(BaseModel):
    id: Optional[str] = None
    company: str = ""
    position: str = ""
    location: str = ""
    start_date: str = ""
    end_date: str = ""
    current: bool = False
    bullets: List[str] = []
    tech_stack: List[str] = []


class ProjectItem(BaseModel):
    id: Optional[str] = None
    title: str = ""
    description: str = ""
    role: str = ""
    live_url: Optional[str] = ""
    repo_url: Optional[str] = ""
    bullets: List[str] = []
    tech_stack: List[str] = []


class SkillGroup(BaseModel):
    category: str = ""  # e.g. "Languages", "Frameworks & Tools", "Databases", "Core Concepts"
    items: List[str] = []


class CertificationItem(BaseModel):
    id: Optional[str] = None
    name: str = ""
    issuer: str = ""
    issue_date: str = ""
    credential_url: Optional[str] = ""


class StructuredResume(BaseModel):
    contact: ContactInfo = Field(default_factory=ContactInfo)
    summary: str = ""
    skills: List[SkillGroup] = []
    experience: List[ExperienceItem] = []
    projects: List[ProjectItem] = []
    education: List[EducationItem] = []
    certifications: List[CertificationItem] = []
    achievements: List[str] = []


class ResumeCreate(BaseModel):
    title: str = "My Resume"
    structured_data: Optional[StructuredResume] = None


class ResumeUpdate(BaseModel):
    title: Optional[str] = None
    structured_data: Optional[Dict[str, Any]] = None
    is_primary: Optional[bool] = None


class ResumeVersionResponse(BaseModel):
    id: str
    resume_id: str
    version_number: int
    version_name: str
    structured_data: Dict[str, Any]
    created_at: datetime

    class Config:
        from_attributes = True


class CategoryScores(BaseModel):
    skills_relevance: int = 0
    projects_experience: int = 0
    work_achievements: int = 0
    education_certs: int = 0
    ats_readability: int = 0
    writing_impact: int = 0


class WeakBulletRewrite(BaseModel):
    original: str
    improved: str
    reason: str
    impact_metric_added: bool = False


class PrioritizedChecklistItem(BaseModel):
    id: str
    task: str
    priority: str  # high, medium, low
    category: str
    estimated_impact: str


class ResumeAnalysisResponse(BaseModel):
    id: str
    resume_id: str
    user_id: str
    overall_score: int
    category_scores: Dict[str, int]
    strengths: List[str]
    missing_sections: List[str]
    weak_bullet_rewrites: List[Dict[str, Any]]
    missing_measurable_achievements: List[str]
    skill_gaps: List[str]
    ats_concerns: List[str]
    actionable_recommendations: List[str]
    prioritized_checklist: List[Dict[str, Any]]
    verified_facts: Dict[str, Any]
    created_at: datetime

    class Config:
        from_attributes = True


class ResumeResponse(BaseModel):
    id: str
    user_id: str
    title: str
    file_name: Optional[str] = None
    file_size_bytes: Optional[int] = None
    file_type: Optional[str] = None
    is_primary: bool
    structured_data: Dict[str, Any]
    latest_score: Optional[int] = None
    latest_analysis: Optional[ResumeAnalysisResponse] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class AIBulletRewriteRequest(BaseModel):
    bullet_point: str
    role_or_project: Optional[str] = None
    context_details: Optional[str] = None
    target_role: Optional[str] = None


class AIBulletRewriteResponse(BaseModel):
    original: str
    suggested_rewrite: str
    action_verb_used: str
    metrics_added: str
    rationale: str


class AISummaryImproveRequest(BaseModel):
    current_summary: str
    target_role: Optional[str] = None
    skills: List[str] = []


class AISummaryImproveResponse(BaseModel):
    improved_summary: str
    key_highlights: List[str]
    explanation: str
