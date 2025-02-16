import json
import os

# Update path to include the data subdirectory
input_file = "data/openai_training_data_prepared_valid.jsonl"
output_file = "data/openai_training_data_chat_format.jsonl"

print(f"Current working directory: {os.getcwd()}")
print(f"Looking for input file: {input_file}")

if not os.path.exists(input_file):
    print(f"Error: Input file '{input_file}' not found!")
    exit(1)

chat_data = []
count = 0

with open(input_file, "r") as f:
    for line in f:
        count += 1
        example = json.loads(line)

        # Convert to chat format
        chat_entry = {
            "messages": [
                {"role": "system", "content": "You are a helpful AI that classifies heart conditions."},
                {"role": "user", "content": example["prompt"]},
                {"role": "assistant", "content": example["completion"]}
            ]
        }
        chat_data.append(chat_entry)

print(f"Processed {count} entries from input file")

# Save the new chat-formatted file
with open(output_file, "w") as f:
    for entry in chat_data:
        f.write(json.dumps(entry) + "\n")

print(f"Chat-formatted training data saved to {output_file}")
