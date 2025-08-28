# TinyWaste 金手指构建指南

这个构建系统可以帮您自动压缩JavaScript代码，避免在开发过程中手动处理minification，节省token消耗。

## 🚀 快速开始

### 1. 安装依赖

```bash
# 安装 Node.js (如果还没有安装)
# 然后安装项目依赖
npm install
```

### 2. 基本使用

```bash
# 一次性构建所有文件
npm run build

# 只构建 cheat.js
npm run build:cheat

# 开发模式 - 监听文件变化，自动重新构建
npm run dev

# 清理生成的文件
npm run clean

# 运行测试，验证构建结果
npm test
```

## 📁 文件结构

```
├── data/
│   ├── cheat.js          # 源代码 (您编辑这个)
│   └── cheat.min.js      # 自动生成的压缩版本
├── build.js              # 构建脚本
├── test-build.js         # 测试脚本
├── package.json          # 项目配置
└── BUILD_GUIDE.md        # 本文档
```

## 🔧 开发工作流

### 推荐的开发流程：

1. **启动开发模式**
   ```bash
   npm run dev
   ```

2. **编辑源代码**
   - 只需要编辑 `data/cheat.js`
   - 保存后会自动生成 `data/cheat.min.js`

3. **测试功能**
   ```bash
   npm test
   ```

4. **提交代码**
   - 只需要提交 `data/cheat.js`
   - `.min.js` 文件由构建系统生成

## ⚙️ 构建配置

构建配置在 `build.js` 中的 `BUILD_CONFIG` 对象：

```javascript
const BUILD_CONFIG = {
    files: [
        {
            input: 'data/cheat.js',      // 源文件
            output: 'data/cheat.min.js', // 输出文件
            options: {
                compress: {
                    drop_console: false,  // 保留console.log
                    keep_fnames: true    // 保留函数名
                },
                mangle: {
                    keep_fnames: true,   // 保留函数名
                    reserved: [...]      // 保留的变量名
                }
            }
        }
    ]
};
```

## 🎯 优势

### 对开发者：
- ✅ **专注源代码**：只需编辑 `.js` 文件
- ✅ **自动化**：保存即压缩，无需手动操作
- ✅ **实时反馈**：文件监听模式，立即看到结果
- ✅ **质量保证**：内置测试，确保压缩后代码正常

### 对AI助手：
- ✅ **节省Token**：不再需要处理压缩文件
- ✅ **提高效率**：专注于功能实现
- ✅ **减少错误**：避免手动压缩的语法错误
- ✅ **一致性**：标准化的构建流程

## 📝 使用示例

### 场景1：添加新功能
```bash
# 1. 启动开发模式
npm run dev

# 2. 编辑 data/cheat.js，添加新功能
# 3. 保存文件 -> 自动生成 cheat.min.js
# 4. 测试功能
npm test
```

### 场景2：修复bug
```bash
# 1. 编辑 data/cheat.js 修复问题
# 2. 一次性构建
npm run build

# 3. 验证修复效果
npm test
```

### 场景3：发布前检查
```bash
# 清理旧文件
npm run clean

# 重新构建
npm run build

# 运行完整测试
npm test
```

## 🔍 故障排除

### Q: 构建失败怎么办？
A: 检查 `data/cheat.js` 的语法错误，构建脚本会显示详细错误信息。

### Q: 压缩后功能不正常？
A: 可能是函数名被错误压缩，检查 `build.js` 中的 `reserved` 数组。

### Q: 文件监听不工作？
A: 确保安装了 `chokidar` 依赖：`npm install chokidar`

### Q: 想要不同的压缩配置？
A: 修改 `build.js` 中的 `BUILD_CONFIG.files[0].options`

## 🚀 高级用法

### 添加更多文件到构建流程
在 `BUILD_CONFIG.files` 数组中添加新的配置对象：

```javascript
{
    input: 'data/another-script.js',
    output: 'data/another-script.min.js',
    options: { /* 自定义压缩选项 */ }
}
```

### 自定义压缩选项
参考 [Terser文档](https://terser.org/docs/api-reference) 了解所有可用选项。

### 集成到CI/CD
在部署脚本中添加：
```bash
npm install
npm run build
npm test
```

---

💡 **提示**：使用这个构建系统后，AI助手只需要关注源代码的功能实现，大大提高开发效率！

