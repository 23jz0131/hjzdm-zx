# HJZDM 智能服务启动脚本
Write-Host "========================================" -ForegroundColor Green
Write-Host "   HJZDM 电商比价系统服务启动器" -ForegroundColor Green  
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

# 检查端口占用
Write-Host "检查端口占用情况..." -ForegroundColor Yellow
$port9090 = Get-NetTCPConnection -LocalPort 9090 -ErrorAction SilentlyContinue
$port3000 = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue

if ($port9090) {
    Write-Host "发现端口9090被占用，PID: $($port9090.OwningProcess)" -ForegroundColor Red
    Stop-Process -Id $port9090.OwningProcess -Force
    Start-Sleep -Seconds 2
}

if ($port3000) {
    Write-Host "发现端口3000被占用，PID: $($port3000.OwningProcess)" -ForegroundColor Red
    Stop-Process -Id $port3000.OwningProcess -Force
    Start-Sleep -Seconds 2
}

# 选择启动模式
Write-Host ""
Write-Host "请选择服务启动模式:" -ForegroundColor Cyan
Write-Host "1. 真实数据模式 (调用Yahoo/Rakuten真实API)" -ForegroundColor White
Write-Host "2. 虚拟数据模式 (使用模拟数据)" -ForegroundColor White
Write-Host "3. 前后端同时启动 (真实数据)" -ForegroundColor White
Write-Host ""

$choice = Read-Host "请输入选择 (1/2/3)"

switch ($choice) {
    "1" {
        Write-Host "启动真实后端数据服务..." -ForegroundColor Green
        Set-Location "C:\Users\3jz\Desktop\ANQUANBIYEZHIZUO"
        mvn spring-boot:run
    }
    "2" {
        Write-Host "启动虚拟数据服务..." -ForegroundColor Yellow
        Set-Location "C:\Users\3jz\Desktop\ANQUANBIYEZHIZUO"
        node mock-server.js
    }
    "3" {
        Write-Host "启动前后端真实数据服务..." -ForegroundColor Green
        
        # 启动后端
        Write-Host "正在启动后端服务..." -ForegroundColor Yellow
        Start-Process -FilePath "cmd.exe" -ArgumentList "/c", "cd /d C:\Users\3jz\Desktop\ANQUANBIYEZHIZUO && mvn spring-boot:run" -WindowStyle Minimized
        
        # 等待后端启动
        Start-Sleep -Seconds 15
        
        # 启动前端
        Write-Host "正在启动前端服务..." -ForegroundColor Yellow
        Set-Location "C:\Users\3jz\Desktop\ANQUANBIYEZHIZUO\frontend\hjzdm-frontend"
        npm start
    }
    default {
        Write-Host "无效选择，启动真实数据模式..." -ForegroundColor Red
        Set-Location "C:\Users\3jz\Desktop\ANQUANBIYEZHIZUO"
        mvn spring-boot:run
    }
}

Write-Host ""
Write-Host "服务启动脚本执行完毕" -ForegroundColor Green