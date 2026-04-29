import os
import requests
import pandas as pd
from io import StringIO
from dotenv import load_dotenv
import time
import re

# Load environment variables
load_dotenv()

API_KEY = os.getenv("FASTAPI_GROK_API_KEY")
API_URL = os.getenv("FASTAPI_GROK_API_URL")
MODEL = os.getenv("FASTAPI_GROK_MODEL")

if not API_KEY or not API_URL:
    print("Error: API credentials not found in .env file.")
    exit(1)

def generate_synthetic_data(num_rows=25):
    prompt = f"""You are a data generation assistant. Generate exactly {num_rows} rows of synthetic data for training a Logistic Regression model to predict student pass/fail outcomes.

The CSV should have the following columns:
1. student_id (integer)
2. progress_status (IN_PROGRESS or COMPLETED)
3. time_spent_seconds (integer, 300 to 20000)
4. avg_exercise_attempts (float, 1.0 to 10.0)
5. avg_exercise_execution_time_ms (integer, 100 to 10000)
6. exercise_is_correct_ratio (float, 0.0 to 1.0)
7. quiz_score (float, 0.0 to 100.0)
8. quiz_attempt_number (integer, 1 to 5)
9. predicted_pass_probability (float, 0.0 to 1.0)
10. risk_level (LOW, MEDIUM, HIGH)

Logical rules for correlation:
- LOW risk: high exercise_is_correct_ratio, low avg_exercise_attempts, high quiz_score, COMPLETED status or moderate time_spent_seconds, predicted_pass_probability > 0.7.
- HIGH risk: low exercise_is_correct_ratio, high avg_exercise_attempts, low quiz_score, IN_PROGRESS status with high time_spent_seconds, predicted_pass_probability < 0.4.
- MEDIUM risk: predicted_pass_probability between 0.4 and 0.7.
- risk_level MUST strictly match the predicted_pass_probability bounds.

IMPORTANT: You MUST wrap your generated CSV data inside a markdown block like this:
```csv
student_id,progress_status,time_spent_seconds,...
1,COMPLETED,4000,...
```
Do NOT include any other text inside the CSV block.
"""

    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json",
    }
    
    payload = {
        "model": MODEL,
        "input": prompt
    }

    try:
        response = requests.post(API_URL, headers=headers, json=payload, timeout=60)
        response.raise_for_status()
        data = response.json()
        
        generated_text = ""
        # Check standard and custom response structures
        if data.get("output") and isinstance(data["output"], list):
            for item in data["output"]:
                if item.get("type") in ["message", "reasoning"]:
                    content = item.get("content", [])
                    if content and len(content) > 0 and content[0].get("text"):
                        # If we found text, append it (sometimes reasoning + message are separate)
                        generated_text += content[0]["text"] + "\n"
                        
        if not generated_text and data.get("choices"):
            generated_text = data["choices"][0]["message"]["content"]
            
        if not generated_text:
            print("Failed to extract text from API response.")
            return None

        # DEBUG: Print the raw text to see what the LLM is actually returning
        print("=== RAW GENERATED TEXT START ===")
        print(generated_text[:1000]) # Print first 1000 chars to avoid flooding terminal
        print("=== RAW GENERATED TEXT END ===")

        # Extract CSV using regex
        match = re.search(r'```(?:csv)?\s*(.*?)\s*```', generated_text, re.DOTALL | re.IGNORECASE)
        if match:
            return match.group(1).strip()
            
        # Fallback if the LLM forgot the ```csv tag but included the header
        header_idx = generated_text.find("student_id,progress_status")
        if header_idx != -1:
            csv_str = generated_text[header_idx:]
            # Cut off at the next markdown block if present
            end_idx = csv_str.find("```")
            if end_idx != -1:
                csv_str = csv_str[:end_idx]
            return csv_str.strip()

        print("Could not find CSV block in the response.")
        return None

    except Exception as e:
        print(f"API Error: {e}")
        if 'response' in locals() and hasattr(response, 'text'):
            print(f"API Response: {response.text}")
        return None

if __name__ == "__main__":
    print("Starting data generation process...")
    # Generating 25 rows x 4 batches = 100 rows. Added sleep to prevent TPM rate limits.
    all_dfs = []
    
    for i in range(4):
        print(f"Generating batch {i+1}/4...")
        csv_data = generate_synthetic_data(25)
        
        if csv_data:
            try:
                df = pd.read_csv(StringIO(csv_data))
                # Validate it has the correct columns before appending
                if 'student_id' in df.columns and 'risk_level' in df.columns:
                    all_dfs.append(df)
                    print(f"Batch {i+1} successfully parsed ({len(df)} rows).")
                else:
                    print(f"Batch {i+1} parsed but missing expected columns.")
            except Exception as e:
                print(f"Error parsing batch {i+1} CSV: {e}")
        else:
            print(f"Failed to generate batch {i+1}.")
            
        if i < 3: # Don't sleep after the last batch
            print("Sleeping for 0 seconds to respect API rate limits...")
            time.sleep(30)
            
    if all_dfs:
        try:
            final_df = pd.concat(all_dfs, ignore_index=True)
            # Fix IDs to be strictly sequential 1 to N
            final_df['student_id'] = range(1, len(final_df) + 1)
            
            output_file = "synthetic_training_data.csv"
            final_df.to_csv(output_file, index=False)
            print(f"\nSUCCESS! Generated {len(final_df)} rows of training data.")
            print(f"Data saved to {output_file}")
            
            print("\nData Preview:")
            print(final_df.head())
        except Exception as e:
            print(f"Error saving combined data: {e}")
    else:
        print("No valid data was generated across all batches.")
