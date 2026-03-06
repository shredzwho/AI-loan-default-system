#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e

# Setup trap to kill background processes on script exit
trap "trap - SIGTERM && kill -- -$$" SIGINT SIGTERM EXIT

echo "====================================="
echo "Starting AI-Loan System"
echo "====================================="

# 1. Start the FastAPI Backend
echo "Starting FastAPI Backend..."
if [ -d "venv" ]; then
    source venv/bin/activate
else
    echo "Warning: venv not found. Ensure dependencies are installed."
fi

uvicorn api.app:app --host 0.0.0.0 --port 8000 --reload &
BACKEND_PID=$!
echo "Backend running at http://localhost:8000 (PID: $BACKEND_PID)"

# 2. Start the Next.js Frontend
echo "Starting Next.js Frontend..."
if [ -d "frontend" ]; then
    cd frontend
    npm run dev &
    FRONTEND_PID=$!
    echo "Frontend running at http://localhost:3000 (PID: $FRONTEND_PID)"
    cd ..
else
    echo "Error: frontend directory not found!"
    exit 1
fi

echo "====================================="
echo "Both systems are running!"
echo "Press Ctrl+C to stop both."
echo "====================================="

# Wait for background processes to keep the script running
wait
