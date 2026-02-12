# 🚀 Vercel 部署完整指南

## 📋 部署前准备

### 1. 安装Vercel CLI
```bash
npm install -g vercel
```

### 2. 登录Vercel账号
```bash
vercel login
```

## 🎯 部署步骤

### 方法一：使用一键脚本（推荐）
```bash
# 运行部署脚本
deploy-vercel.bat
```

### 方法二：手动部署
```bash
# 1. 进入前端目录
cd frontend/hjzdm-frontend

# 2. 安装依赖
npm install

# 3. 构建项目
npm run build

# 4. 部署到Vercel
vercel --prod
```

## ⚙️ 配置说明

### 环境变量配置
在Vercel控制台设置环境变量：
```
REACT_APP_API_BASE_URL = https://您的后端服务地址
```

### 重要配置文件
- `vercel.json` - Vercel部署配置
- `.env.production` - 生产环境变量
- `package.json` - 项目依赖和脚本

## 🌐 部署后配置

### 1. 获取部署URL
部署成功后会获得类似这样的地址：
```
https://hjzdm-frontend-xxxx.vercel.app
```

### 2. 配置自定义域名（可选）
- 在Vercel控制台添加自定义域名
- 配置DNS解析记录

### 3. 设置环境变量
在Vercel项目设置中配置API地址：
```
REACT_APP_API_BASE_URL = https://您的Render后端地址
```

## 🔧 常见问题解决

### Q: 构建失败怎么办？
A: 检查package.json依赖是否完整，清除node_modules重新安装

### Q: 部署后页面空白？
A: 检查环境变量配置，确认API地址正确

### Q: API调用失败？
A: 确认后端服务已部署并正常运行，检查CORS配置

## 📱 用户访问
部署完成后，任何人都可以通过浏览器访问您的网站：
1. 打开部署获得的URL
2. 使用电商比价功能
3. 享受TikTok风格的简洁界面

## 🔄 持续部署
每次代码更新后：
```bash
git add .
git commit -m "更新描述"
git push
vercel --prod
```

---
部署成功后，全世界的用户都能访问您的电商比价网站了！