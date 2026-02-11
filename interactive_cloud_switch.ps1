# Interactive cloud database switch script
# Prompts for database password and switches to cloud database while keeping 9090 port

param(
    [string]$Password = ""
)

Write-Host "=== Interactive Cloud Database Switch ===" -ForegroundColor Green
Write-Host ""

# Check if password was provided as parameter
if ([string]::IsNullOrEmpty($Password)) {
    Write-Host "Please enter your TiDB database password:" -ForegroundColor Yellow
    $Password = Read-Host -AsSecureString | ConvertFrom-SecureString -AsPlainText
}

# Validate password
if ([string]::IsNullOrEmpty($Password)) {
    Write-Host "ERROR: Password cannot be empty" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Configuration Details:" -ForegroundColor Yellow
Write-Host "  Port: 9090 (will be maintained)"
Write-Host "  Database: TiDB Cloud (fortune500)"
Write-Host "  Host: gateway01.ap-northeast-1.prod.aws.tidbcloud.com"
Write-Host "  Username: 2eXmMXiGeCt9iz7.root"
Write-Host ""

Write-Host "Important Notes:" -ForegroundColor Yellow
Write-Host "  - System will switch to TiDB Cloud database"
Write-Host "  - Service will continue running on port 9090"
Write-Host "  - Your cloud account and submission data will be preserved"
Write-Host ""

$confirmation = Read-Host "Continue with database switch? (y/N)"
if ($confirmation -ne "y" -and $confirmation -ne "Y") {
    Write-Host "Operation cancelled" -ForegroundColor Yellow
    exit 0
}

# Set environment variables
$env:SPRING_DATASOURCE_DRIVER_CLASS_NAME = "com.mysql.cj.jdbc.Driver"
$env:SPRING_DATASOURCE_URL = "jdbc:mysql://gateway01.ap-northeast-1.prod.aws.tidbcloud.com:4000/fortune500?useUnicode=true&characterEncoding=utf8&zeroDateTimeBehavior=convertToNull&useSSL=true&serverTimezone=GMT%2B8&requireSSL=true&verifyServerCertificate=false&allowPublicKeyRetrieval=true"
$env:SPRING_DATASOURCE_USERNAME = "2eXmMXiGeCt9iz7.root"
$env:SPRING_DATASOURCE_PASSWORD = $Password
$env:SERVER_PORT = "9090"

Write-Host ""
Write-Host "Starting system with cloud database..." -ForegroundColor Green
Write-Host "Service port: 9090"
Write-Host "Database: TiDB Cloud"
Write-Host ""

try {
    # Start Spring Boot application
    mvn spring-boot:run
    
    Write-Host ""
    Write-Host "SUCCESS: System startup complete!" -ForegroundColor Green
    Write-Host "Service address: http://localhost:9090"
    Write-Host "API documentation: http://localhost:9090/doc.html"
    
} catch {
    Write-Host ""
    Write-Host "FAILED: Startup failed - $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Common issues:"
    Write-Host "  1. Incorrect database password"
    Write-Host "  2. Network connectivity issues"
    Write-Host "  3. Database service unavailable"
}