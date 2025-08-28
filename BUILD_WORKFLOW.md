# 🔧 TinyWaste 构建工作流

## 📋 快速参考

### 对于AI助手
```bash
# 编辑源代码后，提醒用户运行：
.\build.bat

# 永远不要手动编辑 .min.js 文件！
```

### 对于开发者
```bash
# 开发流程
1. 编辑 data/cheat.js
2. 运行 .\build.bat  
3. 测试功能
4. 提交源码（不提交.min.js）
```

## 🎯 核心规则

### ✅ DO（应该做的）
- 编辑 `data/cheat.js`（源代码）
- 运行 `.\build.bat` 生成压缩版
- 专注于功能开发
- 测试构建结果

### ❌ DON'T（不应该做的）
- 手动编辑 `data/cheat.min.js`
- 在响应中输出压缩代码
- 跳过构建步骤
- 提交压缩文件到版本控制

## 💡 Token优化效果

### 之前的工作流
```
用户请求 → AI分析 → AI修改源码 → AI手动压缩 → AI输出压缩代码
消耗Token: ~5000-8000 per modification
```

### 现在的工作流  
```
用户请求 → AI分析 → AI修改源码 → 提醒用户构建
消耗Token: ~1000-2000 per modification
```

**节省率：60-75%** 🎉

## 🚀 立即使用

1. 编辑源码：`data/cheat.js`
2. 运行构建：`.\build.bat`
3. 享受高效开发！

---
*此工作流已集成到 Cursor Rules 中，AI助手会自动遵循这些规范*
