from datetime import datetime, timezone
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.router import api_router
from app.core.config import settings

app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="AgroSphere AI Microservice - Crop recommendation and plant disease diagnosis APIs.",
)

# CORS Middleware to allow requests from React (Vite) and Spring Boot
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Root health check endpoint
@app.get("/", tags=["Root"])
def root():
    return {
        "message": "Welcome to AgroSphere AI Service API",
        "docs_url": "/docs",
        "health_url": "/health",
    }


@app.get("/health", tags=["Health"])
def health():
    return {
        "status": "UP",
        "service": "ai-service",
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


# Include versioned API router
app.include_router(api_router, prefix="/api/v1")


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host=settings.host, port=settings.port, reload=True)
