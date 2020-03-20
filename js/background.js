console.log("background is done!");

// 定义倒计时文字容器
var surplusTime;
// 定义一个 一次执行定时器
var timeoutId;
// 定义一个桌面通知框id
var notificationId;
var emojiReg = /[\uD83C|\uD83D|\uD83E][\uDC00-\uDFFF][\u200D|\uFE0F]|[\uD83C|\uD83D|\uD83E][\uDC00-\uDFFF]|[0-9|*|#]\uFE0F\u20E3|[0-9|#]\u20E3|[\u203C-\u3299]\uFE0F\u200D|[\u203C-\u3299]\uFE0F|[\u2122-\u2B55]|\u303D|[\A9|\AE]\u3030|\uA9|\uAE|\u3030/gi;
var handleGithubGistLog = new Array();
var handleGiteeGistLog = new Array();
var gitHubApiUrl = "https://api.github.com";
var giteeApiUrl = "https://gitee.com/api/v5";
var usedSeconds;
var pushToGithubGistStatus;
var pushToGiteeGistStatus;
var githubGistToken;
var giteeGistToken;
var githubGistId;
var giteeGistId;
// 定义一个n次循环定时器
var githubIntervalId;
var giteeIntervalId;
var isLock = false;
var failedDirsList = new Array();
var getDirsFlag = false;
var startTime;
var endTime;

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
    var script3 = document.createElement('script');
    script3.src = "js/axios.min.js";
    document.head.appendChild(script3);

    // 获取tab数量并在pop上显示
    chrome.tabs.query({ currentWindow: true }, function (tab) {
        chrome.browserAction.setBadgeText({ text: tab.length + "" });
        chrome.browserAction.setBadgeBackgroundColor({ color: [255, 0, 0, 255] });
    });
    chrome.storage.local.get(function (storage) {
        console.log(storage);
    });
    // 创建定时同步gitee任务
    chrome.alarms.create("checkAutoSyncGitee", { delayInMinutes: 70, periodInMinutes: 70 });
    // 创建定时同步github任务
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
    handleGithubGistLog.length = 0;
    handleGithubGistLog.push(`${chrome.i18n.getMessage("start")}${moment().format('YYYY-MM-DD HH:mm:ss')}`);
    handleGithubGistLog.push(`${chrome.i18n.getMessage("autoPushToGithubGist")}`)
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
                    handleGithubGistLog.push(storage.handleGistStatus.type)
                    handleGithubGistLog.push(`${chrome.i18n.getMessage("endPushToGithubGistTask")}`)
                    handleGithubGistLog.push(`${chrome.i18n.getMessage("end")}${moment().format('YYYY-MM-DD HH:mm:ss')}`);
                    setHandleGistLog(`${chrome.i18n.getMessage("autoPushGithub")}`, handleGithubGistLog);
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
    handleGiteeGistLog.length = 0;
    handleGiteeGistLog.push(`${chrome.i18n.getMessage("start")}${moment().format('YYYY-MM-DD HH:mm:ss')}`);
    handleGiteeGistLog.push(`${chrome.i18n.getMessage("autoPushToGiteeGist")}`)
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
                    handleGiteeGistLog.push(storage.handleGistStatus.type)
                    handleGiteeGistLog.push(`${chrome.i18n.getMessage("endPushToGiteeGistTask")}`)
                    handleGiteeGistLog.push(`${chrome.i18n.getMessage("end")}${moment().format('YYYY-MM-DD HH:mm:ss')}`);
                    setHandleGistLog(`${chrome.i18n.getMessage("autoPushGitee")}`, handleGiteeGistLog);
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
    handleGithubGistLog.push(`${chrome.i18n.getMessage("startPushToGithubGistTask")}`)
    if (typeof (pushToGithubGistStatus) != "undefined") {
        githubIntervalId = setInterval(function () {
            if (typeof (pushToGithubGistStatus) != "undefined") {
                usedSeconds++;
            } else {
                clearInterval(githubIntervalId);
                handleGithubGistLog.push(`${usedSeconds}${chrome.i18n.getMessage("secondWait")}`)
                handleGithubGistLog.push(`${chrome.i18n.getMessage("endPushToGithubGistTask")}`)
                handleGithubGistLog.push(`${chrome.i18n.getMessage("end")}${moment().format('YYYY-MM-DD HH:mm:ss')}`);
                setHandleGistStatus("IDLE");
                setHandleGistLog(`${chrome.i18n.getMessage("autoPushGithub")}`, handleGithubGistLog);
            }
        }, 1000);
        console.log(githubIntervalId)
        isStoredGithubTokenLocal("push_github");
    }
};

