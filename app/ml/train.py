import os
import shutil
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report, accuracy_score
import joblib
import sys

# Paths
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, BASE_DIR)

from app.ml.extract_training_data import extract_real_training_data
from app.database import SessionLocal

DATA_PATH = os.path.join(BASE_DIR, "synthetic_training_data.csv")
MODEL_DIR = os.path.join(BASE_DIR, "app", "ml", "models")
MODEL_PATH = os.path.join(MODEL_DIR, "risk_model.joblib")
CANDIDATE_MODEL_PATH = os.path.join(MODEL_DIR, "risk_model_candidate.joblib")

def train(db=None):
    print("Loading synthetic baseline data...")
    if not os.path.exists(DATA_PATH):
        print(f"Error: Data file not found at {DATA_PATH}") 
        return None
        
    synthetic_df = pd.read_csv(DATA_PATH)
    
    # 2. Extract Real Database Training Data
    close_db_after = False
    if db is None:
        try:
            db = SessionLocal()
            close_db_after = True
        except Exception as e:
            print(f"Warning: Could not connect to database for live extraction: {e}")
            db = None

    real_df = pd.DataFrame()
    if db is not None:
        try:
            print("Extracting real student training data from database...")
            real_df = extract_real_training_data(db)
            print(f"Extracted {len(real_df)} real student interaction records.")
        except Exception as e:
            print(f"Note: Live DB tables not initialized yet ({e}). Using synthetic baseline dataset.")
        finally:
            if close_db_after:
                db.close()

    # Combine datasets
    if not real_df.empty:
        # Align columns
        cols_to_keep = [col for col in synthetic_df.columns if col in real_df.columns or col == "risk_level"]
        df = pd.concat([synthetic_df, real_df], ignore_index=True)
    else:
        df = synthetic_df
    
    # Drop identifier and target leak columns if present
    drop_cols = [c for c in ["student_id", "predicted_pass_probability"] if c in df.columns]
    X = df.drop(columns=["risk_level"] + drop_cols)
    y = df["risk_level"]
    
    # Define categorical and numerical features
    categorical_features = []
    numeric_features = [
        "exercise_is_correct_ratio",
        "exercise_completion_velocity",
        "practice_problems_solved",
        "quiz_score",
        "avg_exercise_attempts",
        "avg_exercise_execution_time_ms"
    ]
    
    # Preprocessing
    preprocessor = ColumnTransformer(
        transformers=[
            ("num", StandardScaler(), numeric_features)
        ]
    )
    
    # Create a pipeline
    pipeline = Pipeline(steps=[
        ("preprocessor", preprocessor),
        ("classifier", LogisticRegression(multi_class="multinomial", solver="lbfgs", max_iter=1000))
    ])
    
    # Train-test split
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    print("Training Logistic Regression model...")
    pipeline.fit(X_train, y_train)
    
    # Evaluation
    print("\nEvaluating model...")
    y_pred = pipeline.predict(X_test)
    acc = accuracy_score(y_test, y_pred)
    print("Accuracy:", acc)
    print("\nClassification Report:\n", classification_report(y_test, y_pred))

    # Print Feature Importance / Hierarchy Inspection
    print("\n--- Model Feature Hierarchy & Coefficient Analysis ---")
    classifier = pipeline.named_steps["classifier"]
    classes = list(classifier.classes_)
    low_idx = classes.index("LOW") if "LOW" in classes else 0
    coefs = classifier.coef_[low_idx]
    
    feature_names = numeric_features
    ranked_features = sorted(zip(feature_names, coefs), key=lambda x: abs(x[1]), reverse=True)
    print("Rank | Feature Name                     | Coef (LOW Risk Class) | Abs Weight")
    print("-------------------------------------------------------------------------")
    for idx, (name, val) in enumerate(ranked_features, 1):
        print(f" #{idx}   | {name:<32} | {val:>21.4f} | {abs(val):>10.4f}")
    
    # Save model candidate first for safe atomic hot-swapping
    os.makedirs(MODEL_DIR, exist_ok=True)
    joblib.dump(pipeline, CANDIDATE_MODEL_PATH)
    
    # Atomic rename/replace to prevent file lock crashes on live backend
    shutil.move(CANDIDATE_MODEL_PATH, MODEL_PATH)
    print(f"\nModel successfully trained and hot-swapped to {MODEL_PATH}")

    # Notify MLService to clear cached model instance if loaded in memory
    try:
        from app.services.ml_service import MLService
        MLService.reload_model()
    except Exception:
        pass

    return acc

if __name__ == "__main__":
    train()

