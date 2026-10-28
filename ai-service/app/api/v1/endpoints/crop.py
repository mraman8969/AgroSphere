from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field
from app.services.crop_service import recommend_crop_and_fertilizer, CROPS_DATABASE

router = APIRouter()


class CropRecommendationRequest(BaseModel):
    nitrogen: float = Field(..., ge=0, le=500, description="Nitrogen content ratio in soil (kg/ha or index)")
    phosphorus: float = Field(..., ge=0, le=300, description="Phosphorus content ratio in soil (kg/ha or index)")
    potassium: float = Field(..., ge=0, le=500, description="Potassium content ratio in soil (kg/ha or index)")
    temperature: float = Field(..., ge=-10, le=60, description="Temperature in degree Celsius")
    humidity: float = Field(..., ge=0, le=100, description="Relative humidity in percentage")
    ph: float = Field(..., ge=0, le=14, description="pH value of soil (0.0 to 14.0)")
    rainfall: float = Field(..., ge=0, le=3000, description="Rainfall in mm")


@router.post("/crop/recommend", tags=["Crop & Fertilizer Recommendation"])
async def get_crop_and_fertilizer_recommendation(payload: CropRecommendationRequest):
    """
    Evaluates soil nutrients (N, P, K, pH) and microclimate metrics to deliver:
    1. Primary and alternative suitable Indian crops with compatibility scores
    2. Precision fertilizer recommendations (Urea, DAP, MOP dosages)
    3. Soil pH amendment instructions and organic bio-fertilizer guidance
    """
    try:
        result = recommend_crop_and_fertilizer(
            nitrogen=payload.nitrogen,
            phosphorus=payload.phosphorus,
            potassium=payload.potassium,
            temperature=payload.temperature,
            humidity=payload.humidity,
            ph=payload.ph,
            rainfall=payload.rainfall
        )
        return {
            "status": "success",
            **result
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error evaluating crop & fertilizer recommendation: {str(e)}"
        )


@router.get("/crop/supported", tags=["Crop & Fertilizer Recommendation"])
async def get_supported_crops():
    """Returns the list of crops in the agricultural database with their physiological envelopes."""
    return {
        "success": True,
        "count": len(CROPS_DATABASE),
        "crops": [
            {
                "crop": c["crop"],
                "hindi_name": c["hindi_name"],
                "category": c["category"],
                "season": c["season"],
                "soil_suitability": c["soil_suitability"]
            }
            for c in CROPS_DATABASE
        ]
    }
