# Use an official Python runtime as a parent image
FROM python:3.11-slim

# Set the working directory to /app
WORKDIR /app

# Copy the requirements file and install dependencies
# We copy this first to leverage Docker cache
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application code
COPY . .

# Expose port 8000 for FastAPI and 8501 for Streamlit
EXPOSE 8000
EXPOSE 8501

# Default command: Run the FastAPI server
# You can override this to run Streamlit by passing: `streamlit run app/main.py --server.port=8501 --server.address=0.0.0.0`
CMD ["uvicorn", "api.app:app", "--host", "0.0.0.0", "--port", "8000"]
