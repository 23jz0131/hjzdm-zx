# 停止真实数据服务的PowerShell脚本

Write-Host "🛑 停止真实数据服务..." -ForegroundColor Yellow

# 查找并终止9090端口的服务
Write-Host "`n🔍 查找9090端口服务..." -ForegroundColor Yellow
$portProcess = Get-NetTCPConnection -LocalPort 9090 -ErrorAction SilentlyContinue

if ($portProcess) {
    $processId = $portProcess.OwningProcess
    Write-Host "✅ 找到PID $processId 的服务" -ForegroundColor Green
    
    try {
        # 获取进程信息
        $process = Get-Process -Id $processId -ErrorAction SilentlyContinue
        if ($process) {
            Write-Host "📝 进程名称: $($process.ProcessName)" -ForegroundColor White
            Write-Host "📝 启动时间: $($process.StartTime)" -ForegroundColor White
        }
        
        # 终止进程
        Write-Host "🛑 终止服务进程..." -ForegroundColor Yellow
        Stop-Process -Id $processId -Force
        Start-Sleep -Seconds 1
        
        # 验证是否已停止
        $verify = Get-NetTCPConnection -LocalPort 9090 -ErrorAction SilentlyContinue
        if (-not $verify) {
            Write-Host "✅ 服务已成功停止" -ForegroundColor Green
        } else {
            Write-Host "⚠️  服务可能仍在运行，请手动检查" -ForegroundColor Yellow
        }
        
    } catch {
        Write-Host "❌ 停止服务失败: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "💡 尝试使用任务管理器手动终止相关进程" -ForegroundColor Cyan
    }
} else {
    Write-Host "ℹ️  9090端口当前未被占用" -ForegroundColor Cyan
}

# 查找可能的Node.js进程
Write-Host "`n🔍 查找相关的Node.js进程..." -ForegroundColor Yellow
$nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object {
    $_.CommandLine -match "real-data-server\.js" -or
    $_.CommandLine -match "mock-server\.js" -or
    $_.Path -match "real-data-server\.js" -or
    $_.Path -match "mock-server\.js"
}

if ($nodeProcesses) {
    Write-Host "✅ 找到 $($nodeProcesses.Count) 个相关Node.js进程" -ForegroundColor Green
    foreach ($proc in $nodeProcesses) {
        Write-Host "   PID: $($proc.Id), 启动时间: $($proc.StartTime)" -ForegroundColor White
        try {
            Stop-Process -Id $proc.Id -Force
            Write-Host "   ✅ 已终止PID $($proc.Id)" -ForegroundColor Green
        } catch {
            Write-Host "   ❌ 终止PID $($proc.Id) 失败" -ForegroundColor Red
        }
    }
} else {
    Write-Host "ℹ️  未找到相关的Node.js进程" -ForegroundColor Cyan
}

Write-Host "`n✅ 停止服务操作完成" -ForegroundColor Green