// 推送到gitee的gist
function pushToGiteeGist() {
    console.log("推送gitee")
    setHandleGistStatus(`${chrome.i18n.getMessage("pushToGiteeGistIng")}`);
    usedSeconds = 0;
    pushToGiteeGistStatus = `${chrome.i18n.getMessage("startPushToGiteeGistTask")}`;
    handleGiteeGistLog.push(`${chrome.i18n.getMessage("startPushToGiteeGistTask")}`)
    if (typeof (pushToGiteeGistStatus) != "undefined") {
        giteeIntervalId = setInterval(function () {
            if (typeof (pushToGiteeGistStatus) != "undefined") {
                usedSeconds++;
            } else {
                clearInterval(giteeIntervalId);
                handleGiteeGistLog.push(`${usedSeconds}${chrome.i18n.getMessage("secondWait")}`)
                handleGiteeGistLog.push(`${chrome.i18n.getMessage("endPushToGiteeGistTask")}`)
                handleGiteeGistLog.push(`${chrome.i18n.getMessage("end")}${moment().format('YYYY-MM-DD HH:mm:ss')}`);
                setHandleGistStatus("IDLE");
                setHandleGistLog(`${chrome.i18n.getMessage("autoPushGitee")}`, handleGiteeGistLog);
            }
        }, 1000);
        console.log(giteeIntervalId)
        isStoredGiteeTokenLocal("push_gitee");
    }
};

// 判断是否已经保存github的Token
function isStoredGithubTokenLocal(action) {
    console.log("是否已经保存github的Token")
    handleGithubGistLog.push(`${chrome.i18n.getMessage("startCheckGithubTokenSaved")}`);
    chrome.storage.local.get("githubGistToken", function (storage) {
        if (storage.githubGistToken) {
            console.log("已经保存github的Token")
            handleGithubGistLog.push(`${chrome.i18n.getMessage("githubTokenSaved")}`);
            githubGistToken = storage.githubGistToken;
            isStoredGithubGistIdLocal(action);
        } else {
            console.log("没有保存github的Token")
            handleGithubGistLog.push(`${chrome.i18n.getMessage("githubTokenNoSaved")}`);
            pushToGithubGistStatus = undefined;
        }
    });
}

// 判断是否已经保存gitee的Token
function isStoredGiteeTokenLocal(action) {
    console.log("是否已经保存gitee的Token")
    handleGiteeGistLog.push(`${chrome.i18n.getMessage("startCheckGiteeTokenSaved")}`);
    chrome.storage.local.get("giteeGistToken", function (storage) {
        if (storage.giteeGistToken) {
            console.log("已经保存gitee的Token")
            handleGiteeGistLog.push(`${chrome.i18n.getMessage("giteeTokenSaved")}`);
            giteeGistToken = storage.giteeGistToken;
            isStoredGiteeGistIdLocal(action);
        } else {
            console.log("没有保存gitee的Token")
            handleGiteeGistLog.push(`${chrome.i18n.getMessage("giteeTokenNoSaved")}`);
            pushToGiteeGistStatus = undefined;
        }
    });
}

