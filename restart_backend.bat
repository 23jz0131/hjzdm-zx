@echo off
echo === 重启后端服务 ===

echo 正在终止现有Java进程...
taskkill /f /im java.exe >nul 2>&1

echo 等待进程完全终止...
timeout /t 3 /nobreak >nul

echo 启动Spring Boot应用...
cd /d "C:\Users\3jz\Desktop\ANQUANBIYEZHIZUO"
mvn spring-boot:run

pause