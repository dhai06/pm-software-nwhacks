"""
CRUD operations for Tasks and TaskDependencies
"""

from sqlalchemy.orm import Session
from sqlalchemy import select
from uuid import UUID
from typing import List, Optional
from fastapi import HTTPException
import traceback
from models import Task, TaskDependency
from schemas import TaskCreate, TaskUpdate, DependencyCreate
from core.validation import detect_cycle


# ==================== TASKS ====================

def get_task(db: Session, task_id: UUID) -> Optional[Task]:
    """Get a single task by ID"""
    try:
        stmt = select(Task).where(Task.id == task_id)
        return db.execute(stmt).scalars().first()
    except Exception as e:
        print(f"❌ Error in get_task: {str(e)}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


def list_tasks(db: Session, limit: int = 100, skip: int = 0) -> List[Task]:
    """List all tasks with pagination"""
    try: 
        stmt = select(Task).offset(skip).limit(limit)
        return db.execute(stmt).scalars().all()
    except Exception as e:
        print(f"❌ Error in list_tasks: {str(e)}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


def create_task(db: Session, task_in: TaskCreate) -> Task:
    """Create a new task"""
    try:
        print(f"📝 Creating task: {task_in.name}")
        task = Task(
            name=task_in. name,
            duration=task_in.duration,
            description=task_in.description,
            status=task_in.status,
            buffer_time=task_in.buffer_time,
            start_date=task_in. start_date,
            target_completion_date=task_in. target_completion_date,
        )
        db.add(task)
        db.commit()
        db.refresh(task)
        print(f"✅ Task created successfully with ID: {task.id}")
        return task
    except Exception as e:
        db.rollback()
        print(f"❌ Error in create_task: {str(e)}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Failed to create task: {str(e)}")


def update_task(
    db: Session, task_id: UUID, task_in: TaskUpdate
) -> Task:
    """Update an existing task"""
    try: 
        task = get_task(db, task_id)
        if not task:
            raise HTTPException(status_code=404, detail="Task not found")

        update_data = task_in.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(task, field, value)

        db.add(task)
        db.commit()
        db.refresh(task)
        print(f"✅ Task {task_id} updated successfully")
        return task
    except Exception as e:
        db.rollback()
        print(f"❌ Error in update_task:  {str(e)}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Failed to update task: {str(e)}")


def delete_task(db: Session, task_id:  UUID) -> None:
    """Delete a task"""
    try: 
        task = get_task(db, task_id)
        if not task:
            raise HTTPException(status_code=404, detail="Task not found")

        db.delete(task)
        db.commit()
        print(f"✅ Task {task_id} deleted successfully")
    except Exception as e:
        db.rollback()
        print(f"❌ Error in delete_task: {str(e)}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Failed to delete task:  {str(e)}")


# ==================== TASK DEPENDENCIES ====================

def get_dependency(db: Session, dep_id: UUID) -> Optional[TaskDependency]:
    """Get a single dependency by ID"""
    try:
        stmt = select(TaskDependency).where(TaskDependency.id == dep_id)
        return db.execute(stmt).scalars().first()
    except Exception as e: 
        print(f"❌ Error in get_dependency: {str(e)}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


def list_dependencies(
    db: Session, task_id: Optional[UUID] = None, limit: int = 100
) -> List[TaskDependency]:
    """List dependencies, optionally filtered by task_id"""
    try:
        stmt = select(TaskDependency)
        if task_id: 
            stmt = stmt.where(TaskDependency.task_id == task_id)
        stmt = stmt.limit(limit)
        return db.execute(stmt).scalars().all()
    except Exception as e: 
        print(f"❌ Error in list_dependencies: {str(e)}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


def create_dependency(
    db: Session, dep_in: DependencyCreate
) -> TaskDependency:
    """Create a new dependency with validation"""
    try:
        task_id = dep_in.task_id
        depends_on_task_id = dep_in.depends_on_task_id

        print(f"🔗 Creating dependency: {task_id} depends on {depends_on_task_id}")

        # Validate both tasks exist
        t1 = get_task(db, task_id)
        t2 = get_task(db, depends_on_task_id)

        if not t1:
            raise HTTPException(status_code=404, detail=f"Task {task_id} not found")
        if not t2:
            raise HTTPException(status_code=404, detail=f"Task {depends_on_task_id} not found")

        # Prevent self-dependency
        if task_id == depends_on_task_id:
            raise HTTPException(status_code=400, detail="Cannot depend on self")

        # Check for existing dependency
        stmt = select(TaskDependency).where(
            (TaskDependency.task_id == task_id)
            & (TaskDependency.depends_on_task_id == depends_on_task_id)
        )
        existing = db.execute(stmt).scalars().first()
        if existing:
            raise HTTPException(status_code=400, detail="Dependency already exists")

        # Detect cycle
        if detect_cycle(db, task_id, depends_on_task_id):
            raise HTTPException(status_code=400, detail="Dependency would create a cycle")

        # Create dependency
        dep = TaskDependency(
            task_id=task_id,
            depends_on_task_id=depends_on_task_id,
        )
        db.add(dep)
        db.commit()
        db.refresh(dep)
        print(f"✅ Dependency created successfully with ID: {dep.id}")
        return dep
    except HTTPException:
        raise
    except Exception as e: 
        db.rollback()
        print(f"❌ Error in create_dependency: {str(e)}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Failed to create dependency: {str(e)}")


def delete_dependency(db: Session, dep_id: UUID) -> None:
    """Delete a dependency"""
    try:
        dep = get_dependency(db, dep_id)
        if not dep:
            raise HTTPException(status_code=404, detail="Dependency not found")

        db.delete(dep)
        db.commit()
        print(f"✅ Dependency {dep_id} deleted successfully")
    except Exception as e:
        db. rollback()
        print(f"❌ Error in delete_dependency: {str(e)}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Failed to delete dependency: {str(e)}")