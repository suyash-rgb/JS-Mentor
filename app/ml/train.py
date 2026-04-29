import os
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report, accuracy_score
import joblib

# Paths
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DATA_PATH = os.path.join(BASE_DIR, "synthetic_training_data.csv")
MODEL_DIR = os.path.join(BASE_DIR, "app", "ml", "models")
MODEL_PATH = os.path.join(MODEL_DIR, "risk_model.joblib")

def train():
    print("Loading data...")
    if not os.path.exists(DATA_PATH):
        print(f"Error: Data file not found at {DATA_PATH}")
        return
        
    df = pd.read_csv(DATA_PATH)
    
    # Drop columns that shouldn't be features
    # We drop 'predicted_pass_probability' because it directly leaks the risk_level label.
    # We drop 'student_id' because it's just an identifier, not a predictor.
    X = df.drop(columns=["student_id", "risk_level", "predicted_pass_probability"])
    y = df["risk_level"]
    
    # Define categorical and numerical features
    categorical_features = ["progress_status"]
    numeric_features = [
        "time_spent_seconds",
        "avg_exercise_attempts",
        "avg_exercise_execution_time_ms",
        "exercise_is_correct_ratio",
        "quiz_score",
        "quiz_attempt_number"
    ]
    
    # Preprocessing
    preprocessor = ColumnTransformer(
        transformers=[
            ("num", StandardScaler(), numeric_features),
            ("cat", OneHotEncoder(handle_unknown="ignore"), categorical_features)
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
    print("Accuracy:", accuracy_score(y_test, y_pred))
    print("\nClassification Report:\n", classification_report(y_test, y_pred))
    
    # Save the model
    os.makedirs(MODEL_DIR, exist_ok=True)
    joblib.dump(pipeline, MODEL_PATH)
    print(f"\nModel successfully saved to {MODEL_PATH}")

if __name__ == "__main__":
    train()
