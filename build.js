#!/usr/bin/env node
/**
 * TinyWaste 金手指自动构建脚本
 * 功能：自动压缩 JavaScript 文件，支持文件监听
 */

const fs = require('fs');
const path = require('path');
const { minify } = require('terser');

// 检查是否安装了可选依赖
let chokidar = null;
let chalk = null;

try {
    chokidar = require('chokidar');
} catch (e) {
    console.warn('警告: chokidar 未安装，文件监听功能不可用');
}

try {
    chalk = require('chalk');
} catch (e) {
    // chalk 不是必需的，只是为了美化输出
}

// 日志函数
const log = {
    info: (msg) => console.log(chalk ? chalk.blue('ℹ') : '[INFO]', msg),
    success: (msg) => console.log(chalk ? chalk.green('✓') : '[SUCCESS]', msg),
    error: (msg) => console.error(chalk ? chalk.red('✗') : '[ERROR]', msg),
    warn: (msg) => console.warn(chalk ? chalk.yellow('⚠') : '[WARN]', msg)
};

// 构建配置
const BUILD_CONFIG = {
    files: [
        {
            input: 'data/cheat.js',
            output: 'data/cheat.min.js',
            options: {
                compress: {
                    drop_console: false, // 保留 console.log，方便调试
                    drop_debugger: true,
                    pure_funcs: [], // 不移除任何函数调用
                    keep_fargs: true, // 保留函数参数名
                    keep_fnames: true // 保留函数名（重要：金手指需要函数名）
                },
                mangle: {
                    keep_fnames: true, // 保留函数名
                    reserved: [
                        // 保留关键的全局变量和函数名
                        'CHEAT_ENABLED', 'CHEAT_LOG_PREFIX', 'LOCKED_STATUS', 
                        'WHITE_MODE_ENABLED', 'ORIGINAL_BAG_CAP',
                        'initCheat', 'setupCheatConsole', 'createCheatUI',
                        'toggleWhiteMode', 'expandInventory', 'removeAllBuffs',
                        'PLAYER_STATUS', 'STATUS_LIST', 'SPECIAL_LIST', 'BAG_CAP',
                        'window', 'document', '$', 'jQuery'
                    ]
                },
                format: {
                    comments: false, // 移除注释
                    beautify: false  // 不美化，完全压缩
                }
            }
        }
        // 可以在这里添加更多文件的构建配置
    ]
};

/**
 * 压缩单个文件
 */
async function minifyFile(config) {
    const { input, output, options } = config;
    
    try {
        // 检查输入文件是否存在
        if (!fs.existsSync(input)) {
            log.error(`输入文件不存在: ${input}`);
            return false;
        }
        
        // 读取源文件
        const sourceCode = fs.readFileSync(input, 'utf8');
        log.info(`正在压缩: ${input} -> ${output}`);
        
        // 压缩代码
        const result = await minify(sourceCode, options);
        
        if (result.error) {
            log.error(`压缩失败: ${result.error}`);
            return false;
        }
        
        // 确保输出目录存在
        const outputDir = path.dirname(output);
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }
        
        // 写入压缩后的文件
        fs.writeFileSync(output, result.code, 'utf8');
        
        // 计算压缩率
        const originalSize = sourceCode.length;
        const minifiedSize = result.code.length;
        const compressionRatio = ((originalSize - minifiedSize) / originalSize * 100).toFixed(1);
        
        log.success(`压缩完成: ${output}`);
        log.info(`文件大小: ${originalSize} -> ${minifiedSize} bytes (压缩 ${compressionRatio}%)`);
        
        return true;
    } catch (error) {
        log.error(`压缩文件时出错: ${error.message}`);
        return false;
    }
}

/**
 * 构建所有文件
 */
async function buildAll() {
    log.info('开始构建...');
    let successCount = 0;
    
    for (const config of BUILD_CONFIG.files) {
        const success = await minifyFile(config);
        if (success) successCount++;
    }
    
    if (successCount === BUILD_CONFIG.files.length) {
        log.success(`构建完成! 成功处理 ${successCount} 个文件`);
    } else {
        log.error(`构建部分失败: ${successCount}/${BUILD_CONFIG.files.length} 文件成功`);
    }
    
    return successCount === BUILD_CONFIG.files.length;
}

/**
 * 监听文件变化
 */
function watchFiles() {
    if (!chokidar) {
        log.error('文件监听需要 chokidar 依赖，请运行: npm install chokidar');
        process.exit(1);
    }
    
    const watchPaths = BUILD_CONFIG.files.map(config => config.input);
    log.info(`开始监听文件变化: ${watchPaths.join(', ')}`);
    
    const watcher = chokidar.watch(watchPaths, {
        ignored: /node_modules/,
        persistent: true,
        ignoreInitial: true
    });
    
    watcher.on('change', async (filePath) => {
        log.info(`文件变化detected: ${filePath}`);
        
        // 找到对应的构建配置
        const config = BUILD_CONFIG.files.find(c => c.input === filePath);
        if (config) {
            await minifyFile(config);
        }
    });
    
    watcher.on('error', error => {
        log.error(`文件监听出错: ${error}`);
    });
    
    log.success('文件监听已启动，按 Ctrl+C 停止');
    
    // 优雅关闭
    process.on('SIGINT', () => {
        log.info('正在关闭文件监听...');
        watcher.close();
        process.exit(0);
    });
}

/**
 * 主函数
 */
async function main() {
    const args = process.argv.slice(2);
    const isWatch = args.includes('--watch') || args.includes('-w');
    
    // 首次构建
    const buildSuccess = await buildAll();
    
    if (!buildSuccess) {
        process.exit(1);
    }
    
    // 如果需要监听文件变化
    if (isWatch) {
        watchFiles();
    }
}

// 如果直接运行此脚本
if (require.main === module) {
    main().catch(error => {
        log.error(`构建失败: ${error.message}`);
        process.exit(1);
    });
}

module.exports = { buildAll, minifyFile, BUILD_CONFIG };

