/**
 * 实现B站动态转发定时抽奖的小功能，抽取点赞或者转发的用户 （去重）
 * 作者: UP胖虎遛二狗 echonoshy@github.com
 * 使用方法: 
 * 1. 打开动态页面，在浏览器控制台粘贴本代码。
 * 2. 修改 `targetDate` 和 `drawCount` 配置参数，设置抽奖时间和抽奖人数。
 */

// ==================== 配置参数 ====================
const targetDate = new Date("2025-01-10T10:15:00"); // 设置抽奖时间
const drawCount = 3; // 设置抽奖人数
// =================================================

console.log("等待目标时间:", targetDate);

// 定时检查当前时间
const checkTimeInterval = setInterval(() => {
    const now = new Date();
    if (now >= targetDate) {
        clearInterval(checkTimeInterval); // 停止检查
        console.log("到达目标时间，开始抽奖操作！");

        // 执行抽奖逻辑
        startLottery();
    } else {
        console.log(`当前时间: ${now}，距离执行还有 ${(targetDate - now) / 1000} 秒`);
    }
}, 1000); // 每秒检查一次

// 全局变量，用于存储转发和点赞用户
let forwardUsers = new Set(); 
let likeUsers = new Set(); 
let scrollInterval; // 用于控制自动下拉刷新的循环

// 抽奖逻辑函数
function startLottery() {
    console.log("程序开始运行");

    // 自动点击“赞与转发”按钮
    const forwardTab = Array.from(document.querySelectorAll('.bili-tabs__nav__item')).find(el => 
        el.innerText.includes("赞与转发")
    );
    if (forwardTab) {
        forwardTab.click();
        console.log("点击了‘赞与转发’按钮，正在加载转发列表...");
    } else {
        console.error("未找到‘赞与转发’按钮，请检查页面是否正确！");
        return;
    }

    // 启动自动下拉刷新逻辑
    scrollInterval = setInterval(scrollPage, 500);
}

// 自动下拉刷新
function scrollPage() {
    window.scrollBy(0, 1920); // 向下滚动一定距离

    const noMoreIndicator = document.querySelector(".reaction-list__nomore"); // 没有更多数据的指示器
    if (noMoreIndicator) {
        console.log("已到底部，停止下拉刷新");
        clearInterval(scrollInterval); // 停止下拉刷新

        // 开始处理转发用户列表
        processUserList();
    }
}

// 处理转发和点赞用户列表
function processUserList() {
    console.log("开始处理转发和点赞用户列表...");

    const reactionItems = document.getElementsByClassName("reaction-item"); // 替换为实际转发用户列表选择器
    if (!reactionItems || reactionItems.length === 0) {
        console.error("未找到转发项，可能页面数据尚未加载或选择器错误！");
        return;
    }

    for (let i = 0; i < reactionItems.length; i++) {
        let reactionTextElement = reactionItems[i].getElementsByClassName("reaction-item__name")[0];
        if (reactionTextElement && reactionTextElement.innerText.includes("转发了")) {
            let name = reactionTextElement.innerText.replace("转发了", "").trim();
            forwardUsers.add(name);
        }
        if (reactionTextElement && reactionTextElement.innerText.includes("赞了")) {
            let name = reactionTextElement.innerText.replace("赞了", "").trim();
            likeUsers.add(name);
        }
    }

    // 合并转发和点赞的用户，满足其中一个条件的用户都能参与抽奖
    let allUsers = new Set([...forwardUsers, ...likeUsers]);

    console.log("抽奖数据加载完成，总共 " + forwardUsers.size + " 名转发用户，" + likeUsers.size + " 名点赞用户，" + allUsers.size + " 名参与抽奖的用户");
    console.log("用户列表：", Array.from(allUsers));

    // 将合并后的结果覆盖到全局变量
    forwardUsers = allUsers;

    // 随机抽取幸运用户
    drawWinners(drawCount); // 使用配置参数中的抽奖人数
}

// 抽取幸运用户
function drawWinners(num) {
    // 将 forwardUsers 转换为数组，以便操作
    const userArray = Array.from(forwardUsers);

    // 如果抽奖人数大于集合大小，直接限制抽奖人数
    if (num > userArray.length) {
        console.log("抽奖人数大于用户数，自动调整为最大用户数！");
        num = userArray.length;
    }

    // 用于存储已抽取的用户
    const winners = new Set();

    for (let i = 0; i < num; i++) {
        let luckyNum;

        // 直到抽到一个未抽过的用户
        do {
            luckyNum = Math.floor(Math.random() * userArray.length); // 随机生成一个用户索引
        } while (winners.has(luckyNum)); // 如果用户已经被抽取，重新生成

        // 添加到已抽取用户集合
        winners.add(luckyNum);

        // 输出中奖者
        console.log(`🎉 中奖用户: ${userArray[luckyNum]}`);
    }
}
