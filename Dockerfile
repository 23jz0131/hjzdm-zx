# 多阶段构建 - 构建阶段
FROM maven:3.8.4-openjdk-17 AS builder

# 设置工作目录
WORKDIR /app

# 复制Maven配置文件（利用Docker缓存优化）
COPY pom.xml .
COPY src ./src

# 构建应用（跳过测试以加快构建速度）
RUN mvn clean package -DskipTests

# 运行阶段
FROM eclipse-temurin:17-jre-alpine

# 安装必要的工具
RUN apk add --no-cache \
    curl

# 创建应用用户
RUN groupadd -r appuser && useradd -r -g appuser appuser

# 设置工作目录
WORKDIR /app

# 从构建阶段复制JAR文件
COPY --from=builder /app/target/*.jar app.jar

# 更改文件所有权
RUN chown appuser:appuser app.jar

# 切换到非root用户
USER appuser

# 暴露端口
EXPOSE 9090

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=120s --retries=3 \
    CMD curl -f http://localhost:9090/actuator/health || exit 1

# 启动应用
ENTRYPOINT ["java", "-Dserver.port=9090", "-jar", "app.jar"]
