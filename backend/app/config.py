import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class Config:
    OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
    DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./test.db")  # Default to SQLite if not provided
    MODEL_NAME = os.getenv("MODEL_NAME", "openai-ppg-predictor")
    DEBUG = os.getenv("DEBUG", "False").lower() == "true"

config = Config()
