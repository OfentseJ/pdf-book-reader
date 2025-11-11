# === Stage 1: Build the React app ===
FROM node:20 AS build
WORKDIR /app

# Copy package files explicitly (no glob)
COPY package.json ./

# Install dependencies
RUN npm install
RUN npm install dequal@2.0.3 --save-exact

# Copy all source files
COPY . .

# Pass the VITE_API_URL build argument from Render
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# Build the app
RUN npm run build


# === Stage 2: Serve the app with Nginx ===
FROM nginx:stable-alpine

# Copy built files from the build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom nginx config from build stage
COPY --from=build /app/nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80 for the frontend
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]