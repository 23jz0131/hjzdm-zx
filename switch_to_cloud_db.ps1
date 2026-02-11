#!/usr/bin/env pwsh

# 云端数据库切换脚本
# 使用生产环境配置启动系统

Write-Host "=== 云端数据库系统启动 ===" -ForegroundColor Green
Write-Host ""

# 检查必要文件
if (-Not (Test-Path "src/main/resources/application-prod.yml")) {
    Write-Host "❌ 错误: 找不到生产环境配置文件" -ForegroundColor Red
    Write-Host "请确保 src/main/resources/application-prod.yml 文件存在"
    exit 1
}

# 显示数据库连接信息
Write-Host "📋 数据库配置信息:" -ForegroundColor Yellow
Write-Host "  主机: gateway01.ap-northeast-1.prod.aws.tidbcloud.com"
Write-Host "  端口: 4000"
Write-Host "  数据库: fortune500"
Write-Host "  用户名: 2eXmMXiGeCt9iz7.root"
Write-Host ""

# 提示用户确认
Write-Host "⚠️  注意事项:" -ForegroundColor Yellow
Write-Host "  - 系统将切换到云端TiDB数据库"
Write-Host "  - 您的云端账户和投稿信息将会保留"
Write-Host "  - 本地H2数据库数据不会迁移"
Write-Host ""

$confirmation = Read-Host "是否继续启动? (y/N)"
if ($confirmation -ne "y" -and $confirmation -ne "Y") {
    Write-Host "取消启动" -ForegroundColor Yellow
    exit 0
}

# 设置环境变量以激活生产环境配置
$env:SPRING_PROFILES_ACTIVE = "prod"
$env:SPRING_CONFIG_LOCATION = "classpath:application-prod.yml"

Write-Host ""
Write-Host "🚀 启动系统中..." -ForegroundColor Green
Write-Host "使用配置: application-prod.yml"
Write-Host "激活Profile: prod"
Write-Host ""

try {
    # 启动Spring Boot应用
    mvn spring-boot:run -Dspring-boot.run.profiles=prod
    
    Write-Host ""
    Write-Host "✅ 系统启动完成!" -ForegroundColor Green
    Write-Host "服务地址: http://localhost:8080"
    Write-Host "API文档: http://localhost:8080/doc.html"
    
} catch {
    Write-Host ""
    Write-Host "❌ 启动失败: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "请检查网络连接和数据库配置"
}