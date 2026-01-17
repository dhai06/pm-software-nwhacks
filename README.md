# Intelligent Critical Path & Scenario Planning

A hybrid Project Management tool combining **Critical Path Method (CPM)** for execution and **"What-If" Scenario Planning** for risk-free simulation.

## 📂 Project Structure

```
/pm-software-nwhacks
├── /frontend                          # Next.js 14 App (The "Reality" Engine)
│   ├── /app
│   │   ├── /dashboard                 # Main application pages
│   │   │   ├── page.tsx              # Dashboard home (project list)
│   │   │   └── /project/[id]         # Dynamic project routes
│   │   │       ├── page.tsx          # Timeline/Board view switcher
│   │   │       └── layout.tsx        # Project layout wrapper
│   │   ├── layout.tsx                # Root layout
│   │   └── page.tsx                  # Landing page
│   │
│   ├── /components                    # React components
│   │   ├── /timeline                 # Gantt Chart components (React Flow)
│   │   │   ├── TimelineView.tsx      # Main timeline container
│   │   │   ├── TaskNode.tsx          # Custom node (Gantt bar)
│   │   │   └── DependencyEdge.tsx    # Custom edge (dependency arrow)
│   │   ├── /kanban                   # Board components (dnd-kit)
│   │   │   ├── KanbanView.tsx        # Main board container
│   │   │   ├── Column.tsx            # Status column
│   │   │   └── TaskCard.tsx          # Draggable task card
│   │   └── /ui                       # Shadcn/UI primitives (auto-generated)
│   │
│   ├── /lib                          # Core logic
│   │   ├── /stores                   # Zustand state management
│   │   │   ├── projectStore.ts       # Tasks, dependencies, validation
│   │   │   └── uiStore.ts            # View mode, selection state
│   │   ├── /algorithms               # Client-side graph logic
│   │   │   └── graphGuard.ts         # DFS cycle detection (Graph Guard)
│   │   └── supabase.ts               # Supabase client config
│   │
│   ├── /types                        # TypeScript definitions
│   │   └── index.ts                  # Task, Dependency, Graph, Validation types
│   │
│   ├── .env.local.example            # Environment variables template
│   ├── package.json                  # Dependencies
│   └── tailwind.config.ts            # Tailwind CSS config
│
├── /ai-service                       # FastAPI Microservice (The "Pathfinder")
│   ├── main.py                       # FastAPI entry point
│   ├── /routers                      # API endpoints
│   │   ├── plan_generator.py        # /api/generate/plan (RAG-based)
│   │   └── loop_fixer.py            # /api/fix/loop (AI suggestions)
│   ├── /core                         # RAG logic
│   │   └── __init__.py              # Vector search, LLM orchestration
│   ├── /models                       # Pydantic models
│   │   └── __init__.py
│   └── requirements.txt              # Python dependencies
│
├── /supabase                         # Database config
│   ├── /migrations                   # SQL migrations
│   │   └── 001_initial_schema.sql   # Projects, Tasks, Dependencies tables
│   └── seed.sql                      # Template data for RAG
│
├── PRD.MD                            # Product Requirements Document
├── Implementation_Plan.MD            # Build guide
├── claude.MD                         # Tech stack context
└── README.md                         # This file
```

## 🛠 Tech Stack

### Frontend
- **Framework:** Next.js 16 (App Router) + React 19
- **Language:** TypeScript
- **Styling:** Tailwind CSS + Shadcn/UI
- **State:** Zustand
- **Graph Visualization:** React Flow (@xyflow/react)
- **Drag & Drop:** dnd-kit
- **Database Client:** Supabase JS

### Backend
- **Primary:** Next.js Server Actions + Supabase (PostgreSQL)
- **AI Microservice:** FastAPI (Python)
- **Vector Store:** pgvector (Supabase extension)

## 📦 Current Status

### ✅ Completed
- [x] Monorepo structure created
- [x] Next.js 16 app initialized with TypeScript and React 19
- [x] Core dependencies installed (zustand, reactflow, dnd-kit, supabase)
- [x] TypeScript type definitions (Task, Dependency, Graph, Validation)
- [x] Zustand stores (projectStore, uiStore)
- [x] Component placeholders (Timeline, Kanban)
- [x] Page structure (Dashboard, Project detail)
- [x] Python FastAPI skeleton
- [x] Database migration placeholders

### 🚧 TODO (Phase 1: Core Mechanics)
- [ ] Implement Graph Guard (DFS cycle detection in graphGuard.ts)
- [ ] Build Timeline View with React Flow
- [ ] Build Kanban Board with dnd-kit
- [ ] Two-way sync between Timeline and Kanban
- [ ] Supabase schema implementation
- [ ] Real-time subscriptions

### 🔮 Future Phases
- **Phase 2:** AI Integration (RAG, Template Matching)
- **Phase 3:** Scenario Branching (Deep-copy projects)
- **Phase 4:** Advanced Features (Critical Path calculation, Subtask tracking)

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Python 3.10+
- Supabase account (or local instance)

### Frontend Setup
```bash
cd frontend
npm install
cp .env.local.example .env.local
# Edit .env.local with your Supabase credentials
npm run dev
```

### AI Service Setup
```bash
cd ai-service
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

## 📝 Key Files to Understand

1. **[types/index.ts](frontend/types/index.ts)** - Core data structures
2. **[lib/stores/projectStore.ts](frontend/lib/stores/projectStore.ts)** - State management
3. **[lib/algorithms/graphGuard.ts](frontend/lib/algorithms/graphGuard.ts)** - Cycle detection (Graph Guard)
4. **[app/dashboard/project/[id]/page.tsx](frontend/app/dashboard/project/[id]/page.tsx)** - Main project view

