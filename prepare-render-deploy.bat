@echo off
echo 🚀 Render 部署准备脚本
echo ====================

echo 🔧 1. 清理旧的构建文件...
if exist target rmdir /s /q target
if exist app.jar del app.jar

echo 🔨 2. 构建项目...
call mvnw clean package -DskipTests

echo 📦 3. 复制JAR文件...
copy target\*.jar app.jar

echo 💾 4. 初始化Git仓库...
git init
git add .
git commit -m "Prepare for Render deployment"

echo ✅ 部署准备完成！

echo.
echo 📋 下一步操作：
echo 1. 将代码推送到GitHub
echo 2. 在Render.com创建新Web Service
echo 3. 连接GitHub仓库
echo 4. Render会自动使用Dockerfile部署
echo 5. 在Environment Variables中配置数据库连接信息

echo.
echo ⚠️  重要环境变量需要在Render中配置：
echo SPRING_DATASOURCE_URL=jdbc:mysql://your-tidb-host:4000/fortune500
echo SPRING_DATASOURCE_USERNAME=your-username  
echo SPRING_DATASOURCE_PASSWORD=your-password
echo RAKUTEN_APP_ID=your-app-id
echo YAHOO_CLIENT_ID=your-client-id
echo JWT_USER_SECRET_KEY=generate-random-key
echo PORT=9090

pause