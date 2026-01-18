"""
Validation helpers:  cycle detection, dependency graph analysis
"""

from sqlalchemy.orm import Session
from sqlalchemy import select
from uuid import UUID
from typing import Set, Dict, List
from models import TaskDependency


def detect_cycle(db: Session, new_task_id: UUID, new_depends_on_id: UUID) -> bool:
    """
    Detect if adding a new dependency would create a cycle.
    
    Args:
        new_task_id: The task that will have the new dependency
        new_depends_on_id: The task it will depend on
        
    Returns: 
        True if cycle would be created, False otherwise
        
    Logic:
        Current dependencies: A→B→C (A depends on B, B depends on C)
        If we try to add:  C→A, it creates a cycle:  A→B→C→A
        
        We need to check: 
        - Is there a path from new_task_id to new_depends_on_id?
        - If YES, then adding new_depends_on_id→new_task_id creates a cycle
    """
    print(f"\n🔍 CYCLE DETECTION")
    print(f"   Checking:  {new_depends_on_id} → {new_task_id}")
    
    # Build current dependency graph
    stmt = select(TaskDependency)
    all_deps = db.execute(stmt).scalars().all()
    
    # Create adjacency list:  depends_on_id → [task_ids]
    # Example: if B depends on A, then A → [B]
    graph = {}
    for dep in all_deps: 
        depends_on = str(dep.depends_on_task_id)
        task = str(dep.task_id)
        
        if depends_on not in graph:
            graph[depends_on] = []
        graph[depends_on].append(task)
        
        print(f"   Current edge: {depends_on} → {task}")
    
    # Convert UUIDs to strings for comparison
    task_str = str(new_task_id)
    depends_on_str = str(new_depends_on_id)
    
    print(f"\n   New edge would be: {depends_on_str} → {task_str}")
    
    # Check if there's already a path from task_str to depends_on_str
    # If yes, adding depends_on_str → task_str creates a cycle
    has_path = _dfs_has_path(graph, task_str, depends_on_str)
    
    if has_path:
        print(f"   ⚠️  PATH EXISTS:  {task_str} → ...  → {depends_on_str}")
        print(f"   ❌ CYCLE WOULD BE CREATED!")
        return True
    else:
        print(f"   ✅ NO PATH EXISTS: {task_str} cannot reach {depends_on_str}")
        print(f"   ✅ NO CYCLE")
        return False


def _dfs_has_path(graph:  Dict[str, List[str]], start: str, target: str, visited: Set[str] = None) -> bool:
    """
    Depth-first search to check if there's a path from start to target.
    
    Args:
        graph:  Adjacency list where graph[a] = [b, c] means a → b and a → c
        start: Starting node
        target: Target node to reach
        visited: Set of already visited nodes (for recursion)
        
    Returns: 
        True if path exists, False otherwise
    """
    if visited is None:
        visited = set()
    
    # Base case: we reached the target
    if start == target:
        return True
    
    # Base case: already visited this node (prevent infinite loops)
    if start in visited:
        return False
    
    visited.add(start)
    
    # Recursively check all neighbors
    for neighbor in graph.get(start, []):
        if _dfs_has_path(graph, neighbor, target, visited):
            return True
    
    return False


def build_dependency_graph(db: Session) -> dict:
    """Build adjacency list of tasks and their dependencies"""
    stmt = select(TaskDependency)
    deps = db.execute(stmt).scalars().all()

    # adjacency:  depends_on → [tasks that depend]
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