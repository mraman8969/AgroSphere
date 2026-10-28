from datetime import datetime, timezone
from fastapi import APIRouter

router = APIRouter()


@router.get("/health", tags=["Health"])
async def health_check():
    """Returns the operational status of the AI service."""
    return {
        "status": "UP",
        "service": "AgroSphere AI Service",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "version": "0.1.0",
    }
