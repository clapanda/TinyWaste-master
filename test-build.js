#!/usr/bin/env node
/**
 * 构建系统测试脚本
 * 验证压缩后的代码是否正常工作
 */

const fs = require('fs');
const path = require('path');
const { buildAll } = require('./build.js');

// 简单的测试框架
class TestRunner {
    constructor() {
        this.tests = [];
        this.passed = 0;
        this.failed = 0;
    }
    
    test(name, fn) {
        this.tests.push({ name, fn });
    }
    
    async run() {
        console.log('🧪 开始运行构建测试...\n');
        
        for (const test of this.tests) {
            try {
                await test.fn();
                console.log(`✅ ${test.name}`);
                this.passed++;
            } catch (error) {
                console.error(`❌ ${test.name}: ${error.message}`);
                this.failed++;
            }
        }
        
        console.log(`\n📊 测试结果: ${this.passed} 通过, ${this.failed} 失败`);
        return this.failed === 0;
    }
}

const runner = new TestRunner();

// 测试：源文件存在
runner.test('源文件存在检查', () => {
    const sourceFile = 'data/cheat.js';
    if (!fs.existsSync(sourceFile)) {
        throw new Error(`源文件不存在: ${sourceFile}`);
    }
});

// 测试：构建过程
runner.test('构建过程测试', async () => {
    const success = await buildAll();
    if (!success) {
        throw new Error('构建过程失败');
    }
});

// 测试：输出文件存在
runner.test('输出文件存在检查', () => {
    const outputFile = 'data/cheat.min.js';
    if (!fs.existsSync(outputFile)) {
        throw new Error(`输出文件不存在: ${outputFile}`);
    }
});

// 测试：输出文件有效性
runner.test('输出文件有效性检查', () => {
    const outputFile = 'data/cheat.min.js';
    const content = fs.readFileSync(outputFile, 'utf8');
    
    // 检查文件不为空
    if (content.length === 0) {
        throw new Error('输出文件为空');
    }
    
    // 检查关键函数是否存在
    const requiredFunctions = [
        'initCheat',
        'toggleWhiteMode', 
        'expandInventory',
        'removeAllBuffs'
    ];
    
    for (const func of requiredFunctions) {
        if (!content.includes(func)) {
            throw new Error(`关键函数缺失: ${func}`);
        }
    }
});

// 测试：JavaScript 语法检查
runner.test('JavaScript语法检查', () => {
    const outputFile = 'data/cheat.min.js';
    const content = fs.readFileSync(outputFile, 'utf8');
    
    try {
        // 简单的语法检查
        new Function(content);
    } catch (error) {
        throw new Error(`JavaScript语法错误: ${error.message}`);
    }
});

// 测试：压缩效果检查
runner.test('压缩效果检查', () => {
    const sourceFile = 'data/cheat.js';
    const outputFile = 'data/cheat.min.js';
    
    const sourceSize = fs.statSync(sourceFile).size;
    const outputSize = fs.statSync(outputFile).size;
    
    if (outputSize >= sourceSize) {
        throw new Error('压缩后文件大小没有减小');
    }
    
    const compressionRatio = ((sourceSize - outputSize) / sourceSize * 100);
    console.log(`    压缩率: ${compressionRatio.toFixed(1)}% (${sourceSize} -> ${outputSize} bytes)`);
});

// 运行测试
if (require.main === module) {
    runner.run().then(success => {
        process.exit(success ? 0 : 1);
    });
}

module.exports = { TestRunner };

