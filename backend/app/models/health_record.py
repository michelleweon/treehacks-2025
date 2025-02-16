from pydantic import BaseModel
from typing import Optional

class HealthRecord(BaseModel):
    ppg_signal: list[float]  # List of PPG signal values
    heart_rate: Optional[float] = None  # Optional heart rate measurement
    blood_pressure: Optional[tuple[int, int]] = None  # Optional (systolic, diastolic) BP
    ecg_signal: Optional[list[float]] = None  # Optional ECG signal values
