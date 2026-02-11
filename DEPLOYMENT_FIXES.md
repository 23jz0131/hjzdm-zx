# Render部署修复指南

## 已修复的问题

### 1. 端口配置不一致
**问题**: render.yaml中PORT设置为9090，但Dockerfile中Nginx监听80端口
**修复**: 统一使用9090端口

### 2. 健康检查路径重定向循环
**问题**: `/actuator/health` 被Nginx重定向到 `/index.html`，形成无限循环
**修复**: 在Nginx配置中优先处理 `/actuator/health` 路径

### 3. 健康检查超时设置
**问题**: 默认超时时间太短，应用启动较慢时会失败
**修复**: 增加healthCheckTimeoutSeconds到60秒

## 配置变更详情

### Dockerfile变更
```nginx
# 旧配置
listen 80;
location / {
    try_files $uri $uri/ /index.html;
}

# 新配置  
listen 9090;
location /actuator/health {
    proxy_pass http://localhost:9090;
}
location / {
    root /usr/share/nginx/html;
    try_files $uri $uri/ /index.html;
}
```

### render.yaml变更
```yaml
# 添加超时配置
healthCheckTimeoutSeconds: 60
```

## 部署步骤

1. 提交代码变更到Git
2. 推送到GitHub仓库
3. Render会自动检测变更并重新部署
4. 在Render Dashboard监控部署状态

## 调试工具

使用 `health-check-debug.js` 脚本本地测试健康检查端点：
```bash
node health-check-debug.js
```

## 预期结果

修复后的部署应该：
- ✅ 健康检查返回200状态码
- ✅ `/actuator/health` 返回正确的健康状态
- ✅ 前端页面正常访问
- ✅ API接口正常工作