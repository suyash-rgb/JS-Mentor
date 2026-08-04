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

## 5. Atomic Hot-Swapping & Zero-Downtime Pipeline
To guarantee continuous operations and avoid file-lock or serialization conflicts on a live production FastAPI server during active student sessions, model updates use a zero-downtime atomic pipeline:

1. **Stage to Candidate**: The training runner writes the updated Logistic Regression pipeline to a candidate file: `risk_model_candidate.joblib`.
2. **Atomic OS-level Move**: The runner calls Python's `shutil.move()` to atomically rename `risk_model_candidate.joblib` to `risk_model.joblib`. This OS-level operation ensures the target file is either fully replaced or untouched, eliminating partial or corrupted reads.
3. **In-Memory Cache Invalidation**: The runner invokes `MLService.reload_model()`, which clears the in-memory cached model instance (`_model = None` and resetting `_model_mtime = 0`).
4. **Dynamic On-Demand Reload**: The next student prediction query detects the change in file modification time (`mtime`) on disk, reload-triggers `joblib.load()`, and populates the cache with the new weights under $< 50$ milliseconds.

### Zero-Downtime Hot-Swapping Sequence Flow:

```mermaid
sequenceDiagram
    autonumber
    participant Trainer as Trainer / Cron Job
    participant TrainScript as Training Script (train.py)
    participant Disk as Disk Storage (models/)
    participant MLService as ML Service (ml_service.py)
    participant API as FastAPI App / Worker

    Trainer->>TrainScript: Trigger training run
    TrainScript->>TrainScript: Pull synthetic baseline + live DB records
    TrainScript->>TrainScript: Train Logistic Regression pipeline
    Note over TrainScript, Disk: Stage candidate to avoid file locks
    TrainScript->>Disk: Save candidate weights (risk_model_candidate.joblib)
    Note over TrainScript, Disk: Atomic file replacement (OS-level rename)
    TrainScript->>Disk: shutil.move(candidate, risk_model.joblib)
    Note over TrainScript, MLService: In-memory cache invalidation
    TrainScript->>MLService: Invoke MLService.reload_model()
    MLService->>MLService: Reset cached model (_model = None, _model_mtime = 0)
    
    rect rgb(240, 248, 255)
        Note over API, MLService: Next prediction request arrives
        API->>MLService: MLService.predict_single(features)
        MLService->>MLService: Detect change in file mtime on disk
        MLService->>Disk: Load updated risk_model.joblib via joblib.load
        MLService->>API: Return risk level classification
    end
```

---

## 6. Vector Similarity Search & Automated Review Recycling (Qdrant + FastEmbed)
To automate the grading of programming exercises and optimize trainer efficiency, JS-Mentor integrates an on-the-fly vector similarity search (Nearest Neighbor query) engine.

### System Architecture & Pipeline
1. **Embedding Generation**: When a student submits a coding solution, the backend leverages **FastEmbed** (`BAAI/bge-small-en-v1.5` model) to generate a 384-dimensional vector embedding representing the semantic structure of the JavaScript code.
2. **Qdrant Vector Database Search**: The backend queries Qdrant to find the nearest graded historical submission for that specific `exercise_id` using **Cosine Similarity**.
3. **Similarity Threshold Match**:
   * **Score $\ge 0.95$**: If a historically graded submission matches with $\ge 95\%$ similarity, the system recycles the previous trainer's score and feedback, automatically setting the submission status to `AUTO_REVIEWED`.
   * **Score $< 0.95$**: If no matching neighbor is found within the threshold, the submission is categorized as `PENDING_REVIEW` for manual trainer grading.
4. **Attribution Library Enrichment**: When a trainer manually reviews a submission and hits "Submit Grade", the final grade, feedback, and 384-dimensional vector are upserted into Qdrant to enrich the model vector library for future students.

### Automated Code Review Pipeline Flow:

```mermaid
flowchart TD
    A["Student Submits JavaScript Code"] --> B["FastEmbed (bge-small-en-v1.5): Generate 384-D Vector"]
    B --> C["Query Qdrant: Match exercise_id & status = GRADED"]
    C --> D{"Cosine Similarity Score >= 0.95?"}
    
    D -->|Yes: Nearest Neighbor Match| E["Recycle Grade & Feedback Text"]
    E --> F["Set Status = AUTO_REVIEWED"]
    F --> G["Grading Hub UI: Prefill feedback & show ML Badge/Banner"]
    
    D -->|No: Low Similarity| H["Set Status = PENDING_REVIEW"]
    H --> I["Trainer Manually Reviews & Grades Code"]
    I --> J["Upsert Final Grade, Feedback & Vector to Qdrant"]
    G --> K["Trainer approves/edits feedback (Status -> GRADED)"]
    K --> J
```