// 判断是否已经保存了github的gistId
function isStoredGithubGistIdLocal(action) {
    console.log("是否已经保存了github的gistId")
    handleGithubGistLog.push(`${chrome.i18n.getMessage("startCheckGistIdSaved")}`)
    chrome.storage.local.get("githubGistId", function (storage) {
        if (storage.githubGistId) {
            console.log("已经保存了github的gistId")
            handleGithubGistLog.push(`${chrome.i18n.getMessage("gistIdSaved")}`)
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
            handleGithubGistLog.push(`${chrome.i18n.getMessage("gistIdNoSaved")}`)
            pushToGithubGistStatus = undefined;
        }
    });
}

// 判断是否已经保存了gitee的gistId
function isStoredGiteeGistIdLocal(action) {
    console.log("是否已经保存了gitee的gistId")
    handleGiteeGistLog.push(`${chrome.i18n.getMessage("startCheckGistIdSaved")}`)
    chrome.storage.local.get("giteeGistId", function (storage) {
        if (storage.giteeGistId) {
            console.log("已经保存了gitee的gistId")
            handleGiteeGistLog.push(`${chrome.i18n.getMessage("gistIdSaved")}`)
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
            handleGiteeGistLog.push(`${chrome.i18n.getMessage("gistIdNoSaved")}`)
            pushToGiteeGistStatus = undefined;
        }
    });
}

// 更新github的gist
function updateGithubGist(content) {
    console.log("更新github的gist")
    handleGithubGistLog.push(`${chrome.i18n.getMessage("directUpdate")}`)
    var _content = JSON.stringify(content);
    var js = generateJs(content)
    var data = {
        "description": "myCloudSkyMonster",
        "public": false,
        "files": {
            "brower_Tabs.json": { "content": _content },
            "brower_tasks.js": { "content": js }
        }
    }
    $.ajax({
        type: "PATCH",
        headers: { "Authorization": "token " + githubGistToken },
        url: gitHubApiUrl + "/gists/" + githubGistId,
        data: JSON.stringify(data),
        success: function (data, status) {
            if (status == "success") {
                console.log("更新成功")
                chrome.storage.local.set({ "taskJsUrl": data.files['brower_tasks.js'].raw_url })
                handleGithubGistLog.push(`${chrome.i18n.getMessage("updateSuccess")}`)
            } else {
                console.log("更新失败")
                handleGithubGistLog.push(`${chrome.i18n.getMessage("updateFailed")}`)
            }
        },
        error: function (xhr, errorText, errorType) {
            handleGithubGistLog.push(`${chrome.i18n.getMessage("updateFailed")}-->${xhr.responseText}`)
        },
        complete: function () {
            //do something
            pushToGithubGistStatus = undefined;
        }
    })
};

// 生成js
function generateJs(content) {
    var result = ""
    var myRun = "console.log('load完任务了'); function myRun(functionName) {"
    var functionJs = ""
    var alarmJs = "chrome.alarms.onAlarm.addListener(function (alarm) {"
    var taskList = content.taskList
    if (taskList) {
        for (let i = 0; i < taskList.length; i++) {
            let script = taskList[i].script + ";"
            let functionName = taskList[i].functionName
            let jsContent = " if(functionName === '" + functionName + "'){" + functionName + "();}"
            let jsContent2 = " if(alarm.name === '" + functionName + "'){" + functionName + "();}"
            myRun += jsContent
            functionJs += script
            alarmJs += jsContent2
        }
    }
    result = myRun + "}" + functionJs + alarmJs + "});"
    console.log(result)
    return result;
}

