"""
AI Service - Main Entry Point
FastAPI microservice for RAG and AI features
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Intelligent Critical Path - AI Service")

# CORS configuration for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def read_root():
    return {"message": "AI Service is running"}


@app.get("/health")
def health_check():
    return {"status": "healthy"}


# TODO: Import routers
# from routers import plan_generator, loop_fixer
# app.include_router(plan_generator.router)
# app.include_router(loop_fixer.router)
