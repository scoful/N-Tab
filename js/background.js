console.log("background is done!");

// 定义倒计时文字容器
var surplusTime;
// 定义一个 一次执行定时器
var timeoutId;
// 定义一个桌面通知框id
var notificationId;
window.onload = function () {
    console.log("load完window了");
}

// 一load完就加载jq，并获取tab数量显示在pop的badge上
document.addEventListener('DOMContentLoaded', function () {
    console.log("load完background了");
    var script = document.createElement('script');
    script.src = "js/jquery-2.2.2.min.js";
    document.head.appendChild(script);
    // 获取tab数量并在pop上显示
    chrome.tabs.query({ currentWindow: true }, function (tab) {
        chrome.browserAction.setBadgeText({ text: tab.length + "" });
        chrome.browserAction.setBadgeBackgroundColor({ color: [255, 0, 0, 255] });
    });
    chrome.storage.local.get(function (storage) {
        console.log(storage);
    });
    var intervalId = setInterval(code, delay);// todo

});


// 调用有道翻译api
function translateFunc(txt) {
    console.log("开始翻译！");
    var url = "https://fanyi.youdao.com/openapi.do?keyfrom=lulua-net&key=620584095&type=data&doctype=json&version=1.1&q=" + txt;
    $.ajax({
        type: "GET",
        url: url,
        success: function (data, status) {
            if (status == "success") {
                console.log(data.translation[0]);
                sendMessageToContentScript("translateResult", data.translation[0]);
            } else {
                sendMessageToContentScript("translateResult", "HELP!!!");
            }
        },
        error: function (xhr, errorText, errorType) {
            sendMessageToContentScript("translateResult", "HELP!!!可能断网了");
        },
        complete: function () {
            //do something
        }
    })
};

// 持续监听发送给background的消息
chrome.runtime.onMessage.addListener(function (req, sender, sendRes) {
    switch (req.action) {
        case 'translate': // 翻译
            translateFunc(req.message);
            sendRes('ok'); // acknowledge
            break;
        case 'save-all': // 保存所有tab
            if (req.tabsArr.length > 0) {
                saveTabs(req.tabsArr);
                openBackgroundPage();
                closeTabs(req.tabsArr);
            } else {
                openBackgroundPage();
            }
            sendRes('ok'); // acknowledge
            break;
        case 'openbackgroundpage': // 打开展示页
            openBackgroundPage();
            sendRes('ok'); // acknowledge
            break;
        case 'save-current': // 保存当前tab
            if (req.tabsArr.length > 0) {
                saveTabs(req.tabsArr);
                openBackgroundPage();
                closeTabs(req.tabsArr);
            } else {
                openBackgroundPage();
            }
            sendRes('ok'); // acknowledge
            break;
        case 'save-others': // 保存其他tab
            if (req.tabsArr.length > 0) {
                saveTabs(req.tabsArr);
                openBackgroundPage();
                closeTabs(req.tabsArr);
            } else {
                openBackgroundPage();
            }
            sendRes('ok'); // acknowledge
            break;
        case 'five-minute': // 5分钟后提醒
            remind(5);
            sendRes('ok'); // acknowledge
            break;
        case 'ten-minute': // 10分钟后提醒
            remind(10);
            sendRes('ok'); // acknowledge
            break;
        case 'forty-minute': // 40分钟后提醒
            remind(40);
            sendRes('ok'); // acknowledge
            break;
        case 'custom-minute': // 自定义分钟后提醒
            remind(Number(req.message));
            sendRes('ok'); // acknowledge
            break;
        case 'command-x': // todo，没有触发入口
            closeCurrentTab();
            sendRes('ok'); // acknowledge
            break;
        case 'command-X': // todo，没有触发入口
            restartLastClosedTab();
            sendRes('ok'); // acknowledge
            break;
        default:
            sendRes('nope'); // acknowledge
            break;
    }
});


// 向content-script主动发送消息
function sendMessageToContentScript(action, message) {
    chrome.tabs.query({ active: true, currentWindow: true }, function (res) {
        chrome.tabs.sendMessage(res[0].id, { action: action, message: message }, function (response) {
            if (response === 'ok') {
                console.log("background-->content发送的消息被消费了");
            }
        });
    });
}

