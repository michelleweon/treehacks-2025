import pandas as pd
import openai
from app.config import config

def train_ai_model(data_path: str):
    """
    Trains an AI model using past PPG data from a CSV file.
    """
    try:
        # Load historical data
        df = pd.read_csv(data_path)
        ppg_signals = df["ppg_signal"].tolist()
        labels = df[["ecg_signal", "blood_pressure"]].to_dict(orient="records")
        
        # Prepare data for OpenAI fine-tuning (if applicable)
        training_data = [
            {"prompt": f"PPG: {ppg}", "completion": str(label)} 
            for ppg, label in zip(ppg_signals, labels)
        ]
        
        # Example: Save as JSON for OpenAI fine-tuning
        import json
        with open("training_data.json", "w") as f:
            json.dump(training_data, f)
        
        print("Training data prepared. Upload for fine-tuning if needed.")
        return training_data
    except Exception as e:
        raise RuntimeError(f"Error training AI model: {e}")
