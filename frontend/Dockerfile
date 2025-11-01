FROM node:20 AS build
WORKDIR /app

COPY package*.json ./
RUN npm install
RUN npm install dequal@2.0.3 --save-exact

COPY . .
RUN npm run build


# === Stage 2: Serve the app with Nginx ===
FROM nginx:stable-alpine

# Copy built files from the previous stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom nginx config to serve .mjs correctly
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80 for the frontend
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
