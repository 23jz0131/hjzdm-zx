#!/bin/bash

echo "🚀 开始全新部署流程..."

# 1. 构建后端
echo "🔧 构建后端应用..."
./mvnw clean package -DskipTests

# 2. 准备部署文件
echo "📦 准备部署文件..."
cp target/*.jar app.jar

# 3. 创建 git 仓库
echo "💾 初始化代码仓库..."
git init
git add .
git commit -m "Prepare for deployment"

echo "✅ 部署准备完成！"
echo ""
echo "接下来请按照 SIMPLE_DEPLOYMENT_GUIDE.md 的指引进行部署："
echo "1. 将代码推送到 GitHub"
echo "2. 在 Railway 部署后端"
echo "3. 在 Vercel 部署前端"
echo ""
echo "部署完成后，全世界都可以访问您的网站了！"