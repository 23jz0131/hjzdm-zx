# Stage 1: Build Frontend
FROM node:18 AS frontend-build
WORKDIR /frontend
COPY frontend/hjzdm-frontend/package*.json ./
COPY frontend/hjzdm-frontend/package-lock.json ./
RUN npm ci --legacy-peer-deps
COPY frontend/hjzdm-frontend/ ./
RUN npm install react-scripts --save-dev
RUN chmod +x node_modules/.bin/* 2>/dev/null || true
RUN npm run build

# Stage 2: Build Backend
FROM maven:3.9.6-eclipse-temurin-17 AS backend-build
WORKDIR /app
COPY pom.xml .
COPY src ./src
# Clean existing static files and copy new frontend build
RUN rm -rf src/main/resources/static/*
COPY --from=frontend-build /frontend/build ./src/main/resources/static
RUN mvn -q -DskipTests package

# Stage 3: Runtime with Nginx for static files
FROM nginx:alpine AS nginx-runtime
COPY --from=backend-build /app/target/HJZDM-0.0.1-SNAPSHOT.jar /app/app.jar

# Copy static files to nginx
COPY --from=frontend-build /frontend/build /usr/share/nginx/html

# Create nginx config
RUN echo '\
server {\
    listen 80;\
    server_name _;\
    \
    # Serve static files\
    location /static/ {\
        alias /usr/share/nginx/html/static/;\
        expires 1y;\
        add_header Cache-Control "public, immutable";\
    }\
    \
    location / {\
        root /usr/share/nginx/html;\
        try_files \$uri \$uri/ /index.html;\
    }\
    \
    # Proxy API requests to backend\
    location /api/ {\
        proxy_pass http://localhost:9090;\
        proxy_set_header Host \$host;\
        proxy_set_header X-Real-IP \$remote_addr;\
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;\
        proxy_set_header X-Forwarded-Proto \$scheme;\
    }\
    \
    location /uploads/ {\
        proxy_pass http://localhost:9090;\
        proxy_set_header Host \$host;\
        proxy_set_header X-Real-IP \$remote_addr;\
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;\
        proxy_set_header X-Forwarded-Proto \$scheme;\
    }\
}' > /etc/nginx/conf.d/default.conf

# Start both nginx and java backend
RUN echo '#!/bin/sh' > /start.sh && \
    echo 'java -Dspring.profiles.active=prod -jar /app/app.jar &' >> /start.sh && \
    echo 'nginx -g "daemon off;"' >> /start.sh && \
    chmod +x /start.sh
EXPOSE 80 9090
ENTRYPOINT ["/start.sh"]
