# Implementation Plan: Intelligent Critical Path & Scenario Planning

**Version:** 1.0
**Based on:** PRD v3.2
**Tech Stack:** Next.js 16 (App Router), React 19, Supabase, FastAPI (Python), Zustand, React Flow.

---

## 📂 1. Repository & File Structure

We will use a monorepo-style structure to keep the Frontend (Next.js) and the AI Microservice (Python) in one place for easier development, though they will be deployed separately.

```bash
/project-root
├── /frontend                 # Next.js App Router (The "Reality" Engine)
│   ├── /app
│   │   ├── /dashboard        # Main app views
│   │   │   ├── /project/[id] # Dynamic route for Project View
│   │   │   │   ├── page.tsx  # Timeline/Board switcher
│   │   │   │   └── layout.tsx
│   │   └── /api              # Next.js API Routes (Proxy to AI Service)
│   ├── /components
│   │   ├── /timeline         # Gantt Chart components (React Flow wrapper)
│   │   ├── /kanban           # Board components (dnd-kit or react-beautiful-dnd)
│   │   └── /ui               # Shadcn/Tailwind primitives
│   ├── /lib
│   │   ├── /stores           # Zustand stores (projectStore.ts, uiStore.ts)
│   │   ├── /algorithms       # Client-side graph logic (DFS cycle check)
│   │   └── supabase.ts       # Supabase client
│   └── /types                # TypeScript interfaces (Task, Dependency, Graph)
│
├── /ai-service               # FastAPI Microservice (The "Pathfinder")
│   ├── main.py               # Entry point
│   ├── /routers              # Endpoints (plan_generator.py, loop_fixer.py)
│   ├── /core                 # RAG logic & Vector Store interaction
│   └── /models               # Pydantic models
│
└── /supabase                 # Database Config
    ├── /migrations           # SQL migrations (pgvector setup, tables)
    └── seed.sql              # Initial template data