def calculate_cpm(tasks, dependencies):
    graph = {t["id"]: [] for t in tasks}
    reverse_graph = {t["id"]: [] for t in tasks}

    for dep in dependencies:
        graph[dep["depends_on"]].append(dep["task_id"])
        reverse_graph[dep["task_id"]].append(dep["depends_on"])

    # Topological sort
    visited = set()
    order = []

    def dfs(node):
        if node in visited:
            return
        visited.add(node)
        for n in graph[node]:
            dfs(n)
        order.append(node)

    for t in graph:
        dfs(t)

    order.reverse()

    ES = {}
    EF = {}

    for t in order:
        ES[t] = max([EF[d] for d in reverse_graph[t]], default=0)
        EF[t] = ES[t] + tasks[t]["duration"]

    project_end = max(EF.values())

    LS = {}
    LF = {}

    for t in reversed(order):
        LF[t] = min([LS[n] for n in graph[t]], default=project_end)
        LS[t] = LF[t] - tasks[t]["duration"]

    slack = {t: LS[t] - ES[t] for t in tasks}

    return ES, EF, LS, LF, slack, project_end
