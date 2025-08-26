// cheat.js - 增强版金手指功能模块
// 适用于GitHub Pages部署

var CHEAT_ENABLED = false;
var CHEAT_LOG_PREFIX = "🎮 金手指:";

// 初始化金手指
$(document).ready(function() {
    // 等待游戏加载完成后初始化金手指
    setTimeout(function() {
        console.log(CHEAT_LOG_PREFIX, "初始化中...");
        createCheatUI();
        addCheatStyles();
        initCheatConsole();
        CHEAT_ENABLED = true;
        console.log(CHEAT_LOG_PREFIX, "初始化完成 ✅");
    }, 3000);
});

// 初始化控制台命令
function initCheatConsole() {
    // 在window对象上添加金手指命令
    window.cheat = {
        // 显示帮助信息
        help: function() {
            console.log(CHEAT_LOG_PREFIX, "可用命令：");
            console.log("  cheat.status() - 显示金手指状态");
            console.log("  cheat.toggle() - 开关金手指面板");
            console.log("  cheat.set(属性名, 值) - 设置属性值");
            console.log("  cheat.max(属性名) - 将属性设为最大值");
            console.log("  cheat.maxAll() - 所有属性最大化");
            console.log("  cheat.listAttrs() - 列出所有可修改的属性");
            return "金手指控制台已加载 🎮";
        },
        
        // 显示金手指状态
        status: function() {
            console.log(CHEAT_LOG_PREFIX, "状态:", CHEAT_ENABLED ? "已启用 ✅" : "未启用 ❌");
            console.log(CHEAT_LOG_PREFIX, "面板:", $("#cheatPanel").is(":visible") ? "显示中 👁️" : "已隐藏 🙈");
            return "金手指状态已显示";
        },
        
        // 切换金手指面板
        toggle: function() {
            toggleCheatPanel();
            return "金手指面板已" + ($("#cheatPanel").is(":visible") ? "显示 👁️" : "隐藏 🙈");
        },
        
        // 设置属性值
        set: function(attr, value) {
            if (!PLAYER_STATUS[attr]) {
                console.error(CHEAT_LOG_PREFIX, "属性不存在:", attr);
                return "属性不存在 ❌";
            }
            
            var oldValue = PLAYER_STATUS[attr].value;
            modifyAttribute(attr, value);
            console.log(CHEAT_LOG_PREFIX, `已修改 ${PLAYER_STATUS[attr].name}: ${oldValue} → ${value}`);
            return `${PLAYER_STATUS[attr].name} 已修改为 ${value} ✅`;
        },
        
        // 将属性设为最大值
        max: function(attr) {
            if (!PLAYER_STATUS[attr]) {
                console.error(CHEAT_LOG_PREFIX, "属性不存在:", attr);
                return "属性不存在 ❌";
            }
            
            var max = PLAYER_STATUS[attr].max || 999;
            var oldValue = PLAYER_STATUS[attr].value;
            modifyAttribute(attr, max);
            console.log(CHEAT_LOG_PREFIX, `已最大化 ${PLAYER_STATUS[attr].name}: ${oldValue} → ${max}`);
            return `${PLAYER_STATUS[attr].name} 已最大化为 ${max} ✅`;
        },
        
        // 所有属性最大化
        maxAll: function() {
            console.log(CHEAT_LOG_PREFIX, "正在最大化所有属性...");
            
            // 基础属性
            for (var i in STATUS_LIST) {
                var status = STATUS_LIST[i];
                var max = PLAYER_STATUS[status].max || 999;
                modifyAttribute(status, max);
            }
            
            // 特殊属性
            for (var i in SPECIAL_LIST) {
                var special = SPECIAL_LIST[i];
                var max = PLAYER_STATUS[special].max || 999;
                modifyAttribute(special, max);
            }
            
            console.log(CHEAT_LOG_PREFIX, "所有属性已最大化 ✅");
            return "所有属性已最大化 ✅";
        },
        
        // 列出所有可修改的属性
        listAttrs: function() {
            console.log(CHEAT_LOG_PREFIX, "基础属性:");
            for (var i in STATUS_LIST) {
                var status = STATUS_LIST[i];
                console.log(`  ${status}: ${PLAYER_STATUS[status].name} = ${PLAYER_STATUS[status].value}`);
            }
            
            console.log(CHEAT_LOG_PREFIX, "特殊属性:");
            for (var i in SPECIAL_LIST) {
                var special = SPECIAL_LIST[i];
                console.log(`  ${special}: ${PLAYER_STATUS[special].name} = ${PLAYER_STATUS[special].value}`);
            }
            
            return "属性列表已显示 📋";
        }
    };
    
    // 打印帮助信息
    console.log(CHEAT_LOG_PREFIX, "金手指控制台已加载");
    console.log(CHEAT_LOG_PREFIX, "输入 cheat.help() 查看可用命令");
}

