# Stage 1: Build Frontend
FROM node:18 AS frontend-build
WORKDIR /frontend
COPY frontend/hjzdm-frontend/package*.json ./
RUN npm install
COPY frontend/hjzdm-frontend/ ./
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

# Stage 3: Runtime
FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=backend-build /app/target/HJZDM-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 9090
ENTRYPOINT ["java", "-jar", "app.jar"]
