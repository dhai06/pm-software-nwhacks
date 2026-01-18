"""
Critical Path Method computation endpoint
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Dict, Any
from database import get_db
from models import Task, TaskDependency
from cpm import calculate_cpm

router = APIRouter(prefix="/api", tags=["cpm"])


@router.get("/cpm", response_model=Dict[str, Any])
def compute_cpm(db: Session = Depends(get_db)):
    """
    Compute Critical Path Method for all tasks. 

    Returns:
    {
        "ES": {task_id: earliest_start_day},
        "EF": {task_id: earliest_finish_day},
        "LS": {task_id:  latest_start_day},
        "LF": {task_id: latest_finish_day},
        "slack": {task_id: slack_days},
        "project_end": int,
        "critical_path":  [task_id, ...]
    }
    """
    # Fetch all tasks and dependencies
    tasks_query = db.query(Task).all()
    deps_query = db.query(TaskDependency).all()

    tasks = []
    for t in tasks_query:
        tasks.append({
            "id": str(t.id),
            "duration": t.duration or 0,
            "buffer_time": t.buffer_time or 0,
        })

    dependencies = []
    for d in deps_query: 
        dependencies.append({
            "task_id": str(d.task_id),
            "depends_on_task_id": str(d. depends_on_task_id),
        })

    try:
        result = calculate_cpm(tasks, dependencies)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))