// 金手指UI创建函数
function createCheatUI() {
    // 创建emoji按钮（半透明）
    var emojiBtn = newElement("div", "cheatEmojiBtn", "", "cheatEmojiBtn", "🎮");
    $("#background").append(emojiBtn);
    
    // 创建金手指按钮（保留原按钮，但隐藏）
    var cheatBtn = newElement("button", "cheatBtn", "", "btn btn-danger", "金手指");
    $("#footer").append(cheatBtn);
    $(cheatBtn).hide();
    
    // 创建金手指面板
    var cheatPanel = newElement("div", "cheatPanel", "", "cheatPanel", "");
    $("#background").append(cheatPanel);
    $(cheatPanel).hide();
    
    // 创建状态指示器
    var statusIndicator = newElement("div", "cheatStatus", "", "cheatStatus", "");
    $("#cheatPanel").append(statusIndicator);
    updateCheatStatus();
    
    // 添加功能分类和选项
    createAttributeSection();
    
    // 为后续功能预留占位区域
    createPlaceholderSections();
    
    // 绑定事件
    $("#cheatEmojiBtn").click(toggleCheatPanel);
    $("#cheatBtn").click(toggleCheatPanel);
}

// 更新金手指状态指示器
function updateCheatStatus() {
    var statusText = "金手指状态: " + (CHEAT_ENABLED ? "已启用 ✅" : "未启用 ❌");
    $("#cheatStatus").html(statusText);
    console.log(CHEAT_LOG_PREFIX, statusText);
}

// 切换金手指面板显示/隐藏
function toggleCheatPanel() {
    if ($("#cheatPanel").is(":visible")) {
        $("#cheatPanel").fadeOut(300);
        console.log(CHEAT_LOG_PREFIX, "面板已隐藏 🙈");
    } else {
        $("#cheatPanel").fadeIn(300);
        console.log(CHEAT_LOG_PREFIX, "面板已显示 👁️");
        
        // 更新所有属性的当前值
        updateAllAttributeValues();
    }
}

// 更新所有属性输入框的值
function updateAllAttributeValues() {
    // 基础属性
    for (var i in STATUS_LIST) {
        var status = STATUS_LIST[i];
        if (PLAYER_STATUS[status] && PLAYER_STATUS[status].value !== undefined) {
            $("#attr_" + status).val(Math.floor(PLAYER_STATUS[status].value));
        }
    }
    
    // 特殊属性
    for (var i in SPECIAL_LIST) {
        var special = SPECIAL_LIST[i];
        if (PLAYER_STATUS[special] && PLAYER_STATUS[special].value !== undefined) {
            $("#attr_" + special).val(Math.floor(PLAYER_STATUS[special].value));
        }
    }
}

