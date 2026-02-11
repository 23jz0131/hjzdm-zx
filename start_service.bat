@echo off
setlocal enabledelayedexpansion

echo ==========================================
echo    ANQUANBIYEZHIZUO 服务启动脚本
echo ==========================================
echo.

:: 设置工作目录
cd /d "C:\Users\3jz\Desktop\ANQUANBIYEZHIZUO"
echo 当前目录: %cd%
echo.

:: 1. 终止所有Java进程
echo [1/5] 终止现有Java进程...
taskkill /f /im java.exe >nul 2>&1
if !errorlevel! equ 0 (
    echo     ✓ Java进程已终止
) else (
    echo     ○ 没有找到运行中的Java进程
)
timeout /t 2 /nobreak >nul

:: 2. 清理Maven缓存
echo [2/5] 清理Maven缓存...
call mvn clean > mvn_clean.log 2>&1
if !errorlevel! equ 0 (
    echo     ✓ Maven清理完成
) else (
    echo     ✗ Maven清理失败，查看 mvn_clean.log
)

:: 3. 强制删除target目录
echo [3/5] 删除编译输出目录...
if exist target (
    rd /s /q target >nul 2>&1
    if !errorlevel! equ 0 (
        echo     ✓ target目录已删除
    ) else (
        echo     ✗ target目录删除失败
    )
) else (
    echo     ○ target目录不存在
)

:: 4. 重新编译项目
echo [4/5] 编译项目...
call mvn compile > mvn_compile.log 2>&1
if !errorlevel! equ 0 (
    echo     ✓ 项目编译成功
) else (
    echo     ✗ 项目编译失败，查看 mvn_compile.log
    echo     日志摘要:
    findstr "ERROR\|error" mvn_compile.log | more
    goto :error
)

:: 5. 启动Spring Boot应用
echo [5/5] 启动Spring Boot应用...
echo.
echo ==========================================
echo 服务启动中，请稍候...
echo 访问地址: http://localhost:9090
echo ==========================================
echo.

call mvn spring-boot:run

goto :end

:error
echo.
echo ****************************************************
echo * 启动失败！请检查上述错误信息和日志文件
echo * 日志文件位置:
echo *   - mvn_clean.log (清理日志)
echo *   - mvn_compile.log (编译日志)
echo ****************************************************
pause
exit /b 1

:end
echo.
echo 服务已停止
pause