// 持续监听，当tab被激活的时候刷新一下pop上badge的tab的数量
chrome.tabs.onActivated.addListener(function callback() {
    chrome.tabs.query({}, function (tab) {
        chrome.browserAction.setBadgeText({ text: tab.length + "" });
        chrome.browserAction.setBadgeBackgroundColor({ color: [255, 0, 0, 255] });
    });
});
// 持续监听，当tab被关闭的时候刷新一下pop上badge的tab的数量
chrome.tabs.onRemoved.addListener(function callback() {
    chrome.tabs.query({}, function (tab) {
        chrome.browserAction.setBadgeText({ text: tab.length + "" });
        chrome.browserAction.setBadgeBackgroundColor({ color: [255, 0, 0, 255] });
    });
});
// 持续监听，当tab被创建的时候刷新一下pop上badge的tab的数量
chrome.tabs.onCreated.addListener(function callback() {
    chrome.tabs.query({}, function (tab) {
        chrome.browserAction.setBadgeText({ text: tab.length + "" });
        chrome.browserAction.setBadgeBackgroundColor({ color: [255, 0, 0, 255] });
    });
});

// 生成唯一标识
// refer: https://gist.github.com/solenoid/1372386
var genObjectId = function () {
    var timestamp = (new Date().getTime() / 1000 | 0).toString(16);
    return timestamp + 'xxxxxxxxxxxxxxxx'.replace(/[x]/g, function () {
        return (Math.random() * 16 | 0).toString(16);
    }).toLowerCase();
};

// makes a tab group, filters it and saves it to localStorage
function saveTabs(tabsArr) {
    var tabGroup = makeTabGroup(tabsArr),
        cleanTabGroup = filterTabGroup(tabGroup);

    saveTabGroup(cleanTabGroup);
}

// from the array of Tab objects it makes an object with date and the array
function makeTabGroup(tabsArr) {
    var date;
    date = dateFormat("YYYY-mm-dd HH:MM:SS", new Date());
    var tabGroup = {
        date: date,
        id: genObjectId() // clever way to quickly get a unique ID
    };
    let res = tabsArr.map(({ title, url }) => ({ title, url }));
    tabGroup.tabs = res;

    return tabGroup;
}

// filters tabGroup for stuff like pinned tabs, chrome:// tabs, etc.
function filterTabGroup(tabGroup) {
    return tabGroup;
}

// saves array (of Tab objects) to localStorage
function saveTabGroup(tabGroup) {
    getShardings(function (callback) {
        if (!callback || typeof callback == 'undefined' || callback == undefined) {
            saveShardings([tabGroup], "object");
        } else {
            var newArr = callback;
            newArr.unshift(tabGroup);
            saveShardings(newArr, "object");
        }
    })
}

// 打开background页
function openBackgroundPage() {
    chrome.tabs.query({ url: "chrome-extension://*/workbench.html*", currentWindow: true }, function (tab) {
        if (tab.length >= 1) {
            chrome.tabs.move(tab[0].id, { index: 0 }, function callback() {
                chrome.tabs.highlight({ tabs: 0 }, function callback() {
                });
            });
            chrome.tabs.reload(tab[0].id, {}, function (tab) {
            });
        } else {
            chrome.tabs.create({ index: 0, url: chrome.extension.getURL('workbench.html') });
        }
    });
}

// close all the tabs in the provided array of Tab objects
function closeTabs(tabsArr) {
    var tabsToClose = [],
        i;

    for (i = 0; i < tabsArr.length; i += 1) {
        tabsToClose.push(tabsArr[i].id);
    }

    chrome.tabs.remove(tabsToClose, function () {
        if (chrome.runtime.lastError) {
            console.error(chrome.runtime.lastError);
        }
    });
}

// 创建右键菜单，发送当前tab
chrome.contextMenus.create({
    title: "发射当前tab",
    onclick: function () {
        chrome.tabs.query({ url: ["https://*/*", "http://*/*"], active: true, currentWindow: true }, function (tabsArr) {
            if (tabsArr.length > 0) {
                saveTabs(tabsArr);
                openBackgroundPage();
                closeTabs(tabsArr);
            } else {
                openBackgroundPage();
            }
        });
    }
});

