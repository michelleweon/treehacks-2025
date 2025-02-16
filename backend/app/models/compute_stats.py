import pandas as pd
import numpy as np
import os

# Check current working directory
print("Current working directory:", os.getcwd())

# Load original dataset
file_path = os.path.join(os.getcwd(), "unscaled_metadata.csv")  # Ensure the path is correct
if not os.path.exists(file_path):
    print(f"File not found: {file_path}")
    # Add more debugging information if needed
else:
    print(f"File found: {file_path}")
df = pd.read_csv(file_path)

# Identify feature columns (excluding labels)
feature_columns = ["sinus", "bradycardia", "tachycardia", "brady_episode", "increased_hrv"]

# Compute mean and std deviation
stats = {}
for col in feature_columns:
    stats[col] = {
        "mean": np.mean(df[col]),
        "std": np.std(df[col])
    }

# Save computed statistics
import json
file_path = os.path.join(os.getcwd(), "scaling_factors.json")  # Ensure the path is correct
with open(file_path, "w") as f:
    json.dump(stats, f)

print(f"Scaling factors saved to 'scaling_factors.json'")
