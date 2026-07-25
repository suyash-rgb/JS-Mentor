import pandas as pd
import numpy as np

def generate_practice_problems(risk_level):
    if risk_level == 'LOW':
        return np.random.randint(70, 151)
    elif risk_level == 'MEDIUM':
        return np.random.randint(20, 70)
    else:
        return np.random.randint(0, 20)

def main():
    file_path = "synthetic_training_data.csv"
    print(f"Reading {file_path}...")
    
    try:
        df = pd.read_csv(file_path)
    except FileNotFoundError:
        print(f"Error: {file_path} not found.")
        return
        
    if 'practice_problems_solved' in df.columns:
        print("Column 'practice_problems_solved' already exists. Skipping patch.")
        return
        
    print(f"Loaded {len(df)} rows. Generating 'practice_problems_solved'...")
    df['practice_problems_solved'] = df['risk_level'].apply(generate_practice_problems)
    
    # Reorder columns to put practice_problems_solved before predicted_pass_probability
    cols = list(df.columns)
    cols.remove('practice_problems_solved')
    
    # Try to insert it right after quiz_attempt_number
    try:
        idx = cols.index('quiz_attempt_number')
        cols.insert(idx + 1, 'practice_problems_solved')
        df = df[cols]
    except ValueError:
        pass # Keep it at the end if we can't find quiz_attempt_number
        
    print("Saving updated dataset...")
    df.to_csv(file_path, index=False)
    
    print("\nDataset updated successfully!")
    print("\nData Preview:")
    print(df[['student_id', 'risk_level', 'practice_problems_solved']].head(10))

if __name__ == "__main__":
    main()
