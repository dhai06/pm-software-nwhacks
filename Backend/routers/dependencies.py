"""
Dependency endpoints:  CRUD operations and validation
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from uuid import UUID
import traceback

from database import get_db
from crud import (
    get_dependency,
    list_dependencies,
    create_dependency,
    delete_dependency,
)
from schemas import DependencyCreate, DependencyOut

router = APIRouter(prefix="/api/dependencies", tags=["dependencies"])


@router.post("/", response_model=DependencyOut, status_code=201)
def create_dependency_endpoint(
    dep_in: DependencyCreate, db: Session = Depends(get_db)
):
    """
    Create a new task dependency.
    Validates that: 
    - Both tasks exist
    - No self-dependency
    - No duplicate dependency
    - No cycle is created
    """
    try: 
        print(f"\n📥 POST /api/dependencies - Creating dependency")
        result = create_dependency(db, dep_in)
        print(f"✅ Dependency created: {result.id}")
        return result
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error in create_dependency_endpoint: {str(e)}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Internal server error:  {str(e)}")


@router.get("/", response_model=List[DependencyOut])
def list_dependencies_endpoint(
    task_id: Optional[UUID] = Query(None),
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db),
):
    """
    List dependencies. 
    Optionally filter by task_id.
    """
    try:
        print(f"\n📥 GET /api/dependencies - Fetching dependencies (task_id={task_id}, limit={limit})")
        results = list_dependencies(db, task_id=task_id, limit=limit)
        print(f"✅ Retrieved {len(results)} dependencies")
        return results
    except Exception as e:
        print(f"❌ Error in list_dependencies_endpoint: {str(e)}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Internal server error:  {str(e)}")


@router.delete("/{dep_id}")
def delete_dependency_endpoint(dep_id: UUID, db: Session = Depends(get_db)):
    """Delete a dependency"""
    try:
        print(f"\n📥 DELETE /api/dependencies/{dep_id}")
        delete_dependency(db, dep_id)
        print(f"✅ Dependency deleted")
        return {"status": "deleted", "dep_id": str(dep_id)}
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error in delete_dependency_endpoint: {str(e)}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")