// 更新gitee的gist
function updateGiteeGist(content) {
    console.log("更新gitee的gist")
    handleGiteeGistLog.push(`${chrome.i18n.getMessage("directUpdate")}`)
    var _content = JSON.stringify(content);
    var js = generateJs(content)
    var data = {
        "description": "myCloudSkyMonster",
        "public": false,
        "files": {
            "brower_Tabs.json": { "content": _content },
            "brower_tasks.js": { "content": js }
        }
    }
    $.ajax({
        type: "PATCH",
        headers: { "Authorization": "token " + giteeGistToken },
        url: giteeApiUrl + "/gists/" + giteeGistId,
        data: data,
        success: function (data, status) {
            if (status == "success") {
                console.log("更新成功")
                chrome.storage.local.set({ "taskJsUrl": data.files['brower_tasks.js'].raw_url })
                handleGiteeGistLog.push(`${chrome.i18n.getMessage("updateSuccess")}`)
            } else {
                console.log("更新失败")
                handleGiteeGistLog.push(`${chrome.i18n.getMessage("updateFailed")}`)
            }
        },
        error: function (xhr, errorText, errorType) {
            handleGiteeGistLog.push(`${chrome.i18n.getMessage("updateFailed")}-->${xhr.responseText}`)
        },
        complete: function () {
            //do something
            pushToGiteeGistStatus = undefined;
        }
    })
};


// 构造操作gist的日志结构
function setHandleGistLog(type, handleGistLog) {
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
                if (data.translation) {
                    console.log(data.translation[0]);
                    sendMessageToContentScript("translateResult", data.translation[0]);
                }
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
            chrome.storage.local.get(function (storage) {
                let opts = storage.options
                let openBackgroundAfterSendTab = "yes"
                if (opts) {
                    openBackgroundAfterSendTab = opts.openBackgroundAfterSendTab || "yes"
                }
                if (req.tabsArr.length > 0) {
                    saveTabs(req.tabsArr);
                    if (openBackgroundAfterSendTab === "yes") {
                        openBackgroundPage();
                    }
                    closeTabs(req.tabsArr);
                } else {
                    if (openBackgroundAfterSendTab === "yes") {
                        openBackgroundPage();
                    }
                }
            })
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
        case 'super-save': // 百度网盘转存
            console.log("super-save")
            startTime = moment();
            sendRes('ok'); // acknowledge
            startTransfer(req.message)
                .then(function (data) {
                    console.log(data)
                    data.firstOn = true;
                    return isRootDirExist(data);
                })
                .then(function (data) {
                    data.rootPath = "/3kSpan";
                    if (data.oldDirs.length > 0) {
                        var flag = false;
                        for (let i = 0; i < data.oldDirs.length; i++) {
                            if (data.oldDirs[i].path === '/3kSpan') {
                                flag = true;
                            }
                        }
                        if (!flag) {
                            return createRootDir(data)
                        } else {
                            return data;
                        }
                    } else {
                        return createRootDir(data)
                    }
                })
                .then(function (data) {
                    return getDirs(data);
                })
                .then(function (data) {
                    if (data.newDirs.length > 0) {
                        failedDirsList.length = 0
                        return loopDirectTransfer(data);
                    }
                });
            break;
        case 'test': // test
            console.log("test axios")
            sendRes('ok'); // acknowledge
            break;
        default:
            sendRes('nope'); // acknowledge
            break;
    }
});

// 开始转存，获取shorturl
function startTransfer(data) {
    let p = new Promise(function (resolve, reject) {
        chrome.tabs.query({ active: true, currentWindow: true }, function (tab) {
            var currentUrl = tab[0].url;
            var shorturl = currentUrl.split("/s/1")[1].substr(0, 22);
            data.shorturl = shorturl;
            resolve(data);
        });
    });
    return p;
}

// 获取网盘本来的目录结构
function isRootDirExist(data) {
    let p = new Promise(function (resolve, reject) {
        axios.get('https://pan.baidu.com/rest/2.0/xpan/file?method=list')
            .then(function (response) {
                data.oldDirs = response.data.list;
                resolve(data)
            })
            .catch(function (error) {
                console.log(error);
            });
    });
    return p;
}

