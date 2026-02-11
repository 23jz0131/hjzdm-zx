# ✅ Render 部署最终检查清单

## 🎯 核心配置确认
- [x] Dockerfile 使用 9090 端口
- [x] render.yaml 配置 9090 端口  
- [x] Java 应用启动参数设置 -Dserver.port=9090
- [x] 健康检查路径 /actuator/health
- [x] 健康检查超时时间 120 秒

## 📋 部署前必做事项

### 1. 代码准备
```cmd
prepare-render-deploy.bat
```

### 2. GitHub 推送
```bash
git remote add origin https://github.com/yourusername/hjzdm-project.git
git push -u origin main
```

### 3. Render 环境变量配置
```
PORT=9090
SPRING_PROFILES_ACTIVE=prod
SPRING_DATASOURCE_URL=jdbc:mysql://your-tidb-host:4000/fortune500
SPRING_DATASOURCE_USERNAME=your-username
SPRING_DATASOURCE_PASSWORD=your-password
RAKUTEN_APP_ID=your-app-id
YAHOO_CLIENT_ID=your-client-id
JWT_USER_SECRET_KEY=随机安全字符串
```

## 🚀 部署成功标准

✅ 应用显示 "Live" 状态
✅ 可以通过分配的域名访问
✅ API 端点返回正常响应
✅ 数据库连接正常
✅ Yahoo/Rakuten API 功能正常

## 🆘 故障排除

**端口问题**：确认所有配置都是 9090 端口
**健康检查失败**：检查应用启动时间和内存使用
**数据库连接**：确认 TiDB Cloud 白名单配置

这次配置完全符合您的 9090 端口要求，应该能一次部署成功！