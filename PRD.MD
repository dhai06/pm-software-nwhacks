

# Product Requirements Document (v3.2)

## Intelligent Critical Path & Scenario Planning

---

## 🎯 Product Overview

**Problem:** Small businesses and engineering teams (Capstone, SAE, Hardware Startups) face two struggles:

1. **Execution Chaos:** They miss hard deadlines because they lack visibility into how a delay in "Task A" impacts the final delivery (The "Ripple Effect").
2. **Fear of Growth:** They hesitate to expand (e.g., "Can we add a bowling alley to our venue?") because they cannot simulate the complexity without disrupting operations.

**Solution:** An AI-powered project platform combining **Critical Path Management (CPM)** for day-to-day execution and **"What-If" Branching** for risk-free scenario planning.

**Target Audience:**

* **Student Engineering Teams:** (Formula SAE, Capstone) managing tight deadlines and hardware lead times.
* **Small Business Owners:** (Event Venues, Retail) managing renovations or complex events.
* **Hardware Startups:** Teams dealing with manufacturing lead times that cannot be "sprinted."

---

## 👥 Stakeholders

| Stakeholder | Goals | Pain Points |
| --- | --- | --- |
| **The Lead (User)** | Hit the final deadline. Simulate risky ideas without breaking the plan. | "If we add this feature, will we miss our launch?" |
| **The Team Member** | Clear daily instructions. Avoid blocking others. | "I didn't know my delay blocked the whole firmware team." |
| **The Advisor** | Visibility into risk and progress. | "Show me you have a plan B." |

---

## 📋 Product Requirements

### 1. Core Mechanics: The "Reality" Engine

**1.1 Visual Timeline (Interactive Gantt)**

* **Drag-to-Reschedule:** Click and drag the right edge to extend duration, or the whole bar to move start dates.
* **Auto-Ripple:** Moving a predecessor immediately pushes all dependent tasks.
* **Dependency "Snap":** Drag a line from Task A to Task B to create a dependency instantly.

**1.2 Integrated Kanban Board**

* **Two-Way Sync:** A "Board View" tab alongside "Timeline View."
* **Status Impact:** Moving a card to "Done" updates progress in Timeline. Moving to "Blocked" turns the task red on the Timeline.
* **Real-Time State:** Updates must reflect instantly across views without full page reloads.

**1.3 Subtask Granularity & Tracking**

* **The "Micro-Goal" System:** Parent tasks have checklists (e.g., "Cut tubes," "Weld joints").
* **Progress Calculation:** 5/10 subtasks checked = 50% progress bar fill.
* **Early Warning:** If `(DaysPassed / Duration) > (SubtasksDone / TotalSubtasks)`, show "⚠️ Pace Warning".

---

### 2. AI Integration: The "Pathfinder"

**2.1 Intelligent Setup (Cold Start Solver)**

* **Prompt-to-Plan:** User types *"Building a gesture-controlled robot arm."* AI retrieves the most relevant template from our **Curated Dataset** and generates a task list.
* **Vector Retrieval:** System uses RAG (Retrieval-Augmented Generation) to find similar "Gold Standard" project plans (e.g., from generic engineering or construction datasets) to ground the suggestion.

**2.2 Optimization & Fixes**

* **Loop Breaker:** If a user accidentally creates a circular dependency, AI suggests: *"Link A→B creates a loop. Should we reverse the dependency or add an intermediate step?"*

---

### 3. "What If" Scenarios: The Retention Engine

**3.1 Project Branching**

* **Branch Creation:** Create "Scenario: Expansion" from the main timeline.
* **Sandboxed Environment:** Deep-copy the current project state. Add tasks/dependencies without affecting the "Live" project.
* **Comparison Overlay:** Toggle to overlay "Scenario" ghost bars on the "Live" timeline.

**3.2 AI Expansion**

* **Template Injection:** User asks *"What is needed to add a bowling alley?"* AI queries the internal vector database for "bowling alley installation" templates and injects specific tasks (Permits, Installation) into the current branch.

---

### 4. Safety Systems: User-Error Prevention

**4.1 The "Graph Guard" (Circular Dependency Prevention)**

* **Client-Side Cycle Check:** Before any link is finalized, the system runs a Depth-First Search (DFS) **in the browser**.
* **Hard Stop:** If User tries to link Task C → Task A (when A → B → C exists), the connection line snaps back and turns red immediately.
* **Feedback:** Toast message: *"Cannot link: This creates an infinite loop."*

**4.2 The "Orphan" Hunter (Logic Gaps)**

* **Floating Task Detection:** Any task (except the very first one) that has **no predecessors** triggers a "Floating Task" warning icon.
* **Dead-End Detection:** Any task (except the final deliverable) with **no successors** is flagged.

**4.3 Temporal Sanity Checks**

* **Constraint Conflicts:** If a user manually pins a task to "Monday," but its predecessor finishes "Tuesday," the system flags a **"Constraint Violation"**.
* **Weekend Warning:** If a strict 2-day task lands on a Saturday/Sunday, prompt: *"Include weekends in duration? (Y/N)"*

---

## 🎨 UI/UX Specifications

### Views

1. **The Timeline (Strategy):** Focus on duration bars, dependencies, and the "Red Line" (Critical Path). Built using **React Flow** or similar node-based library.
2. **The Board (Tactics):** Columns for status. Cards show Due Date and "Blocking [X] Tasks" count.
3. **Branching Tab:** Dropdown to switch between `Main (Live)` and `Scenario drafts`.

### Visual Error Handling

* **Error State:** Tasks with errors (loops, conflicts) pulsate Red/Orange.
* **Resolution Popover:** Clicking the error offers "One-Click Fixes" (e.g., "Remove Dependency," "Auto-push Date").

---

## 🛠 Technical Requirements

### 1. Hybrid Architecture

* **Frontend:** **Next.js (App Router)** + **Tailwind CSS**. Handles UI, State Management (Zustand), and Client-Side Logic.
* **Primary Backend:** **Next.js Server Actions** + **Supabase**. Handles Auth, Database CRUD, and Real-time subscriptions.
* **AI Microservice:** **FastAPI (Python)**. Handles RAG, Vector Similarity Search, and LLM orchestration. Hosted separately (e.g., Railway/Render).

### 2. Data Strategy

* **Database:** PostgreSQL (via Supabase).
* **Vector Store:** `pgvector` extension on Supabase.
* **Data Source:** **Curated Industry Datasets** (Ingested via Python script, not scraped at runtime).
* **Branching Logic:** Implemented via **Deep Copy** in Postgres (Project ID -> Scenario ID -> Tasks).

### 3. Client-Side Logic (Critical)

* **Cycle Detection:** The DFS algorithm must be implemented in **TypeScript** on the frontend to ensure <100ms feedback loops when connecting tasks.
* **State Sync:** Dragging a task in "Gantt View" must optimistically update the "Kanban View" store before the server response confirms.

---

## ⚠️ Risks & Assumptions

* **Risk:** AI Hallucination regarding duration estimates.
* *Mitigation:* Use **RAG with Curated Datasets** (verified examples) rather than open generation. Label all AI suggestions "Estimates."


* **Assumption:** Users understand "Branching."
* *Mitigation:* Use terms like "Simulations" or "Drafts" instead of "Branches."


* **Risk:** Over-constraining users.
* *Mitigation:* Allow users to "Ignore Warnings" for Orphan tasks, but **never** ignore Circular Loops.



---