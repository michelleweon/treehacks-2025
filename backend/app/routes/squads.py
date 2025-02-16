from fastapi import APIRouter, HTTPException
from app.services.data_processor import get_squad_summary

router = APIRouter()

dataframe = None  # This will be replaced by actual data handling logic

@router.get("/squads")
def list_squads():
    global dataframe
    if dataframe is None:
        raise HTTPException(status_code=400, detail="No data available. Please upload a CSV file.")
    squads = get_squad_summary(dataframe)
    return squads

@router.get("/squads/{squad_id}")
def get_squad_details(squad_id: int):
    global dataframe
    if dataframe is None:
        raise HTTPException(status_code=400, detail="No data available. Please upload a CSV file.")
    squad_details = get_squad_summary(dataframe, squad_id)
    if squad_details is None:
        raise HTTPException(status_code=404, detail="Squad not found")
    return squad_details