# HJZDM 生产环境部署指南

## 数据库配置

生产环境使用 TiDB Cloud 数据库：

- **主机**: gateway01.ap-northeast-1.prod.aws.tidbcloud.com
- **端口**: 4000
- **用户名**: 2eXmMXiGeCt9iz7.root
- **密码**: FPpKFpms5hDXtOuF
- **数据库**: fortune500
- **SSL模式**: VERIFY_IDENTITY

## 部署方式

### 方式1: 直接运行 (推荐开发测试)

```bash
# Windows
start-prod.bat

# Linux/macOS
chmod +x start-prod.sh
./start-prod.sh
```

### 方式2: Docker 部署 (推荐生产环境)

```bash
# 构建并启动
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```

### 方式3: 手动运行Jar包

```bash
# 构建项目
mvn clean package -DskipTests

# 运行应用
java -Dspring.profiles.active=prod -jar target/HJZDM-0.0.1-SNAPSHOT.jar
```

## 环境变量

生产环境支持以下环境变量：

```bash
SPRING_PROFILES_ACTIVE=prod
SPRING_DATASOURCE_USERNAME=2eXmMXiGeCt9iz7.root
SPRING_DATASOURCE_PASSWORD=FPpKFpms5hDXtOuF
SERVER_PORT=8080
REDIS_HOST=localhost
REDIS_PORT=6379
JWT_USER_SECRET_KEY=your-jwt-secret-key
```

## 目录结构

```
./logs/      # 应用日志文件
./uploads/   # 用户上传文件
```

## 访问地址

- **后端API**: http://localhost:8080
- **前端页面**: http://localhost:3000
- **API文档**: http://localhost:8080/doc.html
- **健康检查**: http://localhost:8080/actuator/health

## 注意事项

1. 首次运行前请确保数据库表结构已创建
2. 建议在生产环境中配置HTTPS
3. 定期备份数据库和上传文件
4. 监控应用日志和系统资源使用情况