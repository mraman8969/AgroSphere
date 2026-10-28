from fastapi import APIRouter

from app.api.v1.endpoints import crop, disease, health

api_router = APIRouter()
api_router.include_router(health.router)
api_router.include_router(crop.router)
api_router.include_router(disease.router)
