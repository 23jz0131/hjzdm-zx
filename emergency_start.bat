@echo off
setlocal enabledelayedexpansion

echo ==========================================
echo    ANQUANBIYEZHIZUO 紧急修复启动脚本
echo ==========================================
echo.

:: 设置工作目录
cd /d "C:\Users\3jz\Desktop\ANQUANBIYEZHIZUO"

:: 1. 终止所有Java进程
echo [1/5] 终止现有Java进程...
taskkill /f /im java.exe >nul 2>&1
timeout /t 3 /nobreak >nul

:: 2. 清理Maven缓存
echo [2/5] 清理Maven缓存...
call mvn clean >nul 2>&1

:: 3. 删除编译输出
echo [3/5] 删除编译输出...
if exist target rd /s /q target >nul 2>&1

:: 4. 执行数据库清理
echo [4/5] 执行数据库清理...
mysql -u root -p123456 hjzdm < emergency_sql_cleanup.sql > db_cleanup_result.txt 2>&1
if !errorlevel! equ 0 (
    echo     ✓ 数据库清理完成
) else (
    echo     ○ 数据库清理可能已完成或无需清理
)

:: 5. 编译并启动
echo [5/5] 编译项目并启动服务...
call mvn compile > compile_result.txt 2>&1
if !errorlevel! equ 0 (
    echo     ✓ 项目编译成功
    echo.
    echo ==========================================
    echo 服务启动中...
    echo 访问地址: http://localhost:9090
    echo 测试账户: testuser3 / 123123
    echo ==================================
    echo.
    call mvn spring-boot:run
) else (
    echo     ✗ 项目编译失败
    echo     请查看 compile_result.txt 获取详细信息
)

pause