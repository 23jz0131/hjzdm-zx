# 项目大小分析脚本
Write-Host "=== HJZDM项目大小分析 ===" -ForegroundColor Green

# 定义要分析的主要目录
$directories = @(
    @{Name="node_modules"; Path="node_modules"},
    @{Name="frontend_node_modules"; Path="frontend\hjzdm-frontend\node_modules"},
    @{Name="target"; Path="target"},
    @{Name="tools"; Path="tools"},
    @{Name="build"; Path="frontend\hjzdm-frontend\build"},
    @{Name="git"; Path=".git"},
    @{Name="uploads"; Path="uploads"},
    @{Name="src"; Path="src"}
)

$totalSize = 0
$results = @()

foreach ($dir in $directories) {
    $fullPath = Join-Path $PWD $dir.Path
    if (Test-Path $fullPath) {
        $size = (Get-ChildItem -Path $fullPath -Recurse -File -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum
        if ($size) {
            $sizeMB = [math]::Round($size / 1MB, 2)
            $results += [PSCustomObject]@{
                Directory = $dir.Name
                Path = $dir.Path
                SizeMB = $sizeMB
                SizeGB = [math]::Round($size / 1GB, 2)
            }
            $totalSize += $size
            Write-Host "$($dir.Name): $($sizeMB) MB" -ForegroundColor Yellow
        }
    }
}

Write-Host "`n=== 总结 ===" -ForegroundColor Green
$totalMB = [math]::Round($totalSize / 1MB, 2)
$totalGB = [math]::Round($totalSize / 1GB, 2)
Write-Host "项目总大小: $totalMB MB ($totalGB GB)" -ForegroundColor Cyan

Write-Host "`n=== 详细分析 ===" -ForegroundColor Green
$results | Sort-Object SizeMB -Descending | Format-Table -AutoSize

# 查找最大的单个文件
Write-Host "`n=== 最大的文件 ===" -ForegroundColor Green
Get-ChildItem -Path . -Recurse -File -ErrorAction SilentlyContinue | 
    Sort-Object Length -Descending | 
    Select-Object -First 10 |
    Select-Object Name, @{Name="Size(MB)";Expression={[math]::Round($_.Length/1MB, 2)}}, Directory |
    Format-Table -AutoSize