// 创建插件所需根目录
function createRootDir(data) {
    let p = new Promise(function (resolve, reject) {
        console.log("创建根目录：" + data.rootPath)
        // 允许携带cookie
        axios.defaults.withCredentials = true

        var form = new FormData();
        form.append("path", data.rootPath);
        form.append("isdir", "1");
        form.append("block_list", "[]");
        axios.post('https://pan.baidu.com/api/create?a=commit&bdstoken=' + data.bdstoken, form)
            .then(function (response) {
                // console.log(response);
                // console.log(response.data);
                resolve(data)
            })
            .catch(function (error) {
                console.log(error);
            });
    });
    return p;
}


// 获取外链顶层文件夹结构
function getDirs(data) {
    let p = new Promise(function (resolve, reject) {
        axios.get('https://pan.baidu.com/rest/2.0/xpan/share?method=list&shareid=' + data.shareId + '&shorturl=' + data.shorturl + '&root=1&sekey=' + data.sekey)
            .then(function (response) {
                console.log(response);
                if (response.data.list.length > 0) {
                    data.newDirs = response.data.list;
                }
                resolve(data);
            })
            .catch(function (error) {
                console.log(error);
            });
    });
    return p;
}

// 触发递归转存
async function loopDirectTransfer(data) {
    for (let i = 0; i < data.newDirs.length; i++) {
        console.log(data.newDirs[i])
        var fsid = data.newDirs[i].fs_id
        var dir = data.newDirs[i].path
        await waiteMinute()
        await directTransfer(data, fsid, dir)
    }
    if (failedDirsList.length == 0) {
        console.log("保存完毕！")
        endTime = moment();
        const duration = moment.duration(moment(endTime).diff(moment(startTime)));
        notificationId = genObjectId();
        chrome.notifications.create(notificationId, {
            type: 'basic',
            iconUrl: 'images/128.png',
            title: '百度网盘转存通知',
            message: `转存完毕！用时:${duration.hours()}时${duration.minutes()}分${duration.seconds()}秒`,
            buttons: [{ "title": `${chrome.i18n.getMessage("close")}` }],
            requireInteraction: true
        });
    } else {
        console.log("有目录保存失败")
        console.log(failedDirsList)
        data.newDirs.length = 0
        for (let i = 0; i < failedDirsList.length; i++) {
            await getFiles(data, failedDirsList[i])
        }
        failedDirsList.length = 0
        loopDirectTransfer(data)
    }
}

// 每调用一次api，暂停2秒，防止被block
function waiteMinute() {
    let p = new Promise(function (resolve, reject) {
        setTimeout(() => {
            console.log('等2秒');
            resolve("done")
        }, 2000);
    });
    return p;
}

// 调用转存api
function directTransfer(data, fsid, dir) {
    let p = new Promise(function (resolve, reject) {
        console.log("开始保存文件！")
        // 允许携带cookie
        axios.defaults.withCredentials = true
        var form = new FormData();
        form.append("fsidlist", "[" + fsid + "]");
        var firstOn = data.firstOn;
        if (firstOn) {
            form.append("path", data.rootPath);
        } else {
            var a = dir.lastIndexOf("/")
            var b = dir.substr(0, a)
            form.append("path", data.rootPath + b);
        }
        axios.post('https://pan.baidu.com/share/transfer?shareid=' + data.shareId + '&from=' + data.from + '&ondup=newcopy&async=1', form)
            .then(function (response) {
                // console.log(response);
                console.log(response.data);
                if (response.data.errno == 120 || response.data.errno == 130 || response.data.errno == -33 || response.data.errno == 12) {
                    console.log("超过限制了")
                    failedDirsList.push(dir);
                    resolve('no done')
                } else if (response.data.errno == 0) {
                    console.log("保存文件成功！")
                    resolve('done');
                } else if (response.data.errno == 2) {
                    console.log("参数错误")
                    resolve('done');
                }
            })
            .catch(function (error) {
                console.log(error);
            });
    });
    return p;
}

