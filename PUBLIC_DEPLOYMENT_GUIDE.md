# 🌐 HJZDM 网站公网部署指南

## 🎯 部署目标
让全世界的用户都能访问您的电商比价网站

## 📋 部署方案

### 方案一：Vercel + Render（推荐）⭐

#### 前端部署（Vercel）
1. **注册Vercel账号**
   - 访问 https://vercel.com
   - 使用GitHub账号登录

2. **连接GitHub仓库**
   - 在Vercel中导入您的项目
   - 选择 `frontend/hjzdm-frontend` 目录

3. **配置环境变量**
   ```
   REACT_APP_API_BASE_URL=https://您的后端域名
   ```

4. **一键部署**
   - Vercel会自动检测React项目
   - 自动生成HTTPS网址

#### 后端部署（Render）
1. **已经在进行中** ✅
   - 使用我们之前配置的 `Dockerfile.render`
   - 配置了TiDB Cloud数据库
   - 端口已设置为9090

### 方案二：全流程Render部署

如果想全部部署在Render平台：

1. **前端静态文件部署**
   - 在Render创建Static Site
   - 指向 `frontend/hjzdm-frontend/build` 目录

2. **后端服务部署**
   - 已配置完成 ✅

### 方案三：传统服务器部署

1. **购买云服务器**（阿里云/腾讯云/AWS）
2. **安装必要环境**（Node.js, Java, Nginx）
3. **配置域名和SSL证书**
4. **部署应用**

## 🚀 快速开始（推荐方案一）

### 1. 前端Vercel部署
```bash
# 运行一键部署脚本
deploy-frontend.bat
```

或者手动部署：
```bash
cd frontend/hjzdm-frontend
npm install
npm run build
npx vercel --prod
```

### 2. 后端Render部署
- 已经在进行中，等待构建完成即可

### 3. 配置API连接
在前端代码中配置正确的后端API地址

## 🔧 访问地址示例

部署成功后，您将获得：
- **前端地址**：https://your-project.vercel.app
- **后端地址**：https://your-service.onrender.com

## 📱 用户访问体验

用户只需访问前端地址即可：
1. 浏览商品比价
2. 搜索心仪商品
3. 查看真实电商平台价格
4. 享受TikTok风格的简洁界面

## 💡 优化建议

1. **性能优化**
   - 启用Vercel的图片优化
   - 配置CDN缓存策略

2. **SEO优化**
   - 添加页面meta标签
   - 配置sitemap.xml

3. **监控告警**
   - 设置Uptime监控
   - 配置错误日志收集

## 🆘 常见问题

**Q: 部署后无法访问？**
A: 检查API地址配置是否正确，确认后端服务已启动

**Q: 加载速度慢？**
A: 启用CDN，优化图片资源，压缩代码

**Q: 移动端显示异常？**
A: 检查响应式设计，测试不同设备兼容性

---
部署完成后，全世界的用户都可以通过互联网访问您的电商比价网站了！