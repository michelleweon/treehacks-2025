from openai import OpenAI, OpenAIError

# Initialize OpenAI client
client = OpenAI(api_key="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")  # Replace with your actual API key

# Replace with your fine-tuned model ID
fine_tuned_model = "ft:gpt-3.5-turbo-0125:squadpulse::B1V3b31s"  # Update this

def predict_classification(raw_features: dict):
    """Formats raw input and gets prediction from fine-tuned GPT model."""
    
    feature_list = [f"{k}: {v}" for k, v in raw_features.items()]
    prompt = (
        "Classify the following patient as 'regular', 'irregular', or 'afib':\n"
        + ", ".join(feature_list)
    )

    try:
        response = client.chat.completions.create(
            model=fine_tuned_model,  
            messages=[
                {"role": "system", "content": "You are a medical classifier that categorizes patients based on input data."},
                {"role": "user", "content": prompt}
            ]
        )
        
        # Print the entire response for debugging
        print(f"Full Response: {response}")

        raw_output = response.choices[0].message.content.strip()
        print(f"Raw Model Output: {raw_output}")  # ✅ Debugging Step

        return raw_output

    except OpenAIError as e:
        print(f"An error occurred: {e}")
        return None

# Example usage
new_data = {
    "sinus_value": 0.45,
    "bradycardia_value": 0.78,
    "tachycardia_value": -0.23,
    "brady_episode": 1,
    "increased_hrv": 0
}

prediction = predict_classification(new_data)
if prediction:
    print(f"Predicted Classification: {prediction}")
else:
    print("Failed to get a prediction.")
