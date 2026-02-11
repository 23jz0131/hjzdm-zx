# HJZDM电商比价系统 Render部署指南

## 🚀 部署前准备

### 1. 环境要求
- GitHub账户（用于代码托管）
- Render账户（免费 tier 可用）
- TiDB Cloud数据库（已有配置）
- 第三方API密钥（Yahoo、Rakuten）

### 2. 项目结构调整
您的项目已经是前后端一体化架构，适合部署到Render。

## 📁 部署配置文件

### 1. render.yaml (已存在，需要调整)
```yaml
services:
  - type: web
    name: hjzdm-ecommerce
    env: docker
    plan: free  # 或选择starter/standard计划
    region: singapore  # 亚洲地区延迟更低
    buildCommand: mvn clean package -DskipTests
    startCommand: java -Dspring.profiles.active=prod -jar target/HJZDM-0.0.1-SNAPSHOT.jar
    healthCheckPath: /actuator/health
    autoDeploy: true
    envVars:
      - key: SERVER_PORT
        value: 8080
      - key: SPRING_PROFILES_ACTIVE
        value: prod
      - key: RAKUTEN_APP_ID
        sync: false
      - key: RAKUTEN_APPLICATION_SECRET
        sync: false
      - key: RAKUTEN_AFFILIATE_ID
        sync: false
      - key: YAHOO_CLIENT_ID
        sync: false
      - key: YAHOO_SECRET
        sync: false
      - key: JWT_USER_SECRET_KEY
        generateValue: true
      - key: UPLOAD_PATH
        value: /tmp/uploads
```

### 2. Dockerfile 优化 (已存在，可直接使用)
```dockerfile
# 多阶段构建已配置好，无需修改
# 前端构建 → 后端构建 → Nginx运行时
```

### 3. application-prod.yml 调整
```yaml
server:
  port: ${PORT:8080}  # Render使用PORT环境变量

spring:
  datasource:
    url: ${DATABASE_URL}  # 从Render环境变量获取
    username: ${DB_USERNAME}
    password: ${DB_PASSWORD}
  # 其他配置保持不变
```

## 🔧 Render部署步骤

### 步骤1: 代码准备
1. 将代码推送到GitHub仓库
```bash
git init
git add .
git commit -m "Prepare for Render deployment"
git remote add origin https://github.com/yourusername/hjzdm.git
git push -u origin main
```

