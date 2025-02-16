from fastapi import APIRouter, HTTPException
from app.services.ai_inference import predict_health_metrics
from app.models.health_record import HealthRecord

router = APIRouter()

@router.post("/predict")
def predict_health(data: HealthRecord):
    try:
        result = predict_health_metrics(data)
        return {"prediction": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
