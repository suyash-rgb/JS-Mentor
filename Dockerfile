# Use an official Python runtime as a parent image
FROM python:3.10-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Set the working directory in the container
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy the requirements file into the container
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application code
COPY . .

# Ensure the startup script is executable
RUN chmod +x scripts/start.sh

# =====================================================================
# SEQUENTIAL SETUP INSTRUCTIONS (Automated via start.sh)
# =====================================================================
# 1. ML Model Training (Build Phase)
# 2. Database Initialization (Runtime Phase)
# 3. App Startup (Runtime Phase)
# =====================================================================

# Train the ML model during the build phase
RUN python app/ml/train.py

# Expose the port (Render uses $PORT)
EXPOSE 10000

# Use the startup script to run DB initialization and start the app sequentially
CMD ["./scripts/start.sh"]
