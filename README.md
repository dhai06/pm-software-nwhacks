# Critical Path Project Manager

A project management tool with interactive Gantt chart timeline and Kanban board views. Uses the Critical Path Method (CPM) algorithm to calculate optimal task scheduling and identify the critical path through your project.

## What it does

- **Timeline View**: Gantt chart built with React Flow. Drag tasks horizontally to reschedule, drag edges to resize duration, or drag vertically to reorder. Supports day/week/month zoom levels.
- **Board View**: Kanban board with drag-and-drop between Not Started, In Progress, and Done columns.
- **CPM Scheduling**: One-click auto-scheduling based on task dependencies. Calculates earliest/latest start times, slack, and highlights which tasks are on the critical path.
- **Task Dependencies**: Define which tasks depend on others. The timeline shows dependency arrows and warns you if a task starts before its prerequisites finish.

## Project Structure

```
/frontend          Next.js 16 app (React 19)
/Backend           FastAPI REST API
/ai-service        Placeholder for future AI features
/supabase          Database migration files
```

## Tech Stack

**Frontend**
- Next.js 16 with App Router
- React 19
- TypeScript
- Tailwind CSS
- Zustand for state management
- React Flow for the timeline/Gantt chart
- dnd-kit for Kanban drag-and-drop
- date-fns for date handling

**Backend**
- FastAPI
- SQLAlchemy ORM
- PostgreSQL (via Supabase or any Postgres instance)
- Pydantic for request/response validation

## Setup

### Prerequisites
- Node.js 18+
- Python 3.10+
- PostgreSQL database (Supabase works well)

### Frontend

```bash
cd frontend
npm install
```

Create a `.env.local` file with your backend URL:
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Run the dev server:
```bash
npm run dev
```

The app runs at http://localhost:3000

### Backend

```bash
cd Backend
python -m venv venv
venv\Scripts\activate      # Windows
# source venv/bin/activate  # Mac/Linux

pip install -r requirements.txt
```

Create a `.env` file:
```
DATABASE_URL=postgresql://user:pass@host:5432/dbname
```

Run the server:
```bash
uvicorn main:app --reload
```

API runs at http://localhost:8000

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/tasks | List all tasks |
| POST | /api/tasks | Create a task |
| GET | /api/tasks/{id} | Get a task |
| PATCH | /api/tasks/{id} | Update a task |
| DELETE | /api/tasks/{id} | Delete a task |
| GET | /api/dependencies | List dependencies |
| POST | /api/dependencies | Create a dependency |
| DELETE | /api/dependencies/{id} | Remove a dependency |
| GET | /api/cpm | Calculate critical path |

## CPM Algorithm

The `/api/cpm` endpoint returns:

```json
{
  "ES": {"task-id": 0},
  "EF": {"task-id": 7},
  "LS": {"task-id": 0},
  "LF": {"task-id": 7},
  "slack": {"task-id": 0},
  "project_end": 14,
  "critical_path": ["task-id-1", "task-id-3"]
}
```

- **ES/EF**: Earliest Start/Finish day
- **LS/LF**: Latest Start/Finish day (without delaying the project)
- **slack**: How many days a task can slip without affecting the end date
- **critical_path**: Tasks with zero slack (must be completed on time)

The frontend uses this to highlight critical path tasks and auto-schedule all tasks based on their dependencies.

## Running Tests

```bash
cd frontend
npm test
```