// 获取非顶层文件夹结构
async function getFiles(data, dir) {
    var page = 0;
    getDirsFlag = false;
    while (!getDirsFlag) {
        page++;
        console.log("第" + page)
        await getFile(data, dir, page)
    }
    await createDir(data, dir)
    data.firstOn = false
}

// 创建文件夹结构
function createDir(data, dir) {
    let p = new Promise(function (resolve, reject) {
        console.log("创建目录：" + data.rootPath + dir)
        // 允许携带cookie
        axios.defaults.withCredentials = true

        var form = new FormData();
        form.append("path", data.rootPath + dir);
        form.append("isdir", "1");
        form.append("block_list", "[]");
        axios.post('https://pan.baidu.com/api/create?a=commit&bdstoken=' + data.bdstoken, form)
            .then(function (response) {
                // console.log(response);
                console.log(response.data);
                resolve('done')
            })
            .catch(function (error) {
                console.log(error);
            });
    });
    return p;
}

// 获取指定目录文件夹
function getFile(data, dir, page) {
    let p = new Promise(function (resolve, reject) {
        axios.get('https://pan.baidu.com/share/list?shareid=' + data.shareId + '&shorturl=' + data.shorturl + '&sekey=' + data.sekey + '&dir=' + dir + '&page=' + page)
            .then(function (response) {
                console.log(response);
                if (response.data.list.length > 0) {
                    for (let i = 0; i < response.data.list.length; i++) {
                        data.newDirs.push(response.data.list[i]);
                    }
                } else {
                    getDirsFlag = true
                }
                resolve('done');
            })
            .catch(function (error) {
                console.log(error);
            });
    });
    return p;
}


// 持续监听在https://pan.baidu.com下的post方法发送之前，在header里加referer
chrome.webRequest.onBeforeSendHeaders.addListener(function (details) {
    if (details.method === 'POST' && details.url.indexOf("https://pan.baidu.com") != -1) {
        // console.log(details)
        details.requestHeaders.push({ name: 'Referer', value: 'pan.baidu.com' });
        return { requestHeaders: details.requestHeaders };
    }
},
    { urls: ["<all_urls>"] },
    ["blocking", "requestHeaders"]);


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
    tabGroup.isLock = false;
    tabGroup.groupTitle = '';
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
        if (callback || typeof callback != 'undefined' || callback != undefined) {
            if (!callback.tabGroups || typeof callback.tabGroups == 'undefined' || callback.tabGroups == undefined) {
                saveShardings([tabGroup], "object");
            } else {
                var newArr = callback.tabGroups;
                newArr.unshift(tabGroup);
                saveShardings(newArr, "object");
            }
        } else {
            saveShardings([tabGroup], "object");
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
        chrome.storage.local.get(function (storage) {
            chrome.tabs.query({ url: ["https://*/*", "http://*/*"], highlighted: true, currentWindow: true }, function (tabsArr) {
                let opts = storage.options
                let openBackgroundAfterSendTab = "yes"
                if (opts) {
                    openBackgroundAfterSendTab = opts.openBackgroundAfterSendTab || "yes"
                }
                if (tabsArr.length > 0) {
                    saveTabs(tabsArr);
                    if (openBackgroundAfterSendTab === "yes") {
                        openBackgroundPage();
                    }
                    closeTabs(tabsArr);
                } else {
                    if (openBackgroundAfterSendTab === "yes") {
                        openBackgroundPage();
                    }
                }

            });
        })
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
            chrome.contextMenus.update("1", { title: `${chrome.i18n.getMessage("remindStatus")}` }, function callback() { })
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
    chrome.contextMenus.update("1", { title: surplusTime }, function callback() { })
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
                delete items["tabGroups_" + i]
            }
        }
        delete items.tabGroups_num
        delete items.gistLog
        delete items.handleGistStatus
        delete items.giteeGistId
        delete items.giteeGistToken
        delete items.githubGistId
        delete items.githubGistToken
        if (tabGroupsStr.length > 0) {
            items["tabGroups"] = JSON.parse(tabGroupsStr)
        }
        cb(items)
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
    if (newState == "active") {
        if (isLock) {
            chrome.alarms.create("checkAutoSyncGitee", { delayInMinutes: 70, periodInMinutes: 70 });
            chrome.alarms.create("checkAutoSyncGithub", { delayInMinutes: 90, periodInMinutes: 90 });
            isLock = false;
        }
    }
    if (newState == "locked") {
        isLock = true;
        chrome.alarms.clearAll(function (wasCleared) {
            console.log(wasCleared)
        });
    }
    chrome.alarms.getAll(function (alarms) {
        console.log(alarms)
    });
});

