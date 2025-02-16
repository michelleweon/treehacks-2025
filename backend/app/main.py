from fastapi import FastAPI
from app.routes import squads, alerts, ai

app = FastAPI(title="Health Insights API", description="API for squad insights, alerts, and AI-driven health predictions.")

# Include API routes
app.include_router(squads.router, prefix="/squads", tags=["Squads"])
app.include_router(alerts.router, prefix="/alerts", tags=["Alerts"])
app.include_router(ai.router, prefix="/ai", tags=["AI Predictions"])

@app.get("/")
def read_root():
    return {"message": "Welcome to the Health Insights API"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
