// cheat.js - 增强版金手指功能模块
// 适用于GitHub Pages部署

// 全局变量
var CHEAT_ENABLED = false;
var CHEAT_LOG_PREFIX = "🎮 金手指:";
var LOCKED_STATUS = {}; // 存储被锁定的属性
var WHITE_MODE_ENABLED = false; // 白嫖模式开关
var ORIGINAL_BAG_CAP = 12; // 原始背包容量

// 在游戏加载完成后初始化金手指
function initCheat() {
    console.log(CHEAT_LOG_PREFIX, "初始化中...");
    try {
        createCheatUI();
        addCheatStyles();
        setupCheatConsole();
        installStatusHook();
        installCraftingHook();
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
            // 检查是否是PLAYER_STATUS且属性被锁定
            if (data === PLAYER_STATUS && LOCKED_STATUS[name]) {
                console.log(CHEAT_LOG_PREFIX, `阻止属性 ${name} 变化，保持锁定值`);
                return; // 属性被锁定，忽略变化
            }
            
            // 否则调用原始函数
            window.originalCaculate(data, name, value);
        };
        
        // 添加定时器监控，确保锁定的属性不会变化
        if (typeof window.lockStatusInterval === 'undefined') {
            window.lockStatusInterval = setInterval(function() {
                // 检查所有锁定的属性
                for (var attr in LOCKED_STATUS) {
                    if (LOCKED_STATUS[attr] && PLAYER_STATUS[attr]) {
                        var currentValue = PLAYER_STATUS[attr].value;
                        var targetValue;
                        
                        // 对于辐射，锁定值为0，其他属性锁定为最大值
                        if (attr === 'radiation') {
                            targetValue = 0;
                        } else {
                            targetValue = PLAYER_STATUS[attr].max || 100;
                        }
                        
                        // 如果当前值不等于目标值，强制设置回来
                        if (currentValue !== targetValue) {
                            // 静默恢复锁定的属性值，不输出日志避免刷屏
                            PLAYER_STATUS[attr].value = targetValue;
                            updateStatus(attr);
                        }
                    }
                }
            }, 1000); // 每秒检查一次
        }
        
        console.log(CHEAT_LOG_PREFIX, "状态钩子已安装，锁定功能已加强");
    } catch(e) {
        console.error(CHEAT_LOG_PREFIX, "安装状态钩子失败", e);
    }
}

// 安装物品制作钩子，实现白嫖模式
function installCraftingHook() {
    try {
        // 保存原始的costMaterialFunc函数
        if (typeof window.originalCostMaterialFunc === 'undefined') {
            window.originalCostMaterialFunc = window.costMaterialFunc;
        }

        // 重写costMaterialFunc函数，添加白嫖模式
        window.costMaterialFunc = function(cost, item, amount) {
            if (WHITE_MODE_ENABLED) {
                console.log(CHEAT_LOG_PREFIX, "白嫖模式: 跳过材料扣除");
                // 白嫖模式：跳过材料扣除，直接执行后续逻辑
                if (TOOL_DATA[item].only) {
                    if (TOOL_DATA[item].upgrade != undefined) {
                        eval(TOOL_DATA[item].upgrade);
                    }
                    if (TOOL_DATA[item].eternal == undefined) {
                        delete TOOL_DATA[item].show;
                        TOOL_FINISHED.push(item);
                    }
                    var newObj = new workbenchObj(mode);
                    newObj.create();
                }
                return;
            }

            // 否则调用原始函数
            window.originalCostMaterialFunc(cost, item, amount);
        };

        console.log(CHEAT_LOG_PREFIX, "物品制作钩子已安装，白嫖模式可用");
    } catch(e) {
        console.error(CHEAT_LOG_PREFIX, "安装物品制作钩子失败", e);
    }
}

// 白嫖模式切换
function toggleWhiteMode() {
    WHITE_MODE_ENABLED = !WHITE_MODE_ENABLED;
    var status = WHITE_MODE_ENABLED ? "开启" : "关闭";
    console.log(CHEAT_LOG_PREFIX, "白嫖模式已" + status);
    showMsg("白嫖模式已" + status);

    // 更新按钮状态
    $("#whiteModeBtn").text(WHITE_MODE_ENABLED ? "关闭白嫖" : "开启白嫖");

    // 重新安装钩子确保生效
    installCraftingHook();
}

