#!/bin/bash
# 生产环境启动脚本 (Linux/macOS)

echo "========================================"
echo "正在启动 HJZDM 应用程序 (生产环境)"
echo "========================================"

# 设置环境变量
export SPRING_PROFILES_ACTIVE=prod
export SPRING_DATASOURCE_USERNAME="2eXmMXiGeCt9iz7.root"
export SPRING_DATASOURCE_PASSWORD="FPpKFpms5hDXtOuF"
export SERVER_PORT=8080

# 创建必要的目录
mkdir -p ./logs
mkdir -p ./uploads

echo "环境变量设置完成"
echo "数据库用户名: $SPRING_DATASOURCE_USERNAME"
echo "服务器端口: $SERVER_PORT"
echo "日志目录: ./logs"
echo "上传目录: ./uploads"

echo ""
echo "正在启动应用程序..."
echo ""

# 启动Spring Boot应用
mvn spring-boot:run -Dspring-boot.run.profiles=prod