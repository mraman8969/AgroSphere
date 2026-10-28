from fastapi import APIRouter, File, UploadFile, HTTPException, status
from app.services.disease_service import predict_disease, get_class_names

router = APIRouter()

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB
ALLOWED_CONTENT_TYPES = {"image/jpeg", "image/png", "image/jpg", "image/webp"}


@router.post("/disease/detect", tags=["Crop Disease Detection"])
async def detect_crop_disease(file: UploadFile = File(...)):
    """
    Real-time Crop Leaf Disease Detection using Pretrained EfficientNetB0 TFLite.
    Accepts plant leaf photo (JPEG/PNG/WEBP), validates format/size, runs real neural
    network inference, and enriches output with ICAR-aligned organic and chemical treatments.
    """
    if file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported image type: '{file.content_type}'. Allowed types: JPEG, PNG, WEBP."
        )

    image_bytes = await file.read()
    if len(image_bytes) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file is empty. Please upload a valid crop leaf image."
        )

    if len(image_bytes) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File size exceeds maximum limit of 10MB ({round(len(image_bytes)/(1024*1024), 2)}MB received)."
        )

    try:
        result = predict_disease(image_bytes)
        return {
            "status": "success",
            "filename": file.filename,
            "content_type": file.content_type,
            "size_bytes": len(image_bytes),
            **result
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error executing neural model inference: {str(e)}"
        )


@router.get("/disease/classes", tags=["Crop Disease Detection"])
async def get_supported_classes():
    """Returns the list of 15 crop diseases and healthy states supported by the model."""
    classes = get_class_names()
    return {
        "success": True,
        "model": "EfficientNetB0 (PlantVillage + Indian Crops)",
        "count": len(classes),
        "supported_classes": classes
    }
