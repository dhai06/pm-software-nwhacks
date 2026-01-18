"""
Task endpoints:   CRUD operations
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID
import traceback

from database import get_db
from crud import get_task, list_tasks, create_task, update_task, delete_task
from schemas import TaskCreate, TaskUpdate, TaskOut

router = APIRouter(prefix="/api/tasks", tags=["tasks"])


@router.post("/", response_model=TaskOut, status_code=201)
def create_task_endpoint(task_in: TaskCreate, db: Session = Depends(get_db)):
    """Create a new task"""
    try:
        print(f"\n{'='*60}")
        print(f"📥 POST /api/tasks/")
        print(f"   Request: name={task_in.name}, duration={task_in.duration}")
        
        result = create_task(db, task_in)
        
        print(f"✅ SUCCESS: Task created with ID {result.id}")
        print(f"{'='*60}\n")
        return result
        
    except Exception as e: 
        print(f"\n{'='*60}")
        print(f"❌ ERROR in create_task_endpoint:")
        print(f"   Error message: {str(e)}")
        print(f"   Error type: {type(e).__name__}")
        print(f"\nFull traceback:")
        traceback.print_exc()
        print(f"{'='*60}\n")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/", response_model=List[TaskOut])
def list_tasks_endpoint(
    limit: int = Query(100, ge=1, le=1000),
    skip: int = Query(0, ge=0),
    db: Session = Depends(get_db),
):
    """List all tasks"""
    try:
        print(f"\n{'='*60}")
        print(f"📥 GET /api/tasks/")
        print(f"   Parameters: limit={limit}, skip={skip}")
        
        results = list_tasks(db, limit=limit, skip=skip)
        
        print(f"✅ SUCCESS: Retrieved {len(results)} tasks")
        print(f"{'='*60}\n")
        return results
        
    except Exception as e:
        print(f"\n{'='*60}")
        print(f"❌ ERROR in list_tasks_endpoint:")
        print(f"   Error message: {str(e)}")
        print(f"   Error type: {type(e).__name__}")
        print(f"\nFull traceback:")
        traceback.print_exc()
        print(f"{'='*60}\n")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{task_id}", response_model=TaskOut)
def get_task_endpoint(task_id: UUID, db: Session = Depends(get_db)):
    """Get a single task by ID"""
    try: 
        print(f"\n{'='*60}")
        print(f"📥 GET /api/tasks/{task_id}")
        
        task = get_task(db, task_id)
        if not task:
            raise HTTPException(status_code=404, detail="Task not found")
            
        print(f"✅ SUCCESS: Retrieved task {task.name}")
        print(f"{'='*60}\n")
        return task
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"\n{'='*60}")
        print(f"❌ ERROR in get_task_endpoint:")
        print(f"   Error message: {str(e)}")
        print(f"   Error type: {type(e).__name__}")
        print(f"\nFull traceback:")
        traceback.print_exc()
        print(f"{'='*60}\n")
        raise HTTPException(status_code=500, detail=str(e))


@router.patch("/{task_id}", response_model=TaskOut)
def update_task_endpoint(
    task_id: UUID, task_in: TaskUpdate, db: Session = Depends(get_db)
):
    """Update a task"""
    try: 
        print(f"\n{'='*60}")
        print(f"📥 PATCH /api/tasks/{task_id}")
        
        result = update_task(db, task_id, task_in)
        
        print(f"✅ SUCCESS: Task updated")
        print(f"{'='*60}\n")
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"\n{'='*60}")
        print(f"❌ ERROR in update_task_endpoint:")
        print(f"   Error message: {str(e)}")
        print(f"   Error type: {type(e).__name__}")
        print(f"\nFull traceback:")
        traceback.print_exc()
        print(f"{'='*60}\n")
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{task_id}")
def delete_task_endpoint(task_id: UUID, db: Session = Depends(get_db)):
    """Delete a task"""
    try:
        print(f"\n{'='*60}")
        print(f"📥 DELETE /api/tasks/{task_id}")
        
        delete_task(db, task_id)
        
        print(f"✅ SUCCESS: Task deleted")
        print(f"{'='*60}\n")
        return {"status": "deleted", "task_id": str(task_id)}
        
    except HTTPException:
        raise
    except Exception as e: 
        print(f"\n{'='*60}")
        print(f"❌ ERROR in delete_task_endpoint:")
        print(f"   Error message: {str(e)}")
        print(f"   Error type: {type(e).__name__}")
        print(f"\nFull traceback:")
        traceback.print_exc()
        print(f"{'='*60}\n")
        raise HTTPException(status_code=500, detail=str(e))