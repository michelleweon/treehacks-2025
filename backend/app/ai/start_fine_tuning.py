from openai import OpenAI

client = OpenAI(api_key="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")

# Replace with your actual File ID from the upload step
file_id = "file-VgpQaEG8Uo5Sxr7GtYup7Z"

try:
    fine_tune_job = client.fine_tuning.jobs.create(
        training_file=file_id,
        model="gpt-3.5-turbo"
    )

    print("Request details:")
    print(f"Model: gpt-3.5-turbo")  
    print(f"File ID: {file_id}")
    print("\nResponse:")
    print(fine_tune_job)

except Exception as e:
    print(f"Full error details:")
    print(f"Error: {str(e)}")
