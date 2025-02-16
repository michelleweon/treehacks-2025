import openai
from app.config import config

def predict_health_metrics(data):
    """
    Uses OpenAI's API to predict health metrics based on PPG data.
    """
    openai.api_key = config.OPENAI_API_KEY
    
    prompt = f"Predict ECG and blood pressure from PPG signal: {data.ppg_signal}"
    
    try:
        response = openai.ChatCompletion.create(
            model=config.MODEL_NAME,
            messages=[{"role": "user", "content": prompt}],
        )
        prediction = response["choices"][0]["message"]["content"]
        return prediction
    except Exception as e:
        raise RuntimeError(f"AI prediction failed: {e}")
