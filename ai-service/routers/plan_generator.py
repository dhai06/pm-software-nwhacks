"""
Plan Generator Router
Handles AI-powered project plan generation
"""

from fastapi import APIRouter

router = APIRouter(prefix="/api/generate", tags=["generation"])


@router.post("/plan")
async def generate_plan(prompt: str):
    """
    Generate project plan from user prompt
    TODO: Implement RAG-based generation
    """
    return {"message": "Plan generation endpoint - TODO"}
