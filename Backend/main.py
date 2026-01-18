"""
Main FastAPI Application
Backend API for Project Management with CPM
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Import routers - THESE ARE CRITICAL
from routers import tasks, dependencies, cpm_route

# Create FastAPI app
app = FastAPI(
    title="PM Software Backend - CPM Algorithm",
    description="REST API for task management and critical path calculation",
    version="1.0.0",
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# INCLUDE ALL ROUTERS - THIS IS THE KEY PART
app.include_router(tasks.router)
app.include_router(dependencies.router)
app.include_router(cpm_route.router)

# Root endpoint
@app.get("/")
def root():
    return {
        "status": "Backend running",
        "service": "PM Software Backend",
        "version": "1.0.0",
    }

# Health check
@app.get("/health")
def health_check():
    return {"status": "healthy"}
