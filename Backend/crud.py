"""
CRUD operations for Tasks and TaskDependencies
"""

from sqlalchemy.orm import Session
from sqlalchemy import select
from uuid import UUID
from typing import List, Optional
from fastapi import HTTPException

from models import Task, TaskDependency
from schemas import TaskCreate, TaskUpdate, DependencyCreate
from core.validation import detect_cycle


# ==================== TASKS ====================

def get_task(db: Session, task_id: UUID) -> Optional[Task]:
    """Get a single task by ID"""
    stmt = select(Task).where(Task.id == task_id)
    return db.execute(stmt).scalars().first()


def list_tasks(db: Session, limit: int = 100, skip: int = 0) -> List[Task]:
    """List all tasks with pagination"""
    stmt = select(Task).offset(skip).limit(limit)
    return db.execute(stmt).scalars().all()


def create_task(db: Session, task_in: TaskCreate) -> Task:
    """Create a new task"""
    task = Task(
        name=task_in.name,
        duration=task_in.duration,
        description=task_in.description,
        status=task_in.status,
        buffer_time=task_in.buffer_time,
        start_date=task_in.start_date,
        target_completion_date=task_in.target_completion_date,
    )
    db.add(task)
    db.commit()
    db.refresh(task)
    return task


def update_task(db: Session, task_id: UUID, task_in: TaskUpdate) -> Task:
    """Update an existing task"""
    task = get_task(db, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    update_data = task_in.dict(exclude_unset=True)
    for field, value in update_data. items():
        setattr(task, field, value)

    db.add(task)
    db.commit()
    db.refresh(task)
    return task


def delete_task(db: Session, task_id: UUID) -> None:
    """Delete a task"""
    task = get_task(db, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    db.delete(task)
    db.commit()


# ==================== TASK DEPENDENCIES ====================

def get_dependency(db: Session, dep_id: UUID) -> Optional[TaskDependency]:
    """Get a single dependency by ID"""
    stmt = select(TaskDependency).where(TaskDependency.id == dep_id)
    return db.execute(stmt).scalars().first()


def list_dependencies(
    db: Session, task_id: Optional[UUID] = None, limit: int = 100
) -> List[TaskDependency]:
    """List dependencies, optionally filtered by task_id"""
    stmt = select(TaskDependency)
    if task_id: 
        stmt = stmt.where(TaskDependency.task_id == task_id)
    stmt = stmt.limit(limit)
    return db.execute(stmt).scalars().all()


def create_dependency(
    db: Session, dep_in: DependencyCreate
) -> TaskDependency:
    """Create a new dependency with validation"""
    task_id = dep_in.task_id
    depends_on_task_id = dep_in.depends_on_task_id

    print(f"\n{'='*70}")
    print(f"🔗 CREATE DEPENDENCY REQUEST")
    print(f"   task_id (depends): {task_id}")
    print(f"   depends_on_task_id (prerequisite): {depends_on_task_id}")
    print(f"{'='*70}")

    # Validate both tasks exist
    t1 = get_task(db, task_id)
    t2 = get_task(db, depends_on_task_id)

    if not t1:
        raise HTTPException(status_code=404, detail=f"Task {task_id} not found")
    if not t2:
        raise HTTPException(status_code=404, detail=f"Task {depends_on_task_id} not found")

    print(f"   ✅ Task {task_id} exists:  {t1.name}")
    print(f"   ✅ Task {depends_on_task_id} exists: {t2.name}")

    # Prevent self-dependency
    if task_id == depends_on_task_id:
        print(f"   ❌ REJECTED: Self-dependency not allowed")
        raise HTTPException(status_code=400, detail="Cannot depend on self")

    print(f"   ✅ Not a self-dependency")

    # Check for existing dependency
    stmt = select(TaskDependency).where(
        (TaskDependency.task_id == task_id)
        & (TaskDependency.depends_on_task_id == depends_on_task_id)
    )
    existing = db.execute(stmt).scalars().first()
    if existing:
        print(f"   ❌ REJECTED: Dependency already exists")
        raise HTTPException(status_code=400, detail="Dependency already exists")

    print(f"   ✅ Dependency doesn't already exist")

    # Detect cycle
    print(f"\n   🔍 Checking for cycles...")
    if detect_cycle(db, task_id, depends_on_task_id):
        print(f"\n{'='*70}")
        print(f"   ❌ REJECTED: Cycle would be created!")
        print(f"{'='*70}\n")
        raise HTTPException(status_code=400, detail="Dependency would create a cycle")

    # Create dependency
    print(f"\n   ✅ No cycle detected - proceeding with dependency creation")
    dep = TaskDependency(
        task_id=task_id,
        depends_on_task_id=depends_on_task_id,
    )
    db.add(dep)
    db.commit()
    db.refresh(dep)
    
    print(f"\n{'='*70}")
    print(f"   ✅ DEPENDENCY CREATED SUCCESSFULLY")
    print(f"   ID: {dep.id}")
    print(f"{'='*70}\n")
    
    return dep


def delete_dependency(db: Session, dep_id: UUID) -> None:
    """Delete a dependency"""
    dep = get_dependency(db, dep_id)
    if not dep:
        raise HTTPException(status_code=404, detail="Dependency not found")

    db.delete(dep)
    db.commit()