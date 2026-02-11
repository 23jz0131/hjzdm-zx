@echo off
title 真实数据后端服务启动器
echo ========================================
echo    HJZDM 真实电商平台数据服务启动器   
echo ========================================
echo.

echo 正在检查端口占用情况...
netstat -ano | findstr :9090 >nul
if %errorlevel% == 0 (
    echo 发现端口9090已被占用，正在终止相关进程...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :9090') do (
        taskkill /F /PID %%a >nul 2>&1
    )
    timeout /t 2 /nobreak >nul
)

echo.
echo 正在启动真实的Java后端服务...
echo 服务将调用真实的Yahoo和Rakuten API
echo.

cd /d "C:\Users\3jz\Desktop\ANQUANBIYEZHIZUO"
mvn spring-boot:run -Dstart-class=com.wray.hjzdm.HjzdmApplication

echo.
echo 服务启动完成！
echo 前端请访问: http://localhost:3000
echo 后端API地址: http://localhost:9090
pause