// 定时提醒
function remind(minute) {
    if (typeof (surplusTime) === "undefined") {
        notificationId = genObjectId();
        setTimeout(() => {
            chrome.notifications.create(notificationId, {
                type: 'basic',
                iconUrl: 'images/favicon.png',
                title: 'TIME UP',
                message: minute + '分钟时间到了！',
                buttons: [{ "title": "关闭" }],
                requireInteraction: true
            });
            // 时间到，清除定时器
            clearTimeout(timeoutId);
            surplusTime = undefined;
        }, minute * 60 * 1000);
        var endDateStr = new Date();
        var min = endDateStr.getMinutes();
        endDateStr.setMinutes(min + minute);
        endDateStr.toLocaleString();
        timeDown(endDateStr);
    } else {
        alert("当前正在倒计时！一次只能倒计时一个");
    }
}

// 倒计时
function timeDown(endDateStr) {
    //结束时间
    var endDate = new Date(endDateStr);
    //当前时间
    var nowDate = new Date();
    //相差的总秒数
    var totalSeconds = parseInt((endDate - nowDate) / 1000);
    //天数
    var days = Math.floor(totalSeconds / (60 * 60 * 24));
    //取模（余数）
    var modulo = totalSeconds % (60 * 60 * 24);
    //小时数
    var hours = Math.floor(modulo / (60 * 60));
    modulo = modulo % (60 * 60);
    //分钟
    var minutes = Math.floor(modulo / 60);
    //秒
    var seconds = modulo % 60;
    surplusTime = "还剩:" + days + "天" + hours + "小时" + minutes + "分钟" + seconds + "秒";
    //延迟一秒执行自己
    timeoutId = setTimeout(function () {
        timeDown(endDateStr);
    }, 1000)

}

// 判断是否int
function isInt(i) {
    return typeof i == "number" && !(i % 1) && !isNaN(i);
}

// 日期格式化
function dateFormat(fmt, date) {
    let ret;
    let opt = {
        "Y+": date.getFullYear().toString(),        // 年
        "m+": (date.getMonth() + 1).toString(),     // 月
        "d+": date.getDate().toString(),            // 日
        "H+": date.getHours().toString(),           // 时
        "M+": date.getMinutes().toString(),         // 分
        "S+": date.getSeconds().toString()          // 秒
        // 有其他格式化字符需求可以继续添加，必须转化成字符串
    };
    for (let k in opt) {
        ret = new RegExp("(" + k + ")").exec(fmt);
        if (ret) {
            fmt = fmt.replace(ret[1], (ret[1].length == 1) ? (opt[k]) : (opt[k].padStart(ret[1].length, "0")));
        };
    };
    return fmt;
}

// 关闭当前tab
function closeCurrentTab() {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabsArr) {
        chrome.storage.local.set({ 'xCommandUrl': tabsArr[0].url });
        chrome.tabs.remove(tabsArr[0].id, function () { });
    });
}

// 重新打开最后一次关闭的tab
function restartLastClosedTab() {
    chrome.storage.local.get('xCommandUrl', function (storage) {
        if (storage.xCommandUrl) {
            chrome.tabs.create({ index: 0, url: storage.xCommandUrl });
        }
    });
}

// 用分片的思想去存storage，因为sync的总量太小了，只有102400byte=8k，所以改成local，有5m。
function saveShardings(tabGroup, type) {
    var tabGroupStr;
    if (type == "object") {
        tabGroupStr = JSON.stringify(tabGroup);
    } else if (type == "string") {
        tabGroupStr = tabGroup;
    }
    var length = tabGroupStr.length;
    var sliceLength = 102400;
    var tabGroupSlices = {}; // 保存分片数据
    var i = 0; // 分片序号

    // 分片保存数据
    while (length > 0) {
        tabGroupSlices["tabGroups_" + i] = tabGroupStr.substr(i * sliceLength, sliceLength);
        length -= sliceLength;
        i++;
    }

    // 保存分片数量
    tabGroupSlices["tabGroups_num"] = i;

    // 写入Storage
    chrome.storage.local.set(tabGroupSlices);

}

// 获取storage里的数据
function getShardings(cb) {
    chrome.storage.local.get(null, function (items) {
        var tabGroupsStr = "";
        if (items.tabGroups_num >= 1) {
            // 把分片数据组成字符串
            for (var i = 0; i < items.tabGroups_num; i++) {
                tabGroupsStr += items["tabGroups_" + i];
            }
            cb(JSON.parse(tabGroupsStr));
        } else {
            cb();
        }
    });
}

// 持续监听通知框的按钮点击事件，点了就清除通知框
chrome.notifications.onButtonClicked.addListener(function callback(notificationId, buttonIndex) {
    chrome.notifications.clear(notificationId, function callback() {
    });
});