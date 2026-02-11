@echo off
setlocal enabledelayedexpansion

echo ==========================================
echo    ANQUANBIYEZHIZUO 最终修复启动脚本
echo ==========================================
echo.

:: 设置工作目录
cd /d "C:\Users\3jz\Desktop\ANQUANBIYEZHIZUO"
echo 当前目录: %cd%
echo.

:: 1. 终止所有Java进程
echo [1/6] 终止现有Java进程...
taskkill /f /im java.exe >nul 2>&1
if !errorlevel! equ 0 (
    echo     ✓ Java进程已终止
) else (
    echo     ○ 没有找到运行中的Java进程
)
timeout /t 3 /nobreak >nul

:: 2. 彻底清理所有缓存
echo [2/6] 彻底清理缓存...
if exist target (
    rd /s /q target >nul 2>&1
    echo     ✓ target目录已删除
)
call mvn clean > clean.log 2>&1
echo     ✓ Maven缓存已清理

:: 3. 验证关键文件状态
echo [3/6] 验证文件状态...
echo     检查User实体类...
findstr /i "gender\|age\|birthDate" "src\main\java\com\wray\hjzdm\entity\User.java" >nul
if !errorlevel! equ 0 (
    echo     ✗ User实体类中仍存在问题字段
    goto :error
) else (
    echo     ✓ User实体类状态正常
)

:: 4. 重新编译项目
echo [4/6] 重新编译项目...
call mvn compile > compile.log 2>&1
if !errorlevel! equ 0 (
    echo     ✓ 项目编译成功
) else (
    echo     ✗ 项目编译失败
    echo     查看 compile.log 获取详细信息
    goto :error
)

:: 5. 显示即将启动的服务信息
echo [5/6] 准备启动服务...
echo.
echo ==========================================
echo 服务配置信息:
echo • 端口: 9090
echo • 数据库: 本地MySQL (hjzdm)
echo • 符合用户简化数据结构偏好
echo • 移除了gender、age、birthDate等多余字段
echo ==========================================
echo.

:: 6. 启动Spring Boot应用
echo [6/6] 启动Spring Boot应用...
echo 服务启动中，请稍候...
echo.

call mvn spring-boot:run

goto :end

:error
echo.
echo ****************************************************
echo * 启动失败！请检查上述错误信息
echo * 日志文件:
echo *   - clean.log (清理日志)
echo *   - compile.log (编译日志)
echo ****************************************************
pause
exit /b 1

:end
echo.
echo 服务已停止
pause