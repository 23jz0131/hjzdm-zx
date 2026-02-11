# 🔥 全新简化部署指南

## 🎯 部署目标
让全世界都能访问您的电商比价网站

## 🚀 部署步骤

### 第一步：准备代码
```bash
# 在项目根目录执行
git init
git add .
git commit -m "Initial commit for deployment"
```

### 第二步：部署后端到 Railway
1. 访问 https://railway.app/
2. 点击 "Start a New Project"
3. 选择 "Deploy from GitHub repo"
4. 连接您的 GitHub 账户
5. 选择此项目仓库
6. Railway 会自动检测 railway.json 并部署

### 第三步：配置环境变量（Railway）
在 Railway 项目设置中添加以下环境变量：
```
PORT=8080
SPRING_PROFILES_ACTIVE=prod
SPRING_DATASOURCE_URL=jdbc:mysql://your-tidb-host:4000/fortune500
SPRING_DATASOURCE_USERNAME=your-username
SPRING_DATASOURCE_PASSWORD=your-password
RAKUTEN_APP_ID=your-app-id
RAKUTEN_APPLICATION_SECRET=your-secret
YAHOO_CLIENT_ID=your-client-id
YAHOO_SECRET=your-secret
JWT_USER_SECRET_KEY=generate-a-random-key
```

### 第四步：部署前端到 Vercel
1. 进入 frontend/hjzdm-frontend 目录
2. 修改 vercel.json 中的 REACT_APP_API_URL 为您的 Railway 后端地址
3. 访问 https://vercel.com/
4. 导入 frontend/hjzdm-frontend 目录
5. Vercel 会自动部署

## ✅ 成功标志
- Railway 显示 "Success" 状态
- Vercel 显示部署完成
- 可以通过分配的域名访问网站

## 💡 小贴士
- Railway 提供免费额度，适合个人项目
- Vercel 对静态站点完全免费
- 部署过程中遇到问题可查看各平台的日志