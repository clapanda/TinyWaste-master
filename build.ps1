# TinyWaste 金手指构建脚本 (PowerShell版本)
# 适用于没有 Node.js 环境的情况

param(
    [switch]$Watch,
    [switch]$Clean,
    [switch]$Help
)

# 颜色输出函数
function Write-Info($message) {
    Write-Host "ℹ $message" -ForegroundColor Blue
}

function Write-Success($message) {
    Write-Host "✓ $message" -ForegroundColor Green
}

function Write-Error($message) {
    Write-Host "✗ $message" -ForegroundColor Red
}

function Write-Warning($message) {
    Write-Host "⚠ $message" -ForegroundColor Yellow
}

# 帮助信息
if ($Help) {
    Write-Host "TinyWaste 金手指构建脚本" -ForegroundColor Cyan
    Write-Host "=========================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "用法:"
    Write-Host "  .\build.ps1           - 一次性构建"
    Write-Host "  .\build.ps1 -Watch    - 监听文件变化，自动构建"
    Write-Host "  .\build.ps1 -Clean    - 清理构建文件"
    Write-Host "  .\build.ps1 -Help     - 显示帮助"
    Write-Host ""
    Write-Host "注意: 这是简化版构建脚本，不需要 Node.js"
    Write-Host "     如需完整功能，请安装 Node.js 并使用 npm 脚本"
    exit 0
}

# 清理功能
if ($Clean) {
    Write-Info "清理构建文件..."
    
    $filesToClean = @("data\cheat.min.js")
    
    foreach ($file in $filesToClean) {
        if (Test-Path $file) {
            Remove-Item $file -Force
            Write-Success "已删除: $file"
        }
    }
    
    Write-Success "清理完成"
    exit 0
}

# 简单的JavaScript压缩函数
function Compress-JavaScript {
    param(
        [string]$InputFile,
        [string]$OutputFile
    )
    
    if (-not (Test-Path $InputFile)) {
        Write-Error "输入文件不存在: $InputFile"
        return $false
    }
    
    Write-Info "正在处理: $InputFile -> $OutputFile"
    
    try {
        # 读取源文件
        $content = Get-Content $InputFile -Raw -Encoding UTF8
        
        # 简单的压缩处理
        # 移除注释 (// 开头的行)
        $content = $content -replace '(?m)^\s*//.*$', ''
        
        # 移除多行注释
        $content = $content -replace '(?s)/\*.*?\*/', ''
        
        # 移除空行
        $content = $content -replace '(?m)^\s*$\r?\n', ''
        
        # 移除行首空白
        $content = $content -replace '(?m)^\s+', ''
        
        # 移除多余的空格 (但保留字符串内的空格)
        $content = $content -replace '\s+', ' '
        
        # 移除分号前的空格
        $content = $content -replace '\s+;', ';'
        
        # 移除逗号前的空格
        $content = $content -replace '\s+,', ','
        
        # 移除括号内外的多余空格
        $content = $content -replace '\s*\(\s*', '('
        $content = $content -replace '\s*\)\s*', ')'
        $content = $content -replace '\s*\{\s*', '{'
        $content = $content -replace '\s*\}\s*', '}'
        
        # 确保输出目录存在
        $outputDir = Split-Path $OutputFile -Parent
        if (-not (Test-Path $outputDir)) {
            New-Item -ItemType Directory -Path $outputDir -Force | Out-Null
        }
        
        # 添加压缩标识注释
        $header = "// 由 PowerShell 构建脚本压缩生成 - $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')`n"
        $content = $header + $content
        
        # 写入压缩后的文件
        $content | Out-File -FilePath $OutputFile -Encoding UTF8 -NoNewline
        
        # 计算压缩率
        $originalSize = (Get-Item $InputFile).Length
        $compressedSize = (Get-Item $OutputFile).Length
        $compressionRatio = [math]::Round((($originalSize - $compressedSize) / $originalSize) * 100, 1)
        
        Write-Success "压缩完成: $OutputFile"
        Write-Info "文件大小: $originalSize -> $compressedSize bytes (压缩 $compressionRatio%)"
        
        return $true
    }
    catch {
        Write-Error "压缩失败: $($_.Exception.Message)"
        return $false
    }
}

# 构建函数
function Build-All {
    Write-Info "开始构建..."
    
    $buildConfigs = @(
        @{
            Input = "data\cheat.js"
            Output = "data\cheat.min.js"
        }
    )
    
    $successCount = 0
    
    foreach ($config in $buildConfigs) {
        $success = Compress-JavaScript -InputFile $config.Input -OutputFile $config.Output
        if ($success) {
            $successCount++
        }
    }
    
    if ($successCount -eq $buildConfigs.Count) {
        Write-Success "构建完成! 成功处理 $successCount 个文件"
        return $true
    } else {
        Write-Error "构建部分失败: $successCount/$($buildConfigs.Count) 文件成功"
        return $false
    }
}

# 文件监听函数
function Watch-Files {
    Write-Info "开始监听文件变化..."
    Write-Info "监听: data\cheat.js"
    Write-Success "文件监听已启动，按 Ctrl+C 停止"
    
    $watcher = New-Object System.IO.FileSystemWatcher
    $watcher.Path = "data"
    $watcher.Filter = "cheat.js"
    $watcher.NotifyFilter = [System.IO.NotifyFilters]::LastWrite
    $watcher.EnableRaisingEvents = $true
    
    $action = {
        $path = $Event.SourceEventArgs.FullPath
        $name = $Event.SourceEventArgs.Name
        $changeType = $Event.SourceEventArgs.ChangeType
        
        Write-Host ""
        Write-Info "文件变化检测: $name"
        
        # 等待一小段时间，确保文件写入完成
        Start-Sleep -Milliseconds 500
        
        Build-All | Out-Null
    }
    
    Register-ObjectEvent -InputObject $watcher -EventName "Changed" -Action $action | Out-Null
    
    try {
        # 保持脚本运行
        while ($true) {
            Start-Sleep -Seconds 1
        }
    }
    finally {
        $watcher.EnableRaisingEvents = $false
        $watcher.Dispose()
        Write-Info "文件监听已停止"
    }
}

# 主逻辑
Write-Host "TinyWaste 金手指构建脚本 (PowerShell版)" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

# 检查源文件是否存在
if (-not (Test-Path "data\cheat.js")) {
    Write-Error "源文件不存在: data\cheat.js"
    Write-Warning "请确保您在正确的目录中运行此脚本"
    exit 1
}

# 执行构建
$buildSuccess = Build-All

if (-not $buildSuccess) {
    exit 1
}

# 如果需要监听文件变化
if ($Watch) {
    Write-Host ""
    Watch-Files
}