// 持续监听响应定时任务
chrome.alarms.onAlarm.addListener(function (alarm) {
    if (alarm.name == "checkAutoSyncGitee") {
        console.log("自动同步gitee")
        checkAutoSyncGitee();
    }
    if (alarm.name == "checkAutoSyncGithub") {
        console.log("自动同步github")
        checkAutoSyncGithub();
    }
});

// 持续监听是否按了manifest设置的快捷键
chrome.commands.onCommand.addListener(function (command) {
    if (command === "toggle-feature-save-all") {
        chrome.tabs.query({ url: ["https://*/*", "http://*/*"], currentWindow: true }, function (tabsArr) {
            saveTabs(tabsArr);
            openBackgroundPage();
            closeTabs(tabsArr);
        });
    }
    if (command === "toggle-feature-save-current") {
        chrome.storage.local.get(function (storage) {
            chrome.tabs.query({ url: ["https://*/*", "http://*/*"], highlighted: true, currentWindow: true }, function (tabsArr) {
                let opts = storage.options
                let openBackgroundAfterSendTab = "yes"
                if (opts) {
                    openBackgroundAfterSendTab = opts.openBackgroundAfterSendTab || "yes"
                }
                if (tabsArr.length > 0) {
                    saveTabs(tabsArr);
                    if (openBackgroundAfterSendTab === "yes") {
                        openBackgroundPage();
                    }
                    closeTabs(tabsArr);
                } else {
                    if (openBackgroundAfterSendTab === "yes") {
                        openBackgroundPage();
                    }
                }
            });
        })
    }

});

// 持续监听storage是否修改
chrome.storage.onChanged.addListener(function (changes, areaName) {
    var flag = false;
    console.log(changes)
    for (var key in changes) {
        if (key.indexOf("tabGroups") != -1) {
            console.log(key)
            if (key.indexOf("tabGroups_num") == -1) {
                flag = true;
            }
        }
        if (key.indexOf("taskList") != -1) {
            flag = true;
        }
    }
    if (areaName === "local" && flag) {
        console.log("要同步")
        startPushToGiteeGist();
    } else {
        console.log("不要同步")
    }
});


chrome.contextMenus.create({
    id: "1",
    title: `${chrome.i18n.getMessage("remindStatus")}`,
    contexts: ["browser_action"]
});

chrome.contextMenus.create({
    id: "2",
    title: `${chrome.i18n.getMessage("generateQr")}`,
    contexts: ["browser_action"],
    onclick: function () {
        chrome.tabs.query({ url: ["https://*/*", "http://*/*"], active: true, currentWindow: true }, function (tab) {
            console.log(tab)
            if (tab.length > 0) {
                data = tab[0].url;
                let qrInfo = `<img id="qr" src = "http://qr.topscan.com/api.php?text=" + ${data}>`
                sendMessageToContentScript("generateQr", qrInfo);
            }
        });
    }
});

chrome.contextMenus.create({
    id: "3",
    title: `${chrome.i18n.getMessage("tabsMenu")}`,
    contexts: ["browser_action"]
});

