@echo off
title 彻底禁用虚拟数据模式
echo ========================================
echo    HJZDM - 彻底禁用虚拟数据模式   
echo ========================================
echo.

echo 正在清理所有虚拟数据相关文件和服务...
echo.

REM 终止所有可能的Node.js服务
echo 终止Node.js相关进程...
taskkill /f /im node.exe >nul 2>&1
taskkill /f /fi "WINDOWTITLE eq *mock*" >nul 2>&1
timeout /t 2 /nobreak >nul

REM 重命名或移动虚拟数据文件
echo 移动虚拟数据文件到backup目录...
if not exist "backup_virtual_data" mkdir backup_virtual_data

move /y "mock-server.js" "backup_virtual_data\" >nul 2>&1
move /y "real-data-server.js" "backup_virtual_data\" >nul 2>&1

REM 更新启动脚本，强制只使用真实数据
echo 更新启动脚本...
echo @echo off > start-backend.bat
echo title HJZDM 真实数据后端服务 >> start-backend.bat
echo echo 正在启动真实的Java后端服务... >> start-backend.bat
echo cd /d "C:\Users\3jz\Desktop\ANQUANBIYEZHIZUO" >> start-backend.bat
echo mvn spring-boot:run >> start-backend.bat
echo pause >> start-backend.bat

echo.
echo 已完成虚拟数据禁用配置！
echo 现在系统只会使用真实的Yahoo/Rakuten API数据
echo.
echo 如需恢复虚拟数据，请将backup_virtual_data目录中的文件移回原位置
echo.
pause