# 快速启动脚本 - 启动9090和3000端口服务

Write-Host "🚀 开始启动服务..." -ForegroundColor Green

# 启动后端服务 (9090端口)
Write-Host "🔧 启动后端服务 (9090端口)..." -ForegroundColor Yellow
Start-Process -FilePath "node" -ArgumentList "$PWD\mock-server.js" -WindowStyle Normal

# 等待后端启动
Start-Sleep -Seconds 3

# 启动前端服务 (3000端口)
Write-Host "🌐 启动前端服务 (3000端口)..." -ForegroundColor Yellow
Set-Location "$PWD\frontend\hjzdm-frontend"
Start-Process -FilePath "npm" -ArgumentList "start" -WindowStyle Normal

# 返回项目根目录
Set-Location "$PWD"

Write-Host "✅ 服务启动命令已执行!" -ForegroundColor Green
Write-Host "🌐 前端访问地址: http://localhost:3000" -ForegroundColor Cyan
Write-Host "🖥️  后端API地址: http://localhost:9090" -ForegroundColor Cyan
Write-Host "📚 API文档地址: http://localhost:9090/doc.html" -ForegroundColor Cyan