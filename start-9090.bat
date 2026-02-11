@echo off
echo ========================================
echo 🚀 启动 HJZDM 应用 (9090端口)
echo ========================================
echo.

echo 🔧 检查端口占用情况...
netstat -ano | findstr :9090
if %errorlevel% equ 0 (
    echo ⚠️  9090端口已被占用，正在终止相关进程...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :9090') do (
        echo 终止进程 PID: %%a
        taskkill /PID %%a /F 2>nul
    )
    timeout /t 2 /nobreak >nul
)

echo.
echo 🚀 启动后端服务...
start "HJZDM Backend (9090)" cmd /k "mvn spring-boot:run"
timeout /t 5 /nobreak >nul

echo 🌐 启动前端服务...
cd frontend\hjzdm-frontend
start "HJZDM Frontend (3000)" cmd /k "npm start"
cd ..\..

echo.
echo ========================================
echo ✅ 启动完成！
echo ========================================
echo 🌐 前端访问地址: http://localhost:3000
echo 🖥️  后端API地址: http://localhost:9090
echo 📚 API文档地址: http://localhost:9090/doc.html
echo.
echo 💡 提示：
echo - 前端会自动代理API请求到后端9090端口
echo - 如需停止服务，请关闭对应的命令行窗口
echo - 日志可在各窗口中查看
echo.
pause