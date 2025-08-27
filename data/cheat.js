// cheat.js - 增强版金手指功能模块
// 适用于GitHub Pages部署

// 全局变量
var CHEAT_ENABLED = false;
var CHEAT_LOG_PREFIX = "🎮 金手指:";
var LOCKED_STATUS = {}; // 存储被锁定的属性

// 在游戏加载完成后初始化金手指
function initCheat() {
    console.log(CHEAT_LOG_PREFIX, "初始化中...");
    try {
        createCheatUI();
        addCheatStyles();
        setupCheatConsole();
        installStatusHook();
        CHEAT_ENABLED = true;
        console.log(CHEAT_LOG_PREFIX, "初始化完成 ✅");
    } catch(e) {
        console.error(CHEAT_LOG_PREFIX, "初始化失败", e);
    }
}

// 安装状态钩子，拦截属性变化
function installStatusHook() {
    try {
        // 保存原始的caculate函数
        if (typeof window.originalCaculate === 'undefined') {
            window.originalCaculate = window.caculate;
        }
        
        // 重写caculate函数，添加锁定检查
        window.caculate = function(data, name, value) {
            // 只有当LOCKED_STATUS不为空（有属性被锁定）时才进行检查
            if (Object.keys(LOCKED_STATUS).length > 0) {
                // 如果是PLAYER_STATUS且属性被锁定，则不进行修改
                if (data === PLAYER_STATUS && LOCKED_STATUS[name]) {
                    return; // 属性被锁定，忽略变化
                }
            }
            
            // 否则调用原始函数
            window.originalCaculate(data, name, value);
        };
        
        console.log(CHEAT_LOG_PREFIX, "状态钩子已安装，但只在有属性被锁定时生效");
    } catch(e) {
        console.error(CHEAT_LOG_PREFIX, "安装状态钩子失败", e);
    }
}

