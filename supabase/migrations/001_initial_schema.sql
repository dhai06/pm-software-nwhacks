-- Initial Database Schema
-- Tables for Projects, Tasks, Dependencies

-- TODO: Create tables for:
-- 1. projects (id, name, description, type, parent_project_id, owner_id, created_at, updated_at)
-- 2. tasks (id, project_id, title, description, status, start_date, duration, progress, assignee, created_at, updated_at)
-- 3. subtasks (id, task_id, title, completed, created_at)
-- 4. dependencies (id, source_task_id, target_task_id, type, lag)
-- 5. Enable pgvector extension for RAG
