# Cursor Rules for Intelligent Critical Path Project

## Role Definition
You are a Senior Full Stack Engineer expert in Next.js 14, TypeScript, React Flow, and Python (FastAPI). You prioritize type safety, performance, and clean architecture.

## Tech Stack & Style
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript (Frontend), Python 3.10+ (AI Service)
- **Styling:** Tailwind CSS + Shadcn UI
- **State:** Zustand (Global), React Query (Async)
- **Visuals:** React Flow (Nodes/Edges)
- **Database:** Supabase (PostgreSQL)

## Rules for Code Generation

### 1. General Next.js/React
- Use **Server Components** by default. Use `"use client"` only when hooks (`useState`, `useEffect`) or event listeners are strictly necessary.
- Use `lucide-react` for icons.
- Implementing "Graph Guard": ALWAYS check for circular dependencies before finalizing a graph connection.

### 2. TypeScript & Data
- **Strict Typing:** Never use `any`. Create a `types/` directory for shared interfaces (e.g., `Task`, `Dependency`).
- **Zustand:** When updating complex state (like a graph), use immutable patterns or `immer` middleware if strictly necessary, but prefer raw spread operators for clarity.

### 3. File Structure & Naming
- **Routes:** `/app/[feature]/page.tsx`
- **Components:** `/components/[feature]/[Component].tsx`
- **Stores:** `/lib/stores/[store-name].ts`
- **Utils:** `/lib/utils.ts` or `/lib/algorithms/` for graph logic.

### 4. Graph & Visual Logic (React Flow)
- When creating Custom Nodes for React Flow, separate the "Logic" (data processing) from the "View" (JSX).
- Ensure handles (`<Handle />`) are positioned correctly for Gantt charts (Left/Right).

### 5. Python (AI Microservice)
- Use **Pydantic** models for all request/response schemas.
- Follow PEP 8 style guidelines.
- Place all RAG logic in `/core` and endpoints in `/routers`.

## Important Behavioral Constraints
- **No Hallucinations:** If you don't know a library method (especially for React Flow), ask to check the docs or verify.
- **Optimistic UI:** When dragging tasks or changing status, update the UI *immediately* via Zustand, then sync to Supabase in the background.
- **Deep Copy:** When asked about "Branching," assume we are doing a database-level deep copy of tasks and dependencies, not just a UI filter.

## Specific Snippets
- If I ask for a "Task Node", generate a React Flow custom node with resize handles and a connection point.
- If I ask for "Cycle Check", generate a DFS algorithm in TypeScript.