# HJZDM 永久真实数据启动脚本
Write-Host "========================================" -ForegroundColor Green
Write-Host "   HJZDM 永久真实数据服务启动器   " -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

# 清理虚拟数据进程
Write-Host "正在清理可能的虚拟数据进程..." -ForegroundColor Yellow
Stop-Process -Name "node" -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

# 检查并释放端口
Write-Host "正在检查端口占用情况..." -ForegroundColor Yellow
$portInUse = Get-NetTCPConnection -LocalPort 9090 -ErrorAction SilentlyContinue
if ($portInUse) {
    Write-Host "发现端口9090已被占用，正在终止相关进程..." -ForegroundColor Yellow
    $portInUse | ForEach-Object {
        Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue
    }
    Start-Sleep -Seconds 2
}

Write-Host ""
Write-Host "正在启动真实的Java后端服务..." -ForegroundColor Cyan
Write-Host "服务将调用真实的Yahoo和Rakuten API" -ForegroundColor Cyan
Write-Host "数据库: TiDB Cloud" -ForegroundColor Cyan
Write-Host ""

Set-Location "C:\Users\3jz\Desktop\ANQUANBIYEZHIZUO"

# 启动真实后端服务
mvn spring-boot:run

Write-Host ""
Write-Host "服务启动完成！" -ForegroundColor Green
Write-Host "前端请访问: http://localhost:3000" -ForegroundColor Green
Write-Host "后端API地址: http://localhost:9090" -ForegroundColor Green
Write-Host "注意: 系统已永久禁用虚拟数据，始终使用真实电商平台数据" -ForegroundColor Red
Write-Host ""
Read-Host "按任意键退出"