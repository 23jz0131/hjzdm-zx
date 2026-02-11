# 🚀 Render 一键部署指南

## 📋 部署前准备

### 1. 运行准备脚本
```cmd
prepare-render-deploy.bat
```

### 2. 推送代码到 GitHub
```bash
git remote add origin https://github.com/yourusername/your-repo.git
git push -u origin main
```

## 🎯 Render 部署步骤

### 步骤 1: 创建 Render 账户
- 访问 https://render.com
- 注册免费账户

### 步骤 2: 创建 Web Service
1. 点击 Dashboard 右上角 "+ Create" 按钮
2. 选择 "Web Service"
3. 连接您的 GitHub 账户
4. 选择刚才推送的仓库

### 步骤 3: 配置部署设置
```
Name: hjzdm-ecommerce
Region: Singapore (推荐)
Branch: main
Root Directory: / (根目录)
Runtime: Docker
Dockerfile Path: ./Dockerfile
Plan: Free
```

### 步骤 4: 配置环境变量
在 "Advanced" 部分添加以下环境变量：

| 变量名 | 值 |
|--------|-----|
| `PORT` | `8080` |
| `SPRING_PROFILES_ACTIVE` | `prod` |
| `SPRING_DATASOURCE_URL` | `jdbc:mysql://your-tidb-host:4000/fortune500` |
| `SPRING_DATASOURCE_USERNAME` | `your-username` |
| `SPRING_DATASOURCE_PASSWORD` | `your-password` |
| `RAKUTEN_APP_ID` | `your-rakuten-app-id` |
| `YAHOO_CLIENT_ID` | `your-yahoo-client-id` |
| `JWT_USER_SECRET_KEY` | `随机字符串` |

### 步骤 5: 部署
点击 "Create Web Service" 开始部署

## 🔍 部署监控

### 查看部署进度
- 在 Render Dashboard 查看构建日志
- 等待显示 "Live" 状态

### 常见问题解决

**1. 构建失败**
- 检查 Dockerfile 语法
- 确认 Maven 依赖下载正常

**2. 健康检查失败**
- 延长 healthCheckTimeoutSeconds 到 120 秒
- 检查应用是否正确监听 8080 端口

**3. 数据库连接失败**
- 确认 TiDB Cloud 白名单已添加 Render IP
- 验证数据库连接信息正确性

## ✅ 部署成功验证

部署成功后，您将获得：
- 🌐 公网访问地址 (类似：https://hjzdm-ecommerce.onrender.com)
- 📊 实时监控面板
- 🔄 自动重启机制

## 💡 优化建议

1. **性能优化**：启用 CDN 加速
2. **安全性**：配置 HTTPS 强制跳转
3. **监控**：设置自定义域名和 SSL 证书
4. **备份**：定期备份数据库

## 🆘 技术支持

如果遇到问题：
1. 查看 Render 官方文档
2. 检查应用日志输出
3. 验证所有环境变量配置
4. 确认外部服务（数据库/API）可访问