// 设置控制台命令
function setupCheatConsole() {
    try {
        // 在全局作用域创建cheat对象
        window.cheat = {};
        
        // 显示帮助信息
        window.cheat.help = function() {
            console.log(CHEAT_LOG_PREFIX, "🎮 金手指控制台命令 🎮");
            console.log("---------------------------------------");
            console.log("基本命令：");
            console.log("  cheat.status()             - 显示金手指状态");
            console.log("  cheat.toggle()             - 开关金手指面板");
            console.log("  cheat.listAttrs()          - 列出所有可修改的属性");
            console.log("---------------------------------------");
            console.log("属性修改命令：");
            console.log("  cheat.set('属性名', 值)     - 设置属性值");
            console.log("  cheat.max('属性名')         - 将属性设为最大值");
            console.log("  cheat.maxStatus()          - 最大化基础状态属性（生命、饱食、水分等）");
            console.log("  cheat.maxSpecial()         - 最大化特殊属性（体质、感知、魅力等）");
            console.log("  cheat.maxAll()             - 同时执行maxStatus和maxSpecial");
            console.log("---------------------------------------");
            console.log("属性锁定命令：");
            console.log("  cheat.lock('属性名')        - 锁定/解锁指定属性，使其不随时间变化");
            console.log("  cheat.lock('属性名', 值)    - 设置属性值并锁定");
            console.log("  cheat.lockStatus()         - 最大化并锁定所有基础状态属性");
            console.log("  cheat.unlockAll()          - 解锁所有属性");
            console.log("---------------------------------------");
            console.log("使用示例：");
            console.log("  cheat.set('life', 100)     - 将生命值设为100");
            console.log("  cheat.lock('hunger', 100)  - 将饱食度设为100并锁定");
            console.log("  cheat.lock('radiation', 0) - 将辐射设为0并锁定");
            console.log("  cheat.maxStatus()          - 最大化所有基础状态属性");
            console.log("---------------------------------------");
            console.log("UI界面功能：");
            console.log("  - 属性后的🔓/🔒按钮可以锁定/解锁该属性");
            console.log("  - 锁定后的属性不会随时间变化");
            console.log("  - 锁定的属性在listAttrs()中会显示🔒标记");
            console.log("---------------------------------------");
            console.log("快捷键：");
            console.log("  Alt+X                     - 切换金手指面板");
            console.log("---------------------------------------");
            console.log("注意事项：");
            console.log("  1. 属性名必须用引号括起来，例如 'life'");
            console.log("  2. 锁定功能通过拦截游戏内属性变化实现");
            console.log("  3. 如果金手指面板不显示，可以使用快捷键或刷新页面");
            console.log("金手指控制台已加载 🎮");
        };
        
        // 显示金手指状态
        window.cheat.status = function() {
            console.log(CHEAT_LOG_PREFIX, "状态:", CHEAT_ENABLED ? "已启用 ✅" : "未启用 ❌");
            console.log(CHEAT_LOG_PREFIX, "面板:", $("#cheatPanel").is(":visible") ? "显示中 👁️" : "已隐藏 🙈");
        };
        
        // 切换金手指面板
        window.cheat.toggle = function() {
            // 检查面板是否存在，如果不存在则重新创建
            if ($("#cheatPanel").length === 0) {
                console.log(CHEAT_LOG_PREFIX, "面板不存在，重新创建...");
                createCheatUI();
            }
            
            var isVisible = $("#cheatPanel").is(":visible");
            if (isVisible) {
                $("#cheatPanel").fadeOut(300);
                console.log(CHEAT_LOG_PREFIX, "面板已隐藏 🙈");
            } else {
                // 确保面板在最上层
                $("#cheatPanel").css("z-index", "9999999");
                // 确保面板附加到body
                if ($("#cheatPanel").parent().prop("tagName") !== "BODY") {
                    $("body").append($("#cheatPanel"));
                }
                $("#cheatPanel").fadeIn(300);
                updateAllAttributeValues();
                console.log(CHEAT_LOG_PREFIX, "面板已显示 👁️");
            }
        };
        
        // 设置属性值
        window.cheat.set = function(attr, value) {
            // 检查参数是否为字符串
            if (typeof attr !== 'string') {
                console.error(CHEAT_LOG_PREFIX, "属性名必须是字符串，例如: cheat.set('life', 100)");
                console.log(CHEAT_LOG_PREFIX, "可用属性列表:");
                window.cheat.listAttrs();
                return;
            }
            
            // 检查属性是否存在
            if (!PLAYER_STATUS[attr]) {
                console.error(CHEAT_LOG_PREFIX, `属性 '${attr}' 不存在`);
                console.log(CHEAT_LOG_PREFIX, "可用属性列表:");
                window.cheat.listAttrs();
                return;
            }
            
            // 检查值是否为数字
            if (isNaN(value)) {
                console.error(CHEAT_LOG_PREFIX, "属性值必须是数字");
                return;
            }
            
            var oldValue = PLAYER_STATUS[attr].value;
            modifyAttribute(attr, value);
            console.log(CHEAT_LOG_PREFIX, `已修改 ${PLAYER_STATUS[attr].name}: ${oldValue} → ${value}`);
        };
        
        // 将属性设为最大值
        window.cheat.max = function(attr) {
            // 检查参数是否为字符串
            if (typeof attr !== 'string') {
                console.error(CHEAT_LOG_PREFIX, "属性名必须是字符串，例如: cheat.max('life')");
                console.log(CHEAT_LOG_PREFIX, "可用属性列表:");
                window.cheat.listAttrs();
                return;
            }
            
            // 检查属性是否存在
            if (!PLAYER_STATUS[attr]) {
                console.error(CHEAT_LOG_PREFIX, `属性 '${attr}' 不存在`);
                console.log(CHEAT_LOG_PREFIX, "可用属性列表:");
                window.cheat.listAttrs();
                return;
            }
            
            // 辐射特殊处理
            if (attr === 'radiation') {
                console.warn(CHEAT_LOG_PREFIX, "警告：最大化辐射可能导致角色死亡！");
            }
            
            var max = PLAYER_STATUS[attr].max || 999;
            var oldValue = PLAYER_STATUS[attr].value;
            modifyAttribute(attr, max);
            console.log(CHEAT_LOG_PREFIX, `已最大化 ${PLAYER_STATUS[attr].name}: ${oldValue} → ${max}`);
        };
        
        // 最大化基础状态属性（生命、饱食、水分、精力、理智）
        window.cheat.maxStatus = function() {
            console.log(CHEAT_LOG_PREFIX, "正在最大化基础状态属性...");
            
            // 需要最大化的基础属性列表
            var statusToMax = ['life', 'hunger', 'thirst', 'energy', 'san'];
            
            // 最大化基础属性
            for (var i in statusToMax) {
                var status = statusToMax[i];
                if (PLAYER_STATUS[status]) {
                    var max = PLAYER_STATUS[status].max || 100;
                    modifyAttribute(status, max);
                }
            }
            
            // 将辐射设为0
            if (PLAYER_STATUS['radiation']) {
                modifyAttribute('radiation', 0);
            }
            
            console.log(CHEAT_LOG_PREFIX, "基础状态属性已最大化 ✅");
        };
        
        // 最大化特殊属性（体质、感知、魅力、运气、灵巧）
        window.cheat.maxSpecial = function() {
            console.log(CHEAT_LOG_PREFIX, "正在最大化特殊属性...");
            
            // 最大化特殊属性
            for (var i in SPECIAL_LIST) {
                var special = SPECIAL_LIST[i];
                var max = PLAYER_STATUS[special].max || 999;
                modifyAttribute(special, max);
            }
            
            console.log(CHEAT_LOG_PREFIX, "特殊属性已最大化 ✅");
        };
        
        // 保留maxAll函数，但简化为同时调用maxStatus和maxSpecial
        window.cheat.maxAll = function() {
            console.log(CHEAT_LOG_PREFIX, "正在最大化所有属性...");
            window.cheat.maxStatus();
            window.cheat.maxSpecial();
            console.log(CHEAT_LOG_PREFIX, "所有属性已最大化 ✅");
        };
        
        // 列出所有可修改的属性
        window.cheat.listAttrs = function() {
            console.log(CHEAT_LOG_PREFIX, "基础属性:");
            for (var i in STATUS_LIST) {
                var status = STATUS_LIST[i];
                var lockStatus = LOCKED_STATUS[status] ? "🔒" : "";
                console.log(`  ${status}: ${PLAYER_STATUS[status].name} = ${PLAYER_STATUS[status].value} ${lockStatus}`);
            }
            
            console.log(CHEAT_LOG_PREFIX, "特殊属性:");
            for (var i in SPECIAL_LIST) {
                var special = SPECIAL_LIST[i];
                var lockStatus = LOCKED_STATUS[special] ? "🔒" : "";
                console.log(`  ${special}: ${PLAYER_STATUS[special].name} = ${PLAYER_STATUS[special].value} ${lockStatus}`);
            }
        };
        
        // 锁定/解锁属性值
        window.cheat.lock = function(attr, value) {
            // 检查参数是否为字符串
            if (typeof attr !== 'string') {
                console.error(CHEAT_LOG_PREFIX, "属性名必须是字符串，例如: cheat.lock('life')");
                console.log(CHEAT_LOG_PREFIX, "可用属性列表:");
                window.cheat.listAttrs();
                return;
            }
            
            // 检查属性是否存在
            if (!PLAYER_STATUS[attr]) {
                console.error(CHEAT_LOG_PREFIX, `属性 '${attr}' 不存在`);
                console.log(CHEAT_LOG_PREFIX, "可用属性列表:");
                window.cheat.listAttrs();
                return;
            }
            
            // 如果已经锁定，则解锁
            if (LOCKED_STATUS[attr]) {
                delete LOCKED_STATUS[attr];
                console.log(CHEAT_LOG_PREFIX, `已解锁 ${PLAYER_STATUS[attr].name} 属性，恢复正常变化`);
                return;
            }
            
            // 如果提供了值，则先设置该值
            if (value !== undefined) {
                modifyAttribute(attr, value);
            }
            
            // 锁定当前值
            LOCKED_STATUS[attr] = true;
            console.log(CHEAT_LOG_PREFIX, `已锁定 ${PLAYER_STATUS[attr].name} 属性，当前值: ${PLAYER_STATUS[attr].value}`);
        };
        
        // 锁定所有基础状态属性
        window.cheat.lockStatus = function() {
            console.log(CHEAT_LOG_PREFIX, "正在锁定所有基础状态属性...");
            
            // 先最大化基础属性
            window.cheat.maxStatus();
            
            // 锁定基础属性
            var statusToLock = ['life', 'hunger', 'thirst', 'energy', 'san', 'radiation'];
            for (var i in statusToLock) {
                var status = statusToLock[i];
                if (PLAYER_STATUS[status]) {
                    LOCKED_STATUS[status] = true;
                }
            }
            
            console.log(CHEAT_LOG_PREFIX, "所有基础状态属性已锁定 🔒");
        };
        
        // 解锁所有属性
        window.cheat.unlockAll = function() {
            console.log(CHEAT_LOG_PREFIX, "正在解锁所有属性...");
            
            // 清空锁定状态
            LOCKED_STATUS = {};
            
            // 恢复原始的caculate函数，确保游戏正常运行
            if (typeof window.originalCaculate !== 'undefined') {
                window.caculate = window.originalCaculate;
                console.log(CHEAT_LOG_PREFIX, "已恢复原始状态计算函数");
            }
            
            // 重新安装钩子，但此时LOCKED_STATUS为空，不会影响游戏
            setTimeout(function() {
                installStatusHook();
            }, 100);
            
            // 更新UI
            updateLockButtonStatus();
            
            console.log(CHEAT_LOG_PREFIX, "所有属性已解锁 ✅");
        };
        
        // 打印帮助信息
        console.log(CHEAT_LOG_PREFIX, "金手指控制台已加载");
        console.log(CHEAT_LOG_PREFIX, "输入 cheat.help() 查看可用命令");
    } catch(e) {
        console.error(CHEAT_LOG_PREFIX, "控制台设置失败", e);
    }
}

