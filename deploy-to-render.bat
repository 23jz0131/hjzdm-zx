@echo off
title HJZDM Render部署助手
echo ========================================
echo    HJZDM电商比价系统Render部署助手   
echo ========================================
echo.

echo 🚀 开始HJZDM系统Render部署准备...
echo.

REM 检查必要工具
echo 🔍 检查必要工具...
where git >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ 未找到Git，请先安装Git
    pause
    exit /b 1
) else (
    echo ✅ Git已安装
)

where docker >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️  未找到Docker，跳过本地测试
) else (
    echo ✅ Docker已安装
)

REM 创建必要的目录
echo 📁 创建部署所需目录...
if not exist "logs" mkdir logs
if not exist "uploads" mkdir uploads
if not exist "target" mkdir target

REM 检查配置文件
echo 📋 检查配置文件...

if not exist "render.yaml" (
    echo ❌ 未找到render.yaml配置文件
    pause
    exit /b 1
) else (
    echo ✅ render.yaml配置文件存在
)

if not exist "Dockerfile" (
    echo ❌ 未找到Dockerfile
    pause
    exit /b 1
) else (
    echo ✅ Dockerfile存在
)

REM 检查前端依赖
echo 🏗️  检查前端依赖状态...
cd frontend\hjzdm-frontend
if not exist "node_modules" (
    echo ⚠️  前端依赖未安装，正在安装...
    npm install --legacy-peer-deps
    if %errorlevel% neq 0 (
        echo ❌ 前端依赖安装失败
        cd ..\..
        pause
        exit /b 1
    )
)
cd ..\..

REM 本地构建测试
echo 🧪 执行本地构建测试...

echo 正在构建前端...
cd frontend\hjzdm-frontend
call npm run build
if %errorlevel% neq 0 (
    echo ❌ 前端构建失败
    cd ..\..
    pause
    exit /b 1
)
cd ..\..

echo 正在构建后端...
call mvn clean package -DskipTests
if %errorlevel% neq 0 (
    echo ❌ 后端构建失败
    pause
    exit /b 1
)

echo ✅ 本地构建测试通过

REM 生成部署清单
echo 📝 生成部署清单...
(
echo # HJZDM部署检查清单
echo.
echo ## 🔧 部署前准备
echo - [ ] 代码已推送到GitHub仓库
echo - [ ] Render账户已注册并登录
echo - [ ] TiDB Cloud数据库已准备就绪
echo - [ ] 第三方API密钥已获取
echo.
echo ## 📁 配置文件检查
echo - [ ] render.yaml 配置正确
echo - [ ] Dockerfile 可正常使用
echo - [ ] application-prod.yml 配置完成
echo - [ ] 环境变量清单已准备
echo.
echo ## 🔐 环境变量准备
echo 需要在Render中配置的环境变量：
echo.
echo ### 数据库配置
echo ```batch
echo DATABASE_URL=jdbc:mysql://gateway01.ap-northeast-1.prod.aws.tidbcloud.com:4000/fortune500?useSSL=true^&requireSSL=true
echo DB_USERNAME=2eXmMXiGeCt9iz7.root
echo DB_PASSWORD=[您的数据库密码]
echo ```
echo.
echo ### 第三方API密钥
echo ```batch
echo RAKUTEN_APP_ID=1065081596741280321
echo RAKUTEN_APPLICATION_SECRET=[乐天Secret]
echo RAKUTEN_AFFILIATE_ID=4f0e084a.2fb02d14.4f0e084b.3ecf281e
echo YAHOO_CLIENT_ID=[Yahoo Client ID]
echo YAHOO_SECRET=[Yahoo Secret]
echo ```
echo.
echo ### 安全配置
echo ```batch
echo JWT_USER_SECRET_KEY=[随机生成的密钥]
echo UPLOAD_PATH=/tmp/uploads
echo ```
echo.
echo ## 🚀 Render部署步骤
echo 1. 登录 Render Dashboard ^(https://dashboard.render.com^)
echo 2. 点击 "New+" → "Web Service"
echo 3. 选择您的GitHub仓库
echo 4. 填写部署配置：
echo    - Name: hjzdm-ecommerce
echo    - Region: Singapore
echo    - Runtime: Docker
echo    - Plan: Free ^(或根据需要选择^)
echo 5. 配置上述环境变量
echo 6. 点击 "Create Web Service"
echo 7. 等待构建和部署完成
echo.
echo ## ✅ 部署后验证
echo - [ ] 应用可通过URL访问
echo - [ ] 用户注册/登录功能正常
echo - [ ] 商品搜索比价功能正常
echo - [ ] 披露功能正常
echo - [ ] 管理员后台可访问
echo - [ ] 第三方API调用正常
echo.
echo ## 📊 监控配置
echo - [ ] 设置健康检查端点
echo - [ ] 配置错误通知
echo - [ ] 设置性能监控
echo - [ ] 配置日志收集
echo.
echo ## 🔧 故障排除
echo 常见问题及解决方案：
echo 1. 构建失败 → 检查依赖和内存限制
echo 2. 数据库连接失败 → 检查连接字符串和防火墙
echo 3. API调用失败 → 验证密钥有效性
echo 4. 性能问题 → 考虑升级实例规格
echo.
echo ---
echo 部署负责人: _____________
echo 部署日期: _____________
echo 部署版本: _____________
) > DEPLOYMENT_CHECKLIST.md

echo ✅ 部署清单已生成: DEPLOYMENT_CHECKLIST.md

REM 显示下一步操作
echo.
echo 🎉 部署准备完成！
echo.
echo 下一步操作：
echo.
echo 1. 将代码推送到GitHub：
echo    git add .
echo    git commit -m "Prepare for Render deployment"
echo    git remote add origin https://github.com/yourusername/hjzdm.git
echo    git push -u origin main
echo.
echo 2. 按照 DEPLOYMENT_CHECKLIST.md 中的步骤在Render平台部署
echo.
echo 3. 部署成功后，访问您的应用URL进行测试
echo.
echo 💡 提示：
echo - 详细部署指南请查看 RENDER_DEPLOYMENT_GUIDE.md
echo - 遇到问题可参考文档中的故障排除部分
echo - 建议先在Free tier测试，确认无误后再升级到付费计划
echo.
echo 祝您部署顺利！🚀
echo.
pause