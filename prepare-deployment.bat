@echo off
echo 🚀 开始全新部署流程...

echo 🔧 构建后端应用...
call mvnw clean package -DskipTests

echo 📦 准备部署文件...
copy target\*.jar app.jar

echo 💾 初始化代码仓库...
git init
git add .
git commit -m "Prepare for deployment"

echo ✅ 部署准备完成！
echo.
echo 接下来请按照 SIMPLE_DEPLOYMENT_GUIDE.md 的指引进行部署：
echo 1. 将代码推送到 GitHub
echo 2. 在 Railway 部署后端  
echo 3. 在 Vercel 部署前端
echo.
echo 部署完成后，全世界都可以访问您的网站了！
pause