@echo off
rem TinyWaste 金手指构建脚本 (批处理版本)
rem 简单的JavaScript压缩工具，不需要Node.js

setlocal enabledelayedexpansion

echo.
echo TinyWaste 金手指构建脚本
echo ========================
echo.

rem 检查参数
if "%1"=="clean" goto :clean
if "%1"=="help" goto :help
if "%1"=="-h" goto :help
if "%1"=="--help" goto :help

rem 检查源文件
if not exist "data\cheat.js" (
    echo [错误] 源文件不存在: data\cheat.js
    echo 请确保您在正确的目录中运行此脚本
    pause
    exit /b 1
)

rem 构建过程
echo [信息] 开始构建...
echo [信息] 正在处理: data\cheat.js -^> data\cheat.min.js

rem 创建临时PowerShell脚本进行文本处理
echo $content = Get-Content 'data\cheat.js' -Raw -Encoding UTF8 > temp_compress.ps1
echo $content = $content -replace '(?m)^\s*//.*$', '' >> temp_compress.ps1
echo $content = $content -replace '(?s)/\*.*?\*/', '' >> temp_compress.ps1
echo $content = $content -replace '(?m)^\s*$\r?\n', '' >> temp_compress.ps1
echo $content = $content -replace '(?m)^\s+', '' >> temp_compress.ps1
echo $content = $content -replace '\s+', ' ' >> temp_compress.ps1
echo $content = $content -replace '\s+;', ';' >> temp_compress.ps1
echo $content = $content -replace '\s+,', ',' >> temp_compress.ps1
echo $content = $content -replace '\s*\(\s*', '(' >> temp_compress.ps1
echo $content = $content -replace '\s*\)\s*', ')' >> temp_compress.ps1
echo $content = $content -replace '\s*\{\s*', '{' >> temp_compress.ps1
echo $content = $content -replace '\s*\}\s*', '}' >> temp_compress.ps1
echo $header = "// 由构建脚本压缩生成 - $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')`n" >> temp_compress.ps1
echo $content = $header + $content >> temp_compress.ps1
echo $content ^| Out-File -FilePath 'data\cheat.min.js' -Encoding UTF8 -NoNewline >> temp_compress.ps1

rem 执行压缩
powershell -ExecutionPolicy Bypass -File temp_compress.ps1

rem 清理临时文件
del temp_compress.ps1 >nul 2>&1

rem 检查结果
if exist "data\cheat.min.js" (
    echo [成功] 压缩完成: data\cheat.min.js
    
    rem 计算文件大小
    for %%A in ("data\cheat.js") do set "originalSize=%%~zA"
    for %%A in ("data\cheat.min.js") do set "compressedSize=%%~zA"
    
    echo [信息] 文件大小: !originalSize! -^> !compressedSize! bytes
    echo [成功] 构建完成!
) else (
    echo [错误] 构建失败
    pause
    exit /b 1
)

echo.
echo 使用说明:
echo   build.bat        - 构建压缩文件
echo   build.bat clean  - 清理构建文件  
echo   build.bat help   - 显示帮助
echo.
goto :end

:clean
echo [信息] 清理构建文件...
if exist "data\cheat.min.js" (
    del "data\cheat.min.js"
    echo [成功] 已删除: data\cheat.min.js
) else (
    echo [信息] 没有找到需要清理的文件
)
echo [成功] 清理完成
goto :end

:help
echo.
echo TinyWaste 金手指构建脚本帮助
echo ============================
echo.
echo 用法:
echo   build.bat           - 构建压缩文件
echo   build.bat clean     - 清理构建文件
echo   build.bat help      - 显示此帮助
echo.
echo 功能:
echo   - 自动压缩 data\cheat.js 为 data\cheat.min.js
echo   - 移除注释和多余空白
echo   - 不需要安装 Node.js 或其他依赖
echo.
echo 注意:
echo   - 这是简化版构建工具
echo   - 如需完整功能请安装 Node.js 并使用 npm 脚本
echo   - 源文件: data\cheat.js (您编辑这个文件)
echo   - 输出文件: data\cheat.min.js (自动生成)
echo.

:end
endlocal

