import openai

openai.api_key = "your_openai_api_key"

try:
    print("Uploading file...")

    file = openai.File.create(
        file=open("openai_training_data_prepared_valid.jsonl", "rb"),
        purpose="fine-tune"
    )

    print("File uploaded successfully!")
    print(f"File ID: {file['id']}")

except Exception as e:
    print(f"Error: {e}")
