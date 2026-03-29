# Use an official Python runtime as a parent image
FROM python:3.10-slim

# Set environment variables to ensure logs are visible and Python is stable
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Set the working directory in the container
WORKDIR /app

# Install system dependencies for core logic and PDF generation (ReportLab)
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    cargo \
    libjpeg-dev \
    zlib1g-dev \
    libfreetype6-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy the requirements file into the container at /app
COPY requirements.txt .

# Install any needed packages specified in requirements.txt
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application
COPY . .

# Expose port 8000 for the Neural Hub
EXPOSE 8000

# Run uvicorn in production mode (no --reload)
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
