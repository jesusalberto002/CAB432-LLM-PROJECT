# frontend/Dockerfile

# --- Build Stage ---
# Use a Node.js image to build the static files
FROM node:18 AS build

# ---- ADD THIS LINE ----
# This makes the build argument available in this stage
ARG REACT_APP_API_URL

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# ---- MODIFY THIS LINE ----
# This ensures the environment variable is set for the build command
RUN REACT_APP_API_URL=$REACT_APP_API_URL npm run build

# --- Production Stage ---
# Use a lightweight NGINX server to serve the static files
FROM nginx:stable-alpine

# Copy the built files from the 'build' stage
COPY --from=build /app/build /usr/share/nginx/html

# Expose port 80 for the NGINX server
EXPOSE 80

# Command to start the NGINX server
CMD ["nginx", "-g", "daemon off;"]