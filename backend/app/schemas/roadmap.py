from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel


class PreparationTaskCreate(BaseModel):
    category: str
    title: str
    description: str
    priority: str = "medium"
    estimated_duration_minutes: int = 30
    supporting_resources: List[str] = []


class PreparationTaskUpdate(BaseModel):
    is_completed: Optional[bool] = None
    priority: Optional[str] = None
    title: Optional[str] = None
    description: Optional[str] = None


class PreparationTaskResponse(BaseModel):
    id: str
    user_id: str
    category: str
    title: str
    description: str
    priority: str
    estimated_duration_minutes: int
    is_completed: bool
    completed_at: Optional[datetime] = None
    supporting_resources: List[str] = []
    created_at: datetime

    class Config:
        from_attributes = True


class RoadmapOverview(BaseModel):
    total_tasks: int
    completed_tasks: int
    completion_percentage: int
    categories: Dict[str, List[PreparationTaskResponse]]
