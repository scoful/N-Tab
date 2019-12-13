console.log("background is done!");

// 定义倒计时文字容器
var surplusTime;
// 定义一个 一次执行定时器
var timeoutId;
// 定义一个桌面通知框id
var notificationId;
var emojiReg = /[\uD83C|\uD83D|\uD83E][\uDC00-\uDFFF][\u200D|\uFE0F]|[\uD83C|\uD83D|\uD83E][\uDC00-\uDFFF]|[0-9|*|#]\uFE0F\u20E3|[0-9|#]\u20E3|[\u203C-\u3299]\uFE0F\u200D|[\u203C-\u3299]\uFE0F|[\u2122-\u2B55]|\u303D|[\A9|\AE]\u3030|\uA9|\uAE|\u3030/gi;
var handleGistLog = new Array();
var gitHubApiUrl = "https://api.github.com";
var giteeApiUrl = "https://gitee.com/api/v5";
var usedSeconds;
var pushToGithubGistStatus;
var pushToGiteeGistStatus;
var githubGistToken;
var giteeGistToken;
var githubGistId;
var giteeGistId;


window.onload = function () {
    console.log("load完window了");
}

// 一load完就加载jq，并获取tab数量显示在pop的badge上
document.addEventListener('DOMContentLoaded', function () {
    console.log("load完background了");
    var script = document.createElement('script');
    script.src = "js/jquery-2.2.2.min.js";
    document.head.appendChild(script);
    var script2 = document.createElement('script');
    script2.src = "js/moment.min.js";
    document.head.appendChild(script2);

    // 获取tab数量并在pop上显示
    chrome.tabs.query({ currentWindow: true }, function (tab) {
        chrome.browserAction.setBadgeText({ text: tab.length + "" });
        chrome.browserAction.setBadgeBackgroundColor({ color: [255, 0, 0, 255] });
    });
    chrome.storage.local.get(function (storage) {
        console.log(storage);
    });

    chrome.alarms.create("checkAutoSyncGitee", { delayInMinutes: 70, periodInMinutes: 70 });
    chrome.alarms.create("checkAutoSyncGithub", { delayInMinutes: 90, periodInMinutes: 90 });

});

// 检查是否同步github的gist
function checkAutoSyncGithub() {
    console.log("检查github是否同步")
    chrome.storage.local.get(null, function (items) {
        var autoSync = items.autoSync
        if (autoSync == true) {
            console.log("autoSync open")
            startPushToGithubGist();
        }
    });
}

// 检查是否同步gitee的gist
function checkAutoSyncGitee() {
    console.log("检查gitee是否同步")
    chrome.storage.local.get(null, function (items) {
        var autoSync = items.autoSync
        if (autoSync == true) {
            console.log("autoSync open")
            startPushToGiteeGist();
        }
    });
}

// 开始推送github的gist
function startPushToGithubGist() {
    console.log("开始推送github")
    handleGistLog.length = 0;
    handleGistLog.push(`${chrome.i18n.getMessage("start")}${moment().format('YYYY-MM-DD HH:mm:ss')}`);
    handleGistLog.push(`${chrome.i18n.getMessage("autoPushToGithubGist")}`)
    chrome.storage.local.get(null, function (storage) {
        console.log(storage.handleGistStatus);
        if (storage.handleGistStatus) {
            console.log("handleGistStatus有值");
            if (storage.handleGistStatus.type == "IDLE") {
                pushToGithubGist();
            } else {
                var time = moment().format('YYYY-MM-DD HH:mm:ss');
                var expireTime = storage.handleGistStatus.expireTime;
                console.log(expireTime)
                if (time > expireTime) {
                    pushToGithubGist();
                } else {
                    handleGistLog.push(storage.handleGistStatus.type)
                    handleGistLog.push(`${chrome.i18n.getMessage("endPushToGithubGistTask")}`)
                    handleGistLog.push(`${chrome.i18n.getMessage("end")}${moment().format('YYYY-MM-DD HH:mm:ss')}`);
                    setHandleGistLog(`${chrome.i18n.getMessage("autoPushGithub")}`);
                }
            }
        } else {
            console.log("handleGistStatus没有值，第一次");
            pushToGithubGist();
        }
    });
}

// 开始推送gitee的gist
function startPushToGiteeGist() {
    console.log("开始推送gitee")
    handleGistLog.length = 0;
    handleGistLog.push(`${chrome.i18n.getMessage("start")}${moment().format('YYYY-MM-DD HH:mm:ss')}`);
    handleGistLog.push(`${chrome.i18n.getMessage("autoPushToGiteeGist")}`)
    chrome.storage.local.get(null, function (storage) {
        console.log(storage.handleGistStatus);
        if (storage.handleGistStatus) {
            console.log("handleGistStatus有值");
            if (storage.handleGistStatus.type == "IDLE") {
                pushToGiteeGist();
            } else {
                var time = moment().format('YYYY-MM-DD HH:mm:ss');
                var expireTime = storage.handleGistStatus.expireTime;
                console.log(expireTime)
                if (time > expireTime) {
                    pushToGiteeGist();
                } else {
                    handleGistLog.push(storage.handleGistStatus.type)
                    handleGistLog.push(`${chrome.i18n.getMessage("endPushToGiteeGistTask")}`)
                    handleGistLog.push(`${chrome.i18n.getMessage("end")}${moment().format('YYYY-MM-DD HH:mm:ss')}`);
                    setHandleGistLog(`${chrome.i18n.getMessage("autoPushGitee")}`);
                }
            }
        } else {
            console.log("handleGistStatus没有值，第一次");
            pushToGiteeGist();
        }
    });
}


// 推送到github的gist
function pushToGithubGist() {
    console.log("推送github")
    setHandleGistStatus(`${chrome.i18n.getMessage("pushToGithubGistIng")}`);
    usedSeconds = 0;
    pushToGithubGistStatus = `${chrome.i18n.getMessage("startPushToGithubGistTask")}`;
    handleGistLog.push(`${chrome.i18n.getMessage("startPushToGithubGistTask")}`)
    if (typeof (pushToGithubGistStatus) != "undefined") {
        intervalId = setInterval(function () {
            if (typeof (pushToGithubGistStatus) != "undefined") {
                usedSeconds++;
            } else {
                clearInterval(intervalId);
                handleGistLog.push(`${usedSeconds}${chrome.i18n.getMessage("secondWait")}`)
                handleGistLog.push(`${chrome.i18n.getMessage("endPushToGithubGistTask")}`)
                handleGistLog.push(`${chrome.i18n.getMessage("end")}${moment().format('YYYY-MM-DD HH:mm:ss')}`);
                setHandleGistStatus("IDLE");
                setHandleGistLog(`${chrome.i18n.getMessage("autoPushGithub")}`);
            }
        }, 1000);
        isStoredGithubTokenLocal("push_github");
    }
};

// 推送到gitee的gist
function pushToGiteeGist() {
    console.log("推送gitee")
    setHandleGistStatus(`${chrome.i18n.getMessage("pushToGiteeGistIng")}`);
    usedSeconds = 0;
    pushToGiteeGistStatus = `${chrome.i18n.getMessage("startPushToGiteeGistTask")}`;
    handleGistLog.push(`${chrome.i18n.getMessage("startPushToGiteeGistTask")}`)
    if (typeof (pushToGiteeGistStatus) != "undefined") {
        intervalId = setInterval(function () {
            if (typeof (pushToGiteeGistStatus) != "undefined") {
                usedSeconds++;
            } else {
                clearInterval(intervalId);
                handleGistLog.push(`${usedSeconds}${chrome.i18n.getMessage("secondWait")}`)
                handleGistLog.push(`${chrome.i18n.getMessage("endPushToGiteeGistTask")}`)
                handleGistLog.push(`${chrome.i18n.getMessage("end")}${moment().format('YYYY-MM-DD HH:mm:ss')}`);
                setHandleGistStatus("IDLE");
                setHandleGistLog(`${chrome.i18n.getMessage("autoPushGitee")}`);
            }
        }, 1000);
        isStoredGiteeTokenLocal("push_gitee");
    }
};

// 判断是否已经保存github的Token
function isStoredGithubTokenLocal(action) {
    console.log("是否已经保存github的Token")
    handleGistLog.push(`${chrome.i18n.getMessage("startCheckGithubTokenSaved")}`);
    chrome.storage.local.get("githubGistToken", function (storage) {
        if (storage.githubGistToken) {
            console.log("已经保存github的Token")
            handleGistLog.push(`${chrome.i18n.getMessage("githubTokenSaved")}`);
            githubGistToken = storage.githubGistToken;
            isStoredGithubGistIdLocal(action);
        } else {
            console.log("没有保存github的Token")
            handleGistLog.push(`${chrome.i18n.getMessage("githubTokenNoSaved")}`);
            pushToGithubGistStatus = undefined;
        }
    });
}

// 判断是否已经保存gitee的Token
function isStoredGiteeTokenLocal(action) {
    console.log("是否已经保存gitee的Token")
    handleGistLog.push(`${chrome.i18n.getMessage("startCheckGiteeTokenSaved")}`);
    chrome.storage.local.get("giteeGistToken", function (storage) {
        if (storage.giteeGistToken) {
            console.log("已经保存gitee的Token")
            handleGistLog.push(`${chrome.i18n.getMessage("giteeTokenSaved")}`);
            giteeGistToken = storage.giteeGistToken;
            isStoredGiteeGistIdLocal(action);
        } else {
            console.log("没有保存gitee的Token")
            handleGistLog.push(`${chrome.i18n.getMessage("giteeTokenNoSaved")}`);
            pushToGiteeGistStatus = undefined;
        }
    });
}

// 判断是否已经保存了github的gistId
function isStoredGithubGistIdLocal(action) {
    console.log("是否已经保存了github的gistId")
    handleGistLog.push(`${chrome.i18n.getMessage("startCheckGistIdSaved")}`)
    chrome.storage.local.get("githubGistId", function (storage) {
        if (storage.githubGistId) {
            console.log("已经保存了github的gistId")
            handleGistLog.push(`${chrome.i18n.getMessage("gistIdSaved")}`)
            githubGistId = storage.githubGistId;
            if (action == "push_github") {
                getShardings(function (callback) {
                    if (!callback || typeof callback == 'undefined' || callback == undefined) {
                        updateGithubGist([]);
                    } else {
                        updateGithubGist(callback);
                    }
                })
            }
        } else {
            console.log("没有保存了github的gistId")
            handleGistLog.push(`${chrome.i18n.getMessage("gistIdNoSaved")}`)
            pushToGithubGistStatus = undefined;
        }
    });
}

// 判断是否已经保存了gitee的gistId
function isStoredGiteeGistIdLocal(action) {
    console.log("是否已经保存了gitee的gistId")
    handleGistLog.push(`${chrome.i18n.getMessage("startCheckGistIdSaved")}`)
    chrome.storage.local.get("giteeGistId", function (storage) {
        if (storage.giteeGistId) {
            console.log("已经保存了gitee的gistId")
            handleGistLog.push(`${chrome.i18n.getMessage("gistIdSaved")}`)
            giteeGistId = storage.giteeGistId;
            if (action == "push_gitee") {
                getShardings(function (callback) {
                    if (!callback || typeof callback == 'undefined' || callback == undefined) {
                        updateGiteeGist([]);
                    } else {
                        updateGiteeGist(callback);
                    }
                })
            }
        } else {
            console.log("没有保存了gitee的gistId")
            handleGistLog.push(`${chrome.i18n.getMessage("gistIdNoSaved")}`)
            pushToGiteeGistStatus = undefined;
        }
    });
}

// 更新github的gist
function updateGithubGist(content) {
    console.log("更新github的gist")
    handleGistLog.push(`${chrome.i18n.getMessage("directUpdate")}`)
    var content = JSON.stringify(content);
    var data = {
        "description": "myCloudSkyMonster",
        "public": false,
        "files": {
            "brower_Tabs.json": { "content": content }
        }
    }
    $.ajax({
        type: "PATCH",
        url: gitHubApiUrl + "/gists/" + githubGistId + "?access_token=" + githubGistToken,
        data: JSON.stringify(data),
        success: function (data, status) {
            if (status == "success") {
                console.log("更新成功")
                handleGistLog.push(`${chrome.i18n.getMessage("updateSuccess")}`)
            } else {
                console.log("更新失败")
                handleGistLog.push(`${chrome.i18n.getMessage("updateFailed")}`)
            }
        },
        error: function (xhr, errorText, errorType) {
            handleGistLog.push(`${chrome.i18n.getMessage("updateFailed")}-->${xhr.responseText}`)
        },
        complete: function () {
            //do something
            pushToGithubGistStatus = undefined;
        }
    })
};

// 更新gitee的gist
function updateGiteeGist(content) {
    console.log("更新gitee的gist")
    handleGistLog.push(`${chrome.i18n.getMessage("directUpdate")}`)
    var content = JSON.stringify(content);
    var data = {
        "description": "myCloudSkyMonster",
        "public": false,
        "files": {
            "brower_Tabs.json": { "content": content }
        }
    }
    $.ajax({
        type: "PATCH",
        url: giteeApiUrl + "/gists/" + giteeGistId + "?access_token=" + giteeGistToken,
        data: data,
        success: function (data, status) {
            if (status == "success") {
                console.log("更新成功")
                handleGistLog.push(`${chrome.i18n.getMessage("updateSuccess")}`)
            } else {
                console.log("更新失败")
                handleGistLog.push(`${chrome.i18n.getMessage("updateFailed")}`)
            }
        },
        error: function (xhr, errorText, errorType) {
            handleGistLog.push(`${chrome.i18n.getMessage("updateFailed")}-->${xhr.responseText}`)
        },
        complete: function () {
            //do something
            pushToGiteeGistStatus = undefined;
        }
    })
};


// 构造操作gist的日志结构
function setHandleGistLog(type) {
    var handleGistLogMap = { id: genObjectId(), handleGistType: type, handleGistLogs: handleGistLog };
    chrome.storage.local.get(null, function (storage) {
        if (storage.gistLog) {
            console.log("gistLog有值");
            if (storage.gistLog.length >= 100) {
                var newArr = storage.gistLog;
                newArr.splice(-1, 1)
                newArr.unshift(handleGistLogMap);
                chrome.storage.local.set({ gistLog: newArr });
            } else {
                var newArr = storage.gistLog;
                newArr.unshift(handleGistLogMap);
                chrome.storage.local.set({ gistLog: newArr });
            }
        } else {
            console.log("gistLog没有值，第一次");
            chrome.storage.local.set({ gistLog: [handleGistLogMap] });
        }
    });
};


// 操作gist的全局状态
function setHandleGistStatus(status) {
    var expireTime = moment().add(1, 'minutes').format('YYYY-MM-DD HH:mm:ss');
    var gistStatusMap = { type: status, expireTime: expireTime };
    chrome.storage.local.set({ handleGistStatus: gistStatusMap });
};

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
                sendMessageToContentScript("translateResult", "--FAILED--!");
            }
        },
        error: function (xhr, errorText, errorType) {
            sendMessageToContentScript("translateResult", "--ERROR,may be lost network--!");
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
        case 'test': // test
            console.log("test")
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

// filters tabGroup
function filterTabGroup(tabGroup) {
    for (let i = 0; i < tabGroup.tabs.length; i++) {
        var title = tabGroup.tabs[i].title
        if (title && typeof (title) != undefined) {
            tabGroup.tabs[i].title = title.replace(emojiReg, "");
        }
    }
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
    title: `${chrome.i18n.getMessage("sendCurrentTab")}`,
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
                iconUrl: 'images/128.png',
                title: 'TIME UP',
                message: minute + `${chrome.i18n.getMessage("timeUpMessage")}`,
                buttons: [{ "title": `${chrome.i18n.getMessage("close")}` }],
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
        alert(`${chrome.i18n.getMessage("timeTaskLived")}`);
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
    surplusTime = `${chrome.i18n.getMessage("surplusTime")}${days}${chrome.i18n.getMessage("days")}${hours}${chrome.i18n.getMessage("hours")}${minutes}${chrome.i18n.getMessage("minutes")}${seconds}${chrome.i18n.getMessage("seconds")}`;
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

// 持续监听，假如锁屏或者睡眠就清空定时任务，激活再重新定时任务
chrome.idle.onStateChanged.addListener(function (newState) {
    console.log(newState)
    console.log(typeof (newState))
    if (newState == "active" || newState == "idle") {
        chrome.alarms.create("checkAutoSyncGitee", { delayInMinutes: 70, periodInMinutes: 70 });
        chrome.alarms.create("checkAutoSyncGithub", { delayInMinutes: 90, periodInMinutes: 90 });

    }
    if (newState == "locked") {
        chrome.alarms.clearAll(function (wasCleared) {
            console.log(wasCleared)
        });
    }
});

// 持续监听响应定时任务
chrome.alarms.onAlarm.addListener(function (alarm) {
    console.log(alarm.name + "_" + alarm.scheduledTime + "_" + alarm.periodInMinutes)
    if (alarm.name == "checkAutoSyncGitee") {
        console.log("自动同步gitee")
        checkAutoSyncGitee();
    }
    if (alarm.name == "checkAutoSyncGithub") {
        console.log("自动同步github")
        checkAutoSyncGithub();
    }
});