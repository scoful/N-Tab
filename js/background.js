console.log("background is done!");

// 倒计时文字
var surplusTime;
// 定义一个一次执行定时器
var timeoutId;
window.onload = function () {
    console.log("load完window了")
}


document.addEventListener('DOMContentLoaded', function () {
    console.log("load完background了")
    var script = document.createElement('script');
    script.src = "js/jquery-2.2.2.min.js";
    document.head.appendChild(script);
    chrome.tabs.query({ currentWindow: true }, function (tab) {
        chrome.browserAction.setBadgeText({ text: tab.length + "" });
        chrome.browserAction.setBadgeBackgroundColor({ color: [255, 0, 0, 255] });
    });
    chrome.storage.sync.get(function (storage) {
        console.log(storage)
    });
});


// 翻译
function translateFunc(txt) {
    console.log("开始翻译！")
    var url = "https://fanyi.youdao.com/openapi.do?keyfrom=lulua-net&key=620584095&type=data&doctype=json&version=1.1&q=" + txt;
    $.ajax({
        type: "GET",
        url: url,
        success: function (data, status) {
            if (status == "success") {
                console.log(data.translation[0]);
                sendMessageToContentScript("translateResult", data.translation[0])
            } else {
                sendMessageToContentScript("translateResult", "HELP!!!")
            }
        },
        error: function (xhr, errorText, errorType) {
            sendMessageToContentScript("translateResult", "HELP!!!可能断网了")
        },
        complete: function () {
            //do something
        }
    })
};

// 持续监听发送给background的消息
chrome.runtime.onMessage.addListener(function (req, sender, sendRes) {
    switch (req.action) {
        case 'translate':
            console.log(req.message)
            translateFunc(req.message)
            sendRes('ok'); // acknowledge
            break;
        case 'save-all':
            console.log(req.tabsArr)
            if (req.tabsArr.length > 0) {
                saveTabs(req.tabsArr);
                openBackgroundPage(); // opening now so window doesn't close
                closeTabs(req.tabsArr);
            } else {
                openBackgroundPage(); // opening now so window doesn't close
            }
            sendRes('ok'); // acknowledge
            break;
        case 'openbackgroundpage':
            openBackgroundPage();
            sendRes('ok'); // acknowledge
            break;
        case 'save-current':
            console.log(req.tabsArr)
            if (req.tabsArr.length > 0) {
                saveTabs(req.tabsArr);
                openBackgroundPage(); // opening now so window doesn't close
                closeTabs(req.tabsArr);
            } else {
                openBackgroundPage(); // opening now so window doesn't close
            }
            sendRes('ok'); // acknowledge
            break;
        case 'save-others':
            console.log(req.tabsArr)
            if (req.tabsArr.length > 0) {
                saveTabs(req.tabsArr);
                openBackgroundPage(); // opening now so window doesn't close
                closeTabs(req.tabsArr);
            } else {
                openBackgroundPage(); // opening now so window doesn't close
            }
            sendRes('ok'); // acknowledge
            break;
        case 'five-minute':
            remind(5);
            sendRes('ok'); // acknowledge
            break;
        case 'ten-minute':
            remind(10);
            sendRes('ok'); // acknowledge
            break;
        case 'forty-minute':
            remind(40);
            sendRes('ok'); // acknowledge
            break;
        case 'custom-minute':
            console.log(req.minute)
            remind(Number(req.minute));
            sendRes('ok'); // acknowledge
            break;
        case 'command-x':
            closeCurrentTab()
            sendRes('ok'); // acknowledge
            break;
        case 'command-X':
            restartLastClosedTab()
            sendRes('ok'); // acknowledge
            break;
        case 'test':
            test();
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
                console.log("background-->content发送的消息被消费了")
            }
        });
    });
}

// 实现在图标上显示当前打开了多少标签
chrome.tabs.onActivated.addListener(function callback() {
    chrome.tabs.query({}, function (tab) {
        chrome.browserAction.setBadgeText({ text: tab.length + "" });
        chrome.browserAction.setBadgeBackgroundColor({ color: [255, 0, 0, 255] });
    });
});
chrome.tabs.onRemoved.addListener(function callback() {
    chrome.tabs.query({}, function (tab) {
        chrome.browserAction.setBadgeText({ text: tab.length + "" });
        chrome.browserAction.setBadgeBackgroundColor({ color: [255, 0, 0, 255] });
    });
});
chrome.tabs.onCreated.addListener(function callback() {
    chrome.tabs.query({}, function (tab) {
        chrome.browserAction.setBadgeText({ text: tab.length + "" });
        chrome.browserAction.setBadgeBackgroundColor({ color: [255, 0, 0, 255] });
    });
});


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
    date = dateFormat("YYYY-mm-dd HH:MM:SS", new Date())
    console.log(date)
    var tabGroup = {
        date: date,
        // id: Date.now() // clever way to quickly get a unique ID
        id: genObjectId() // clever way to quickly get a unique ID
    };
    let res = tabsArr.map(({ title, url, favIconUrl }) => ({ title, url, favIconUrl }))
    console.log(res)
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
            console.log("没有值")
            saveShardings([tabGroup], "object")
        } else {
            console.log(callback)
            var newArr = callback
            newArr.push(tabGroup);
            // newArr.reverse();
            saveShardings(newArr, "object")
        }
    })
}

