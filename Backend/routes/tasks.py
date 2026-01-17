from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models import Task
from cpm import calculate_cpm

router = APIRouter(prefix="/tasks")

@router.post("/")
def create_task(name: str, duration: int, project_id: str, db: Session = Depends(get_db)):
    task = Task(name=name, duration=duration, project_id=project_id)
    db.add(task)
    db.commit()
    return {"status": "task created"}
