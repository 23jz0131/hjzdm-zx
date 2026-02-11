@echo off
echo === 手动服务启动脚本 ===
echo 当前时间: %date% %time%
echo 当前目录: %cd%

echo.
echo 1. 检查Java进程...
tasklist | findstr java

echo.
echo 2. 终止Java进程...
taskkill /f /im java.exe >nul 2>&1
if %errorlevel% equ 0 (
    echo Java进程已终止
) else (
    echo 没有找到Java进程
)

echo.
echo 3. 等待3秒...
timeout /t 3 /nobreak >nul

echo.
echo 4. 清理Maven缓存...
call mvn clean > mvn_clean.log 2>&1
if %errorlevel% equ 0 (
    echo Maven清理完成
) else (
    echo Maven清理失败，查看日志文件 mvn_clean.log
)

echo.
echo 5. 编译项目...
call mvn compile > mvn_compile.log 2>&1
if %errorlevel% equ 0 (
    echo 项目编译完成
) else (
    echo 项目编译失败，查看日志文件 mvn_compile.log
)

echo.
echo 6. 启动Spring Boot应用...
echo 请稍候，应用启动中...
call mvn spring-boot:run

pause