function openBackgroundPage() {
    chrome.tabs.query({ url: "chrome-extension://*/workbench.html*", currentWindow: true }, function (tab) {
        if (tab.length >= 1) {
            chrome.tabs.move(tab[0].id, { index: 0 }, function callback() {
                chrome.tabs.highlight({ tabs: 0 }, function callback() {
                });
            });
            chrome.tabs.reload(tab[0].id, {}, function (tab) {
                console.log("刷新一下！")
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
            console.error(chrome.runtime.lastError)
        }
    });
}

chrome.contextMenus.create({
    title: "发射当前tab",
    onclick: function () {
        chrome.tabs.query({ url: ["https://*/*", "http://*/*"], active: true, currentWindow: true }, function (tabsArr) {
            console.log(tabsArr)
            if (tabsArr.length > 0) {
                saveTabs(tabsArr);
                openBackgroundPage(); // opening now so window doesn't close
                closeTabs(tabsArr);
            } else {
                openBackgroundPage(); // opening now so window doesn't close
            }

        });
    }
});

// 定时提醒
function remind(minute) {
    setTimeout(() => {
        chrome.notifications.create(null, {
            type: 'basic',
            iconUrl: 'images/favicon.png',
            title: 'TIME UP',
            message: minute + '分钟时间到了！',
            requireInteraction: true
        });
        // 时间到，清除定时器
        clearTimeout(timeoutId)
        surplusTime = undefined
    }, minute * 60 * 1000);
    var endDateStr = new Date();
    var min = endDateStr.getMinutes();
    endDateStr.setMinutes(min + minute);
    endDateStr.toLocaleString();
    timeDown(endDateStr)
}

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
    console.log(surplusTime)
    //延迟一秒执行自己
    timeoutId = setTimeout(function () {
        timeDown(endDateStr);
    }, 1000)

}

function isInt(i) {
    return typeof i == "number" && !(i % 1) && !isNaN(i);
}

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
            fmt = fmt.replace(ret[1], (ret[1].length == 1) ? (opt[k]) : (opt[k].padStart(ret[1].length, "0")))
        };
    };
    return fmt;
}

function closeCurrentTab() {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabsArr) {
        chrome.storage.sync.set({ 'xCommandUrl': tabsArr[0].url });
        chrome.tabs.remove(tabsArr[0].id, function () { });
    });
}

function restartLastClosedTab() {
    chrome.storage.sync.get('xCommandUrl', function (storage) {
        console.log(storage)
        if (storage.xCommandUrl) {
            chrome.tabs.create({ index: 0, url: storage.xCommandUrl });
        }
    });

}

function saveShardings(tabGroup, type) {
    var tabGroupStr;
    if (type == "object") {
        tabGroupStr = JSON.stringify(tabGroup);
    } else if (type == "string") {
        tabGroupStr = tabGroup
    }
    var length = tabGroupStr.length;
    var sliceLength = chrome.storage.sync.QUOTA_BYTES_PER_ITEM / 2; // 简单设置每个分片最大长度，保证能存储到
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
    chrome.storage.sync.set(tabGroupSlices);

    console.log(tabGroupSlices);
}

function getShardings(cb) {
    chrome.storage.sync.get(null, function (items) {
        var tabGroupsStr = "";
        if (items.tabGroups_num >= 1) {
            // 把分片数据组成字符串
            for (var i = 0; i < items.tabGroups_num; i++) {
                tabGroupsStr += items["tabGroups_" + i];
            }
            console.log(JSON.parse(tabGroupsStr))
            cb(JSON.parse(tabGroupsStr))
        } else {
            cb()
        }
    });
}



function test() {
    chrome.tabs.highlight({ windowId: 1, tabs: [2] }, function callback() {
        console.log("跳过去！")
        chrome.tabs.update(388, {}, function (tab) {
            console.log("刷新一下！")
        });
    });
}

