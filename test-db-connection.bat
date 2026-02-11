@echo off
REM TiDB Cloud 连接测试脚本 (Windows)
REM 请先设置环境变量或替换密码

echo 🔧 TiDB Cloud 连接测试
echo =========================

REM 检查环境变量
if "%TIDB_PASSWORD%"=="" (
    echo ⚠️  请设置 TIDB_PASSWORD 环境变量
    echo    set TIDB_PASSWORD=your_actual_password
    echo    或者编辑 application.yaml 文件
    pause
    exit /b 1
)

echo 📡 连接信息:
echo    Host: gateway01.ap-northeast-1.prod.aws.tidbcloud.com
echo    Port: 4000
echo    Database: fortune500
echo    Username: 2eXmMXiGeCt9iz7.root
echo.

echo 🧪 准备测试连接...
echo.

REM 检查 MySQL 客户端是否可用
mysql --version >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ 找到 MySQL 客户端，进行连接测试...
    mysql -h gateway01.ap-northeast-1.prod.aws.tidbcloud.com -P 4000 -u 2eXmMXiGeCt9iz7.root -p%TIDB_PASSWORD% fortune500 -e "SELECT 'Connection Successful!' as status, VERSION() as version;" 2>nul
    if %errorlevel% equ 0 (
        echo ✅ 数据库连接成功！
    ) else (
        echo ❌ 数据库连接失败！
        echo    请检查密码和网络连接
    )
) else (
    echo ℹ️  未安装 MySQL 客户端，跳过连接测试
    echo    可以通过启动 Spring Boot 应用来测试连接
)

echo.
echo 🚀 启动应用测试:
echo    mvn spring-boot:run
echo.
echo 📝 完整连接字符串:
echo    mysql://2eXmMXiGeCt9iz7.root:your_password@gateway01.ap-northeast-1.prod.aws.tidbcloud.com:4000/fortune500
echo.
pause