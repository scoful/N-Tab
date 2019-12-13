; (function (m) {
    'use strict';
    var githubGistToken;
    var giteeGistToken;
    var githubGistId;
    var giteeGistId;
    var gitHubApiUrl = "https://api.github.com";
    var giteeApiUrl = "https://gitee.com/api/v5";
    var pushToGithubGistStatus;
    var pullFromGithubGistStatus;
    var pushToGiteeGistStatus;
    var pullFromGiteeGistStatus;
    var handleGistLog = new Array();
    var sortableTitle;
    var sortableTabList = new Array();
    // 定义一个n次循环定时器
    var intervalId;
    var usedSeconds;
    var emojiReg = /[\uD83C|\uD83D|\uD83E][\uDC00-\uDFFF][\u200D|\uFE0F]|[\uD83C|\uD83D|\uD83E][\uDC00-\uDFFF]|[0-9|*|#]\uFE0F\u20E3|[0-9|#]\u20E3|[\u203C-\u3299]\uFE0F\u200D|[\u203C-\u3299]\uFE0F|[\u2122-\u2B55]|\u303D|[\A9|\AE]\u3030|\uA9|\uAE|\u3030/gi;


    document.addEventListener('DOMContentLoaded', function () {
        console.log("load完workbench了");

        document.getElementById("container").innerHTML = `
        <header>
            <h1>CloudSkyMonster
                <span style="font-size: .5em;">${chrome.i18n.getMessage("workBenchHeaderValue")}<span id="totalTabs"></span>${chrome.i18n.getMessage("tabsNo")}</span>
                <button id="githubStatus" class="button"></button>
                <button id="giteeStatus" class="button"></button>
                <button id="usage" class="button"></button>
            </h1>
            <button id="hideShowGist" class="button">${chrome.i18n.getMessage("hisdeShowGistFunction")}</button>
            <button id="hideShowImport" class="button">${chrome.i18n.getMessage("hideShowImportFunction")}</button>
            <span>${chrome.i18n.getMessage("dragTitle")}</span><input id="dragTitle" class="switch switch-anim" type="checkbox">
            <span>${chrome.i18n.getMessage("dragTabs")}</span><input id="dragUrls" class="switch switch-anim" type="checkbox">
            <span>${chrome.i18n.getMessage("autoSync")}</span><input id="autoSync" class="switch switch-anim" type="checkbox">
            <button id="showLog" class="button">${chrome.i18n.getMessage("showLog")}</button>
        </header>
        <div id="menu" class="grid-container" style="display:none">
            <div class="row">
                <div id="pushToGithubGist" class="menu-entry">${chrome.i18n.getMessage("pushToGithubGist")}<span
                        id="pushToGithubGistStatus">${chrome.i18n.getMessage("nope")}</span></div>
            </div>
            <div class="row">
                <div id="pullFromGithubGist" class="menu-entry">${chrome.i18n.getMessage("pullFromGithubGist")}<span
                        id="pullFromGithubGistStatus">${chrome.i18n.getMessage("nope")}</span></div>
            </div>
            <div class="row">
                <div id="pushToGiteeGist" class="menu-entry">${chrome.i18n.getMessage("pushToGiteeGist")}<span
                        id="pushToGiteeGistStatus">${chrome.i18n.getMessage("nope")}</span></div>
            </div>
            <div class="row">
                <div id="pullFromGiteeGist" class="menu-entry">${chrome.i18n.getMessage("pullFromGiteeGist")}<span
                        id="pullFromGiteeGistStatus">${chrome.i18n.getMessage("nope")}</span></div>
            </div>
        </div>
        <div id="importOneTab" style="display:none">
            <textarea id="importTextarea" style="width: 1024px; height: 200px;"></textarea>
            <div>
                <button id="import" class="button">${chrome.i18n.getMessage("importToLocal")}</button><span>${chrome.i18n.getMessage("importWarn")}</span>
            </div>
        </div>
        <div id="tabGroups"></div>
        <footer role="contentinfo">
        ${chrome.i18n.getMessage("sourceCode")}<a
                href="https://github.com/scoful/cloudSkyMonster">GitHub</a>.
        </footer>
        `;

        checkGitHubStatus();
        checkGiteeStatus();
        chrome.storage.local.get(null, function (items) {
            var total = new Array();
            for (var i = 0; i < 100; i++) {
                total.push("tabGroups_" + i);
            };
            // 一load完就算一下storage占用了多少空间
            chrome.storage.local.getBytesInUse(total, function (bytes) {
                console.log("total is " + bytes / 1024 / 1024 + "mb");
            });
            chrome.storage.local.getBytesInUse(null, function (bytes) {
                console.log("total2 is " + bytes / 1024 / 1024 + "mb");
                document.getElementById('usage').innerHTML = `${chrome.i18n.getMessage("usedSpace")}${Math.round(bytes / 1024 / 1024 * 100) / 100}mb/5mb`;
            });

            var dragType = items.dragType;
            if (dragType == "dragUrls") {
                $('#dragUrls').prop("checked", true);
            }
            if (dragType == "dragTitle") {
                $('#dragTitle').prop("checked", true);
            }
            var autoSync = items.autoSync
            if (autoSync == true) {
                $('#autoSync').prop("checked", true);
            }
        });
        // 展示所有标签
        showAllTabs();
        // TODO 本来想实现在空标签页和chrome://extensions/这种特殊页面也可以按x直接关闭，问题：空标签页和chrome://extensions/没有load contentscript，目前只是实现在后台展示页按x关闭
        $(document).keyup(function (event) {
            if (event.key == 'x') {
                var inputs = document.getElementsByTagName('input');
                let flag = false;
                for (var i = 0; i < inputs.length; i++) {
                    if (inputs[i].type == 'text') {
                        if (inputs[i] == document.activeElement) {
                            flag = true;
                        } else {
                            flag = false;
                        }
                    }
                }
                var textareas = document.getElementsByTagName('textarea');
                for (var i = 0; i < textareas.length; i++) {
                    if (textareas[i] == document.activeElement) {
                        flag = true;
                    } else {
                        flag = false;
                    }
                }
                if (!flag) {
                    closeCurrentTab();
                }
            }
            if (event.key == 'X') {
                // todo，按下大写X
            }
        });

        // hide show gist 功能
        document.getElementById('hideShowGist').addEventListener('click', function () {
            $("#menu").slideToggle();
        });

        // hide show 导入oneTab的url功能
        document.getElementById('hideShowImport').addEventListener('click', function () {
            $("#importOneTab").slideToggle();
        });

        // 打开日志页
        document.getElementById('showLog').addEventListener('click', function () {
            openLogPage();
        });

        // 把从onetab导出的数据导入
        document.getElementById('import').addEventListener('click', function () {
            chrome.storage.local.get(null, function (items) {
                var tabGroupsStr = "";
                var tabGroups = new Array();
                if (items.tabGroups_num >= 1) {
                    // 把分片数据组成字符串
                    for (var i = 0; i < items.tabGroups_num; i++) {
                        tabGroupsStr += items["tabGroups_" + i];
                    }
                    tabGroups = JSON.parse(tabGroupsStr);
                }
                var importTextarea = $('#importTextarea').val();
                var content = importTextarea.split("\n");
                let tabsArr = new Array();
                for (let i = 0; i < content.length; i++) {
                    if (content[i] == "") {
                        tabGroups.push(makeTabGroup(tabsArr));
                        tabsArr.length = 0;
                        continue;
                    }
                    let lineList = content[i].split(" | ");
                    let title = lineList[1];
                    if (title && typeof (title) != undefined) {
                        title = title.replace(emojiReg, "");
                    }
                    let tab = { "title": title, "url": lineList[0] }
                    tabsArr.push(tab);
                }
                saveShardings(tabGroups, "object");
                chrome.tabs.query({ active: true, currentWindow: true }, function (tabsArr) {
                    chrome.tabs.reload(tabsArr[0].id, {}, function (tab) {
                    });
                });
            });
        });

        // 是否开启拖曳title，title和url的拖曳互斥
        document.getElementById('dragTitle').addEventListener('click', function () {
            if ($('#dragTitle').prop('checked')) {
                $('#dragUrls').prop("checked", false);
                chrome.storage.local.set({ "dragType": "dragTitle" });
                chrome.tabs.query({ active: true, currentWindow: true }, function (tabsArr) {
                    chrome.tabs.reload(tabsArr[0].id, {}, function (tab) {
                    });
                });
            } else {
                $('#dragUrls').prop("checked", true);
                chrome.storage.local.set({ "dragType": "dragUrls" });
                chrome.tabs.query({ active: true, currentWindow: true }, function (tabsArr) {
                    chrome.tabs.reload(tabsArr[0].id, {}, function (tab) {
                    });
                });
            }
        });
        // 是否开启拖曳url,title和url的拖曳互斥
        document.getElementById('dragUrls').addEventListener('click', function () {
            if ($('#dragUrls').prop('checked')) {
                $('#dragTitle').prop("checked", false);
                chrome.storage.local.set({ "dragType": "dragUrls" });
                chrome.tabs.query({ active: true, currentWindow: true }, function (tabsArr) {
                    chrome.tabs.reload(tabsArr[0].id, {}, function (tab) {
                    });
                });
            } else {
                $('#dragTitle').prop("checked", true);
                chrome.storage.local.set({ "dragType": "dragTitle" });
                chrome.tabs.query({ active: true, currentWindow: true }, function (tabsArr) {
                    chrome.tabs.reload(tabsArr[0].id, {}, function (tab) {
                    });
                });
            }
        });

        // 是否开启自动同步
        document.getElementById('autoSync').addEventListener('click', function () {
            if ($('#autoSync').prop('checked')) {
                chrome.storage.local.set({ "autoSync": true });
            } else {
                chrome.storage.local.set({ "autoSync": false });
            }
        });

        // 响应推送到github的gist的动作
        document.getElementById('pushToGithubGist').addEventListener('click', function () {
            var confirm = prompt(`${chrome.i18n.getMessage("confirmKey")}`, `${chrome.i18n.getMessage("confirmValue")}`);
            if (confirm == "确定" || confirm == "confirm") {
                console.log("yes");
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
                                alert(storage.handleGistStatus.type);
                            }
                        }
                    } else {
                        console.log("handleGistStatus没有值，第一次");
                        pushToGithubGist();
                    }
                });
            } else {
                console.log("no");
            }
        });

        // 响应推送到gitee的gist的动作
        document.getElementById('pushToGiteeGist').addEventListener('click', function () {
            var confirm = prompt(`${chrome.i18n.getMessage("confirmKey")}`, `${chrome.i18n.getMessage("confirmValue")}`);
            if (confirm == "确定" || confirm == "confirm") {
                console.log("yes");
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
                                alert(storage.handleGistStatus.type);
                            }
                        }
                    } else {
                        console.log("handleGistStatus没有值，第一次");
                        pushToGiteeGist();
                    }
                });
            } else {
                console.log("no");
            }
        });

        // 响应从github的gist拉取的动作
        document.getElementById('pullFromGithubGist').addEventListener('click', function () {
            var confirm = prompt(`${chrome.i18n.getMessage("confirmKey")}`, `${chrome.i18n.getMessage("confirmValue")}`);
            if (confirm == "确定" || confirm == "confirm") {
                console.log("yes");
                chrome.storage.local.get(null, function (storage) {
                    console.log(storage.handleGistStatus);
                    if (storage.handleGistStatus) {
                        console.log("handleGistStatus有值");
                        if (storage.handleGistStatus.type == "IDLE") {
                            pullFromGithubGist();
                        } else {
                            var time = moment().format('YYYY-MM-DD HH:mm:ss');
                            var expireTime = storage.handleGistStatus.expireTime;
                            console.log(expireTime)
                            if (time > expireTime) {
                                pullFromGithubGist();
                            } else {
                                alert(storage.handleGistStatus.type);
                            }
                        }
                    } else {
                        console.log("handleGistStatus没有值，第一次");
                        pullFromGithubGist();
                    }
                });
            } else {
                console.log("no");
            }
        });


        // 响应从gitee的gist拉取的动作
        document.getElementById('pullFromGiteeGist').addEventListener('click', function () {
            var confirm = prompt(`${chrome.i18n.getMessage("confirmKey")}`, `${chrome.i18n.getMessage("confirmValue")}`);
            if (confirm == "确定" || confirm == "confirm") {
                console.log("yes");
                chrome.storage.local.get(null, function (storage) {
                    console.log(storage.handleGistStatus);
                    if (storage.handleGistStatus) {
                        console.log("handleGistStatus有值");
                        if (storage.handleGistStatus.type == "IDLE") {
                            pullFromGiteeGist();
                        } else {
                            var time = moment().format('YYYY-MM-DD HH:mm:ss');
                            var expireTime = storage.handleGistStatus.expireTime;
                            console.log(expireTime)
                            if (time > expireTime) {
                                pullFromGiteeGist();
                            } else {
                                alert(storage.handleGistStatus.type);
                            }
                        }
                    } else {
                        console.log("handleGistStatus没有值，第一次");
                        pullFromGiteeGist();
                    }
                });
            } else {
                console.log("no");
            }
        });
    });

    // 从github的gist拉取
    function pullFromGithubGist() {
        setHandleGistStatus(`${chrome.i18n.getMessage("pullFromGithubGistIng")}`);
        handleGistLog.length = 0;
        usedSeconds = 0;
        handleGistLog.push(`${chrome.i18n.getMessage("start")}${moment().format('YYYY-MM-DD HH:mm:ss')}`);
        handleGistLog.push(`${chrome.i18n.getMessage("clickPullFromGithubGist")}`)
        console.log(pullFromGithubGistStatus);
        pullFromGithubGistStatus = `${chrome.i18n.getMessage("startPullFromGithubGistTask")}`;
        console.log("开始pull从github的gist的任务");
        handleGistLog.push(`${chrome.i18n.getMessage("startPullFromGithubGistTask")}`)
        if (typeof (pullFromGithubGistStatus) != "undefined") {
            console.log("开始工作");
            intervalId = setInterval(function () {
                if (typeof (pullFromGithubGistStatus) != "undefined") {
                    console.log("秒等待");
                    usedSeconds++;
                    document.getElementById('pullFromGithubGistStatus').innerHTML = pullFromGithubGistStatus;
                } else {
                    clearInterval(intervalId);
                    document.getElementById('pullFromGithubGistStatus').innerHTML = `${chrome.i18n.getMessage("endPullFromGithubGistTask")}`;
                    handleGistLog.push(`${usedSeconds}${chrome.i18n.getMessage("secondWait")}`)
                    handleGistLog.push(`${chrome.i18n.getMessage("endPullFromGithubGistTask")}`)
                    handleGistLog.push(`${chrome.i18n.getMessage("end")}${moment().format('YYYY-MM-DD HH:mm:ss')}`);
                    setHandleGistStatus("IDLE");
                    setHandleGistLog(`${chrome.i18n.getMessage("clickPullGithub")}`, true);
                    console.log("pull从github的gist的任务完成");
                }
            }, 1000);
            isStoredGithubTokenLocal("pull_github");
        }
    };

    // 从gitee的gist拉取
    function pullFromGiteeGist() {
        setHandleGistStatus(`${chrome.i18n.getMessage("pullFromGiteeGistIng")}`);
        handleGistLog.length = 0;
        usedSeconds = 0;
        handleGistLog.push(`${chrome.i18n.getMessage("start")}${moment().format('YYYY-MM-DD HH:mm:ss')}`);
        handleGistLog.push(`${chrome.i18n.getMessage("clickPullFromGiteeGist")}`)
        console.log(pullFromGiteeGistStatus);
        pullFromGiteeGistStatus = `${chrome.i18n.getMessage("startPullFromGiteeGistTask")}`;
        console.log("开始pull从gitee的gist的任务");
        handleGistLog.push(`${chrome.i18n.getMessage("startPullFromGiteeGistTask")}`)
        if (typeof (pullFromGiteeGistStatus) != "undefined") {
            console.log("开始工作");
            intervalId = setInterval(function () {
                if (typeof (pullFromGiteeGistStatus) != "undefined") {
                    console.log("秒等待");
                    usedSeconds++;
                    document.getElementById('pullFromGiteeGistStatus').innerHTML = pullFromGiteeGistStatus;
                } else {
                    clearInterval(intervalId);
                    document.getElementById('pullFromGiteeGistStatus').innerHTML = `${chrome.i18n.getMessage("endPullFromGiteeGistTask")}`;
                    handleGistLog.push(`${usedSeconds}${chrome.i18n.getMessage("secondWait")}`)
                    handleGistLog.push(`${chrome.i18n.getMessage("endPullFromGiteeGistTask")}`)
                    handleGistLog.push(`${chrome.i18n.getMessage("end")}${moment().format('YYYY-MM-DD HH:mm:ss')}`);
                    setHandleGistStatus("IDLE");
                    setHandleGistLog(`${chrome.i18n.getMessage("clickPullGitee")}`, true);
                    console.log("pull从gitee的gist的任务完成");
                }
            }, 1000);
            isStoredGiteeTokenLocal("pull_gitee");
        }
    };

    // 推送到github的gist
    function pushToGithubGist() {
        setHandleGistStatus(`${chrome.i18n.getMessage("pushToGithubGistIng")}`);
        handleGistLog.length = 0;
        usedSeconds = 0;
        handleGistLog.push(`${chrome.i18n.getMessage("start")}${moment().format('YYYY-MM-DD HH:mm:ss')}`);
        handleGistLog.push(`${chrome.i18n.getMessage("clickPushToGithubGist")}`)
        console.log(pushToGithubGistStatus);
        pushToGithubGistStatus = `${chrome.i18n.getMessage("startPushToGithubGistTask")}`;
        console.log(pushToGithubGistStatus);
        console.log("开始push到github的gist的任务");
        handleGistLog.push(`${chrome.i18n.getMessage("startPushToGithubGistTask")}`)
        if (typeof (pushToGithubGistStatus) != "undefined") {
            console.log("开始工作");
            intervalId = setInterval(function () {
                if (typeof (pushToGithubGistStatus) != "undefined") {
                    console.log("秒等待");
                    usedSeconds++;
                    document.getElementById('pushToGithubGistStatus').innerHTML = pushToGithubGistStatus;
                } else {
                    clearInterval(intervalId);
                    document.getElementById('pushToGithubGistStatus').innerHTML = `${chrome.i18n.getMessage("endPushToGithubGistTask")}`;
                    handleGistLog.push(`${usedSeconds}${chrome.i18n.getMessage("secondWait")}`)
                    handleGistLog.push(`${chrome.i18n.getMessage("endPushToGithubGistTask")}`)
                    handleGistLog.push(`${chrome.i18n.getMessage("end")}${moment().format('YYYY-MM-DD HH:mm:ss')}`);
                    setHandleGistStatus("IDLE");
                    setHandleGistLog(`${chrome.i18n.getMessage("clickPushGithub")}`, false);
                    console.log("push到github的gist的任务完成");
                }
            }, 1000);
            isStoredGithubTokenLocal("push_github");
        }
    };

    // 推送到gitee的gist
    function pushToGiteeGist() {
        setHandleGistStatus(`${chrome.i18n.getMessage("pushToGiteeGistIng")}`);
        handleGistLog.length = 0;
        usedSeconds = 0;
        handleGistLog.push(`${chrome.i18n.getMessage("start")}${moment().format('YYYY-MM-DD HH:mm:ss')}`);
        handleGistLog.push(`${chrome.i18n.getMessage("clickPushToGiteeGist")}`)
        console.log(pushToGiteeGistStatus);
        pushToGiteeGistStatus = `${chrome.i18n.getMessage("startPushToGiteeGistTask")}`;
        console.log(pushToGiteeGistStatus);
        console.log("开始push到gitee的gist的任务");
        handleGistLog.push(`${chrome.i18n.getMessage("startPushToGiteeGistTask")}`)
        if (typeof (pushToGiteeGistStatus) != "undefined") {
            console.log("开始工作");
            intervalId = setInterval(function () {
                if (typeof (pushToGiteeGistStatus) != "undefined") {
                    console.log("秒等待");
                    usedSeconds++;
                    document.getElementById('pushToGiteeGistStatus').innerHTML = pushToGiteeGistStatus;
                } else {
                    clearInterval(intervalId);
                    document.getElementById('pushToGiteeGistStatus').innerHTML = `${chrome.i18n.getMessage("endPushToGiteeGistTask")}`;
                    handleGistLog.push(`${usedSeconds}${chrome.i18n.getMessage("secondWait")}`)
                    handleGistLog.push(`${chrome.i18n.getMessage("endPushToGiteeGistTask")}`)
                    handleGistLog.push(`${chrome.i18n.getMessage("end")}${moment().format('YYYY-MM-DD HH:mm:ss')}`);
                    setHandleGistStatus("IDLE");
                    setHandleGistLog(`${chrome.i18n.getMessage("clickPushGitee")}`, false);
                    console.log("push到gitee的gist的任务完成");
                }
            }, 1000);
            isStoredGiteeTokenLocal("push_gitee");
        }
    };

    // 构造操作gist的日志结构
    function setHandleGistLog(type, isReload) {
        var handleGistLogMap = { id: genObjectId(), handleGistType: type, handleGistLogs: handleGistLog };
        chrome.storage.local.get(null, function (storage) {
            if (storage.gistLog) {
                console.log("gistLog有值");
                if (storage.gistLog.length >= 100) {
                    var newArr = storage.gistLog;
                    newArr.splice(-1, 1)
                    newArr.unshift(handleGistLogMap);
                    chrome.storage.local.set({ gistLog: newArr });
                    if (isReload) {
                        chrome.tabs.query({ active: true, currentWindow: true }, function (tabsArr) {
                            chrome.tabs.reload(tabsArr[0].id, {}, function (tab) {
                            });
                        });
                    }
                } else {
                    var newArr = storage.gistLog;
                    newArr.unshift(handleGistLogMap);
                    chrome.storage.local.set({ gistLog: newArr });
                    if (isReload) {
                        chrome.tabs.query({ active: true, currentWindow: true }, function (tabsArr) {
                            chrome.tabs.reload(tabsArr[0].id, {}, function (tab) {
                            });
                        });
                    }
                }
            } else {
                console.log("gistLog没有值，第一次");
                chrome.storage.local.set({ gistLog: [handleGistLogMap] });
                if (isReload) {
                    chrome.tabs.query({ active: true, currentWindow: true }, function (tabsArr) {
                        chrome.tabs.reload(tabsArr[0].id, {}, function (tab) {
                        });
                    });
                }
            }
        });
    };

    // 生成唯一标识
    // refer: https://gist.github.com/solenoid/1372386
    var genObjectId = function () {
        var timestamp = (new Date().getTime() / 1000 | 0).toString(16);
        return timestamp + 'xxxxxxxxxxxxxxxx'.replace(/[x]/g, function () {
            return (Math.random() * 16 | 0).toString(16);
        }).toLowerCase();
    };

    // 打开日志页
    function openLogPage() {
        chrome.tabs.query({ url: "chrome-extension://*/log.html*", currentWindow: true }, function (tab) {
            if (tab.length >= 1) {
                chrome.tabs.move(tab[0].id, { index: 0 }, function callback() {
                    chrome.tabs.highlight({ tabs: 0 }, function callback() {
                    });
                });
                chrome.tabs.reload(tab[0].id, {}, function (tab) {
                });
            } else {
                chrome.tabs.create({ index: 0, url: chrome.extension.getURL('log.html') });
            }
        });
    };

    // 操作gist的全局状态
    function setHandleGistStatus(status) {
        var expireTime = moment().add(1, 'minutes').format('YYYY-MM-DD HH:mm:ss');
        var gistStatusMap = { type: status, expireTime: expireTime };
        chrome.storage.local.set({ handleGistStatus: gistStatusMap });
    };

    // 检查跟github的通讯是否正常
    function checkGitHubStatus() {
        $.ajax({
            type: "GET",
            url: gitHubApiUrl,
            success: function (data, status) {
                if (status == "success") {
                    console.log("跟github通讯正常！");
                    document.getElementById('githubStatus').innerHTML = `${chrome.i18n.getMessage("githubApiStatusSuccess")}`;
                } else {
                    document.getElementById('githubStatus').innerHTML = `${chrome.i18n.getMessage("githubApiStatusFailed")}`;
                }
            },
            error: function (xhr, errorText, errorType) {
                document.getElementById('githubStatus').innerHTML = `${chrome.i18n.getMessage("githubApiStatusError")}`;
            },
            complete: function () {
                //do something
            }
        })
    };

    // 检查跟gitee的通讯是否正常
    function checkGiteeStatus() {
        $.ajax({
            type: "GET",
            url: giteeApiUrl + "/emojis",
            success: function (data, status) {
                if (status == "success") {
                    console.log("跟gitee通讯正常！");
                    document.getElementById('giteeStatus').innerHTML = `${chrome.i18n.getMessage("giteeApiStatusSuccess")}`;
                } else {
                    document.getElementById('giteeStatus').innerHTML = `${chrome.i18n.getMessage("giteeApiStatusFailed")}`;
                }
            },
            error: function (xhr, errorText, errorType) {
                document.getElementById('giteeStatus').innerHTML = `${chrome.i18n.getMessage("giteeApiStatusError")}`;
            },
            complete: function () {
                //do something
            }
        })
    };

    // 关闭当前tab
    function closeCurrentTab() {
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabsArr) {
            chrome.tabs.remove(tabsArr[0].id, function () { });
        });
    };

    // 更新github的gist
    function updateGithubGist(content) {
        pushToGithubGistStatus = `${chrome.i18n.getMessage("directUpdate")}`;
        handleGistLog.push(`${chrome.i18n.getMessage("directUpdate")}`)
        console.log("已经创建了gist，直接开始更新");
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
                    console.log("更新成功！");
                    handleGistLog.push(`${chrome.i18n.getMessage("updateSuccess")}`)
                } else {
                    console.log("更新失败！");
                    handleGistLog.push(`${chrome.i18n.getMessage("updateFailed")}`)
                }
            },
            error: function (xhr, errorText, errorType) {
                console.log(xhr);
                console.log(errorText);
                console.log(errorType);
                console.log("报错了！");
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
        pushToGiteeGistStatus = `${chrome.i18n.getMessage("directUpdate")}`;
        handleGistLog.push(`${chrome.i18n.getMessage("directUpdate")}`)
        console.log("已经创建了gist，直接开始更新");
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
                    console.log("更新成功！");
                    handleGistLog.push(`${chrome.i18n.getMessage("updateSuccess")}`)
                } else {
                    console.log("更新失败！");
                    handleGistLog.push(`${chrome.i18n.getMessage("updateFailed")}`)
                }
            },
            error: function (xhr, errorText, errorType) {
                console.log(xhr);
                console.log(errorText);
                console.log(errorType);
                console.log("报错了！");
                handleGistLog.push(`${chrome.i18n.getMessage("updateFailed")}-->${xhr.responseText}`)
            },
            complete: function () {
                //do something
                pushToGiteeGistStatus = undefined;
            }
        })
    };

    // 判断是否已经保存了github的gistId
    function isStoredGithubGistIdLocal(action) {
        console.log("开始检查gistId有没有保存");
        handleGistLog.push(`${chrome.i18n.getMessage("startCheckGistIdSaved")}`)
        if (action == "push_github") {
            pushToGithubGistStatus = `${chrome.i18n.getMessage("startCheckGistIdSaved")}`;
        } else if (action == "pull_github") {
            pullFromGithubGistStatus = `${chrome.i18n.getMessage("startCheckGistIdSaved")}`;
        }
        chrome.storage.local.get("githubGistId", function (storage) {
            console.log(storage.githubGistId);
            if (storage.githubGistId) {
                console.log("gistId有保存");
                handleGistLog.push(`${chrome.i18n.getMessage("gistIdSaved")}`)
                githubGistId = storage.githubGistId;
                if (action == "push_github") {
                    getShardings(function (callback) {
                        if (!callback || typeof callback == 'undefined' || callback == undefined) {
                            console.log("本地storage里没有内容");
                            updateGithubGist([]);
                        } else {
                            updateGithubGist(callback);
                        }
                    })
                } else if (action == "pull_github") {
                    getGithubGistById();
                }
            } else {
                console.log("gistId没有保存");
                handleGistLog.push(`${chrome.i18n.getMessage("gistIdNoSaved")}`)
                isHadCreateGithubGist(action);
            }
        });
    }


    // 判断是否已经保存了gitee的gistId
    function isStoredGiteeGistIdLocal(action) {
        console.log("开始检查gistId有没有保存");
        handleGistLog.push(`${chrome.i18n.getMessage("startCheckGistIdSaved")}`)
        if (action == "push_gitee") {
            pushToGiteeGistStatus = `${chrome.i18n.getMessage("startCheckGistIdSaved")}`;
        } else if (action == "pull_gitee") {
            pullFromGiteeGistStatus = `${chrome.i18n.getMessage("startCheckGistIdSaved")}`;
        }
        chrome.storage.local.get("giteeGistId", function (storage) {
            console.log(storage.giteeGistId);
            if (storage.giteeGistId) {
                console.log("gistId有保存");
                handleGistLog.push(`${chrome.i18n.getMessage("gistIdSaved")}`)
                giteeGistId = storage.giteeGistId;
                if (action == "push_gitee") {
                    getShardings(function (callback) {
                        if (!callback || typeof callback == 'undefined' || callback == undefined) {
                            console.log("本地storage里没有内容");
                            updateGiteeGist([]);
                        } else {
                            updateGiteeGist(callback);
                        }
                    })
                } else if (action == "pull_gitee") {
                    getGiteeGistById();
                }
            } else {
                console.log("gistId没有保存");
                handleGistLog.push(`${chrome.i18n.getMessage("gistIdNoSaved")}`)
                isHadCreateGiteeGist(action);
            }
        });
    }

    // 通过gistId获取github gist
    function getGithubGistById() {
        console.log("根据gistId拉取gist");
        handleGistLog.push(`${chrome.i18n.getMessage("getGithubGistById")}`)
        pullFromGithubGistStatus = `${chrome.i18n.getMessage("getGithubGistById")}`;
        $.ajax({
            type: "GET",
            url: gitHubApiUrl + "/gists/" + githubGistId,
            success: function (data, status) {
                if (status == "success") {
                    if (data.files['brower_Tabs.json'].truncated) {
                        var rawUrl = data.files['brower_Tabs.json'].raw_url;
                        console.log(rawUrl)
                        getGithubGistByRawUrl(rawUrl);
                    } else {
                        saveShardings(data.files['brower_Tabs.json'].content, "string");
                        handleGistLog.push(`${chrome.i18n.getMessage("pullSuccess")}`);
                        pullFromGithubGistStatus = undefined;
                    }
                } else {
                    alert("根据gistId拉取gist失败了");
                    handleGistLog.push(`${chrome.i18n.getMessage("pullFailed")}`)
                    pullFromGithubGistStatus = undefined;
                }
            },
            error: function (xhr, errorText, errorType) {
                alert("根据gistId拉取gist报错了");
                handleGistLog.push(`${chrome.i18n.getMessage("pullFailed")}-->${xhr.responseText}`)
                pullFromGithubGistStatus = undefined;
            },
            complete: function () {
                //do something
            }
        })
    }

    function getGithubGistByRawUrl(rawUrl) {
        console.log("根据raw_url拉取gist");
        handleGistLog.push(`${chrome.i18n.getMessage("getGithubGistByRawUrl")}`)
        pullFromGithubGistStatus = `${chrome.i18n.getMessage("getGithubGistByRawUrl")}`;
        $.ajax({
            type: "GET",
            url: rawUrl,
            success: function (data, status) {
                if (status == "success") {
                    saveShardings(data, "string");
                    handleGistLog.push(`${chrome.i18n.getMessage("pullSuccess")}`);
                } else {
                    alert("根据rawUrl拉取gist失败了");
                    handleGistLog.push(`${chrome.i18n.getMessage("pullFailed")}`)
                }
            },
            error: function (xhr, errorText, errorType) {
                alert("根据rawUrl拉取gist报错了");
                handleGistLog.push(`${chrome.i18n.getMessage("pullFailed")}-->${xhr.responseText}`)
            },
            complete: function () {
                //do something
                pullFromGithubGistStatus = undefined;
            }
        })
    }

    // 通过gistId获取gitee gist
    function getGiteeGistById() {
        console.log("根据gistId拉取gist");
        handleGistLog.push(`${chrome.i18n.getMessage("getGiteeGistById")}`)
        pullFromGiteeGistStatus = `${chrome.i18n.getMessage("getGiteeGistById")}`;
        $.ajax({
            type: "GET",
            url: giteeApiUrl + "/gists/" + giteeGistId + "?access_token=" + giteeGistToken,
            success: function (data, status) {
                if (status == "success") {
                    saveShardings(data.files['brower_Tabs.json'].content, "string");
                    handleGistLog.push(`${chrome.i18n.getMessage("pullSuccess")}`)
                } else {
                    alert("根据gistId拉取gist失败了");
                    handleGistLog.push(`${chrome.i18n.getMessage("pullFailed")}`)
                }
            },
            error: function (xhr, errorText, errorType) {
                alert("根据gistId拉取gist报错了");
                handleGistLog.push(`${chrome.i18n.getMessage("pullFailed")}-->${xhr.responseText}`)
            },
            complete: function () {
                //do something
                pullFromGiteeGistStatus = undefined;
            }
        })
    }

    // 判断是否已经创建了gitee的gist
    function isHadCreateGiteeGist(action) {
        console.log("检查是否已经创建了gist");
        handleGistLog.push(`${chrome.i18n.getMessage("startCheckGistCreated")}`)
        if (action == "push_gitee") {
            pushToGiteeGistStatus = `${chrome.i18n.getMessage("startCheckGistCreated")}`;
        } else if (action == "pull_gitee") {
            pullFromGiteeGistStatus = `${chrome.i18n.getMessage("startCheckGistCreated")}`;
        }
        $.ajax({
            type: "GET",
            url: giteeApiUrl + "/gists?access_token=" + giteeGistToken,
            success: function (data, status) {
                if (status == "success") {
                    console.log("查到所有gists！");
                    var i;
                    var flag;
                    for (i = 0; i < data.length; i += 1) {
                        if (data[i].description == "myCloudSkyMonster") {
                            console.log("已经创建了gist");
                            handleGistLog.push(`${chrome.i18n.getMessage("gistCreated")}`)
                            giteeGistId = data[i].id;
                            chrome.storage.local.set({ giteeGistId: data[i].id });
                            handleGistLog.push(`${chrome.i18n.getMessage("getGistIdAndSaved")}`)
                            console.log("获取gistId并保存完毕");
                            console.log(giteeGistId);
                            flag = true;
                            break
                        } else {
                            console.log("还没有创建gist");
                            flag = false;
                        }
                    }
                    if (!flag) {
                        handleGistLog.push(`${chrome.i18n.getMessage("gistNoCreated")}`)
                        if (action == "push_gitee") {
                            getShardings(function (callback) {
                                if (!callback || typeof callback == 'undefined' || callback == undefined) {
                                    console.log("本地storage里没有内容");
                                    createGiteeGist([]);
                                } else {
                                    createGiteeGist(callback);
                                }
                            })
                        } else if (action == "pull_gitee") {
                            console.log("还没有创建gist,没有内容可以拉,结束任务");
                            handleGistLog.push(`${chrome.i18n.getMessage("noGistCreatedAndOver")}`)
                            pullFromGiteeGistStatus = undefined;
                        }
                    } else {
                        if (action == "push_gitee") {
                            getShardings(function (callback) {
                                if (!callback || typeof callback == 'undefined' || callback == undefined) {
                                    console.log("本地storage里没有内容");
                                    updateGiteeGist([]);
                                } else {
                                    updateGiteeGist(callback);
                                }
                            })
                        } else if (action == "pull_gitee") {
                            getGiteeGistById();
                        }
                    }
                } else {
                    alert("获取所有gists时失败了");
                    handleGistLog.push(`${chrome.i18n.getMessage("pullFailed")}`)
                }
            },
            error: function (xhr, errorText, errorType) {
                alert("获取所有gists时报错了");
                handleGistLog.push(`${chrome.i18n.getMessage("pullFailed")}-->${xhr.responseText}`)
            },
            complete: function () {
                //do something
            }
        })
    }

    // 判断是否已经创建了github的gist
    function isHadCreateGithubGist(action) {
        console.log("检查是否已经创建了gist");
        handleGistLog.push(`${chrome.i18n.getMessage("startCheckGistCreated")}`)
        if (action == "push_github") {
            pushToGithubGistStatus = `${chrome.i18n.getMessage("startCheckGistCreated")}`;
        } else if (action == "pull_github") {
            pullFromGithubGistStatus = `${chrome.i18n.getMessage("startCheckGistCreated")}`;
        }
        $.ajax({
            type: "GET",
            url: gitHubApiUrl + "/gists?access_token=" + githubGistToken,
            success: function (data, status) {
                if (status == "success") {
                    console.log("查到所有gists！");
                    var i;
                    var flag;
                    for (i = 0; i < data.length; i += 1) {
                        if (data[i].description == "myCloudSkyMonster") {
                            console.log("已经创建了gist");
                            handleGistLog.push(`${chrome.i18n.getMessage("gistCreated")}`)
                            githubGistId = data[i].id;
                            chrome.storage.local.set({ githubGistId: data[i].id });
                            handleGistLog.push(`${chrome.i18n.getMessage("getGistIdAndSaved")}`)
                            console.log("获取gistId并保存完毕");
                            console.log(githubGistId);
                            flag = true;
                            break
                        } else {
                            console.log("还没有创建gist");
                            flag = false;
                        }
                    }
                    if (!flag) {
                        handleGistLog.push(`${chrome.i18n.getMessage("gistNoCreated")}`)
                        if (action == "push_github") {
                            getShardings(function (callback) {
                                if (!callback || typeof callback == 'undefined' || callback == undefined) {
                                    console.log("本地storage里没有内容");
                                    createGithubGist([]);
                                } else {
                                    createGithubGist(callback);
                                }
                            })
                        } else if (action == "pull_github") {
                            console.log("还没有创建gist,没有内容可以拉,结束任务");
                            handleGistLog.push(`${chrome.i18n.getMessage("noGistCreatedAndOver")}`)
                            pullFromGithubGistStatus = undefined;
                        }
                    } else {
                        if (action == "push_github") {
                            getShardings(function (callback) {
                                if (!callback || typeof callback == 'undefined' || callback == undefined) {
                                    console.log("本地storage里没有内容");
                                    updateGithubGist([]);
                                } else {
                                    updateGithubGist(callback);
                                }
                            })
                        } else if (action == "pull_github") {
                            getGithubGistById();
                        }
                    }
                } else {
                    alert("获取所有gists时失败了");
                    handleGistLog.push(`${chrome.i18n.getMessage("pullFailed")}`)
                }
            },
            error: function (xhr, errorText, errorType) {
                alert("获取所有gists时报错了");
                handleGistLog.push(`${chrome.i18n.getMessage("pullFailed")}-->${xhr.responseText}`)
            },
            complete: function () {
                //do something
            }
        })
    }

    // 判断是否已经保存github的Token
    function isStoredGithubTokenLocal(action) {
        console.log("开始检查githubtoken有没有保存");
        handleGistLog.push(`${chrome.i18n.getMessage("startCheckGithubTokenSaved")}`);
        if (action == "push_github") {
            pushToGithubGistStatus = `${chrome.i18n.getMessage("startCheckGithubTokenSaved")}`;
        } else if (action == "pull_github") {
            pullFromGithubGistStatus = `${chrome.i18n.getMessage("startCheckGithubTokenSaved")}`;
        }
        chrome.storage.local.get("githubGistToken", function (storage) {
            console.log(storage.githubGistToken);
            if (storage.githubGistToken) {
                console.log("githubtoken有保存");
                handleGistLog.push(`${chrome.i18n.getMessage("githubTokenSaved")}`);
                githubGistToken = storage.githubGistToken;
                isStoredGithubGistIdLocal(action);
            } else {
                console.log("githubtoken没有保存");
                handleGistLog.push(`${chrome.i18n.getMessage("githubTokenNoSaved")}`);
                var token = prompt(`${chrome.i18n.getMessage("saveTokenKey")}`, `${chrome.i18n.getMessage("saveTokenValue")}`);
                githubGistToken = token;
                chrome.storage.local.set({ githubGistToken: token });
                console.log("githubtoken保存完毕");
                handleGistLog.push(`${chrome.i18n.getMessage("githubTokenSaveSuccess")}`)
                isStoredGithubGistIdLocal(action);
            }
        });
    }

    // 判断是否已经保存gitee的Token
    function isStoredGiteeTokenLocal(action) {
        console.log("开始检查giteetoken有没有保存");
        handleGistLog.push(`${chrome.i18n.getMessage("startCheckGiteeTokenSaved")}`);
        if (action == "push_gitee") {
            pushToGiteeGistStatus = `${chrome.i18n.getMessage("startCheckGiteeTokenSaved")}`;
        } else if (action == "pull_gitee") {
            pullFromGiteeGistStatus = `${chrome.i18n.getMessage("startCheckGiteeTokenSaved")}`;
        }
        chrome.storage.local.get("giteeGistToken", function (storage) {
            console.log(storage.giteeGistToken);
            if (storage.giteeGistToken) {
                console.log("giteetoken有保存");
                handleGistLog.push(`${chrome.i18n.getMessage("giteeTokenSaved")}`);
                giteeGistToken = storage.giteeGistToken;
                isStoredGiteeGistIdLocal(action);
            } else {
                console.log("giteetoken没有保存");
                handleGistLog.push(`${chrome.i18n.getMessage("giteeTokenNoSaved")}`);
                var token = prompt(`${chrome.i18n.getMessage("saveTokenKey")}`, `${chrome.i18n.getMessage("saveTokenValue")}`);
                giteeGistToken = token;
                chrome.storage.local.set({ giteeGistToken: token });
                console.log("giteetoken保存完毕");
                handleGistLog.push(`${chrome.i18n.getMessage("giteeTokenSaveSuccess")}`)
                isStoredGiteeGistIdLocal(action);
            }
        });
    }

    // 创建github的gist
    function createGithubGist(content) {
        console.log("还没有创建gist,开始创建");
        handleGistLog.push(`${chrome.i18n.getMessage("startCreateGithubGist")}`)
        pushToGithubGistStatus = `${chrome.i18n.getMessage("startCreateGithubGist")}`;
        var content = JSON.stringify(content);
        var data = {
            "description": "myCloudSkyMonster",
            "public": false,
            "files": {
                "brower_Tabs.json": { "content": content }
            }
        }
        $.ajax({
            type: "POST",
            url: gitHubApiUrl + "/gists?access_token=" + githubGistToken,
            dataType: "json",
            data: JSON.stringify(data),
            success: function (data, status) {
                if (status == "success") {
                    console.log("创建成功！");
                    handleGistLog.push(`${chrome.i18n.getMessage("createSuccess")}`)
                } else {
                    console.log("创建失败！");
                    handleGistLog.push(`${chrome.i18n.getMessage("createFailed")}`)
                }
            },
            error: function (xhr, errorText, errorType) {
                console.log(xhr);
                console.log(errorText);
                console.log(errorType);
                console.log("报错了！");
                handleGistLog.push(`${chrome.i18n.getMessage("createFailed")}-->${xhr.responseText}`)
            },
            complete: function () {
                //do something
                pushToGithubGistStatus = undefined;
            }
        })
    };

    // 创建gitee的gist
    function createGiteeGist(content) {
        console.log("还没有创建gist,开始创建");
        handleGistLog.push(`${chrome.i18n.getMessage("startCreateGiteeGist")}`)
        pushToGiteeGistStatus = `${chrome.i18n.getMessage("startCreateGiteeGist")}`;
        var content = JSON.stringify(content);
        var data = {
            "description": "myCloudSkyMonster",
            "public": false,
            "files": {
                "brower_Tabs.json": { "content": content }
            }
        }
        $.ajax({
            type: "POST",
            url: giteeApiUrl + "/gists?access_token=" + giteeGistToken,
            dataType: "json",
            data: data,
            success: function (data, status) {
                if (status == "success") {
                    console.log("创建成功！");
                    handleGistLog.push(`${chrome.i18n.getMessage("createSuccess")}`)
                } else {
                    console.log("创建失败！");
                    handleGistLog.push(`${chrome.i18n.getMessage("createFailed")}`)
                }
            },
            error: function (xhr, errorText, errorType) {
                console.log(xhr);
                console.log(errorText);
                console.log(errorType);
                console.log("报错了！");
                handleGistLog.push(`${chrome.i18n.getMessage("createFailed")}-->${xhr.responseText}`)
            },
            complete: function () {
                //do something
                pushToGiteeGistStatus = undefined;
            }
        })
    };

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
    };

    // 生成唯一标识
    // refer: https://gist.github.com/solenoid/1372386
    var genObjectId = function () {
        var timestamp = (new Date().getTime() / 1000 | 0).toString(16);
        return timestamp + 'xxxxxxxxxxxxxxxx'.replace(/[x]/g, function () {
            return (Math.random() * 16 | 0).toString(16);
        }).toLowerCase();
    };

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
    };

    // 获取local storage
    function getShardings(cb) {
        chrome.storage.local.get(null, function (items) {
            var tabGroupsStr = "";
            if (items.tabGroups_num >= 1) {
                // 把分片数据组成字符串
                for (var i = 0; i < items.tabGroups_num; i++) {
                    tabGroupsStr += items["tabGroups_" + i];
                }
                console.log(JSON.parse(tabGroupsStr));
                cb(JSON.parse(tabGroupsStr));
            } else {
                cb();
            }
        });
    }

    // 移除local storage
    function removeShardings(cb) {
        chrome.storage.local.get(null, function (items) {
            if (items.tabGroups_num >= 1) {
                for (var i = 0; i < items.tabGroups_num; i++) {
                    chrome.storage.local.remove("tabGroups_" + i, function callback() { });
                }
                chrome.storage.local.remove("tabGroups_num", function callback() { });
            }
        });
        cb("ok");
    }

    // 保存local storage
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

    // 展示保存的所有url
    function showAllTabs() {
        chrome.storage.local.get(function (storage) {
            console.log(storage)
            var bridge = [];
            if (storage.tabGroups_num) {
                var tabGroupsStr = "";
                // 把分片数据组成字符串
                for (var i = 0; i < storage.tabGroups_num; i++) {
                    tabGroupsStr += storage["tabGroups_" + i];
                }
                bridge = JSON.parse(tabGroupsStr);
                console.log(bridge)
            }
            var i;
            var total = 0;
            for (i = 0; i < bridge.length; i += 1) {
                total += bridge[i].tabs.length;
            }
            document.getElementById('totalTabs').innerHTML = total;
            var titleClass, tabClass;
            if (storage.dragType == "dragTitle") {
                titleClass = ".my-handle"
                tabClass = ""
            } else {
                titleClass = ""
                tabClass = ".my-handle"
            }
            var tabs = {}, // to-be module
                tabGroups = bridge || [], // tab groups
                opts = storage.options || {
                    deleteTabOnOpen: 'no'
                };
            function saveTabGroups(json) {
                saveShardings(json, "object");
                var i;
                var total = 0;
                for (i = 0; i < json.length; i += 1) {
                    total += json[i].tabs.length;
                }
                document.getElementById('totalTabs').innerHTML = total;
            }

            // model entity
            // 'data' is meant to be a tab group object from localStorage
            tabs.TabGroup = function (data) {
                this.date = m.prop(data.date);
                this.id = m.prop(data.id);
                this.tabs = m.prop(data.tabs);
            };

            // alias for Array
            tabs.TabGroupsList = Array;

            // view-model
            tabs.vm = new function () {
                var vm = {};
                vm.init = function () {
                    // list of tab groups
                    vm.list = new tabs.TabGroupsList();

                    vm.rmGroup = function (groupIndex) {
                        // remove from localStorage
                        tabGroups.splice(groupIndex, 1);
                        // save
                        saveTabGroups(tabGroups);
                        showAllTabs();
                    };

                    vm.moveGroup = function (index, tindex) {
                        if (index > tindex) {
                            tabGroups.splice(tindex, 0, tabGroups[index]);
                            tabGroups.splice(index + 1, 1);
                            saveTabGroups(tabGroups);
                        } else {
                            tabGroups.splice(tindex + 1, 0, tabGroups[index]);
                            tabGroups.splice(index, 1);
                            saveTabGroups(tabGroups);
                        }
                    };

                    vm.rmTab = function (groupIndex, index) {
                        tabGroups[groupIndex].tabs.splice(index, 1);
                        // save
                        saveTabGroups(tabGroups);
                        showAllTabs();
                    };

                    vm.moveTab = function (groupIndex, index, tgroupIndex, tindex) {
                        if (groupIndex == tgroupIndex) {
                            if (index > tindex) {
                                tabGroups[groupIndex].tabs.splice(tindex, 0, tabGroups[groupIndex].tabs[index]);
                                tabGroups[groupIndex].tabs.splice(index + 1, 1);
                                saveTabGroups(tabGroups);
                            } else {
                                tabGroups[groupIndex].tabs.splice(tindex + 1, 0, tabGroups[groupIndex].tabs[index]);
                                tabGroups[groupIndex].tabs.splice(index, 1);
                                saveTabGroups(tabGroups);
                            }
                        } else {
                            tabGroups[tgroupIndex].tabs.splice(tindex, 0, tabGroups[groupIndex].tabs[index]);
                            tabGroups[groupIndex].tabs.splice(index, 1);
                            saveTabGroups(tabGroups);
                        }
                    };


                };
                return vm;
            };

            tabs.controller = function () {
                var i;
                tabs.vm.init();
                for (i = 0; i < tabGroups.length; i += 1) {
                    tabs.vm.list.push(new tabs.TabGroup(tabGroups[i]));
                }
            };

            tabs.view = function () {
                if (tabs.vm.list.length === 0) {
                    return m('p', `${chrome.i18n.getMessage("noTabs")}`);
                }

                // foreach tab group
                return tabs.vm.list.map(function (group, i) {
                    // console.log(tabs.vm.list);
                    // console.log(group.tabs());
                    // console.log(i);
                    // group
                    return m('div' + titleClass, {
                        id: i
                    }, [
                        m('div.group-title', [
                            m('span.delete-link', {
                                onclick: function () {
                                    tabs.vm.rmGroup(i);
                                }
                            }),
                            m('span.group-amount', {
                                onclick: function () {
                                    $("#tabs_" + i).slideToggle();
                                }
                            }, group.tabs().length + ' Tabs'),
                            ' ',
                            m('span.group-date', moment(group.date()).format('YYYY-MM-DD, HH:mm:ss')),
                            ' ',
                            m('span.restore-all', {
                                onclick: function () {
                                    var j;

                                    // reason this goes first and not after is because it doesn't work otherwise
                                    // I imagine it's because you changed tab and stuff
                                    if (opts.deleteTabOnOpen === 'yes') {
                                        tabs.vm.rmGroup(i);
                                    }

                                    for (j = 0; j < group.tabs().length; j += 1) {
                                        chrome.tabs.create({
                                            url: group.tabs()[j].url
                                        });
                                    }
                                }
                            }, 'Restore group')
                        ]),
                        // foreach tab
                        m('ul' + tabClass, {
                            id: "tabs_" + i
                        }, group.tabs().map(function (tab, ii) {
                            return m('li.li-hover', [
                                m('span.delete-link', {
                                    onclick: function () {
                                        tabs.vm.rmTab(i, ii);
                                    }
                                }),
                                // m('img', { src: tab.favIconUrl, height: '16', width: '16' }),
                                // ' ',
                                m('span.link', {
                                    title: tab.title + "\n" + tab.url,
                                    onclick: function () {
                                        if (opts.deleteTabOnOpen === 'yes') {
                                            tabs.vm.rmTab(i, ii);
                                        }
                                        chrome.tabs.create({
                                            url: tab.url, active: false
                                        });
                                    }
                                }, tab.title)
                            ]);
                        }))
                    ]);
                });
            };


            // init the app
            m.module(document.getElementById('tabGroups'), { controller: tabs.controller, view: tabs.view });

            if (storage.dragType == "dragTitle") {
                if (sortableTabList.length > 0) {
                    var j;
                    for (j = 0; j < sortableTabList.length; j += 1) {
                        sortableTabList[j].option("disabled", true);
                    }
                }
                if (typeof (sortableTitle) != "undefined") {
                    sortableTitle.option("disabled", false);
                } else {
                    sortableTitle = Sortable.create(document.getElementById("tabGroups"), {
                        group: {
                            name: "tabGroups",
                            pull: false,
                            put: false
                        },
                        scroll: true,
                        easing: "cubic-bezier(1, 0, 0, 1)",
                        animation: 150, //动画参数
                        ghostClass: 'ghost',
                        onEnd: function (evt) { //拖拽完毕之后发生该事件
                            // console.log(evt)
                            // console.log(evt.item);
                            // console.log(evt.to);
                            // console.log(evt.from);
                            // console.log(evt.oldIndex);
                            // console.log(evt.newIndex);
                            // console.log(evt.oldDraggableIndex);
                            // console.log(evt.newDraggableIndex);
                            tabs.vm.moveGroup(evt.oldIndex, evt.newIndex);
                            showAllTabs();
                        }
                    });
                };
            };
            if (storage.dragType == "dragUrls") {
                var j;
                if (typeof (sortableTitle) != "undefined") {
                    sortableTitle.option("disabled", true);
                }
                sortableTabList.length = 0;
                for (j = 0; j < bridge.length; j += 1) {
                    var sortableTab = Sortable.create(document.getElementById("tabs_" + j), {
                        group: {
                            name: "tabs",
                            pull: true,
                            put: true
                        },
                        easing: "cubic-bezier(1, 0, 0, 1)",
                        scroll: true,
                        swapThreshold: 0.65,
                        animation: 150, //动画参数
                        onEnd: function (evt) {
                            // console.log(evt)
                            // console.log(evt.item);
                            // console.log(evt.to);
                            // console.log(evt.from);
                            // console.log(evt.oldIndex);
                            // console.log(evt.newIndex);
                            // console.log(evt.oldDraggableIndex);
                            // console.log(evt.newDraggableIndex);
                            // console.log("从" + evt.from.parentNode.id + "的" + evt.oldIndex + "到" + evt.to.parentNode.id + "的" + evt.newIndex)
                            tabs.vm.moveTab(evt.from.parentNode.id, evt.oldIndex, evt.to.parentNode.id, evt.newIndex)
                            showAllTabs();
                        }
                    })
                    sortableTabList.push(sortableTab);
                };
            };
        });
    };
}(m));