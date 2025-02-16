from fastapi import APIRouter, HTTPException
import os
from openai import OpenAI

router = APIRouter()

# Perplexity API key – Store this in an environment variable
PERPLEXITY_API_KEY = os.getenv("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")

# Initialize OpenAI client
client = OpenAI(api_key=PERPLEXITY_API_KEY, base_url="https://api.perplexity.ai")

@router.get("/chatbot")
def chatbot_query(query: str):
    """
    Query Perplexity AI for chatbot-style research insights.
    """
    messages = [
        {
            "role": "system",
            "content": (
                "You are an artificial intelligence assistant and you need to "
                "engage in a helpful, detailed, polite conversation with a user."
            ),
        },
        {
            "role": "user",
            "content": query,
        },
    ]

    try:
        # Chat completion without streaming
        response = client.chat.completions.create(
            model="sonar-pro",
            messages=messages,
        )
        return {"query": query, "results": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