### 步骤2: Render平台设置
1. 登录 [Render Dashboard](https://dashboard.render.com/)
2. 点击 "New+" → "Web Service"
3. 选择您的GitHub仓库
4. 填写基本信息：
   - Name: hjzdm-ecommerce
   - Region: Singapore (推荐)
   - Branch: main
   - Root Directory: . (当前目录)
   - Runtime: Docker
   - Plan: Free (或根据需要选择)

### 步骤3: 环境变量配置
在Render的Environment Variables中添加：

**必需变量：**
```
DATABASE_URL=jdbc:mysql://gateway01.ap-northeast-1.prod.aws.tidbcloud.com:4000/fortune500?useSSL=true&requireSSL=true
DB_USERNAME=2eXmMXiGeCt9iz7.root
DB_PASSWORD=FPpKFpms5hDXtOuF
RAKUTEN_APP_ID=1065081596741280321
RAKUTEN_APPLICATION_SECRET=d3cea25fd388a80da369ee74a20e67c9c4b00625
RAKUTEN_AFFILIATE_ID=4f0e084a.2fb02d14.4f0e084b.3ecf281e
YAHOO_CLIENT_ID=dmVyPTIwMjUwNyZpZD1LUlpMQm80aVNUJmhhc2g9TVdJME1ERTRNVFJrTkdJMk1ESmpaQQ
YAHOO_SECRET=8TwrbIHTWFS5Zk6tyOBQLVHdOQQ6g3XEnQmU70SO
JWT_USER_SECRET_KEY=(Render自动生成)
```

### 步骤4: 构建和部署
1. 点击 "Create Web Service"
2. Render会自动开始构建过程
3. 构建日志可以在Dashboard中查看
4. 部署成功后会获得URL

## 🛠️ 部署后配置

### 1. 域名设置（可选）
```
1. 在Render中添加自定义域名
2. 配置DNS记录指向Render提供的CNAME
3. 启用SSL证书（自动提供）
```

### 2. 监控和日志
```
- Render提供内置监控面板
- 可以查看CPU、内存使用情况
- 实时日志查看
- 自动错误通知
```

### 3. 自动部署
```
- 默认启用autoDeploy: true
- GitHub master/main分支更新时自动重新部署
- 可以设置部署预览环境
```

## 🔍 常见问题解决

### Q1: 构建失败
**可能原因：**
- Maven依赖下载超时
- 内存不足（Free tier限制512MB）

**解决方案：**
```dockerfile
# 在Dockerfile中添加内存优化
ENV MAVEN_OPTS="-Xmx512m -XX:MaxMetaspaceSize=128m"
```

### Q2: 数据库连接问题
**检查事项：**
- TiDB Cloud防火墙设置
- 连接字符串格式
- SSL配置

### Q3: API密钥安全
**最佳实践：**
- 所有密钥都使用环境变量
- 不在代码中硬编码
- 定期轮换密钥

### Q4: 性能优化
```yaml
# 添加到render.yaml
numInstances: 2  # 增加实例数
instanceSize: standard  # 升级实例规格
```

## 📊 性能监控配置

### 添加健康检查端点
```java
@RestController
public class HealthController {
    @GetMapping("/actuator/health")
    public Map<String, Object> health() {
        Map<String, Object> health = new HashMap<>();
        health.put("status", "UP");
        health.put("timestamp", System.currentTimeMillis());
        return health;
    }
}
```

### 日志配置优化
```yaml
# application-prod.yml
logging:
  level:
    com.wray.hjzdm: INFO
    org.springframework.web: WARN
  pattern:
    console: "%clr(%d{yyyy-MM-dd HH:mm:ss}){faint} %clr(${LOG_LEVEL_PATTERN:-%5p}) %clr(${PID:- }){magenta} %clr(---){faint} %clr([%15.15t]){faint} %clr(%-40.40logger{39}){cyan} %clr(:){faint} %m%n${LOG_EXCEPTION_CONVERSION_WORD:-%wEx}"
```

## 💰 成本估算

### Free Tier (适合测试)
- 实例: 1个
- 内存: 512MB
- CPU: 0.1核
- 存储: 500MB
- 带宽: 100GB/月

### Production Recommendations
- **Starter**: $7/月 - 适合中小型应用
- **Standard**: $25/月 - 适合生产环境
- **Pro**: $60+/月 - 高流量应用

## 🔄 持续集成/持续部署(CI/CD)

### GitHub Actions 示例
```yaml
name: Deploy to Render
on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    - name: Deploy to Render
      uses: johnbeynon/render-deploy-action@v0.0.8
      with:
        service-id: ${{ secrets.RENDER_SERVICE_ID }}
        api-key: ${{ secrets.RENDER_API_KEY }}
```

## 🎯 部署检查清单

### 部署前 ✅
- [ ] 代码已推送到GitHub
- [ ] render.yaml配置正确
- [ ] Dockerfile经过测试
- [ ] 环境变量已准备
- [ ] 数据库连接测试通过
- [ ] 第三方API密钥有效

### 部署中 ✅
- [ ] Render构建成功
- [ ] 容器启动正常
- [ ] 健康检查通过
- [ ] 基本功能测试通过

### 部署后 ✅
- [ ] 域名解析正常
- [ ] SSL证书生效
- [ ] 性能监控设置
- [ ] 错误日志监控
- [ ] 备份策略制定

## 🆘 技术支持

### Render官方资源
- 文档: https://render.com/docs
- 社区: https://community.render.com/
- 支持: dashboard中提交ticket

### 故障排除工具
```bash
# 本地测试Docker镜像
docker build -t hjzdm-local .
docker run -p 8080:8080 hjzdm-local

# 查看容器日志
docker logs <container_id>

# 进入容器调试
docker exec -it <container_id> /bin/sh
```

---
**部署成功后，您的应用将可以通过Render提供的URL访问，享受全球CDN加速和自动扩缩容服务！**