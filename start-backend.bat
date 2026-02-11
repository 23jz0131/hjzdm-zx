@echo off
title HJZDM 真实数据后端服务
echo ========================================
echo    HJZDM 真实数据后端服务   
echo ========================================
echo.
echo 正在启动真实的Java后端服务...
echo 系统将调用真实的Yahoo和Rakuten API
echo.
cd /d "C:\Users\3jz\Desktop\ANQUANBIYEZHIZUO"
mvn spring-boot:run
pause