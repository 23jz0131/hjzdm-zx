@echo off
echo 正在启动HJZDM应用(端口8080)...
echo.

REM 设置Java环境变量
set JAVA_HOME=C:\Program Files\Java\jdk-17
set PATH=%JAVA_HOME%\bin;%PATH%

REM 编译后端项目
echo 正在编译后端项目...
call mvn clean package -DskipTests

if %errorlevel% neq 0 (
    echo 后端编译失败！
    pause
    exit /b 1
)

REM 启动后端服务
echo 正在启动后端服务(端口8080)...
start "HJZDM Backend" cmd /k "java -jar target/hjzdm-0.0.1-SNAPSHOT.jar --spring.profiles.active=prod"

timeout /t 10 /nobreak >nul

REM 启动前端开发服务器
echo 正在启动前端开发服务器...
cd frontend\hjzdm-frontend
start "HJZDM Frontend" cmd /k "npm start"

echo.
echo 应用启动完成！
echo 后端API: http://localhost:8080
echo 前端页面: http://localhost:3000
echo.
pause