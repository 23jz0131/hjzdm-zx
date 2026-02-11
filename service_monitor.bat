@echo off
title ANQUANBIYEZHIZUO 服务状态监控
color 0A

echo ==========================================
echo    ANQUANBIYEZHIZUO 服务状态监控面板
echo ==========================================
echo.

:start
cls
echo ==========================================
echo    当前系统状态
echo ==================================
echo.

echo [时间] %date% %time%
echo.

echo === 进程状态 ===
echo Java进程:
tasklist | findstr java >nul
if %errorlevel% equ 0 (
    echo ✓ Java进程正在运行
    tasklist | findstr java
) else (
    echo ✗ Java进程未运行
)

echo.
echo === 端口状态 ===
echo 9090端口:
netstat -ano | findstr :9090 >nul
if %errorlevel% equ 0 (
    echo ✓ 9090端口正在监听
    netstat -ano | findstr :9090
) else (
    echo ✗ 9090端口未监听
)

echo.
echo 3000端口:
netstat -ano | findstr :3000 >nul
if %errorlevel% equ 0 (
    echo ✓ 3000端口正在监听
    netstat -ano | findstr :3000
) else (
    echo ○ 3000端口未监听
)

echo.
echo === 服务操作 ===
echo 1. 启动后端服务 (9090端口)
echo 2. 启动前端服务 (3000端口)  
echo 3. 终止所有Java进程
echo 4. 清理并重新编译
echo 5. 测试服务连接
echo 6. 退出监控

echo.
set /p choice=请选择操作 (1-6): 

if "%choice%"=="1" goto start_backend
if "%choice%"=="2" goto start_frontend
if "%choice%"=="3" goto kill_java
if "%choice%"=="4" goto clean_compile
if "%choice%"=="5" goto test_service
if "%choice%"=="6" goto exit

echo 无效选项，请重新选择
timeout /t 2 /nobreak >nul
goto start

:start_backend
cls
echo ==========================================
echo    启动后端服务 (9090端口)
echo ==================================
echo.

cd /d "C:\Users\3jz\Desktop\ANQUANBIYEZHIZUO"
echo 终止现有进程...
taskkill /f /im java.exe >nul 2>&1
timeout /t 2 /nobreak >nul

echo 清理缓存...
call mvn clean >nul 2>&1

echo 编译项目...
call mvn compile >nul 2>&1

echo 启动Spring Boot应用...
echo 服务启动中，请稍候...
echo 访问地址: http://localhost:9090
echo.
call mvn spring-boot:run
goto start

:start_frontend
cls
echo ==========================================
echo    启动前端服务 (3000端口)
echo ==================================
echo.

cd /d "C:\Users\3jz\Desktop\ANQUANBIYEZHIZUO\frontend\hjzdm-frontend"
echo 启动React开发服务器...
echo 访问地址: http://localhost:3000
echo.
call npm start
goto start

:kill_java
cls
echo ==========================================
echo    终止Java进程
echo ==================================
echo.

echo 终止所有Java进程...
taskkill /f /im java.exe
echo 完成!
timeout /t 2 /nobreak >nul
goto start

:clean_compile
cls
echo ==========================================
echo    清理并重新编译
echo ==================================
echo.

cd /d "C:\Users\3jz\Desktop\ANQUANBIYEZHIZUO"
echo 终止Java进程...
taskkill /f /im java.exe >nul 2>&1

echo 删除编译输出...
if exist target rd /s /q target >nul 2>&1

echo 清理Maven缓存...
call mvn clean >nul 2>&1

echo 重新编译...
call mvn compile
echo 编译完成!
timeout /t 2 /nobreak >nul
goto start

:test_service
cls
echo ==========================================
echo    测试服务连接
echo ==================================
echo.

node service_test.js
echo.
pause
goto start

:exit
echo 感谢使用监控面板！
timeout /t 2 /nobreak >nul
exit