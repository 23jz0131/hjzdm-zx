@echo off
echo ========================================
echo 🚀 HJZDM 应用启动测试
echo ========================================
echo.

echo 📋 检查 Java 环境...
java -version
if %errorlevel% neq 0 (
    echo ❌ Java 未安装或不在 PATH 中
    echo 请先安装 Java 8 或更高版本
    pause
    exit /b 1
)
echo ✅ Java 环境正常
echo.

echo 📋 检查 Maven 环境...
mvn --version
if %errorlevel% neq 0 (
    echo ❌ Maven 未安装或不在 PATH 中
    echo 请先安装 Apache Maven
    pause
    exit /b 1
)
echo ✅ Maven 环境正常
echo.

echo 📋 检查 Node.js 环境...
node --version
if %errorlevel% neq 0 (
    echo ❌ Node.js 未安装或不在 PATH 中
    echo 请先安装 Node.js
    pause
    exit /b 1
)
echo ✅ Node.js 环境正常
echo.

echo 📋 检查前端依赖...
cd frontend\hjzdm-frontend
if not exist node_modules (
    echo 📦 安装前端依赖...
    npm install
    if %errorlevel% neq 0 (
        echo ❌ 前端依赖安装失败
        pause
        exit /b 1
    )
)
echo ✅ 前端依赖正常
echo.

cd ..\..
echo 🔨 编译后端代码...
mvn clean compile
if %errorlevel% neq 0 (
    echo ❌ 后端编译失败
    pause
    exit /b 1
)
echo ✅ 后端编译成功
echo.

echo 📦 构建前端代码...
cd frontend\hjzdm-frontend
npm run build
if %errorlevel% neq 0 (
    echo ❌ 前端构建失败
    pause
    exit /b 1
)
echo ✅ 前端构建成功
echo.

cd ..\..
echo.
echo ========================================
echo 🎉 所有检查通过！应用可以启动
echo ========================================
echo.
echo 📝 启动说明:
echo 1. 确保已设置数据库密码环境变量: set TIDB_PASSWORD=你的密码
echo 2. 启动后端: mvn spring-boot:run
echo 3. 启动前端: cd frontend\hjzdm-frontend && npm start
echo.
echo 🌐 访问地址:
echo - 前端: http://localhost:3000
echo - 后端API: http://localhost:8080
echo - API文档: http://localhost:8080/doc.html
echo.
echo 🧪 连接测试:
echo - Windows: test-db-connection.bat
echo - 或者设置密码后启动应用查看日志
echo.
pause