// 创建属性修改部分
function createAttributeSection() {
    var section = newElement("div", "", "cheatSection", "cheatSection", "<h3>属性修改</h3>");
    
    // 快捷按钮区域
    var quickButtons = newElement("div", "", "cheatQuickButtons", "cheatQuickButtons", "");
    
    // 添加全部最大化按钮
    var maxAllBtn = newElement("button", "", "", "btn btn-warning", "全部最大化");
    $(maxAllBtn).click(function() {
        window.cheat.maxAll();
        updateAllAttributeValues();
    });
    $(quickButtons).append(maxAllBtn);
    
    $(section).append(quickButtons);
    
    // 基础属性修改
    var basicSection = newElement("div", "", "", "cheatSubSection", "<h4>基础属性</h4>");
    for (var i in STATUS_LIST) {
        var status = STATUS_LIST[i];
        var row = createAttributeRow(status, PLAYER_STATUS[status].name);
        $(basicSection).append(row);
    }
    $(section).append(basicSection);
    
    // 特殊属性修改
    var specialSection = newElement("div", "", "", "cheatSubSection", "<h4>特殊属性</h4>");
    for (var i in SPECIAL_LIST) {
        var special = SPECIAL_LIST[i];
        var row = createAttributeRow(special, PLAYER_STATUS[special].name);
        $(specialSection).append(row);
    }
    $(section).append(specialSection);
    
    $("#cheatPanel").append(section);
}

// 创建属性行
function createAttributeRow(attr, name) {
    var row = newElement("div", "", "", "cheatAttributeRow", "");
    
    // 属性名称
    var label = newElement("label", "", "", "", name);
    $(row).append(label);
    
    // 属性值输入框
    var input = newElement("input", "attr_" + attr, "", "", "");
    $(input).attr("type", "number");
    $(input).attr("min", "0");
    
    // 设置初始值
    if (PLAYER_STATUS[attr] && PLAYER_STATUS[attr].value !== undefined) {
        $(input).val(Math.floor(PLAYER_STATUS[attr].value));
    }
    
    // 绑定修改事件
    $(input).change(function() {
        var value = parseInt($(this).val());
        modifyAttribute(attr, value);
    });
    
    $(row).append(input);
    
    // 最大值按钮
    var maxBtn = newElement("button", "", "", "btn btn-xs btn-default", "最大");
    $(maxBtn).click(function() {
        var max = PLAYER_STATUS[attr].max || 999;
        $("#attr_" + attr).val(max);
        modifyAttribute(attr, max);
    });
    $(row).append(maxBtn);
    
    return row;
}

// 为后续功能预留占位区域
function createPlaceholderSections() {
    // 物品操作（预留）
    var itemSection = newElement("div", "", "cheatSection", "cheatSection", "<h3>物品操作</h3><p class='comingSoon'>功能开发中...</p>");
    $("#cheatPanel").append(itemSection);
    
    // 地图功能（预留）
    var mapSection = newElement("div", "", "cheatSection", "cheatSection", "<h3>地图功能</h3><p class='comingSoon'>功能开发中...</p>");
    $("#cheatPanel").append(mapSection);
    
    // 战斗辅助（预留）
    var battleSection = newElement("div", "", "cheatSection", "cheatSection", "<h3>战斗辅助</h3><p class='comingSoon'>功能开发中...</p>");
    $("#cheatPanel").append(battleSection);
    
    // 控制台帮助
    var consoleSection = newElement("div", "", "cheatSection", "cheatSection", "<h3>控制台命令</h3>");
    var consoleHelp = newElement("div", "", "", "cheatConsoleHelp", "");
    $(consoleHelp).html(`
        <p>在浏览器控制台(F12)中可使用以下命令:</p>
        <ul>
            <li><code>cheat.help()</code> - 显示帮助</li>
            <li><code>cheat.status()</code> - 显示状态</li>
            <li><code>cheat.set('属性', 值)</code> - 设置属性值</li>
            <li><code>cheat.max('属性')</code> - 最大化属性</li>
            <li><code>cheat.maxAll()</code> - 全部最大化</li>
        </ul>
    `);
    $(consoleSection).append(consoleHelp);
    $("#cheatPanel").append(consoleSection);
}

