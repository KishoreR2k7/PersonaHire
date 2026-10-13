from datetime import datetime, timezone
from typing import Dict, List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_user
from app.models.user import User
from app.models.roadmap import PreparationTask, UserActivity
from app.schemas.roadmap import PreparationTaskResponse, PreparationTaskCreate, PreparationTaskUpdate, RoadmapOverview

router = APIRouter(prefix="/roadmap", tags=["Placement Preparation Roadmap"])


@router.get("/", response_model=RoadmapOverview)
def get_user_roadmap(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    tasks = db.query(PreparationTask).filter(PreparationTask.user_id == current_user.id).all()

    # If user has no tasks yet, seed initial personalized starter tasks based on profile
    if not tasks:
        seed_starter_tasks(current_user, db)
        tasks = db.query(PreparationTask).filter(PreparationTask.user_id == current_user.id).all()

    categorized: Dict[str, List[PreparationTaskResponse]] = {}
    completed_count = 0

    for t in tasks:
        if t.is_completed:
            completed_count += 1
        cat = t.category
        if cat not in categorized:
            categorized[cat] = []
        categorized[cat].append(PreparationTaskResponse.model_validate(t))

    total = len(tasks)
    percentage = int((completed_count / max(1, total)) * 100)

    return RoadmapOverview(
        total_tasks=total,
        completed_tasks=completed_count,
        completion_percentage=percentage,
        categories=categorized
    )


def seed_starter_tasks(user: User, db: Session):
    target_role = user.profile.target_role if user.profile and user.profile.target_role else "Software Engineer"
    default_tasks = [
        {
            "category": "resume_improvements",
            "title": "Rewrite Project Bullets with Google's XYZ Formula",
            "description": "Quantify outcomes (latency, user count, test coverage) using 'Accomplished [X] measured by [Y] by doing [Z]'.",
            "priority": "high",
            "estimated_duration_minutes": 25,
            "supporting_resources": ["XYZ Resume Formula Guide", "Action Verb Cheat Sheet"]
        },
        {
            "category": "technical_skills",
            "title": f"Master Core Concepts for {target_role}",
            "description": "Review RESTful API design, HTTP status codes, concurrency models, and indexing strategies.",
            "priority": "high",
            "estimated_duration_minutes": 45,
            "supporting_resources": ["System Design Primer", "Backend Architecture Checklist"]
        },
        {
            "category": "dsa_coding",
            "title": "Arrays, Hash Maps, and Two Pointers Practice",
            "description": "Solve 3 medium LeetCode/HackerRank problems covering sliding window and hash-based frequency lookups.",
            "priority": "high",
            "estimated_duration_minutes": 60,
            "supporting_resources": ["Blind 75 Curated List"]
        },
        {
            "category": "project_explanations",
            "title": "Prepare 2-Minute Architecture Elevator Pitch",
            "description": "Practice explaining your primary project's database schema, scaling trade-offs, and why you chose your tech stack.",
            "priority": "medium",
            "estimated_duration_minutes": 20,
            "supporting_resources": ["Project Defense Template"]
        },
        {
            "category": "hr_behavioral",
            "title": "Structure 3 Behavioral Stories in STAR Format",
            "description": "Draft specific situations covering: (1) Overcoming a difficult bug, (2) Collaborating under tight deadlines, and (3) Resolving a conflict.",
            "priority": "medium",
            "estimated_duration_minutes": 30,
            "supporting_resources": ["STAR Framework Worksheet"]
        },
        {
            "category": "communication_practice",
            "title": "Conduct First Live AI Mock Interview Session",
            "description": "Complete a 5-question mock interview in Persona Hire to test your clarity, verbal cadence, and technical depth.",
            "priority": "high",
            "estimated_duration_minutes": 15,
            "supporting_resources": ["Mock Interview Best Practices"]
        }
    ]

    for item in default_tasks:
        task = PreparationTask(
            user_id=user.id,
            category=item["category"],
            title=item["title"],
            description=item["description"],
            priority=item["priority"],
            estimated_duration_minutes=item["estimated_duration_minutes"],
            supporting_resources=item["supporting_resources"]
        )
        db.add(task)
    db.commit()


@router.patch("/{task_id}", response_model=PreparationTaskResponse)
def update_roadmap_task(
    task_id: str,
    update: PreparationTaskUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    task = db.query(PreparationTask).filter(PreparationTask.id == task_id, PreparationTask.user_id == current_user.id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found.")

    if update.is_completed is not None:
        task.is_completed = update.is_completed
        task.completed_at = datetime.now(timezone.utc) if update.is_completed else None
        if update.is_completed:
            activity = UserActivity(
                user_id=current_user.id,
                action_type="task_completed",
                title=f"Completed preparation task: '{task.title}'"
            )
            db.add(activity)

    if update.priority is not None:
        task.priority = update.priority
    if update.title is not None:
        task.title = update.title
    if update.description is not None:
        task.description = update.description

    db.commit()
    db.refresh(task)
    return task
