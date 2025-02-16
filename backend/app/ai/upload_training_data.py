from openai import OpenAI
import os

# Initialize OpenAI client
client = OpenAI(api_key="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")  # Replace with your real API key

print(f"Current working directory: {os.getcwd()}")

try:
    print("Uploading file...")

    # Ensure the correct path to the training file
    file_path = "data/openai_training_data_chat_format.jsonl"  # Adjust as needed

    with open(file_path, "rb") as file_handle:
        file = client.files.create(file=file_handle, purpose="fine-tune")

    print("File uploaded successfully!")
    print(f"File ID: {file.id}")

except Exception as e:
    print(f"Error: {e}")
