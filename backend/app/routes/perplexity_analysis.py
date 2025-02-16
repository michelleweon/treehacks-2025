from fastapi import APIRouter, HTTPException
import requests
import os
import json

router = APIRouter()

# Perplexity API key (store in .env for security)
PERPLEXITY_API_KEY = os.getenv("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")

# Load squad dataset (simulating a database query)
DATASET_FILE = "data/ppg_exports_20241126_094919/afib/afib_1.json"

# Function to fetch squad data
def load_squad_data():
    try:
        with open(DATASET_FILE, "r") as f:
            data = json.load(f)
        return data
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Squad data not found")

# Function to query Perplexity AI
def query_perplexity_analysis(data: dict):
    url = "https://api.perplexity.ai/analyze"  # Replace with actual API
    headers = {"Authorization": f"Bearer {PERPLEXITY_API_KEY}", "Content-Type": "application/json"}
    payload = {"query": "Analyze the squad's health status and suggest improvements.", "data": data}

    response = requests.post(url, headers=headers, json=payload)
    if response.status_code == 200:
        return response.json()
    else:
        raise HTTPException(status_code=response.status_code, detail="Error fetching AI analysis")

@router.get("/analyze")
def analyze_squad():
    """
    Fetch squad data and request an AI-driven analysis from Perplexity AI.
    """
    try:
        squad_data = load_squad_data()
        analysis = query_perplexity_analysis(squad_data)
        return {"analysis": analysis}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
