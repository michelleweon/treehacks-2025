from fastapi import APIRouter, HTTPException
from app.services.data_processor import generate_alerts

router = APIRouter()

dataframe = None  # This will be replaced by actual data handling logic

@router.get("/alerts")
def get_alerts():
    global dataframe
    if dataframe is None:
        raise HTTPException(status_code=400, detail="No data available. Please upload a CSV file.")
    alerts = generate_alerts(dataframe)
    return alerts