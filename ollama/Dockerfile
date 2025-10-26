# Start from the official Ollama image
FROM ollama/ollama

# Copy your custom modelfile into a directory inside the image
COPY ./custom-gemma3 /app/custom-gemma3-modelfile

# Start the Ollama server in the background,
# wait a moment for it to initialize,
# --- ADDED: Explicitly pull the base model needed by the modelfile ---
# !!! Replace 'gemma3:1b' below if your custom-gemma3 file uses a different base model !!!
# ---
# create the model using the modelfile,
# and then stop the background server process.
RUN nohup ollama serve & \
    sleep 5 && \
    ollama pull gemma3:1b && \
    ollama create custom-gemma3 -f /app/custom-gemma3-modelfile && \
    pkill ollama