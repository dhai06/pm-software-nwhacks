"""
Pydantic schemas for request/response validation
"""

from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
from datetime import date, datetime
from uuid import UUID
from enum import Enum


class TaskStatus(str, Enum):
    """Task status values"""
    not_started = "not_started"
    in_progress = "in_progress"
    done = "done"


class TaskBase(BaseModel):
    """Base task schema with common fields"""
    name: str = Field(..., min_length=1, max_length=255)
    duration: int = Field(..., ge=0, description="Duration in days")
    description: Optional[str] = None
    status: TaskStatus = TaskStatus.not_started
    buffer_time: int = Field(0, ge=0, description="Buffer time in days")
    start_date: Optional[date] = None
    target_completion_date: Optional[date] = None


class TaskCreate(TaskBase):
    """Schema for creating a task"""
    pass


class TaskUpdate(BaseModel):
    """Schema for updating a task (all fields optional)"""
    name: Optional[str] = None
    duration: Optional[int] = None
    description: Optional[str] = None
    status: Optional[TaskStatus] = None
    buffer_time: Optional[int] = None
    start_date: Optional[date] = None
    target_completion_date: Optional[date] = None


class TaskOut(TaskBase):
    """Schema for task response"""
    id: UUID
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class DependencyCreate(BaseModel):
    """Schema for creating a dependency"""
    task_id: UUID = Field(..., description="Task that depends on another")
    depends_on_task_id: UUID = Field(... , description="Prerequisite task")


class DependencyOut(BaseModel):
    """Schema for dependency response"""
    id: UUID
    task_id: UUID
    depends_on_task_id: UUID
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class TaskWithDependencies(TaskOut):
    """Schema for task with its dependencies"""
    dependencies: List[DependencyOut] = []