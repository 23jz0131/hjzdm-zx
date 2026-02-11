# 虚拟数据禁用确认脚本
Write-Host "========================================" -ForegroundColor Red
Write-Host "   虚拟数据永久禁用确认" -ForegroundColor Red
Write-Host "========================================" -ForegroundColor Red
Write-Host ""

Write-Host "⚠️  此操作将：" -ForegroundColor Yellow
Write-Host "1. 移动 mock-server.js 到备份目录" -ForegroundColor White
Write-Host "2. 移动 real-data-server.js 到备份目录" -ForegroundColor White  
Write-Host "3. 修改所有启动脚本只使用真实数据" -ForegroundColor White
Write-Host "4. 系统将只能使用真实的Yahoo/Rakuten API" -ForegroundColor White
Write-Host ""

$confirm = Read-Host "确认要永久禁用虚拟数据吗？(输入 YES 确认)"

if ($confirm -eq "YES") {
    Write-Host "开始禁用虚拟数据..." -ForegroundColor Green
    
    # 创建备份目录
    if (!(Test-Path "backup_virtual_data")) {
        New-Item -ItemType Directory -Name "backup_virtual_data" | Out-Null
    }
    
    # 移动虚拟数据文件
    if (Test-Path "mock-server.js") {
        Move-Item "mock-server.js" "backup_virtual_data\" -Force
        Write-Host "✓ 已移动 mock-server.js" -ForegroundColor Green
    }
    
    if (Test-Path "real-data-server.js") {
        Move-Item "real-data-server.js" "backup_virtual_data\" -Force
        Write-Host "✓ 已移动 real-data-server.js" -ForegroundColor Green
    }
    
    # 更新启动脚本
    $realBackendScript = @"
@echo off
title HJZDM 真实数据后端服务
echo 正在启动真实的Java后端服务...
echo 系统将调用真实的Yahoo和Rakuten API
cd /d "C:\Users\3jz\Desktop\ANQUANBIYEZHIZUO"
mvn spring-boot:run
pause
"@
    
    Set-Content -Path "start-backend.bat" -Value $realBackendScript
    Write-Host "✓ 已更新启动脚本" -ForegroundColor Green
    
    Write-Host ""
    Write-Host "✅ 虚拟数据已成功禁用！" -ForegroundColor Green
    Write-Host "现在系统只会使用真实的电商平台数据" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "如需恢复，请手动将 backup_virtual_data 目录中的文件移回原位置" -ForegroundColor Yellow
    
} else {
    Write-Host "操作已取消" -ForegroundColor Yellow
}

Write-Host ""
Pause