// 金手指UI创建函数
function createCheatUI() {
    try {
        // 移除可能存在的旧UI元素
        $("#cheatEmojiBtn").remove();
        $("#cheatPanel").remove();
        
        // 创建emoji按钮（半透明）
        var emojiBtn = newElement("div", "cheatEmojiBtn", "", "cheatEmojiBtn", "🎮");
        $("body").append(emojiBtn); // 直接附加到body，确保在最上层
        
        // 创建金手指面板
        var cheatPanel = newElement("div", "cheatPanel", "", "cheatPanel", "");
        $("body").append(cheatPanel); // 直接附加到body，确保在最上层
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
        
        // 确保按钮和面板在最上层
        $("#cheatEmojiBtn").css("z-index", "9999999");
        $("#cheatPanel").css("z-index", "9999999");
        
        console.log(CHEAT_LOG_PREFIX, "UI创建完成，已附加到body最上层");
    } catch(e) {
        console.error(CHEAT_LOG_PREFIX, "UI创建失败", e);
    }
}

// 更新金手指状态指示器
function updateCheatStatus() {
    var statusText = "金手指状态: " + (CHEAT_ENABLED ? "已启用 ✅" : "未启用 ❌");
    $("#cheatStatus").html(statusText);
    console.log(CHEAT_LOG_PREFIX, statusText);
}

