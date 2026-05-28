# JS Mentor Backend

startup instruction: `uvicorn app.main:app --reload`

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
