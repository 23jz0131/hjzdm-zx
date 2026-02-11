# Switch to Real Data Mode

Write-Host "Starting real data mode..." -ForegroundColor Green

# Check and kill existing 9090 port service
Write-Host "`nChecking port 9090..." -ForegroundColor Yellow
$connections = Get-NetTCPConnection -LocalPort 9090 -ErrorAction SilentlyContinue

if ($connections) {
    Write-Host "Found service on port 9090, terminating..." -ForegroundColor Green
    $connections | ForEach-Object {
        Stop-Process -Id $_.OwningProcess -Force
    }
    Start-Sleep -Seconds 2
} else {
    Write-Host "Port 9090 is free" -ForegroundColor Cyan
}

# Check Node.js
Write-Host "`nChecking Node.js..." -ForegroundColor Yellow
try {
    $version = node --version
    Write-Host "Node.js version: $version" -ForegroundColor Green
} catch {
    Write-Host "Node.js not found, please install Node.js" -ForegroundColor Red
    exit 1
}

# Install dependencies
Write-Host "`nInstalling dependencies..." -ForegroundColor Yellow
npm install express cors --save

# Start real data server
Write-Host "`nStarting real data server..." -ForegroundColor Green
Start-Process -FilePath "node" -ArgumentList "real-data-server.js" -WindowStyle Hidden

# Wait for startup
Write-Host "Waiting for server to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

# Verify service
Write-Host "`nVerifying service..." -ForegroundColor Yellow
$check = Get-NetTCPConnection -LocalPort 9090 -ErrorAction SilentlyContinue

if ($check) {
    Write-Host "Real data server started successfully!" -ForegroundColor Green
    Write-Host "Service URL: http://localhost:9090" -ForegroundColor Cyan
    Write-Host "`nAvailable endpoints:" -ForegroundColor Cyan
    Write-Host "POST /goods/compare - Real product comparison" -ForegroundColor White
    Write-Host "POST /goods/search - Real product search" -ForegroundColor White
    Write-Host "POST /goods/pageAll - Real all products" -ForegroundColor White
    Write-Host "GET  /user/me - Real user info" -ForegroundColor White
    
    # Test API
    Write-Host "`nTesting API..." -ForegroundColor Yellow
    try {
        $body = @{ query = "iPhone" } | ConvertTo-Json
        $response = Invoke-RestMethod -Uri "http://localhost:9090/goods/compare" -Method Post -Body $body -ContentType "application/json"
        Write-Host "API test successful!" -ForegroundColor Green
        Write-Host "Response code: $($response.code)" -ForegroundColor White
        Write-Host "Data items: $(if($response.data){$response.data.Count}else{0})" -ForegroundColor White
    } catch {
        Write-Host "API test failed: $($_.Exception.Message)" -ForegroundColor Yellow
    }
} else {
    Write-Host "Failed to start server" -ForegroundColor Red
    exit 1
}

Write-Host "`nReal data mode activated!" -ForegroundColor Green
Write-Host "Run stop-real-data.ps1 to stop the service" -ForegroundColor Cyan