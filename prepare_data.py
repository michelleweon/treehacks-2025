import pandas as pd
import json

# Load the dataset
file_path = "processed_metadata_for_openai.csv"  # Ensure this is in your repo
df = pd.read_csv(file_path)

# Separate features and labels
feature_columns = df.columns[:-1]  # All except the last column
label_column = df.columns[-1]  # Last column contains labels

# Convert each row into OpenAI's training format
training_data = []
for _, row in df.iterrows():
    prompt = ", ".join([f"{col}: {row[col]}" for col in feature_columns])
    completion = row[label_column]  # The classification label

    training_data.append({"prompt": prompt, "completion": completion})

# Save as JSONL file
jsonl_file_path = "openai_training_data.jsonl"
with open(jsonl_file_path, "w") as f:
    for entry in training_data:
        f.write(json.dumps(entry) + "\n")

print(f"Training data saved to {jsonl_file_path}")