// 切换金手指面板显示/隐藏
function toggleCheatPanel() {
    try {
        // 检查金手指按钮是否存在，如果不存在则重新初始化
        if ($("#cheatEmojiBtn").length === 0) {
            console.log(CHEAT_LOG_PREFIX, "金手指按钮不存在，重新初始化...");
            createCheatUI();
        }
        
        // 直接调用cheat.toggle方法，保持一致的行为
        if (typeof window.cheat !== 'undefined' && typeof window.cheat.toggle === 'function') {
            window.cheat.toggle();
        } else {
            // 如果cheat对象尚未初始化，则使用默认行为
            // 检查面板是否存在，如果不存在则重新创建
            if ($("#cheatPanel").length === 0) {
                console.log(CHEAT_LOG_PREFIX, "面板不存在，重新创建...");
                createCheatUI();
            }
            
            var isVisible = $("#cheatPanel").is(":visible");
            if (isVisible) {
                $("#cheatPanel").fadeOut(300);
                console.log(CHEAT_LOG_PREFIX, "面板已隐藏 🙈");
            } else {
                // 确保面板在最上层
                $("#cheatPanel").css("z-index", "9999999");
                // 确保面板附加到body
                if ($("#cheatPanel").parent().prop("tagName") !== "BODY") {
                    $("body").append($("#cheatPanel"));
                }
                $("#cheatPanel").fadeIn(300);
                updateAllAttributeValues();
                console.log(CHEAT_LOG_PREFIX, "面板已显示 👁️");
            }
        }
    } catch(e) {
        console.error(CHEAT_LOG_PREFIX, "切换面板失败", e);
    }
}

// 更新所有属性输入框的值
function updateAllAttributeValues() {
    try {
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
        
        // 更新锁定按钮状态
        updateLockButtonStatus();
    } catch(e) {
        console.error(CHEAT_LOG_PREFIX, "更新属性值失败", e);
    }
}

// 更新锁定按钮状态
function updateLockButtonStatus() {
    try {
        // 更新基础属性的锁定按钮
        var statusToCheck = ['life', 'hunger', 'thirst', 'energy', 'san', 'radiation'];
        for (var i in statusToCheck) {
            var status = statusToCheck[i];
            var lockBtn = $("#lock_" + status);
            
            if (lockBtn.length > 0) {
                if (LOCKED_STATUS[status]) {
                    $(lockBtn).text("🔒");
                    $(lockBtn).addClass("locked");
                } else {
                    $(lockBtn).text("🔓");
                    $(lockBtn).removeClass("locked");
                }
            }
        }
    } catch(e) {
        console.error(CHEAT_LOG_PREFIX, "更新锁定按钮状态失败", e);
    }
}

