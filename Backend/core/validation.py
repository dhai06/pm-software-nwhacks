"""
Validation helpers:  cycle detection, dependency graph analysis
"""

from sqlalchemy.orm import Session
from sqlalchemy import select
from uuid import UUID
from typing import Set
from models import TaskDependency


def detect_cycle(db: Session, new_task_id: UUID, new_depends_on_id: UUID) -> bool:
    """
    Detect if adding a new dependency (new_task_id -> new_depends_on_id)
    would create a cycle in the task graph. 

    Returns True if cycle would be created, False otherwise.
    """
    # Build adjacency:  depends_on -> task
    stmt = select(TaskDependency)
    deps = db.execute(stmt).scalars().all()

    graph = {}
    for dep in deps: 
        task_str = str(dep.task_id)
        depends_on_str = str(dep.depends_on_task_id)
        if depends_on_str not in graph: 
            graph[depends_on_str] = []
        graph[depends_on_str].append(task_str)

    # Check if path exists from new_depends_on_id to new_task_id
    # If yes, adding new_task_id -> new_depends_on_id creates cycle
    return _has_path(graph, str(new_depends_on_id), str(new_task_id))


def _has_path(graph: dict, src: str, target: str, visited: Set[str] = None) -> bool:
    """Check if there's a path from src to target in the graph"""
    if visited is None:
        visited = set()

    if src == target:
        return True

    if src in visited:
        return False

    visited.add(src)

    for neighbor in graph.get(src, []):
        if _has_path(graph, neighbor, target, visited):
            return True

    return False


def build_dependency_graph(db: Session) -> dict:
    """Build adjacency list of tasks and their dependencies"""
    stmt = select(TaskDependency)
    deps = db.execute(stmt).scalars().all()

    # adjacency: depends_on -> [tasks that depend]
    graph = {}
    reverse_graph = {}

    for dep in deps:
        task_id = str(dep.task_id)
        depends_on_id = str(dep.depends_on_task_id)

        if depends_on_id not in graph:
            graph[depends_on_id] = []
        graph[depends_on_id]. append(task_id)

        if task_id not in reverse_graph:
            reverse_graph[task_id] = []
        reverse_graph[task_id]. append(depends_on_id)

    return {"forward": graph, "reverse": reverse_graph}