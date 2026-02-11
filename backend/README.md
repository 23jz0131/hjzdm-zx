# Backend Module

- 说明：后端代码（Java/Spring Boot）独立成 backend 目录/仓库。
- 结构：backend/src/main/java、backend/src/main/resources、backend/pom.xml 等。若采用多模块方案，父 pom 将包含 modules: backend, frontend。
- 构建：mvn -v ； mvn clean package -f backend/pom.xml
- 启动：java -jar backend/target/*.jar（或通过 tomcat/war 部署）