// 创建属性修改部分
function createAttributeSection() {
    try {
        var section = newElement("div", "", "cheatSection", "cheatSection", "<h3>属性修改</h3>");
        
            // 快捷按钮区域
    var quickButtons = newElement("div", "", "cheatQuickButtons", "cheatQuickButtons", "");
    
    // 添加基础属性最大化按钮
    var maxStatusBtn = newElement("button", "", "", "btn btn-primary", "最大化状态");
    $(maxStatusBtn).click(function() {
        window.cheat.maxStatus();
        updateAllAttributeValues();
    });
    $(quickButtons).append(maxStatusBtn);
    
    // 添加特殊属性最大化按钮
    var maxSpecialBtn = newElement("button", "", "", "btn btn-success", "最大化特殊属性");
    $(maxSpecialBtn).click(function() {
        window.cheat.maxSpecial();
        updateAllAttributeValues();
    });
    $(quickButtons).append(maxSpecialBtn);
    
    // 添加锁定状态按钮
    var lockStatusBtn = newElement("button", "", "", "btn btn-warning", "锁定状态");
    $(lockStatusBtn).click(function() {
        window.cheat.lockStatus();
        updateAllAttributeValues();
        // 更新锁定按钮状态
        updateLockButtonStatus();
    });
    $(quickButtons).append(lockStatusBtn);
    
    // 添加解锁全部按钮
    var unlockAllBtn = newElement("button", "", "", "btn btn-danger", "解锁全部");
    $(unlockAllBtn).click(function() {
        window.cheat.unlockAll();
        updateAllAttributeValues();
        // 更新锁定按钮状态
        updateLockButtonStatus();
    });
    $(quickButtons).append(unlockAllBtn);
        
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
    } catch(e) {
        console.error(CHEAT_LOG_PREFIX, "创建属性区域失败", e);
    }
}

// 创建属性行
function createAttributeRow(attr, name) {
    try {
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
        
        // 锁定按钮（只为基础属性添加）
        if ($.inArray(attr, ['life', 'hunger', 'thirst', 'energy', 'san', 'radiation']) !== -1) {
            var lockBtn = newElement("button", "lock_" + attr, "", "btn btn-xs btn-default lockBtn", "🔓");
            
            // 设置初始状态
            if (LOCKED_STATUS[attr]) {
                $(lockBtn).text("🔒");
                $(lockBtn).addClass("locked");
            }
            
            // 绑定锁定/解锁事件
            $(lockBtn).click(function() {
                if (LOCKED_STATUS[attr]) {
                    // 解锁
                    delete LOCKED_STATUS[attr];
                    $(this).text("🔓");
                    $(this).removeClass("locked");
                    console.log(CHEAT_LOG_PREFIX, `已解锁 ${PLAYER_STATUS[attr].name} 属性`);
                } else {
                    // 锁定
                    LOCKED_STATUS[attr] = true;
                    $(this).text("🔒");
                    $(this).addClass("locked");
                    console.log(CHEAT_LOG_PREFIX, `已锁定 ${PLAYER_STATUS[attr].name} 属性`);
                }
            });
            
            $(row).append(lockBtn);
        }
        
        return row;
    } catch(e) {
        console.error(CHEAT_LOG_PREFIX, "创建属性行失败", e);
        return document.createElement("div");
    }
}

