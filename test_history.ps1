
$baseUrl = "http://localhost:9090"
$headers = @{ "Content-Type" = "application/json" }

# 1. Register (Ignore error if exists)
$registerBody = @{
    username = "testuser_hist"
    email = "test_hist@example.com"
    password = "password123"
    confirmPassword = "password123"
} | ConvertTo-Json

try {
    Write-Host "Registering..."
    $regResponse = Invoke-RestMethod -Uri "$baseUrl/user/register" -Method Post -Body $registerBody -Headers $headers -ErrorAction SilentlyContinue
    Write-Host "Register Response: $($regResponse | ConvertTo-Json -Depth 2)"
} catch {
    Write-Host "Registration failed or user exists: $_"
}

# 2. Login
$loginBody = @{
    username = "testuser_hist"
    password = "password123"
} | ConvertTo-Json

try {
    Write-Host "Logging in..."
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/user/login" -Method Post -Body $loginBody -Headers $headers
    $token = $loginResponse.data.token
    Write-Host "Login Success. Token: $token"
} catch {
    Write-Host "Login failed: $_"
    exit
}

# 3. Add History via addAndHistory
$headers.Add("Authorization", $token)

$goodsBody = @{
    goodsName = "Test History Goods $(Get-Date)"
    goodsPrice = 999.0
    goodsLink = "http://example.com/test_history"
    imgUrl = "http://example.com/img.jpg"
    mallType = 10
    status = 1
} | ConvertTo-Json

try {
    Write-Host "Adding Goods and History..."
    $addResponse = Invoke-RestMethod -Uri "$baseUrl/goods/addAndHistory" -Method Post -Body $goodsBody -Headers $headers
    Write-Host "Add Response: $($addResponse | ConvertTo-Json -Depth 2)"
} catch {
    Write-Host "Add History failed: $_"
    exit
}

# 4. Query History
$queryBody = @{
    pageNum = 1
    pageSize = 10
} | ConvertTo-Json

try {
    Write-Host "Querying History..."
    $queryResponse = Invoke-RestMethod -Uri "$baseUrl/user/queryHistory" -Method Post -Body $queryBody -Headers $headers
    Write-Host "Query Response: $($queryResponse | ConvertTo-Json -Depth 3)"
} catch {
    Write-Host "Query History failed: $_"
}
