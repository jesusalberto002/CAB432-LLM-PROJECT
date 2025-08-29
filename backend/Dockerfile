# backend/Dockerfile

FROM python:3.10-slim

# Set a working directory
WORKDIR /code

# Copy the requirements file and install dependencies
COPY ./requirements.txt /code/requirements.txt
RUN pip install --no-cache-dir -r /code/requirements.txt

# Copy your entire backend application code into a subfolder
COPY . /code/backend

# Command to run the application
# We tell Uvicorn to look inside the 'backend' package for the 'main' module
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]