// 为后续功能预留占位区域
function createPlaceholderSections() {
    try {
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
            </ul>
        `);
        $(consoleSection).append(consoleHelp);
        $("#cheatPanel").append(consoleSection);
    } catch(e) {
        console.error(CHEAT_LOG_PREFIX, "创建占位区域失败", e);
    }
}

// 修改属性值
function modifyAttribute(attr, value) {
    try {
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
    } catch(e) {
        console.error(CHEAT_LOG_PREFIX, "修改属性失败", e);
    }
}

// 添加金手指样式
function addCheatStyles() {
    try {
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
        z-index: 9999999;
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
        z-index: 9999999;
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
    
    .lockBtn {
        width: 30px;
        margin-left: 2px !important;
    }
    
    .lockBtn.locked {
        background-color: #ff9900;
        color: #000;
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
        console.log(CHEAT_LOG_PREFIX, "样式添加完成");
    } catch(e) {
        console.error(CHEAT_LOG_PREFIX, "添加样式失败", e);
    }
}

// 在页面加载完成后初始化金手指
$(document).ready(function() {
    console.log(CHEAT_LOG_PREFIX, "等待游戏加载...");
    
    // 定期检查游戏是否已加载
    var checkInterval = setInterval(function() {
        if (typeof PLAYER_STATUS !== "undefined" && typeof STATUS_LIST !== "undefined") {
            console.log(CHEAT_LOG_PREFIX, "游戏已加载，初始化金手指...");
            initCheat();
            clearInterval(checkInterval);
        }
    }, 1000);
    
    // 监听游戏状态变化 - 关键修改点
    $(document).on('click', '#startBtn', function() {
        console.log(CHEAT_LOG_PREFIX, "检测到游戏开始，确保金手指可用...");
        // 先隐藏面板，避免在角色创建过程中干扰
        if ($("#cheatPanel").is(":visible")) {
            $("#cheatPanel").hide();
        }
    });
    
    // 监听确认角色按钮点击
    $(document).on('click', '.modal-footer .btn-primary, .modal-footer .btn-success', function() {
        console.log(CHEAT_LOG_PREFIX, "检测到确认按钮点击，准备重新初始化金手指...");
        
        // 延迟执行，确保在游戏界面加载后再初始化
        setTimeout(function() {
            console.log(CHEAT_LOG_PREFIX, "游戏界面已加载，重新初始化金手指...");
            
            // 移除可能存在的旧UI元素
            $("#cheatEmojiBtn").remove();
            $("#cheatPanel").remove();
            
            // 重新初始化
            initCheat();
            
            // 确保面板初始状态为隐藏
            $("#cheatPanel").hide();
            
            // 将金手指按钮和面板移动到body最后，确保在最上层
            $("body").append($("#cheatEmojiBtn"));
            $("body").append($("#cheatPanel"));
            
            console.log(CHEAT_LOG_PREFIX, "金手指已重新初始化并移至顶层");
        }, 2000);
    });
    
    // 监听游戏内所有可能的界面变化
    var observeDOM = (function(){
        var MutationObserver = window.MutationObserver || window.WebKitMutationObserver;
        
        return function(obj, callback){
            if(!obj || obj.nodeType !== 1) return; 
            
            if(MutationObserver){
                var mutationObserver = new MutationObserver(callback);
                mutationObserver.observe(obj, {childList: true, subtree: true});
                return mutationObserver;
            } else if(window.addEventListener){
                obj.addEventListener('DOMNodeInserted', callback, false);
                obj.addEventListener('DOMNodeRemoved', callback, false);
            }
        };
    })();
    
    // 监听body变化，确保金手指始终可用
    observeDOM(document.body, function(mutations) {
        // 检查金手指按钮是否存在
        if ($("#cheatEmojiBtn").length === 0 && typeof PLAYER_STATUS !== "undefined") {
            console.log(CHEAT_LOG_PREFIX, "检测到DOM变化，金手指按钮丢失，重新初始化...");
            
            // 重新初始化
            initCheat();
            
            // 将金手指按钮和面板移动到body最后，确保在最上层
            $("body").append($("#cheatEmojiBtn"));
            $("body").append($("#cheatPanel"));
        }
    });
    
    // 添加全局快捷键 (Alt+X) 来切换金手指面板
    $(document).keydown(function(e) {
        // Alt+X
        if (e.altKey && e.which === 88) {
            e.preventDefault(); // 阻止默认行为
            console.log(CHEAT_LOG_PREFIX, "检测到快捷键Alt+X，切换金手指面板");
            
            // 检查金手指按钮是否存在，如果不存在则重新初始化
            if ($("#cheatEmojiBtn").length === 0) {
                console.log(CHEAT_LOG_PREFIX, "金手指按钮不存在，重新初始化...");
                initCheat();
                
                // 将金手指按钮和面板移动到body最后，确保在最上层
                $("body").append($("#cheatEmojiBtn"));
                $("body").append($("#cheatPanel"));
            }
            
            if (typeof window.cheat !== "undefined") {
                window.cheat.toggle();
            } else if (CHEAT_ENABLED) {
                toggleCheatPanel();
            } else {
                console.log(CHEAT_LOG_PREFIX, "金手指未初始化，尝试初始化...");
                initCheat();
                setTimeout(function() {
                    toggleCheatPanel();
                }, 500);
            }
        }
    });
});