// 背包扩容功能
function expandInventory() {
    try {
        // 保存原始容量（如果还没有保存过）
        if (typeof ORIGINAL_BAG_CAP === 'undefined' || ORIGINAL_BAG_CAP === null) {
            ORIGINAL_BAG_CAP = BAG_CAP;
        }

        // 将背包容量设置为999
        BAG_CAP = 999;
        console.log(CHEAT_LOG_PREFIX, "背包容量已扩容至999");
        showMsg("背包容量已扩容至999");
    } catch(e) {
        console.error(CHEAT_LOG_PREFIX, "背包扩容失败", e);
    }
}

// 恢复原始背包容量
function restoreInventory() {
    try {
        if (ORIGINAL_BAG_CAP) {
            BAG_CAP = ORIGINAL_BAG_CAP;
            console.log(CHEAT_LOG_PREFIX, "背包容量已恢复至" + ORIGINAL_BAG_CAP);
            showMsg("背包容量已恢复至" + ORIGINAL_BAG_CAP);
        }
    } catch(e) {
        console.error(CHEAT_LOG_PREFIX, "恢复背包容量失败", e);
    }
}

// 移除所有状态
function removeAllBuffs() {
    try {
        var removedCount = 0;
        for (var buff in PLAYER_STATUS.buff) {
            if (PLAYER_STATUS.buff.hasOwnProperty(buff)) {
                removeBuff(buff);
                removedCount++;
            }
        }
        console.log(CHEAT_LOG_PREFIX, "已移除" + removedCount + "个状态");
        showMsg("已移除" + removedCount + "个状态");
    } catch(e) {
        console.error(CHEAT_LOG_PREFIX, "移除状态失败", e);
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
            console.log("物品操作命令：");
            console.log("  cheat.whiteMode()          - 切换白嫖模式（制作物品不消耗材料）");
            console.log("  cheat.expandBag()          - 将背包容量扩容至999");
            console.log("  cheat.restoreBag()         - 恢复原始背包容量");
            console.log("---------------------------------------");
            console.log("状态操作命令：");
            console.log("  cheat.removeAllBuffs()     - 移除当前所有附加状态");
            console.log("---------------------------------------");
            console.log("使用示例：");
            console.log("  cheat.set('life', 100)     - 将生命值设为100");
            console.log("  cheat.lock('hunger', 100)  - 将饱食度设为100并锁定");
            console.log("  cheat.whiteMode()          - 开启/关闭白嫖模式");
            console.log("  cheat.expandBag()          - 扩容背包至999");
            console.log("  cheat.removeAllBuffs()     - 清除所有状态");
            console.log("---------------------------------------");
            console.log("UI界面功能：");
            console.log("  - 属性后的🔓/🔒按钮可以锁定/解锁该属性");
            console.log("  - 锁定后的属性不会随时间变化");
            console.log("  - 锁定的属性在listAttrs()中会显示🔒标记");
            console.log("  - 白嫖模式按钮可以直接在UI中开启/关闭");
            console.log("  - 背包扩容按钮可以立即扩容背包");
            console.log("  - 状态操作可以清除所有负面状态");
            console.log("---------------------------------------");
            console.log("快捷键：");
            console.log("  Alt+X                     - 切换金手指面板");
            console.log("---------------------------------------");
            console.log("注意事项：");
            console.log("  1. 属性名必须用引号括起来，例如 'life'");
            console.log("  2. 锁定功能通过拦截游戏内属性变化实现");
            console.log("  3. 白嫖模式会跳过材料扣除，直接获得物品");
            console.log("  4. 背包扩容会修改BAG_CAP变量，可能影响游戏平衡");
            console.log("  5. 移除状态功能会清除所有buff，包括有益状态");
            console.log("  6. 如果金手指面板不显示，可以使用快捷键或刷新页面");
            console.log("金手指控制台已加载 🎮");
        };
        
        // 显示金手指状态
        window.cheat.status = function() {
            console.log(CHEAT_LOG_PREFIX, "状态:", CHEAT_ENABLED ? "已启用 ✅" : "未启用 ❌");
            console.log(CHEAT_LOG_PREFIX, "面板:", $("#cheatPanel").is(":visible") ? "显示中 👁️" : "已隐藏 🙈");
            console.log(CHEAT_LOG_PREFIX, "白嫖模式:", WHITE_MODE_ENABLED ? "已开启 🎁" : "已关闭 🚫");
            console.log(CHEAT_LOG_PREFIX, "背包容量:", BAG_CAP);
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
            
            // 清除锁定状态监控定时器
            if (typeof window.lockStatusInterval !== 'undefined') {
                clearInterval(window.lockStatusInterval);
                window.lockStatusInterval = undefined;
                console.log(CHEAT_LOG_PREFIX, "已清除锁定状态监控定时器");
            }
            
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

        // 白嫖模式切换
        window.cheat.whiteMode = function() {
            toggleWhiteMode();
        };

        // 背包扩容
        window.cheat.expandBag = function() {
            expandInventory();
        };

        // 恢复背包容量
        window.cheat.restoreBag = function() {
            restoreInventory();
        };

        // 移除所有状态
        window.cheat.removeAllBuffs = function() {
            removeAllBuffs();
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
        
        // 基础属性操作区域
        var basicSection = newElement("div", "", "", "cheatSubSection", "");
        
        // 添加基础属性标题和快捷按钮
        var basicHeader = newElement("div", "", "", "cheatSectionHeader", "");
        $(basicHeader).html("<h4 style='display:inline-block;margin-right:10px;'>基础属性</h4>");
        
        // 添加基础属性最大化按钮
        var maxStatusBtn = newElement("button", "", "", "btn btn-primary btn-sm", "最大化状态");
        $(maxStatusBtn).click(function() {
            window.cheat.maxStatus();
            updateAllAttributeValues();
        });
        $(basicHeader).append(maxStatusBtn);
        
        // 添加锁定状态按钮
        var lockStatusBtn = newElement("button", "", "", "btn btn-warning btn-sm", "锁定状态");
        $(lockStatusBtn).click(function() {
            window.cheat.lockStatus();
            updateAllAttributeValues();
            // 更新锁定按钮状态
            updateLockButtonStatus();
        });
        $(basicHeader).append(lockStatusBtn);
        
        // 添加解锁全部按钮
        var unlockAllBtn = newElement("button", "", "", "btn btn-danger btn-sm", "解锁全部");
        $(unlockAllBtn).click(function() {
            window.cheat.unlockAll();
            updateAllAttributeValues();
            // 更新锁定按钮状态
            updateLockButtonStatus();
        });
        $(basicHeader).append(unlockAllBtn);
        
        $(basicSection).append(basicHeader);
        
        // 基础属性行
        for (var i in STATUS_LIST) {
            var status = STATUS_LIST[i];
            var row = createAttributeRow(status, PLAYER_STATUS[status].name);
            $(basicSection).append(row);
        }
        $(section).append(basicSection);
        
        // 特殊属性修改
        var specialSection = newElement("div", "", "", "cheatSubSection", "");
        
        // 添加特殊属性标题和按钮
        var specialHeader = newElement("div", "", "", "cheatSectionHeader", "");
        $(specialHeader).html("<h4 style='display:inline-block;margin-right:10px;'>特殊属性</h4>");
        
        // 添加特殊属性最大化按钮
        var maxSpecialBtn = newElement("button", "", "", "btn btn-success btn-sm", "最大化特殊属性");
        $(maxSpecialBtn).click(function() {
            window.cheat.maxSpecial();
            updateAllAttributeValues();
        });
        $(specialHeader).append(maxSpecialBtn);
        
        $(specialSection).append(specialHeader);
        
        // 特殊属性行
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
        
        // 判断是基础属性还是特殊属性
        var isBasicStatus = $.inArray(attr, ['life', 'hunger', 'thirst', 'energy', 'san', 'radiation']) !== -1;
        
        if (isBasicStatus) {
            // 基础属性使用"最大"按钮
            var maxBtn = newElement("button", "", "", "btn btn-xs btn-default", "最大");
            $(maxBtn).click(function() {
                var max = PLAYER_STATUS[attr].max || 100;
                // 辐射特殊处理
                if (attr === 'radiation') {
                    max = 0;
                }
                $("#attr_" + attr).val(max);
                modifyAttribute(attr, max);
            });
            $(row).append(maxBtn);
            
            // 锁定按钮（只为基础属性添加）
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
        } else {
            // 特殊属性使用"+10"和"最大"按钮
            var plus10Btn = newElement("button", "", "", "btn btn-xs btn-info", "+10");
            $(plus10Btn).click(function() {
                var currentValue = parseInt($("#attr_" + attr).val()) || 0;
                var newValue = currentValue + 10;
                $("#attr_" + attr).val(newValue);
                modifyAttribute(attr, newValue);
            });
            $(row).append(plus10Btn);
            
            var maxBtn = newElement("button", "", "", "btn btn-xs btn-default", "最大");
            $(maxBtn).click(function() {
                var max = PLAYER_STATUS[attr].max || 999;
                $("#attr_" + attr).val(max);
                modifyAttribute(attr, max);
            });
            $(row).append(maxBtn);
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
        // 物品操作
        var itemSection = newElement("div", "", "cheatSection", "cheatSection", "<h3>物品操作</h3>");
        var itemControls = newElement("div", "", "", "itemControls", "");

        // 白嫖模式按钮
        var whiteModeBtn = newElement("button", "whiteModeBtn", "", "btn btn-primary cheatBtn", WHITE_MODE_ENABLED ? "关闭白嫖" : "开启白嫖");
        $(whiteModeBtn).click(function() {
            toggleWhiteMode();
        });
        $(itemControls).append(whiteModeBtn);

        // 背包扩容按钮
        var expandBagBtn = newElement("button", "", "", "btn btn-success cheatBtn", "背包扩容至999");
        $(expandBagBtn).click(function() {
            expandInventory();
            $(this).text("已扩容 (" + BAG_CAP + ")");
            $(this).prop("disabled", true);
            setTimeout(function() {
                $(expandBagBtn).text("恢复原始容量");
                $(expandBagBtn).prop("disabled", false);
                $(expandBagBtn).removeClass("btn-success").addClass("btn-warning");
                $(expandBagBtn).unbind("click").click(function() {
                    restoreInventory();
                    $(expandBagBtn).text("背包扩容至999");
                    $(expandBagBtn).removeClass("btn-warning").addClass("btn-success");
                });
            }, 1000);
        });
        $(itemControls).append(expandBagBtn);

        $(itemSection).append(itemControls);
        $("#cheatPanel").append(itemSection);
        
        // 状态操作
        var statusSection = newElement("div", "", "cheatSection", "cheatSection", "<h3>状态操作</h3>");
        var statusControls = newElement("div", "", "", "statusControls", "");

        // 移除所有状态按钮
        var removeBuffsBtn = newElement("button", "", "", "btn btn-danger cheatBtn", "移除所有状态");
        $(removeBuffsBtn).click(function() {
            removeAllBuffs();
            $(this).text("已清除状态");
            setTimeout(function() {
                $(removeBuffsBtn).text("移除所有状态");
            }, 2000);
        });
        $(statusControls).append(removeBuffsBtn);

        $(statusSection).append(statusControls);
        $("#cheatPanel").append(statusSection);

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
                <li><code>cheat.help()</code> - 显示所有命令</li>
                <li><code>cheat.status()</code> - 显示金手指状态</li>
                <li><code>cheat.whiteMode()</code> - 切换白嫖模式</li>
                <li><code>cheat.expandBag()</code> - 扩容背包</li>
                <li><code>cheat.removeAllBuffs()</code> - 清除状态</li>
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
        
        .cheatSectionHeader {
            display: flex;
            align-items: center;
            margin-bottom: 8px;
            padding-bottom: 5px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        .cheatSectionHeader button {
            margin-left: 5px;
            padding: 2px 5px;
            font-size: 11px;
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
            margin-bottom: 15px;
            padding: 8px;
            background-color: rgba(255, 255, 255, 0.05);
            border-radius: 3px;
            border-left: 3px solid rgba(255, 204, 0, 0.5);
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

        /* 新功能按钮样式 */
        .cheatBtn {
            margin: 3px 2px !important;
            padding: 6px 10px !important;
            font-size: 12px !important;
            border-radius: 3px !important;
            min-width: 80px !important;
        }

        .itemControls, .statusControls {
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
            gap: 5px;
            margin-top: 10px;
        }

        .itemControls button, .statusControls button {
            flex: 1;
            min-width: 120px;
            max-width: 140px;
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