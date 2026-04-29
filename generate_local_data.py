import csv
import random
import math

# Sigmoid function (The core math behind Logistic Regression)
def sigmoid(x):
    return 1 / (1 + math.exp(-x))

def generate_realistic_data(num_rows=5000):
    output_file = "synthetic_training_data.csv"
    headers = [
        "student_id", "progress_status", "time_spent_seconds", 
        "avg_exercise_attempts", "avg_exercise_execution_time_ms", 
        "exercise_is_correct_ratio", "quiz_score", "quiz_attempt_number", 
        "predicted_pass_probability", "risk_level"
    ]
    
    with open(output_file, mode='w', newline='') as file:
        writer = csv.writer(file)
        writer.writerow(headers)
        
        for i in range(1, num_rows + 1):
            # 1. Generate an underlying hidden "aptitude" score for the student (0.0 to 1.0)
            # This ensures features are naturally correlated (e.g. good students have high scores AND low attempts)
            aptitude = random.gauss(0.5, 0.2)
            aptitude = max(0.0, min(1.0, aptitude))
            
            # 2. Generate Independent Variables based on aptitude (with some real-world noise/variance)
            is_completed = random.random() < (aptitude + 0.2)
            progress_status = "COMPLETED" if is_completed else "IN_PROGRESS"
            
            time_spent_seconds = int(random.gauss(10000 - (aptitude * 5000), 2000))
            time_spent_seconds = max(300, min(20000, time_spent_seconds))
            
            avg_exercise_attempts = round(random.gauss(8.0 - (aptitude * 6.0), 1.5), 1)
            avg_exercise_attempts = max(1.0, min(10.0, avg_exercise_attempts))
            
            avg_exercise_execution_time_ms = int(random.gauss(8000 - (aptitude * 5000), 1500))
            avg_exercise_execution_time_ms = max(500, min(10000, avg_exercise_execution_time_ms))
            
            exercise_is_correct_ratio = round(random.gauss(0.2 + (aptitude * 0.7), 0.15), 2)
            exercise_is_correct_ratio = max(0.0, min(1.0, exercise_is_correct_ratio))
            
            quiz_score = round(random.gauss(30 + (aptitude * 60), 15), 1)
            quiz_score = max(0.0, min(100.0, quiz_score))
            
            quiz_attempt_number = int(random.gauss(4 - (aptitude * 2), 1))
            quiz_attempt_number = max(1, min(5, quiz_attempt_number))
            
            # 3. Calculate Target Variable using an actual Logistic Regression formula
            # Z = (w1*x1) + (w2*x2) + ... + Intercept
            z = -5.0 # Intercept
            z += (1.5 if progress_status == "COMPLETED" else -1.5)
            z += (exercise_is_correct_ratio * 4.0)
            z += (quiz_score / 100.0 * 5.0)
            z -= (avg_exercise_attempts * 0.3)
            z -= (quiz_attempt_number * 0.5)
            
            # Pass Z through the sigmoid function to get a strict probability between 0 and 1
            predicted_pass_probability = round(sigmoid(z), 3)
            
            # 4. Classify Risk Level precisely based on the calculated probability
            if predicted_pass_probability >= 0.7:
                risk_level = "LOW"
            elif predicted_pass_probability <= 0.4:
                risk_level = "HIGH"
            else:
                risk_level = "MEDIUM"

            writer.writerow([
                i, progress_status, time_spent_seconds, 
                avg_exercise_attempts, avg_exercise_execution_time_ms, 
                exercise_is_correct_ratio, quiz_score, quiz_attempt_number, 
                predicted_pass_probability, risk_level
            ])
            
    print(f"Successfully generated {num_rows} rows of algorithmically correlated real-world data!")
    print(f"Saved to {output_file}")

if __name__ == "__main__":
    generate_realistic_data(5000)
