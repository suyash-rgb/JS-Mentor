#!/bin/bash
# Exit immediately if a command exits with a non-zero status.
set -e

echo "--------------------------------------------------------"
echo "STEP 1: Database Initialization"
echo "--------------------------------------------------------"
# Run the database setup script to ensure tables and seed data exist
python scripts/init_db.py

echo "--------------------------------------------------------"
echo "STEP 2: Starting Application Server"
echo "--------------------------------------------------------"
# Start the FastAPI application using Uvicorn
# We use 'exec' to make uvicorn the main process (PID 1)
exec uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-10000}
