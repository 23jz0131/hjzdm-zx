@echo off
REM 生产环境启动脚本

echo ========================================
echo 正在启动 HJZDM 应用程序 (生产环境)
echo ========================================

REM 设置环境变量
set SPRING_PROFILES_ACTIVE=prod
set SPRING_DATASOURCE_USERNAME=2eXmMXiGeCt9iz7.root
set SPRING_DATASOURCE_PASSWORD=FPpKFpms5hDXtOuF
set SERVER_PORT=8080

REM 创建必要的目录
if not exist ".\logs" mkdir .\logs
if not exist ".\uploads" mkdir .\uploads

echo 环境变量设置完成
echo 数据库用户名: %SPRING_DATASOURCE_USERNAME%
echo 服务器端口: %SERVER_PORT%
echo 日志目录: .\logs
echo 上传目录: .\uploads

echo.
echo 正在启动应用程序...
echo.

REM 启动Spring Boot应用
mvn spring-boot:run -Dspring-boot.run.profiles=prod

pause