#!/usr/bin/env node
/**
 * 项目设置脚本
 * 自动安装依赖并进行初始构建
 */

const { execSync } = require('child_process');
const fs = require('fs');

console.log('🚀 TinyWaste 金手指构建系统设置');
console.log('=====================================\n');

// 检查 Node.js 版本
const nodeVersion = process.version;
const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);

if (majorVersion < 14) {
    console.error('❌ 需要 Node.js 14 或更高版本');
    console.error(`   当前版本: ${nodeVersion}`);
    process.exit(1);
}

console.log(`✅ Node.js 版本检查通过: ${nodeVersion}`);

// 检查 npm
try {
    const npmVersion = execSync('npm --version', { encoding: 'utf8' }).trim();
    console.log(`✅ npm 版本: ${npmVersion}`);
} catch (error) {
    console.error('❌ npm 未安装或不可用');
    process.exit(1);
}

// 安装依赖
console.log('\n📦 安装依赖包...');
try {
    execSync('npm install', { stdio: 'inherit' });
    console.log('✅ 依赖安装完成');
} catch (error) {
    console.error('❌ 依赖安装失败');
    process.exit(1);
}

// 运行初始构建
console.log('\n🔨 运行初始构建...');
try {
    execSync('npm run build', { stdio: 'inherit' });
    console.log('✅ 初始构建完成');
} catch (error) {
    console.error('❌ 初始构建失败');
    process.exit(1);
}

// 运行测试
console.log('\n🧪 运行测试...');
try {
    execSync('npm test', { stdio: 'inherit' });
    console.log('✅ 测试通过');
} catch (error) {
    console.error('❌ 测试失败');
    process.exit(1);
}

console.log('\n🎉 设置完成！');
console.log('\n📚 使用指南:');
console.log('  npm run dev     - 开启开发模式 (文件监听)');
console.log('  npm run build   - 一次性构建');
console.log('  npm test        - 运行测试');
console.log('  npm run clean   - 清理构建文件');
console.log('\n💡 现在您可以专注于编辑 data/cheat.js，构建会自动处理！');

