# JS-Mentor Machine Learning Engine Reference

The Machine Learning (ML) Engine in JS-Mentor provides automated, early-intervention risk assessments for students. By continually analyzing behavior, progression velocity, quiz outcomes, and practical exercises, the platform proactively identifies "High-Risk" students who may need additional support.

---

## 1. Core Architecture & Algorithms
The ML Engine utilizes a supervised classification workflow:
* **Model Classifier**: **Logistic Regression** (LBFGS solver) optimized via a regularized pipeline.
* **Preprocessing**: All numerical attributes are dynamically normalized using a **StandardScaler** to ensure uniform coefficient scale sensitivity.
* **Target Classes**: `LOW`, `MEDIUM`, and `HIGH` risk classifications.
* **Serialization**: The trained model pipeline is saved as `risk_model.joblib`.

---

## 2. Feature Engineering & Vector Representation
The ML model calculates real-time metrics across six primary features to evaluate a student's risk profile:

| Feature Name | Type | Description |
| --- | --- | --- |
| `exercise_is_correct_ratio` | Float | The ratio of correctly solved coding exercises (successful runs vs total attempts). |
| `exercise_completion_velocity` | Float | Gaps between topic progression in seconds. Extremely short gaps (< 10 seconds) flag potential copy-paste cheating patterns. |
| `practice_problems_solved` | Integer | Total problems solved in the Practice Hub, representing self-motivated practice. |
| `quiz_score` | Float | Average score obtained across curriculum module quizzes (0 to 100). |
| `avg_exercise_attempts` | Float | Average attempts required by the student to pass coding exercises. |
| `avg_exercise_execution_time_ms`| Integer | Average runtime duration of user-submitted JavaScript code. |

---

## 3. Explainable AI: Linear Factor Attribution Layer
To avoid "black-box" predictions, the engine uses a fast, local feature weight attribution layer. This layer maps the student's metrics back to the classifier coefficients to output clear, human-readable risk factors on the trainer dashboard:
* **Abnormal Velocity**: Flags copy-paste patterns if progression velocity is $< 10$ seconds.
* **Low Coding Accuracy**: Flags if correctness ratio is $< 50\%$.
* **Low Practice Hub Usage**: Flags if practice problem count is $< 5$.
* **Low Quiz Score**: Flags if average quiz score is $< 60\%$.
* **High Retry Count**: Flags if attempts average exceeds $3.0$.

---

## 4. Ingestion & Continuous Training Loop
The training script (`app/ml/train.py`) combines:
1. **Synthetic Base Data** (`synthetic_training_data.csv`): Rebalanced baseline records representing diverse failure and success patterns.
2. **Real Database Interactions**: Extracted on-the-fly from active database tables (`student_progress`, `exercise_evaluations`, `quiz_evaluations`, and `practice_progress`) to adapt the model to real-world cohorts.

### Evaluation Metrics
During training, the pipeline is evaluated across:
* **Accuracy**: Overall classification correctness.
* **Mean Squared Error (MSE)** & **Root Mean Squared Error (RMSE)**: Evaluated on ordinal risk labels (`LOW` = 0, `MEDIUM` = 1, `HIGH` = 2).
* **Custom Classification Report**: Tracks precision, recall, and support across all target classes.

### Safe Hot-Swapping
To prevent file-lock conflicts and crashes on a live production server, training outputs are written to `risk_model_candidate.joblib` and atomically moved using `shutil.move()` to `risk_model.joblib`. An internal reload mechanism clears the cached in-memory model class instantly:
```python
MLService.reload_model()
```