chrome.contextMenus.create({
    id: "4",
    title: `${chrome.i18n.getMessage("showAllTabs")}`,
    contexts: ["browser_action"],
    onclick: function () {
        openBackgroundPage();
    },
    parentId: "3"
});

chrome.contextMenus.create({
    id: "5",
    title: `${chrome.i18n.getMessage("sendAllTabs")}`,
    contexts: ["browser_action"],
    onclick: function () {
        chrome.tabs.query({ url: ["https://*/*", "http://*/*"], currentWindow: true }, function (req) {
            if (req.length > 0) {
                saveTabs(req);
                openBackgroundPage();
                closeTabs(req);
            } else {
                openBackgroundPage();
            }
        });
    },
    parentId: "3"
});


chrome.contextMenus.create({
    id: "6",
    title: `${chrome.i18n.getMessage("sendCurrentTab")}`,
    contexts: ["browser_action"],
    onclick: function () {
        chrome.storage.local.get(function (storage) {
            let opts = storage.options
            let openBackgroundAfterSendTab = "yes"
            if (opts) {
                openBackgroundAfterSendTab = opts.openBackgroundAfterSendTab || "yes"
            }
            chrome.tabs.query({ url: ["https://*/*", "http://*/*"], highlighted: true, currentWindow: true }, function (req) {
                if (req.length > 0) {
                    saveTabs(req);
                    if (openBackgroundAfterSendTab === "yes") {
                        openBackgroundPage();
                    }
                    closeTabs(req);
                } else {
                    if (openBackgroundAfterSendTab === "yes") {
                        openBackgroundPage();
                    }
                }
            });
        })
    },
    parentId: "3"
});


chrome.contextMenus.create({
    id: "7",
    title: `${chrome.i18n.getMessage("sendOtherTabs")}`,
    contexts: ["browser_action"],
    onclick: function () {
        chrome.tabs.query({ url: ["https://*/*", "http://*/*"], active: false, currentWindow: true }, function (req) {
            if (req.length > 0) {
                saveTabs(req);
                openBackgroundPage();
                closeTabs(req);
            } else {
                openBackgroundPage();
            }
        });
    },
    parentId: "3"
});


chrome.contextMenus.create({
    id: "8",
    title: `${chrome.i18n.getMessage("remindMenu")}`,
    contexts: ["browser_action"]
});

chrome.contextMenus.create({
    id: "9",
    title: `${chrome.i18n.getMessage("fiveMinuteRemind")}`,
    contexts: ["browser_action"],
    onclick: function () {
        remind(5);
    },
    parentId: "8"
});


chrome.contextMenus.create({
    id: "10",
    title: `${chrome.i18n.getMessage("tenMinuteRemind")}`,
    contexts: ["browser_action"],
    onclick: function () {
        remind(10);
    },
    parentId: "8"
});


chrome.contextMenus.create({
    id: "11",
    title: `${chrome.i18n.getMessage("fortyMinuteRemind")}`,
    contexts: ["browser_action"],
    onclick: function () {
        remind(40);
    },
    parentId: "8"
});


chrome.contextMenus.create({
    id: "12",
    title: `${chrome.i18n.getMessage("customMinuteRemind")}`,
    contexts: ["browser_action"],
    onclick: function () {
        var minute = prompt(`${chrome.i18n.getMessage("pleaseInputCustomMinute")}`, 120);
        if (!isInt(parseInt(minute.trim()))) {
            alert(`${chrome.i18n.getMessage("inputNumber")}`)
        } else {
            remind(Number(minute.trim()));
        }
    },
    parentId: "8"
});


chrome.contextMenus.create({
    id: "13",
    title: `${chrome.i18n.getMessage("openJsonTools")}`,
    contexts: ["browser_action"],
    onclick: function () {
        chrome.tabs.create({ index: 0, url: chrome.extension.getURL('json.html') });
    }
});