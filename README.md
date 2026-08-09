# JS Mentor Backend

startup instruction: `uvicorn app.main:app --reload`

## Setup Instructions

1. Create a `.env` file in the root directory:
```env
DATABASE_URL=mysql+pymysql://root:password@localhost:3306/js_mentor_db
SECRET_KEY=your_secret_key
JWT_ALGORITHM=HS256
CLERK_SIGNING_SECRET=your_clerk_signing_secret
FRONTEND_URL=http://localhost:3000

FASTAPI_GROK_API_KEY=your_groq_api_key
FASTAPI_GROK_API_URL=https://api.groq.com/openai/v1/responses
FASTAPI_GROK_MODEL=openai/gpt-oss-20b

CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
RAZORPAY_WEBHOOK_SECRET=your_razorpay_webhook_secret
QUIZ_SECRET_KEY=your_secure_quiz_key
```

2. Start the server: `uvicorn app.main:app --reload`

## Testing

The project uses `pytest` for unit and integration testing. All tests are safely isolated and use dummy/in-memory SQLite databases so they will **never** modify or delete your production data.

### Running the Tests

1. Ensure your virtual environment is activated:
   ```bash
   # Windows
   .\venv\Scripts\activate
   ```
2. Run the full test suite using:
   ```bash
   python -m pytest app/tests -v
   ```

### Test Coverage
- `test_curriculum.py`: Tests the full `/curriculum` API routes against a mock `data.json`.
- `test_ingestion.py`: Tests the logic for logging student progress, exercises, and quizzes.
- `test_ml_filter.py`: Tests the qualification logic of the ML service.
- `test_scheduling_engine.py`: Tests the logic and constraints of the automated trainer doubt scheduling engine.
