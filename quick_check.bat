@echo off
echo ================================
echo 投稿数据库状态快速检查
echo ================================

echo 检查后端服务是否运行...
curl -s http://localhost:9090/actuator/health >nul 2>&1
if %errorlevel% == 0 (
    echo ✅ 后端服务运行正常
) else (
    echo ❌ 后端服务未运行，请先启动Spring Boot应用
    pause
    exit /b
)

echo.
echo 尝试管理员登录...
powershell -Command "& {$token = (Invoke-RestMethod -Uri 'http://localhost:9090/user/login' -Method Post -Body '{\"username\":\"admin\",\"password\":\"admin123\"}' -ContentType 'application/json').data.token; Write-Output $token}" > temp_token.txt

if exist temp_token.txt (
    set /p TOKEN=<temp_token.txt
    del temp_token.txt
    echo ✅ 管理员登录成功
    echo.
    echo 获取投稿数据...
    curl -s -H "Authorization: Bearer %TOKEN%" http://localhost:9090/disclosure/list | findstr "total"
) else (
    echo ❌ 管理员登录失败
)

echo.
echo 检查完成
pause