import joblib
import os
import pandas as pd
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter(
    prefix="/ml",
    tags=["Machine Learning"]
)

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
MODEL_PATH = os.path.join(BASE_DIR, "app", "ml", "models", "risk_model.joblib")

model = None

class StudentData(BaseModel):
    progress_status: str
    time_spent_seconds: int
    avg_exercise_attempts: float
    avg_exercise_execution_time_ms: int
    exercise_is_correct_ratio: float
    quiz_score: float
    quiz_attempt_number: int

def get_model():
    global model
    if model is None:
        if os.path.exists(MODEL_PATH):
            model = joblib.load(MODEL_PATH)
        else:
            raise HTTPException(status_code=503, detail="Model is not trained yet. Run train.py first.")
    return model

@router.post("/predict_risk")
def predict_risk(student: StudentData):
    """
    Predicts the risk level (LOW, MEDIUM, HIGH) of a student based on their progress data.
    """
    ml_model = get_model()
    
    # Convert input to DataFrame because our ColumnTransformer in the pipeline expects column names
    input_data = pd.DataFrame([student.model_dump()])
    
    try:
        prediction = ml_model.predict(input_data)
        risk_level = prediction[0]
        
        # Get probabilities for all classes
        probabilities = ml_model.predict_proba(input_data)[0]
        classes = ml_model.classes_
        prob_dict = {classes[i]: float(probabilities[i]) for i in range(len(classes))}
        
        return {
            "risk_level": risk_level,
            "probabilities": prob_dict
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")
