// cheat.js - 简化版金手指功能模块，专注于基础属性修改
// 适用于GitHub Pages部署

var CHEAT_ENABLED = false;

// 金手指UI创建函数
function createCheatUI() {
    // 创建金手指按钮
    var cheatBtn = newElement("button", "cheatBtn", "", "btn btn-danger", "金手指");
    $("#footer").append(cheatBtn);
    
    // 创建金手指面板
    var cheatPanel = newElement("div", "cheatPanel", "", "cheatPanel", "");
    $("#background").append(cheatPanel);
    $(cheatPanel).hide();
    
    // 添加功能分类和选项
    createAttributeSection();
    
    // 为后续功能预留占位区域
    createPlaceholderSections();
    
    // 绑定事件
    $("#cheatBtn").click(toggleCheatPanel);
}

// 切换金手指面板显示/隐藏
function toggleCheatPanel() {
    if ($("#cheatPanel").is(":visible")) {
        $("#cheatPanel").fadeOut(300);
    } else {
        $("#cheatPanel").fadeIn(300);
    }
}

// 创建属性修改部分
function createAttributeSection() {
    var section = newElement("div", "", "cheatSection", "cheatSection", "<h3>属性修改</h3>");
    
    // 基础属性修改
    for (var i in STATUS_LIST) {
        var status = STATUS_LIST[i];
        var row = createAttributeRow(status, PLAYER_STATUS[status].name);
        $(section).append(row);
    }
    
    // 特殊属性修改
    for (var i in SPECIAL_LIST) {
        var special = SPECIAL_LIST[i];
        var row = createAttributeRow(special, PLAYER_STATUS[special].name);
        $(section).append(row);
    }
    
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
}

// 修改属性值
function modifyAttribute(attr, value) {
    if (PLAYER_STATUS[attr] !== undefined) {
        if (PLAYER_STATUS[attr].value !== undefined) {
            PLAYER_STATUS[attr].value = value;
            updateStatus(attr);
            showMsg("已修改 " + PLAYER_STATUS[attr].name + " 为 " + value);
        }
    }
}

// 添加金手指样式
function addCheatStyles() {
    var style = document.createElement('style');
    style.type = 'text/css';
    style.innerHTML = `
    #cheatBtn {
        position: fixed;
        right: 10px;
        top: 10px;
        z-index: 1000;
    }
    
    .cheatPanel {
        position: fixed;
        top: 50px;
        right: 10px;
        width: 280px;
        max-height: 80vh;
        overflow-y: auto;
        background-color: rgba(0, 0, 0, 0.85);
        border: 1px solid #666;
        border-radius: 5px;
        padding: 10px;
        z-index: 1000;
        color: #fff;
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
    `;
    document.head.appendChild(style);
}

// 初始化金手指
$(document).ready(function() {
    // 等待游戏加载完成后初始化金手指
    setTimeout(function() {
        createCheatUI();
        addCheatStyles();
    }, 3000);
});
