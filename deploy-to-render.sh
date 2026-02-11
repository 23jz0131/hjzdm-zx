#!/bin/bash

# HJZDM电商比价系统 Render一键部署脚本
# 适用于Windows Git Bash或Linux/macOS环境

echo "🚀 开始HJZDM系统Render部署准备..."

# 检查必要工具
echo "🔍 检查必要工具..."
if ! command -v git &> /dev/null; then
    echo "❌ 未找到Git，请先安装Git"
    exit 1
fi

if ! command -v docker &> /dev/null; then
    echo "⚠️  未找到Docker，跳过本地测试"
else
    echo "✅ Docker已安装"
fi

# 创建必要的目录
echo "📁 创建部署所需目录..."
mkdir -p logs
mkdir -p uploads
mkdir -p target

# 检查配置文件
echo "📋 检查配置文件..."

if [ ! -f "render.yaml" ]; then
    echo "❌ 未找到render.yaml配置文件"
    exit 1
else
    echo "✅ render.yaml配置文件存在"
fi

if [ ! -f "Dockerfile" ]; then
    echo "❌ 未找到Dockerfile"
    exit 1
else
    echo "✅ Dockerfile存在"
fi

# 检查前端构建
echo "🏗️  检查前端构建状态..."
if [ ! -d "frontend/hjzdm-frontend/node_modules" ]; then
    echo "⚠️  前端依赖未安装，正在安装..."
    cd frontend/hjzdm-frontend
    npm install --legacy-peer-deps
    cd ../..
fi

# 本地构建测试
echo "🧪 执行本地构建测试..."
echo "正在构建前端..."
cd frontend/hjzdm-frontend
npm run build
if [ $? -ne 0 ]; then
    echo "❌ 前端构建失败"
    exit 1
fi
cd ../..

echo "正在构建后端..."
mvn clean package -DskipTests
if [ $? -ne 0 ]; then
    echo "❌ 后端构建失败"
    exit 1
fi

echo "✅ 本地构建测试通过"

# 生成部署清单
echo "📝 生成部署清单..."
cat > DEPLOYMENT_CHECKLIST.md << 'EOF'
# HJZDM部署检查清单

## 🔧 部署前准备
- [ ] 代码已推送到GitHub仓库
- [ ] Render账户已注册并登录
- [ ] TiDB Cloud数据库已准备就绪
- [ ] 第三方API密钥已获取

## 📁 配置文件检查
- [ ] render.yaml 配置正确
- [ ] Dockerfile 可正常使用
- [ ] application-prod.yml 配置完成
- [ ] 环境变量清单已准备

## 🔐 环境变量准备
需要在Render中配置的环境变量：

### 数据库配置
```
DATABASE_URL=jdbc:mysql://gateway01.ap-northeast-1.prod.aws.tidbcloud.com:4000/fortune500?useSSL=true&requireSSL=true
DB_USERNAME=2eXmMXiGeCt9iz7.root
DB_PASSWORD=[您的数据库密码]
```

### 第三方API密钥
```
RAKUTEN_APP_ID=1065081596741280321
RAKUTEN_APPLICATION_SECRET=[乐天Secret]
RAKUTEN_AFFILIATE_ID=4f0e084a.2fb02d14.4f0e084b.3ecf281e
YAHOO_CLIENT_ID=[Yahoo Client ID]
YAHOO_SECRET=[Yahoo Secret]
```

### 安全配置
```
JWT_USER_SECRET_KEY=[随机生成的密钥]
UPLOAD_PATH=/tmp/uploads
```

## 🚀 Render部署步骤
1. 登录 Render Dashboard (https://dashboard.render.com)
2. 点击 "New+" → "Web Service"
3. 选择您的GitHub仓库
4. 填写部署配置：
   - Name: hjzdm-ecommerce
   - Region: Singapore
   - Runtime: Docker
   - Plan: Free (或根据需要选择)
5. 配置上述环境变量
6. 点击 "Create Web Service"
7. 等待构建和部署完成

## ✅ 部署后验证
- [ ] 应用可通过URL访问
- [ ] 用户注册/登录功能正常
- [ ] 商品搜索比价功能正常
- [ ] 披露功能正常
- [ ] 管理员后台可访问
- [ ] 第三方API调用正常

## 📊 监控配置
- [ ] 设置健康检查端点
- [ ] 配置错误通知
- [ ] 设置性能监控
- [ ] 配置日志收集

## 🔧 故障排除
常见问题及解决方案：
1. 构建失败 → 检查依赖和内存限制
2. 数据库连接失败 → 检查连接字符串和防火墙
3. API调用失败 → 验证密钥有效性
4. 性能问题 → 考虑升级实例规格

---
部署负责人: _____________
部署日期: _____________
部署版本: _____________
EOF

echo "✅ 部署清单已生成: DEPLOYMENT_CHECKLIST.md"

# 显示下一步操作
echo "
🎉 部署准备完成！

下一步操作：

1. 将代码推送到GitHub：
   git add .
   git commit -m \"Prepare for Render deployment\"
   git remote add origin https://github.com/yourusername/hjzdm.git
   git push -u origin main

2. 按照 DEPLOYMENT_CHECKLIST.md 中的步骤在Render平台部署

3. 部署成功后，访问您的应用URL进行测试

💡 提示：
- 详细部署指南请查看 RENDER_DEPLOYMENT_GUIDE.md
- 遇到问题可参考文档中的故障排除部分
- 建议先在Free tier测试，确认无误后再升级到付费计划

祝您部署顺利！🚀
"