"""
Critical Path Method (CPM) algorithm implementation
Computes earliest/latest start/finish times, slack, and critical path
"""

from typing import Dict, List
from collections import defaultdict, deque


def calculate_cpm(tasks: List[Dict], dependencies: List[Dict]) -> Dict:
    """
    Calculate Critical Path Method values for all tasks. 

    Args:
        tasks: List of dicts with keys: id, duration (int), buffer_time (int)
        dependencies: List of dicts with keys: task_id, depends_on_task_id

    Returns:
        {
            "ES": {task_id: earliest_start_day},
            "EF": {task_id: earliest_finish_day},
            "LS": {task_id: latest_start_day},
            "LF": {task_id:  latest_finish_day},
            "slack": {task_id: slack_days},
            "project_end": int,
            "critical_path": [task_id, ...]  # tasks with slack == 0
        }
    """
    if not tasks: 
        return {
            "ES": {},
            "EF": {},
            "LS": {},
            "LF": {},
            "slack": {},
            "project_end": 0,
            "critical_path": [],
        }

    # Build task duration map (duration + buffer)
    dur = {}
    task_ids = []
    for t in tasks:
        tid = str(t["id"])
        task_ids.append(tid)
        dur[tid] = int(t. get("duration", 0)) + int(t.get("buffer_time", 0))

    # Build adjacency lists
    graph = {tid: [] for tid in task_ids}  # depends_on -> [task]
    reverse_graph = {tid: [] for tid in task_ids}  # task -> [depends_on]

    for d in dependencies:
        task_id = str(d["task_id"])
        depends_on_id = str(d["depends_on_task_id"])

        # Ignore if references missing tasks
        if task_id not in graph or depends_on_id not in graph:
            continue

        graph[depends_on_id].append(task_id)
        reverse_graph[task_id].append(depends_on_id)

    # Topological sort (Kahn's algorithm) + cycle detection
    indeg = {tid: len(reverse_graph[tid]) for tid in task_ids}
    q = deque([tid for tid in task_ids if indeg[tid] == 0])
    topo_order = []

    while q:
        node = q.popleft()
        topo_order.append(node)
        for nbr in graph[node]:
            indeg[nbr] -= 1
            if indeg[nbr] == 0:
                q.append(nbr)

    if len(topo_order) != len(task_ids):
        raise ValueError("Cycle detected in task dependencies")

    # Forward pass: compute ES, EF
    ES = {}
    EF = {}
    for node in topo_order:
        if not reverse_graph[node]:  # No dependencies
            ES[node] = 0
        else:
            ES[node] = max(EF[pred] for pred in reverse_graph[node])
        EF[node] = ES[node] + dur. get(node, 0)

    # Project end time
    project_end = max(EF. values()) if EF else 0

    # Backward pass: compute LS, LF
    LS = {}
    LF = {}
    for node in reversed(topo_order):
        if not graph[node]:    # No successors
            LF[node] = project_end
        else:
            LF[node] = min(LS[succ] for succ in graph[node])
        LS[node] = LF[node] - dur.get(node, 0)

    # Compute slack and critical path
    slack = {node: LS[node] - ES[node] for node in task_ids}
    critical_path = [node for node in topo_order if slack. get(node, 0) == 0]

    return {
        "ES": ES,
        "EF": EF,
        "LS": LS,
        "LF": LF,
        "slack": slack,
        "project_end": project_end,
        "critical_path": critical_path,
    }