// 修改属性值
function modifyAttribute(attr, value) {
    if (PLAYER_STATUS[attr] !== undefined) {
        if (PLAYER_STATUS[attr].value !== undefined) {
            // 记录修改前的值
            var oldValue = PLAYER_STATUS[attr].value;
            
            // 修改属性值
            PLAYER_STATUS[attr].value = value;
            updateStatus(attr);
            
            // 在控制台记录修改
            console.log(CHEAT_LOG_PREFIX, `已修改 ${PLAYER_STATUS[attr].name}: ${oldValue} → ${value}`);
            
            // 显示游戏内提示
            showMsg("已修改 " + PLAYER_STATUS[attr].name + " 为 " + value);
        }
    }
}

// 添加金手指样式
function addCheatStyles() {
    var style = document.createElement('style');
    style.type = 'text/css';
    style.innerHTML = `
    #cheatEmojiBtn {
        position: fixed;
        right: 10px;
        top: 10px;
        font-size: 24px;
        background-color: rgba(0, 0, 0, 0.5);
        color: #fff;
        width: 40px;
        height: 40px;
        line-height: 40px;
        text-align: center;
        border-radius: 50%;
        cursor: pointer;
        z-index: 1000;
        opacity: 0.7;
        transition: all 0.3s ease;
    }
    
    #cheatEmojiBtn:hover {
        opacity: 1;
        transform: scale(1.1);
        background-color: rgba(255, 50, 50, 0.7);
    }
    
    .cheatPanel {
        position: fixed;
        top: 60px;
        right: 10px;
        width: 300px;
        max-height: 80vh;
        overflow-y: auto;
        background-color: rgba(0, 0, 0, 0.85);
        border: 1px solid #666;
        border-radius: 5px;
        padding: 10px;
        z-index: 1000;
        color: #fff;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
    }
    
    .cheatStatus {
        background-color: rgba(0, 0, 0, 0.5);
        padding: 5px;
        margin-bottom: 10px;
        border-radius: 3px;
        text-align: center;
        font-weight: bold;
        color: #ffcc00;
    }
    
    .cheatSection {
        margin-bottom: 15px;
        padding-bottom: 10px;
        border-bottom: 1px solid #555;
    }
    
    .cheatSection h3 {
        color: #ff9900;
        font-size: 16px;
        margin-top: 5px;
        margin-bottom: 10px;
    }
    
    .cheatSection h4 {
        color: #ffcc00;
        font-size: 14px;
        margin-top: 10px;
        margin-bottom: 5px;
    }
    
    .cheatQuickButtons {
        display: flex;
        justify-content: center;
        margin-bottom: 10px;
    }
    
    .cheatQuickButtons button {
        margin: 0 5px;
    }
    
    .cheatSubSection {
        margin-bottom: 10px;
        padding: 5px;
        background-color: rgba(255, 255, 255, 0.05);
        border-radius: 3px;
    }
    
    .cheatSection button {
        margin: 2px;
        font-size: 12px;
    }
    
    .cheatAttributeRow {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 5px;
    }
    
    .cheatAttributeRow label {
        flex: 1;
    }
    
    .cheatAttributeRow input {
        width: 60px;
        background-color: #333;
        color: #fff;
        border: 1px solid #555;
        padding: 2px 5px;
        margin-right: 5px;
    }
    
    .comingSoon {
        color: #999;
        font-style: italic;
        text-align: center;
        padding: 10px;
    }
    
    .cheatConsoleHelp {
        background-color: rgba(0, 0, 0, 0.3);
        padding: 10px;
        border-radius: 3px;
        font-size: 12px;
    }
    
    .cheatConsoleHelp code {
        background-color: #333;
        padding: 2px 4px;
        border-radius: 3px;
        color: #ffcc00;
    }
    `;
    document.head.appendChild(style);
}