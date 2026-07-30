import csv
import random
import math

# Sigmoid function
def sigmoid(x):
    return 1 / (1 + math.exp(-x))

def generate_realistic_data(num_rows=5000):
    output_file = "synthetic_training_data.csv"
    headers = [
        "student_id",
        "exercise_is_correct_ratio",
        "exercise_completion_velocity",
        "practice_problems_solved",
        "quiz_score",
        "avg_exercise_attempts",
        "avg_exercise_execution_time_ms",
        "predicted_pass_probability",
        "risk_level"
    ]
    
    with open(output_file, mode='w', newline='') as file:
        writer = csv.writer(file)
        writer.writerow(headers)
        
        for i in range(1, num_rows + 1):
            # Generate independent normalized features in [0, 1] to prevent collinearity suppression
            correct_norm = random.uniform(0.0, 1.0)
            velocity_norm = random.uniform(0.0, 1.0)
            practice_norm = random.uniform(0.0, 1.0)
            quiz_norm = random.uniform(0.0, 1.0)
            attempts_norm = random.uniform(0.0, 1.0)
            exec_time_norm = random.uniform(0.0, 1.0)

            # Simulate a 5% copy-paste cheating group (instant submissions < 10 seconds)
            is_cheating = random.random() < 0.05
            if is_cheating:
                exercise_is_correct_ratio = round(random.uniform(0.85, 1.0), 2)
                exercise_completion_velocity = round(random.uniform(1.0, 5.0), 1)
                practice_problems_solved = int(random.uniform(10, 50))
                quiz_score = round(random.uniform(90.0, 100.0), 1)
                correct_norm = exercise_is_correct_ratio
                velocity_norm = 0.0
                practice_norm = practice_problems_solved / 100.0
                quiz_norm = quiz_score / 100.0
            else:
                exercise_is_correct_ratio = round(correct_norm, 2)
                exercise_completion_velocity = round(velocity_norm * 600.0 + 30.0, 1)
                practice_problems_solved = int(practice_norm * 100)
                quiz_score = round(quiz_norm * 100.0, 1)

            avg_exercise_attempts = round(attempts_norm * 9.0 + 1.0, 1)
            avg_exercise_execution_time_ms = int(exec_time_norm * 9500 + 500)

            # Calculate Target Variable Z with strict hierarchy Rank 1 to Rank 6:
            # #1: exercise_is_correct_ratio (+5.0)
            # #2: exercise_completion_velocity (+4.0)
            # #3: practice_problems_solved (+3.0)
            # #4: quiz_score (+2.0)
            # #5: avg_exercise_attempts (-1.2)
            # #6: avg_exercise_execution_time_ms (-0.5)
            z = -5.5  # Intercept to balance LOW/MEDIUM/HIGH classes
            z += (correct_norm * 6.5)
            z += (velocity_norm * 3.8)
            z += (practice_norm * 2.8)
            z += (quiz_norm * 1.8)
            z -= (attempts_norm * 1.0)
            z -= (exec_time_norm * 0.4)

            if exercise_completion_velocity < 10.0:
                z -= 10.0  # Heavy anti-cheat penalty for copy-pasting

            predicted_pass_probability = round(sigmoid(z), 3)

            if predicted_pass_probability >= 0.70:
                risk_level = "LOW"
            elif predicted_pass_probability <= 0.40:
                risk_level = "HIGH"
            else:
                risk_level = "MEDIUM"

            writer.writerow([
                i,
                exercise_is_correct_ratio,
                exercise_completion_velocity,
                practice_problems_solved,
                quiz_score,
                avg_exercise_attempts,
                avg_exercise_execution_time_ms,
                predicted_pass_probability,
                risk_level
            ])
            
    print(f"Successfully generated {num_rows} rows of algorithmically correlated real-world data!")
    print(f"Saved to {output_file}")

if __name__ == "__main__":
    generate_realistic_data(5000)
