# models/__init__.py
from app.database import Base
from .user import User, UserRole
from .student import Student
from .trainer import Trainer, TrainerRegistrationCode
from .learning import StudentProgress, ExerciseEvaluation, QuizEvaluation, StudentRiskPrediction
from .interaction import Doubt, MentorshipSession

# This ensures that when you import 'models', 
# all these classes are registered with SQLAlchemy's Base.