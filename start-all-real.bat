@echo off
title 前后端真实数据服务一键启动
echo ========================================
echo    HJZDM 前后端真实数据服务一键启动   
echo ========================================
echo.

echo === 步骤1: 启动真实后端服务 ===
call start-real-backend.bat

echo.
echo === 步骤2: 启动前端服务 ===
cd frontend\hjzdm-frontend
npm start

echo.
echo === 服务启动完成 ===
echo 前端访问地址: http://localhost:3000
echo 后端API地址: http://localhost:9090
echo 数据模式: 真实电商平台数据(Yahoo/Rakuten)
pause