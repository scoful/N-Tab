;(function (m) {
    'use strict';
    let githubGistToken;
    let giteeGistToken;
    let githubGistId;
    let giteeGistId;
    let gitHubApiUrl = "https://api.github.com";
    let giteeApiUrl = "https://gitee.com/api/v5";
    let pushToGithubGistStatus;
    let pullFromGithubGistStatus;
    let pushToGiteeGistStatus;
    let pullFromGiteeGistStatus;
    let handleGistLog = [];
    let sortableTitle;
    let sortableTabList = [];
    let sortableDelTitle;
    let sortableDelTabList = [];
    // 定义一个n次循环定时器
    let intervalId;
    let usedSeconds;
    let emojiReg = /[\uD83C|\uD83D|\uD83E][\uDC00-\uDFFF][\u200D|\uFE0F]|[\uD83C|\uD83D|\uD83E][\uDC00-\uDFFF]|[0-9|*|#]\uFE0F\u20E3|[0-9|#]\u20E3|[\u203C-\u3299]\uFE0F\u200D|[\u203C-\u3299]\uFE0F|[\u2122-\u2B55]|\u303D|[\A9|\AE]\u3030|\uA9|\uAE|\u3030/gi;
    let startTime;
    let endTime;
    // 定义一个桌面通知框id
    let notificationId;
    // 定义2种已使用状态标识变量
    let isStateOne = true;

    document.addEventListener('DOMContentLoaded', function () {
        console.log("load完workbench了");

        // 获取本机storage
        chrome.storage.local.get(function (storage) {
            console.log(storage);
        });

        // 获取可同步storage
        chrome.storage.sync.get(function (storage) {
            console.log(storage);
        });

        // 获取全部定时任务alarm
        chrome.alarms.getAll(function (alarms) {
            console.log(alarms)
        });

        // 动态加载菜单
        document.querySelector(".navbar").innerHTML = `
            <div class="container">
                <div class="navbar-header">
                    <button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#navbar"
                        aria-expanded="false" aria-controls="navbar">
                        <span class="sr-only">Toggle navigation</span>
                        <span class="icon-bar"></span>
                        <span class="icon-bar"></span>
                        <span class="icon-bar"></span>
                    </button>
                    <a class="navbar-brand" href="#home">N-Tab</a>
                </div>
                <div id="navbar" class="navbar-collapse collapse">
                    <ul class="nav navbar-nav">
                        <li class="active"><a href="#home">${chrome.i18n.getMessage("home")}</a></li>
                        <li>
                            <a href="#">
                                <span id="totals"></span>
                            </a>
                        </li>
                        <li class="dropdown">
                            <a href="#" class="dropdown-toggle" data-toggle="dropdown" role="button"
                                aria-haspopup="true" aria-expanded="false">${chrome.i18n.getMessage("gistFunction")}<span class="caret"></span></a>
                            <ul id="gist" class="dropdown-menu">
                                <li id="pushToGithubGist"><a href="#">${chrome.i18n.getMessage("pushToGithubGist")}</a>
                                </li>
                                <li id="pullFromGithubGist"><a
                                        href="#">${chrome.i18n.getMessage("pullFromGithubGist")}</a></li>
                                <li role="separator" class="divider"></li>
                                <li id="pushToGiteeGist"><a href="#">${chrome.i18n.getMessage("pushToGiteeGist")}</a>
                                </li>
                                <li id="pullFromGiteeGist"><a
                                        href="#">${chrome.i18n.getMessage("pullFromGiteeGist")}</a></li>
                                <li role="separator" class="divider"></li>
                                <li><a href="#">${chrome.i18n.getMessage("autoSync")} <input id="autoSync"
                                            data-size="mini" type="checkbox"></a></li>
                            </ul>
                        </li>
                        <li class="dropdown">
                            <a href="#" class="dropdown-toggle" data-toggle="dropdown" role="button"
                                aria-haspopup="true" aria-expanded="false">${chrome.i18n.getMessage("otherFunction")}<span class="caret"></span></a>
                            <ul id="others" class="dropdown-menu">
                                <li id="showLog"><a href="#logs">${chrome.i18n.getMessage("showLog")}</a></li>
                                <li id="showOptions"><a href="#options">${chrome.i18n.getMessage("optionsValue")}</a></li>
                                <li role="separator" class="divider"></li>
                                <li id="openImportOnetab"><a href="#importOnetab">${chrome.i18n.getMessage("hideShowImportOnetabFunction")}</a></li>
                                <li id="openImportDefault"><a href="#importDefault">${chrome.i18n.getMessage("hideShowImportDefaultFunction")}</a></li>
                                <li id="openExport"><a href="#export">${chrome.i18n.getMessage("hideShowExportFunction")}</a></li>
                                <li role="separator" class="divider"></li>
                                <li><a href="#">${chrome.i18n.getMessage("dragTitle")} <input id="dragTitle" data-size="mini" type="checkbox"></a></li>
                                <li><a href="#">${chrome.i18n.getMessage("dragTabs")} <input id="dragUrls" data-size="mini" type="checkbox"></a></li>
                                <li role="separator" class="divider"></li>
                                <li><a href="#">${chrome.i18n.getMessage("dragOpenTranslate")} <input id="dragOpenTranslate" data-size="mini" type="checkbox"></a></li>
                            </ul>
                        </li>
                        <li>
                            <a href="#baks"><span id="showBaks">${chrome.i18n.getMessage("showBaks")}</span></a>
                        </li>
                        <li>
                            <a><span id="usage"></span></a>
                        </li>
                        <li class="dropdown">
                            <a href="#" class="dropdown-toggle" data-toggle="dropdown" role="button"
                                aria-haspopup="true" aria-expanded="false"><span class="glyphicon glyphicon-heart"></span> ${chrome.i18n.getMessage("donate")}<span class="caret"></span></a>
                            <ul id="others" class="dropdown-menu">
                                <li>
                                    <img src="https://fc.sinaimg.cn/large/692b2078gy1gbslrzhjmfj20gh0ettca.jpg">
                                </li>
                                <li role="separator" class="divider"></li>
                                <li>
                                    <img src="https://fc.sinaimg.cn/large/692b2078gy1hlbzrivgaxj20bf0ccdhu.jpg">
                                </li>
                                    
                            </ul>
                        </li>
                    </ul>
                </div>
                <!--/.nav-collapse -->
            </div>
        `;

        // 动态加载内容
        document.getElementById("body").innerHTML = `
        <div>
                <div id="importOneTab"  class="hide">
                    <span>${chrome.i18n.getMessage("hideShowImportOnetabFunction")}</span>
                    <textarea id="importOnetabTextarea" style="width: 100%; height: 200px; margin-top:5px">
https://www.baidu.com | BaiDu
https://www.google.com | Google

https://www.baidu.com | BaiDu
https://www.google.com | Google
</textarea>
                    <div style="margin-bottom:5px">
                        <button id="importOnetabMode" type="button"
                            class="btn btn-default">${chrome.i18n.getMessage("importToLocal")}</button>
                        <span>${chrome.i18n.getMessage("importWarn")}</span>
                    </div>
                </div>
                <div id="importDefault" class="hide">
                    <span>${chrome.i18n.getMessage("hideShowImportDefaultFunction")}</span>
                    <textarea id="importDefaultTextarea" style="width: 100%; height: 200px; margin-top:5px">
标签组名 | 锁定 | 置顶
https://www.baidu.com | BaiDu
https://www.google.com | Google

 | 解锁 | 不置顶
https://www.baidu.com | BaiDu
https://www.google.com | Google
</textarea>
                    <div style="margin-bottom:5px">
                        <button id="importDefaultMode" type="button"
                            class="btn btn-default">${chrome.i18n.getMessage("importToLocal")}</button>
                        <span>${chrome.i18n.getMessage("importWarn")}</span>
                    </div>
                </div>
                <div id="exportDefault" class="hide">
                    <sapn>${chrome.i18n.getMessage("hideShowExportFunction")}</sapn>
                    <textarea id="exportTextarea" style="width: 100%; height: 200px; margin-top:5px"></textarea>
                    <div style="margin-bottom:5px">
                        <button id="export" type="button" class="btn btn-default">${chrome.i18n.getMessage("exportToLocal")}</button>
                        <span>${chrome.i18n.getMessage("exportWarn")}</span>
                    </div>
                </div>
                <div id="tabGroups"></div>
                <div id="logs"></div>
                <div id="tabGroupsBak"></div>
                <div id="options" class="div-top"></div>
            </div>
            <a href="#top" class="btn btn-primary fixed-bottom-right">${chrome.i18n.getMessage("backToTop")}</a>
            <hr>
            <div class="blog-footer">
            <p>${chrome.i18n.getMessage("sourceCode")}<a
                    href="https://github.com/scoful/cloudSkyMonster">GitHub</a>.</p>
            <p>${chrome.i18n.getMessage("contract")}</p>
            <hr>
            </div>
        </div>

        `;

        // 控制导航阴影
        $("#navbar ul li").click(function () {
            $(this).addClass("active").siblings().removeClass("active");
        })

        // 初始化界面
        chrome.storage.local.get(null, function (items) {
            // 一load完就算一下storage占用了多少空间
            chrome.storage.local.getBytesInUse(null, function (bytes) {
                isStateOne = false
                console.log("total is " + (bytes / 1024 / 1024).toFixed(3) + "mb");
                document.getElementById('usage').innerHTML = `${chrome.i18n.getMessage("usedSpace")}${(bytes / 1024 / 1024).toFixed(3)}mb / 10mb`;
            });

            // 处理是否拖曳标签组和标签
            let dragType = items.dragType;
            if (dragType === "dragUrls") {
                $('#dragUrls').bootstrapSwitch({
                    state: true,
                    onText: `${chrome.i18n.getMessage("yes")}`,
                    offText: `${chrome.i18n.getMessage("no")}`,
                    onColor: "success",
                    offColor: "danger",
                    onSwitchChange: function (event, state) {
                        if (state === true) {
                            $('#dragTitle').bootstrapSwitch("state", false, true)
                            chrome.storage.local.set({"dragType": "dragUrls"});
                            refresh()
                        } else {
                            $('#dragTitle').bootstrapSwitch("state", true, true)
                            chrome.storage.local.set({"dragType": "dragTitle"});
                            refresh()
                        }
                    }
                });
                $('#dragTitle').bootstrapSwitch({
                    state: false,
                    onText: `${chrome.i18n.getMessage("yes")}`,
                    offText: `${chrome.i18n.getMessage("no")}`,
                    onColor: "success",
                    offColor: "danger",
                    onSwitchChange: function (event, state) {
                        if (state === true) {
                            $('#dragUrls').bootstrapSwitch("state", false, true)
                            chrome.storage.local.set({"dragType": "dragTitle"});
                            refresh()
                        } else {
                            $('#dragUrls').bootstrapSwitch("state", true, true)
                            chrome.storage.local.set({"dragType": "dragUrls"});
                            refresh()
                        }
                    }
                });
            } else if (dragType === "dragTitle") {
                $('#dragUrls').bootstrapSwitch({
                    state: false,
                    onText: `${chrome.i18n.getMessage("yes")}`,
                    offText: `${chrome.i18n.getMessage("no")}`,
                    onColor: "success",
                    offColor: "danger",
                    onSwitchChange: function (event, state) {
                        if (state === true) {
                            $('#dragTitle').bootstrapSwitch("state", false, true)
                            chrome.storage.local.set({"dragType": "dragUrls"});
                            refresh()
                        } else {
                            $('#dragTitle').bootstrapSwitch("state", true, true)
                            chrome.storage.local.set({"dragType": "dragTitle"});
                            refresh()
                        }
                    }
                });
                $('#dragTitle').bootstrapSwitch({
                    state: true,
                    onText: `${chrome.i18n.getMessage("yes")}`,
                    offText: `${chrome.i18n.getMessage("no")}`,
                    onColor: "success",
                    offColor: "danger",
                    onSwitchChange: function (event, state) {
                        if (state === true) {
                            $('#dragUrls').bootstrapSwitch("state", false, true)
                            chrome.storage.local.set({"dragType": "dragTitle"});
                            refresh()
                        } else {
                            $('#dragUrls').bootstrapSwitch("state", true, true)
                            chrome.storage.local.set({"dragType": "dragUrls"});
                            refresh()
                        }
                    }
                });
            } else {
                $('#dragUrls').bootstrapSwitch({
                    state: false,
                    onText: `${chrome.i18n.getMessage("yes")}`,
                    offText: `${chrome.i18n.getMessage("no")}`,
                    onColor: "success",
                    offColor: "danger",
                    onSwitchChange: function (event, state) {
                        if (state === true) {
                            $('#dragTitle').bootstrapSwitch("state", false, true)
                            chrome.storage.local.set({"dragType": "dragUrls"});
                            refresh()
                        } else {
                            $('#dragTitle').bootstrapSwitch("state", true, true)
                            chrome.storage.local.set({"dragType": "dragTitle"});
                            refresh()
                        }
                    }
                });
                $('#dragTitle').bootstrapSwitch({
                    state: false,
                    onText: `${chrome.i18n.getMessage("yes")}`,
                    offText: `${chrome.i18n.getMessage("no")}`,
                    onColor: "success",
                    offColor: "danger",
                    onSwitchChange: function (event, state) {
                        if (state === true) {
                            $('#dragUrls').bootstrapSwitch("state", false, true)
                            chrome.storage.local.set({"dragType": "dragTitle"});
                            refresh()
                        } else {
                            $('#dragUrls').bootstrapSwitch("state", true, true)
                            chrome.storage.local.set({"dragType": "dragUrls"});
                            refresh()
                        }
                    }
                });
            }
            // 处理是否自动同步
            let autoSync = items.autoSync
            if (autoSync === true) {
                $('#autoSync').bootstrapSwitch({
                    state: true,
                    onText: `${chrome.i18n.getMessage("yes")}`,
                    offText: `${chrome.i18n.getMessage("no")}`,
                    onColor: "success",
                    offColor: "danger",
                    onSwitchChange: function (event, state) {
                        if (state === true) {
                            chrome.storage.local.set({"autoSync": true});
                        } else {
                            chrome.storage.local.set({"autoSync": false});
                        }
                    }
                });
            } else {
                $('#autoSync').bootstrapSwitch({
                    statue: false,
                    onText: `${chrome.i18n.getMessage("yes")}`,
                    offText: `${chrome.i18n.getMessage("no")}`,
                    onColor: "success",
                    offColor: "danger",
                    onSwitchChange: function (event, state) {
                        if (state === true) {
                            chrome.storage.local.set({"autoSync": true});
                        } else {
                            chrome.storage.local.set({"autoSync": false});
                        }
                    }
                });
            }
            // 处理是否划词翻译
            let dragOpenTranslate = items.dragOpenTranslate
            if (dragOpenTranslate) {
                $('#dragOpenTranslate').bootstrapSwitch({
                    state: true,
                    onText: `${chrome.i18n.getMessage("yes")}`,
                    offText: `${chrome.i18n.getMessage("no")}`,
                    onColor: "success",
                    offColor: "danger",
                    onSwitchChange: function (event, state) {
                        if (state === true) {
                            chrome.storage.local.set({"dragOpenTranslate": true});
                        } else {
                            chrome.storage.local.set({"dragOpenTranslate": false});
                        }
                    }
                });
            } else {
                $('#dragOpenTranslate').bootstrapSwitch({
                    state: false,
                    onText: `${chrome.i18n.getMessage("yes")}`,
                    offText: `${chrome.i18n.getMessage("no")}`,
                    onColor: "success",
                    offColor: "danger",
                    onSwitchChange: function (event, state) {
                        if (state === true) {
                            chrome.storage.local.set({"dragOpenTranslate": true});
                        } else {
                            chrome.storage.local.set({"dragOpenTranslate": false});
                        }
                    }
                });
            }
        });

        // 展示所有标签
        showAllTabs();

        // 把从onetab导出的数据导入，不管插件原先是否有数据，有置顶，全部追加到最后
        document.getElementById('importOnetabMode').addEventListener('click', function () {
            chrome.storage.local.get(null, function (items) {
                let tabGroupsStr = "";
                let tabGroups = [];
                if (items.tabGroups_num >= 1) {
                    // 把分片数据组成字符串
                    for (let i = 0; i < items.tabGroups_num; i++) {
                        tabGroupsStr += items["tabGroups_" + i];
                    }
                    tabGroups = JSON.parse(tabGroupsStr);
                }
                let importOnetabTextarea = $('#importOnetabTextarea').val();
                console.log(importOnetabTextarea)
                if (!importOnetabTextarea) {
                    alert(`${chrome.i18n.getMessage("importTextareaTip")}`)
                    return;
                }
                let content = importOnetabTextarea.split("\n");
                let tabsArr = [];
                for (let i = 0; i < content.length; i++) {
                    // 空行说明是一组标签的结束
                    if (content[i] === "") {
                        tabGroups.push(makeTabGroup(tabsArr));
                        tabsArr.length = 0;
                        continue;
                    }
                    let lineList = content[i].split(" | ");
                    let title = lineList[1];
                    if (title && typeof (title) !== undefined) {
                        title = title.replace(emojiReg, "");
                    }
                    let tab = {"title": title, "url": lineList[0]}
                    tabsArr.push(tab);
                }
                saveShardings(tabGroups, "object");
                refresh()
            });
        });

        // 把从本插件导出的数据导入，假如导入数据有置顶，就置顶到最上，其他数据追加到最后
        document.getElementById('importDefaultMode').addEventListener('click', function () {
            chrome.storage.local.get(null, function (items) {
                let tabGroupsStr = "";
                let tabGroups = [];
                if (items.tabGroups_num >= 1) {
                    // 把分片数据组成字符串
                    for (let i = 0; i < items.tabGroups_num; i++) {
                        tabGroupsStr += items["tabGroups_" + i];
                    }
                    tabGroups = JSON.parse(tabGroupsStr);
                }
                let importDefaultTextarea = $('#importDefaultTextarea').val();
                console.log(importDefaultTextarea)
                if (!importDefaultTextarea) {
                    alert(`${chrome.i18n.getMessage("importTextareaTip")}`)
                    return;
                }
                let content = importDefaultTextarea.split("\n");
                let tabsArr = [];
                let _isPined = '不置顶'
                for (let i = 0; i < content.length; i++) {
                    if (content[i] === "") {
                        console.log(tabsArr[0])
                        let isLock = false
                        let isPined = false
                        let groupTitle = ""
                        if (tabsArr[0] !== undefined) {
                            let _isLock = tabsArr[0].title
                            if (_isLock === '锁定') {
                                isLock = true
                            }
                            if (_isLock === '解锁') {
                                isLock = false
                            }
                            if (_isPined === '置顶') {
                                isPined = true
                            }
                            if (_isPined === '不置顶') {
                                isPined = false
                            }
                            groupTitle = tabsArr[0].url
                        }
                        tabsArr.splice(0, 1)
                        // 判断导入的数据是否有置顶，有置顶的话，要置顶到最上面，其他数据追加到最后
                        if (isPined) {
                            tabGroups.splice(0, 0, makeTabGroup(tabsArr, isLock, groupTitle, isPined));
                        } else {
                            tabGroups.push(makeTabGroup(tabsArr, isLock, groupTitle, isPined));
                        }
                        tabsArr.length = 0;
                        continue;
                    }
                    let lineList = content[i].split(" | ");
                    let title = lineList[1];
                    if (title && typeof (title) !== undefined) {
                        title = title.replace(emojiReg, "");
                    }
                    let tab = {"title": title, "url": lineList[0]}
                    tabsArr.push(tab);
                    if (lineList.length > 2) {
                        _isPined = lineList[2]
                    }
                }
                saveShardings(tabGroups, "object");
                refresh()
            });
        });

        // 导出本插件内容功能
        document.getElementById('export').addEventListener('click', function () {
            chrome.storage.local.get(null, function (items) {
                let tabGroupsStr = "";
                let tabGroups = [];
                if (items.tabGroups_num >= 1) {
                    // 把分片数据组成字符串
                    for (let i = 0; i < items.tabGroups_num; i++) {
                        tabGroupsStr += items["tabGroups_" + i];
                    }
                    tabGroups = JSON.parse(tabGroupsStr);
                }
                $('#exportTextarea').val();
                let exportTextarea = "";
                for (let i = 0; i < tabGroups.length; i++) {
                    let isLock = tabGroups[i].isLock ? "锁定" : "解锁"
                    let isPined = "不置顶"
                    if (tabGroups[i].isPined !== undefined) {
                        isPined = tabGroups[i].isPined ? "置顶" : "不置顶"
                    }
                    let groupTitle = tabGroups[i].groupTitle
                    console.log(typeof (groupTitle))
                    console.log(groupTitle)
                    if (groupTitle === "undefined" || typeof (groupTitle) === "undefined") {
                        groupTitle = ""
                    }
                    let groupInfo = groupTitle + " | " + isLock + " | " + isPined + "\n"
                    exportTextarea += groupInfo
                    for (let j = 0; j < tabGroups[i].tabs.length; j++) {
                        let line = tabGroups[i].tabs[j].url + " | " + tabGroups[i].tabs[j].title + "\n"
                        exportTextarea += line;
                    }
                    exportTextarea += "\n"
                }
                $('#exportTextarea').val(exportTextarea)
            });
        });

        // 控制2种已使用状态的切换
        document.getElementById('usage').addEventListener('click', function () {
            if (isStateOne) {
                chrome.storage.local.getBytesInUse(null, function (bytes) {
                    console.log("total is " + (bytes / 1024 / 1024).toFixed(3) + "mb");
                    document.getElementById('usage').innerHTML = `${chrome.i18n.getMessage("usedSpace")}${(bytes / 1024 / 1024).toFixed(3)}mb / 10mb`;
                });
                isStateOne = false
            } else {
                chrome.storage.local.getBytesInUse(null, function (bytes) {
                    console.log("total is " + (bytes / 1024 / 1024).toFixed(3) + "mb");
                    document.getElementById('usage').innerHTML = `${chrome.i18n.getMessage("usedSpace")}${((bytes / 1024 / 1024) / 10 * 100).toFixed(2)} %`;
                });
                isStateOne = true
            }
        });

        // 响应推送到github的gist的动作
        document.getElementById('pushToGithubGist').addEventListener('click', function () {
            let confirm = prompt(`${chrome.i18n.getMessage("confirmKey")}`, `${chrome.i18n.getMessage("confirmValue")}`);
            if (confirm.trim() === "确定" || confirm.trim() === "confirm") {
                console.log("yes");
                chrome.storage.local.get(null, function (storage) {
                    if (!storage.githubGistToken) {
                        console.log("githubGistToken没有保存");
                        showAlert(`${chrome.i18n.getMessage("showError")}`, `${chrome.i18n.getMessage("githubTokenNoSaved")}` + "\n" + `${chrome.i18n.getMessage("goToOptions")}`)
                        return
                    }
                    console.log(storage.handleGistStatus);
                    if (storage.handleGistStatus) {
                        console.log("handleGistStatus有值");
                        if (storage.handleGistStatus.type === "IDLE") {
                            pushToGithubGist();
                        } else {
                            let time = moment().format('YYYY-MM-DD HH:mm:ss');
                            let expireTime = storage.handleGistStatus.expireTime;
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
                showAlert(`${chrome.i18n.getMessage("showError")}`, `${chrome.i18n.getMessage("importTextareaTip")}`)
            }
        });

        // 响应推送到gitee的gist的动作
        document.getElementById('pushToGiteeGist').addEventListener('click', function () {
            let confirm = prompt(`${chrome.i18n.getMessage("confirmKey")}`, `${chrome.i18n.getMessage("confirmValue")}`);
            if (confirm.trim() === "确定" || confirm.trim() === "confirm") {
                console.log("yes");
                chrome.storage.local.get(null, function (storage) {
                    if (!storage.giteeGistToken) {
                        console.log("giteeGistToken没有保存");
                        showAlert(`${chrome.i18n.getMessage("showError")}`, `${chrome.i18n.getMessage("giteeTokenNoSaved")}` + "\n" + `${chrome.i18n.getMessage("goToOptions")}`)
                        return
                    }
                    console.log(storage.handleGistStatus);
                    if (storage.handleGistStatus) {
                        console.log("handleGistStatus有值");
                        if (storage.handleGistStatus.type === "IDLE") {
                            pushToGiteeGist();
                        } else {
                            let time = moment().format('YYYY-MM-DD HH:mm:ss');
                            let expireTime = storage.handleGistStatus.expireTime;
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
                showAlert(`${chrome.i18n.getMessage("showError")}`, `${chrome.i18n.getMessage("importTextareaTip")}`)
            }
        });

        // 响应从github的gist拉取的动作
        document.getElementById('pullFromGithubGist').addEventListener('click', function () {
            let confirm = prompt(`${chrome.i18n.getMessage("confirmKey")}`, `${chrome.i18n.getMessage("confirmValue")}`);
            if (confirm.trim() === "确定" || confirm.trim() === "confirm") {
                console.log("yes");
                chrome.storage.local.get(null, function (storage) {
                    if (!storage.githubGistToken) {
                        console.log("githubGistToken没有保存");
                        showAlert(`${chrome.i18n.getMessage("showError")}`, `${chrome.i18n.getMessage("githubTokenNoSaved")}` + "\n" + `${chrome.i18n.getMessage("goToOptions")}`)
                        return
                    }
                    console.log(storage.handleGistStatus);
                    if (storage.handleGistStatus) {
                        console.log("handleGistStatus有值");
                        if (storage.handleGistStatus.type === "IDLE") {
                            pullFromGithubGist();
                        } else {
                            let time = moment().format('YYYY-MM-DD HH:mm:ss');
                            let expireTime = storage.handleGistStatus.expireTime;
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
                showAlert(`${chrome.i18n.getMessage("showError")}`, `${chrome.i18n.getMessage("importTextareaTip")}`)
            }
        });

        // 响应从gitee的gist拉取的动作
        document.getElementById('pullFromGiteeGist').addEventListener('click', function () {
            let confirm = prompt(`${chrome.i18n.getMessage("confirmKey")}`, `${chrome.i18n.getMessage("confirmValue")}`);
            if (confirm.trim() === "确定" || confirm.trim() === "confirm") {
                console.log("yes");
                chrome.storage.local.get(null, function (storage) {
                    if (!storage.giteeGistToken) {
                        console.log("giteeGistToken没有保存");
                        showAlert(`${chrome.i18n.getMessage("showError")}`, `${chrome.i18n.getMessage("giteeTokenNoSaved")}` + "\n" + `${chrome.i18n.getMessage("goToOptions")}`)
                        return
                    }
                    console.log(storage.handleGistStatus);
                    if (storage.handleGistStatus) {
                        console.log("handleGistStatus有值");
                        if (storage.handleGistStatus.type === "IDLE") {
                            pullFromGiteeGist();
                        } else {
                            let time = moment().format('YYYY-MM-DD HH:mm:ss');
                            let expireTime = storage.handleGistStatus.expireTime;
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
                showAlert(`${chrome.i18n.getMessage("showError")}`, `${chrome.i18n.getMessage("importTextareaTip")}`)
            }
        });

        // 持续监听通知框的按钮点击事件，点了就清除通知框
        chrome.notifications.onButtonClicked.addListener(function callback(notificationId, buttonIndex) {
            chrome.notifications.clear(notificationId, function callback() {
            });
        });

        // 监听 Bootstrap Modal 的 hidden.bs.modal 事件，不然会导致数据不更新，一直只显示第一次的数据
        $(document).on('hidden.bs.modal', '#alertModal', function (e) {
            // 获取 Modal 元素
            const modal = document.getElementById('alertModal');

            // 移除 Modal 元素
            if (modal) {
                modal.remove();
            }
        });

        // 监听 Bootstrap Modal 的 hidden.bs.modal 事件，不然会导致数据不更新，一直只显示第一次的数据
        $(document).on('hidden.bs.modal', '#confirmationModal', function (e) {
            // 获取 Modal 元素
            const modal = document.getElementById('confirmationModal');

            // 移除 Modal 元素
            if (modal) {
                modal.remove();
            }
        });

        // 监听 hash 的变化事件
        window.addEventListener("hashchange", function () {
            // 获取当前 hash
            const currentHash = window.location.hash;
            // 把当前 hash 清空，才可以再次触发 hashchange 事件，实现多次点击刷新的效果
            window.location.hash = ""
            // 根据不同的 hash 值显示对应的内容
            switch (currentHash) {
                case "#home": //打开 首页
                    $("#logs").addClass("hide");
                    $("#options").addClass("hide");
                    $("#importOneTab").addClass("hide")
                    $("#tabGroupsBak").addClass("hide")
                    $("#importDefault").addClass("hide")
                    $("#exportDefault").addClass("hide")
                    $("#tabGroups").removeClass("hide");
                    // 展示所有标签
                    showAllTabs();
                    break;
                case "#logs": //打开 日志页
                    $("#tabGroups").addClass("hide")
                    $("#tabGroupsBak").addClass("hide")
                    $("#options").addClass("hide")
                    $("#importOneTab").addClass("hide")
                    $("#importDefault").addClass("hide")
                    $("#exportDefault").addClass("hide")
                    $("#logs").removeClass("hide")
                    // 展示Log
                    showAllLogs();
                    break;
                case "#options": //打开 配置页
                    $("#logs").addClass("hide");
                    $("#tabGroups").addClass("hide");
                    $("#tabGroupsBak").addClass("hide");
                    $("#importOneTab").addClass("hide")
                    $("#importDefault").addClass("hide")
                    $("#exportDefault").addClass("hide")
                    $("#options").removeClass("hide");
                    // 展示配置
                    showOptions();
                    break;
                case "#importOnetab": //打开 导入oneTab的url功能
                    $("#logs").addClass("hide");
                    $("#tabGroups").addClass("hide");
                    $("#tabGroupsBak").addClass("hide");
                    $("#options").addClass("hide");
                    $("#importDefault").addClass("hide")
                    $("#exportDefault").addClass("hide")
                    $("#importOneTab").removeClass("hide")
                    break;
                case "#importDefault": //打开 导入默认格式的url功能
                    $("#logs").addClass("hide");
                    $("#tabGroups").addClass("hide");
                    $("#tabGroupsBak").addClass("hide");
                    $("#options").addClass("hide");
                    $("#importOneTab").addClass("hide")
                    $("#exportDefault").addClass("hide")
                    $("#importDefault").removeClass("hide")
                    break;
                case "#export": //打开 导出默认格式的url功能
                    $("#logs").addClass("hide");
                    $("#tabGroups").addClass("hide");
                    $("#tabGroupsBak").addClass("hide");
                    $("#options").addClass("hide");
                    $("#importOneTab").addClass("hide")
                    $("#importDefault").addClass("hide")
                    $("#exportDefault").removeClass("hide")
                    $('#exportTextarea').val("");
                    break;
                case "#baks": //打开 回收站
                    // 展示回收站页
                    showAllDelTabs();
                    break;
            }
        });

    });

    // 从github的gist拉取
    function pullFromGithubGist() {
        startTime = moment();
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
                } else {
                    clearInterval(intervalId);
                    endTime = moment();
                    const duration = moment.duration(moment(endTime).diff(moment(startTime)));
                    notificationId = genObjectId();
                    chrome.notifications.create(notificationId, {
                        type: 'basic',
                        iconUrl: 'images/128.png',
                        title: `${chrome.i18n.getMessage("endPullFromGithubGistTask")}`,
                        message: `${chrome.i18n.getMessage("usedTime")}${duration.hours()}${chrome.i18n.getMessage("hours")}${duration.minutes()}${chrome.i18n.getMessage("minutes")}${duration.seconds()}${chrome.i18n.getMessage("seconds")}`,
                        buttons: [{"title": `${chrome.i18n.getMessage("close")}`}],
                        requireInteraction: true
                    });
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
    }

    // 从gitee的gist拉取
    function pullFromGiteeGist() {
        startTime = moment();
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
                } else {
                    clearInterval(intervalId);
                    endTime = moment();
                    const duration = moment.duration(moment(endTime).diff(moment(startTime)));
                    notificationId = genObjectId();
                    chrome.notifications.create(notificationId, {
                        type: 'basic',
                        iconUrl: 'images/128.png',
                        title: `${chrome.i18n.getMessage("endPullFromGiteeGistTask")}`,
                        message: `${chrome.i18n.getMessage("usedTime")}${duration.hours()}${chrome.i18n.getMessage("hours")}${duration.minutes()}${chrome.i18n.getMessage("minutes")}${duration.seconds()}${chrome.i18n.getMessage("seconds")}`,
                        buttons: [{"title": `${chrome.i18n.getMessage("close")}`}],
                        requireInteraction: true
                    });
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
    }

    // 推送到github的gist
    function pushToGithubGist() {
        startTime = moment();
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
                } else {
                    clearInterval(intervalId);
                    endTime = moment();
                    const duration = moment.duration(moment(endTime).diff(moment(startTime)));
                    notificationId = genObjectId();
                    chrome.notifications.create(notificationId, {
                        type: 'basic',
                        iconUrl: 'images/128.png',
                        title: `${chrome.i18n.getMessage("endPushToGithubGistTask")}`,
                        message: `${chrome.i18n.getMessage("usedTime")}${duration.hours()}${chrome.i18n.getMessage("hours")}${duration.minutes()}${chrome.i18n.getMessage("minutes")}${duration.seconds()}${chrome.i18n.getMessage("seconds")}`,
                        buttons: [{"title": `${chrome.i18n.getMessage("close")}`}],
                        requireInteraction: true
                    });
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
    }

    // 推送到gitee的gist
    function pushToGiteeGist() {
        startTime = moment();
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
                } else {
                    clearInterval(intervalId);
                    endTime = moment();
                    const duration = moment.duration(moment(endTime).diff(moment(startTime)));
                    notificationId = genObjectId();
                    chrome.notifications.create(notificationId, {
                        type: 'basic',
                        iconUrl: 'images/128.png',
                        title: `${chrome.i18n.getMessage("endPushToGiteeGistTask")}`,
                        message: `${chrome.i18n.getMessage("usedTime")}${duration.hours()}${chrome.i18n.getMessage("hours")}${duration.minutes()}${chrome.i18n.getMessage("minutes")}${duration.seconds()}${chrome.i18n.getMessage("seconds")}`,
                        buttons: [{"title": `${chrome.i18n.getMessage("close")}`}],
                        requireInteraction: true
                    });
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
    }

    // 构造操作gist的日志结构
    function setHandleGistLog(type, isReload) {
        let handleGistLogMap = {id: genObjectId(), handleGistType: type, handleGistLogs: handleGistLog};
        chrome.storage.local.get(null, function (storage) {
            if (storage.gistLog) {
                console.log("gistLog有值");
                if (storage.gistLog.length >= 100) {
                    let newArr = storage.gistLog;
                    newArr.splice(-1, 1)
                    newArr.unshift(handleGistLogMap);
                    chrome.storage.local.set({gistLog: newArr});
                    if (isReload) {
                        refresh()
                    }
                } else {
                    let newArr = storage.gistLog;
                    newArr.unshift(handleGistLogMap);
                    chrome.storage.local.set({gistLog: newArr});
                    if (isReload) {
                        refresh()
                    }
                }
            } else {
                console.log("gistLog没有值，第一次");
                chrome.storage.local.set({gistLog: [handleGistLogMap]});
                if (isReload) {
                    refresh()
                }
            }
        });
    }

    // 操作gist的全局状态
    function setHandleGistStatus(status) {
        let expireTime = moment().add(1, 'minutes').format('YYYY-MM-DD HH:mm:ss');
        let gistStatusMap = {type: status, expireTime: expireTime};
        chrome.storage.local.set({handleGistStatus: gistStatusMap});
    }

    // 关闭当前tab
    function closeCurrentTab() {
        chrome.tabs.query({active: true, currentWindow: true}, function (tabsArr) {
            chrome.tabs.remove(tabsArr[0].id, function () {
            });
        });
    }

    // 更新github的gist
    function updateGithubGist(content) {
        pushToGithubGistStatus = `${chrome.i18n.getMessage("directUpdate")}`;
        handleGistLog.push(`${chrome.i18n.getMessage("directUpdate")}`)
        console.log("已经创建了gist，直接开始更新");
        let _content = JSON.stringify(content);
        let data = {
            "description": "myCloudSkyMonster", "public": false, "files": {
                "brower_Tabs.json": {"content": _content}
            }
        }
        $.ajax({
            type: "PATCH",
            headers: {"Authorization": "token " + githubGistToken},
            url: gitHubApiUrl + "/gists/" + githubGistId,
            data: JSON.stringify(data),
            success: function (data, status) {
                if (status === "success") {
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
    }

    // 更新gitee的gist
    function updateGiteeGist(content) {
        pushToGiteeGistStatus = `${chrome.i18n.getMessage("directUpdate")}`;
        handleGistLog.push(`${chrome.i18n.getMessage("directUpdate")}`)
        console.log("已经创建了gist，直接开始更新");
        let _content = JSON.stringify(content);
        let data = {
            "description": "myCloudSkyMonster", "public": false, "files": {
                "brower_Tabs.json": {"content": _content}
            }
        }
        $.ajax({
            type: "PATCH",
            headers: {"Authorization": "token " + giteeGistToken},
            url: giteeApiUrl + "/gists/" + giteeGistId,
            data: data,
            success: function (data, status) {
                if (status === "success") {
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
    }

    // 判断是否已经保存了github的gistId
    function isStoredGithubGistIdLocal(action) {
        console.log("开始检查gistId有没有保存");
        handleGistLog.push(`${chrome.i18n.getMessage("startCheckGistIdSaved")}`)
        if (action === "push_github") {
            pushToGithubGistStatus = `${chrome.i18n.getMessage("startCheckGistIdSaved")}`;
        } else if (action === "pull_github") {
            pullFromGithubGistStatus = `${chrome.i18n.getMessage("startCheckGistIdSaved")}`;
        }
        chrome.storage.local.get("githubGistId", function (storage) {
            console.log(storage.githubGistId);
            if (storage.githubGistId) {
                console.log("gistId有保存");
                handleGistLog.push(`${chrome.i18n.getMessage("gistIdSaved")}`)
                githubGistId = storage.githubGistId;
                if (action === "push_github") {
                    getShardings(function (callback) {
                        if (!callback || typeof callback == 'undefined') {
                            console.log("本地storage里没有内容");
                            updateGithubGist([]);
                        } else {
                            updateGithubGist(callback);
                        }
                    })
                } else if (action === "pull_github") {
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
        if (action === "push_gitee") {
            pushToGiteeGistStatus = `${chrome.i18n.getMessage("startCheckGistIdSaved")}`;
        } else if (action === "pull_gitee") {
            pullFromGiteeGistStatus = `${chrome.i18n.getMessage("startCheckGistIdSaved")}`;
        }
        chrome.storage.local.get("giteeGistId", function (storage) {
            console.log(storage.giteeGistId);
            if (storage.giteeGistId) {
                console.log("gistId有保存");
                handleGistLog.push(`${chrome.i18n.getMessage("gistIdSaved")}`)
                giteeGistId = storage.giteeGistId;
                if (action === "push_gitee") {
                    getShardings(function (callback) {
                        if (!callback || typeof callback == 'undefined') {
                            console.log("本地storage里没有内容");
                            updateGiteeGist([]);
                        } else {
                            updateGiteeGist(callback);
                        }
                    })
                } else if (action === "pull_gitee") {
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
            headers: {"Authorization": "token " + githubGistToken},
            url: gitHubApiUrl + "/gists/" + githubGistId,
            success: function (data, status) {
                if (status === "success") {
                    if (data.files['brower_Tabs.json'].truncated) {
                        let rawUrl = data.files['brower_Tabs.json'].raw_url;
                        console.log(rawUrl)
                        getGithubGistByRawUrl(rawUrl);
                    } else {
                        let content = data.files['brower_Tabs.json'].content
                        let _content = JSON.parse(content)
                        saveShardings(_content.tabGroups, "object");
                        saveShardings(_content.delTabGroups, "del");
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

    // 被截断了，根据raw_url拉取github的gist
    function getGithubGistByRawUrl(rawUrl) {
        console.log("根据raw_url拉取gist");
        handleGistLog.push(`${chrome.i18n.getMessage("getGithubGistByRawUrl")}`)
        pullFromGithubGistStatus = `${chrome.i18n.getMessage("getGithubGistByRawUrl")}`;
        $.ajax({
            type: "GET",
            headers: {"Authorization": "token " + githubGistToken},
            url: rawUrl,
            success: function (data, status) {
                if (status === "success") {
                    let _content = JSON.parse(data)
                    saveShardings(_content.tabGroups, "object");
                    saveShardings(_content.delTabGroups, "del");
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
            headers: {"Authorization": "token " + giteeGistToken},
            url: giteeApiUrl + "/gists/" + giteeGistId,
            success: function (data, status) {
                if (status === "success") {
                    let content = data.files['brower_Tabs.json'].content
                    let _content = JSON.parse(content)
                    saveShardings(_content.tabGroups, "object");
                    saveShardings(_content.delTabGroups, "del");
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
        if (action === "push_gitee") {
            pushToGiteeGistStatus = `${chrome.i18n.getMessage("startCheckGistCreated")}`;
        } else if (action === "pull_gitee") {
            pullFromGiteeGistStatus = `${chrome.i18n.getMessage("startCheckGistCreated")}`;
        }
        $.ajax({
            type: "GET",
            headers: {"Authorization": "token " + giteeGistToken},
            url: giteeApiUrl + "/gists",
            success: function (data, status) {
                if (status === "success") {
                    console.log("查到所有gists！");
                    let i;
                    let flag;
                    for (i = 0; i < data.length; i += 1) {
                        if (data[i].description === "myCloudSkyMonster") {
                            console.log("已经创建了gist");
                            handleGistLog.push(`${chrome.i18n.getMessage("gistCreated")}`)
                            giteeGistId = data[i].id;
                            chrome.storage.local.set({giteeGistId: data[i].id});
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
                        if (action === "push_gitee") {
                            getShardings(function (callback) {
                                if (!callback || typeof callback == 'undefined') {
                                    console.log("本地storage里没有内容");
                                    createGiteeGist([]);
                                } else {
                                    createGiteeGist(callback);
                                }
                            })
                        } else if (action === "pull_gitee") {
                            console.log("还没有创建gist,没有内容可以拉,结束任务");
                            handleGistLog.push(`${chrome.i18n.getMessage("noGistCreatedAndOver")}`)
                            pullFromGiteeGistStatus = undefined;
                        }
                    } else {
                        if (action === "push_gitee") {
                            getShardings(function (callback) {
                                if (!callback || typeof callback == 'undefined') {
                                    console.log("本地storage里没有内容");
                                    updateGiteeGist([]);
                                } else {
                                    updateGiteeGist(callback);
                                }
                            })
                        } else if (action === "pull_gitee") {
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
        if (action === "push_github") {
            pushToGithubGistStatus = `${chrome.i18n.getMessage("startCheckGistCreated")}`;
        } else if (action === "pull_github") {
            pullFromGithubGistStatus = `${chrome.i18n.getMessage("startCheckGistCreated")}`;
        }
        $.ajax({
            type: "GET",
            headers: {"Authorization": "token " + githubGistToken},
            url: gitHubApiUrl + "/gists",
            success: function (data, status) {
                if (status === "success") {
                    console.log("查到所有gists！");
                    let i;
                    let flag;
                    for (i = 0; i < data.length; i += 1) {
                        if (data[i].description === "myCloudSkyMonster") {
                            console.log("已经创建了gist");
                            handleGistLog.push(`${chrome.i18n.getMessage("gistCreated")}`)
                            githubGistId = data[i].id;
                            chrome.storage.local.set({githubGistId: data[i].id});
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
                        if (action === "push_github") {
                            getShardings(function (callback) {
                                if (!callback || typeof callback == 'undefined') {
                                    console.log("本地storage里没有内容");
                                    createGithubGist([]);
                                } else {
                                    createGithubGist(callback);
                                }
                            })
                        } else if (action === "pull_github") {
                            console.log("还没有创建gist,没有内容可以拉,结束任务");
                            handleGistLog.push(`${chrome.i18n.getMessage("noGistCreatedAndOver")}`)
                            pullFromGithubGistStatus = undefined;
                        }
                    } else {
                        if (action === "push_github") {
                            getShardings(function (callback) {
                                if (!callback || typeof callback == 'undefined') {
                                    console.log("本地storage里没有内容");
                                    updateGithubGist([]);
                                } else {
                                    updateGithubGist(callback);
                                }
                            })
                        } else if (action === "pull_github") {
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
        if (action === "push_github") {
            pushToGithubGistStatus = `${chrome.i18n.getMessage("startCheckGithubTokenSaved")}`;
        } else if (action === "pull_github") {
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
                let token = prompt(`${chrome.i18n.getMessage("saveTokenKey")}`, `${chrome.i18n.getMessage("saveTokenValue")}`);
                chrome.storage.local.set({githubGistToken: token.trim()});
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
        if (action === "push_gitee") {
            pushToGiteeGistStatus = `${chrome.i18n.getMessage("startCheckGiteeTokenSaved")}`;
        } else if (action === "pull_gitee") {
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
                let token = prompt(`${chrome.i18n.getMessage("saveTokenKey")}`, `${chrome.i18n.getMessage("saveTokenValue")}`);
                chrome.storage.local.set({giteeGistToken: token.trim()});
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
        let _content = JSON.stringify(content);
        let data = {
            "description": "myCloudSkyMonster", "public": false, "files": {
                "brower_Tabs.json": {"content": _content}
            }
        }
        $.ajax({
            type: "POST",
            headers: {"Authorization": "token " + githubGistToken},
            url: gitHubApiUrl + "/gists",
            dataType: "json",
            data: JSON.stringify(data),
            success: function (data, status) {
                if (status === "success") {
                    console.log("创建成功！");
                    chrome.storage.local.set({"githubGistId": data.id})
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
    }

    // 创建gitee的gist
    function createGiteeGist(content) {
        console.log("还没有创建gist,开始创建");
        handleGistLog.push(`${chrome.i18n.getMessage("startCreateGiteeGist")}`)
        pushToGiteeGistStatus = `${chrome.i18n.getMessage("startCreateGiteeGist")}`;
        let _content = JSON.stringify(content);
        let data = {
            "description": "myCloudSkyMonster", "public": false, "files": {
                "brower_Tabs.json": {"content": _content}
            }
        }
        $.ajax({
            type: "POST",
            headers: {"Authorization": "token " + giteeGistToken},
            url: giteeApiUrl + "/gists",
            dataType: "json",
            data: data,
            success: function (data, status) {
                if (status === "success") {
                    console.log("创建成功！");
                    chrome.storage.local.set({
                        "giteeGistId": data.id
                    })
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
                fmt = fmt.replace(ret[1], (ret[1].length === 1) ? (opt[k]) : (opt[k].padStart(ret[1].length, "0")));
            }

        }

        return fmt;
    }

    // 生成唯一标识
    // refer: https://gist.github.com/solenoid/1372386
    let genObjectId = function () {
        let timestamp = (new Date().getTime() / 1000 | 0).toString(16);
        return timestamp + 'xxxxxxxxxxxxxxxx'.replace(/[x]/g, function () {
            return (Math.random() * 16 | 0).toString(16);
        }).toLowerCase();
    };

    // 生成数据结构
    function makeTabGroup(tabsArr) {
        let date;
        date = dateFormat("YYYY-mm-dd HH:MM:SS", new Date());
        let tabGroup = {
            date: date, id: genObjectId() // clever way to quickly get a unique ID
        };
        let res = tabsArr.map(({title, url}) => ({title, url}));
        tabGroup.tabs = res;
        tabGroup.isLock = false;
        tabGroup.groupTitle = '';
        tabGroup.isPined = false;
        return tabGroup;
    }

    // 生成数据结构
    function makeTabGroup(tabsArr, isLock, groupTitle, isPined) {
        let date;
        date = dateFormat("YYYY-mm-dd HH:MM:SS", new Date());
        let tabGroup = {
            date: date, id: genObjectId() // clever way to quickly get a unique ID
        };
        let res = tabsArr.map(({title, url}) => ({title, url}));
        tabGroup.tabs = res;
        tabGroup.isLock = isLock;
        tabGroup.groupTitle = groupTitle;
        tabGroup.isPined = isPined;
        return tabGroup;
    }

    // 获取存在local storage的数据，组成输出
    function getShardings(cb) {
        chrome.storage.local.get(null, function (items) {
            let tabGroupsStr = "";
            if (items.tabGroups_num >= 1) {
                // 把分片数据组成字符串
                for (let i = 0; i < items.tabGroups_num; i++) {
                    tabGroupsStr += items["tabGroups_" + i];
                    delete items["tabGroups_" + i]
                }
            }
            let delTabGroupsStr = "";
            if (items.del_tabGroups_num >= 1) {
                // 把分片数据组成字符串
                for (let i = 0; i < items.del_tabGroups_num; i++) {
                    delTabGroupsStr += items["del_tabGroups_" + i];
                    delete items["del_tabGroups_" + i]
                }
            }
            delete items.tabGroups_num
            delete items.del_tabGroups_num
            delete items.gistLog
            delete items.handleGistStatus
            delete items.giteeGistId
            delete items.giteeGistToken
            delete items.githubGistId
            delete items.githubGistToken
            if (tabGroupsStr.length > 0) {
                items["tabGroups"] = JSON.parse(tabGroupsStr)
            }
            if (delTabGroupsStr.length > 0) {
                items["delTabGroups"] = JSON.parse(delTabGroupsStr)
            }
            cb(items)
        });
    }

    // 保存数据到local storage
    function saveShardings(tabGroup, type) {
        let tabGroupStr;
        if (type === "object") {
            tabGroupStr = JSON.stringify(tabGroup);
        } else if (type === "string") {
            tabGroupStr = tabGroup;
        } else if (type === "del") {
            tabGroupStr = JSON.stringify(tabGroup);
        }
        if (tabGroupStr && tabGroupStr !== 'null' && tabGroupStr !== 'undefined') {
            // 字符串有值的逻辑
            let length = tabGroupStr.length;
            let sliceLength = 102400;
            let tabGroupSlices = {}; // 保存分片数据
            let i = 0; // 分片序号

            // 前缀
            let prefix = "tabGroups_"
            if (type === "del") {
                prefix = "del_tabGroups_"
            }
            // 分片保存数据
            while (length > 0) {
                tabGroupSlices[prefix + i] = tabGroupStr.substr(i * sliceLength, sliceLength);
                length -= sliceLength;
                i++;
            }

            // 保存分片数量
            tabGroupSlices[prefix + "num"] = i;

            // 写入Storage
            chrome.storage.local.set(tabGroupSlices);
        } else {
            // 字符串为空或为 null 或 undefined 的逻辑
            console.log('为空或为null/undefined');
        }
    }

    // 保存正常的tabGroup
    function saveDefaultTabGroup(tabGroup, type) {
        getShardings(function (callback) {
            if (callback || typeof callback != 'undefined' || callback !== undefined) {
                if (!callback.tabGroups || typeof callback.tabGroups == 'undefined') {
                    saveShardings([tabGroup], type);
                } else {
                    let newArr = callback.tabGroups;
                    // 判断是否有置顶，有置顶的话，新元素要放到所有置顶后面
                    let flag = false
                    for (let i = 0; i < newArr.length; i++) {
                        const currentElement = newArr[i];
                        if (currentElement.isPined === undefined || currentElement.isPined === false) {
                            newArr.splice(i, 0, tabGroup);
                            flag = true
                            break;
                        }
                    }
                    // 如果所有元素都是已固定的，则将新元素添加到数组末尾
                    if (!flag) {
                        newArr.push(tabGroup);
                    }
                    saveShardings(newArr, type);
                }
            } else {
                saveShardings([tabGroup], type);
            }
        })
    }

    // 保存删除的tabGroup
    function saveDelTabGroup(tabGroup, type) {
        getShardings(function (callback) {
            if (callback || typeof callback != 'undefined' || callback !== undefined) {
                if (!callback.delTabGroups || typeof callback.delTabGroups == 'undefined') {
                    saveShardings([tabGroup], type);
                } else {
                    let newArr = callback.delTabGroups;
                    // 判断是否有置顶，有置顶的话，新元素要放到所有置顶后面
                    let flag = false
                    for (let i = 0; i < newArr.length; i++) {
                        const currentElement = newArr[i];
                        if (currentElement.isPined === undefined || currentElement.isPined === false) {
                            newArr.splice(i, 0, tabGroup);
                            flag = true
                            break;
                        }
                    }
                    // 如果所有元素都是已固定的，则将新元素添加到数组末尾
                    if (!flag) {
                        newArr.push(tabGroup);
                    }
                    saveShardings(newArr, type);
                }
            } else {
                saveShardings([tabGroup], type);
            }
        })
    }

    // 展示保存的所有url
    function showAllTabs() {
        chrome.storage.local.get(function (storage) {
            let bridge = [];
            if (storage.tabGroups_num) {
                let tabGroupsStr = "";
                // 把分片数据组成字符串
                for (let i = 0; i < storage.tabGroups_num; i++) {
                    tabGroupsStr += storage["tabGroups_" + i];
                }
                bridge = JSON.parse(tabGroupsStr);
            }
            let i;
            let total = 0;
            for (i = 0; i < bridge.length; i += 1) {
                total += bridge[i].tabs.length;
            }
            document.getElementById('totals').innerHTML = `${chrome.i18n.getMessage("existed")}${i}${chrome.i18n.getMessage("group")} / ${total}${chrome.i18n.getMessage("totals")}`;
            let titleClass, tabClass;
            if (storage.dragType === "dragTitle") {
                titleClass = ".my-handle"
                tabClass = ""
            } else {
                titleClass = ""
                tabClass = ".my-handle"
            }
            let tabs = {}, // to-be module
                tabGroups = bridge || [], // tab groups
                opts = storage.options || {
                    deleteTabOnOpen: 'no'
                };

            function saveTabGroups(json) {
                saveShardings(json, "object");
            }

            function saveDelTabGroups(json) {
                saveDelTabGroup(json, "del");
            }

            // model entity
            // 'data' is meant to be a tab group object from localStorage
            tabs.TabGroup = function (data) {
                this.date = m.prop(data.date);
                this.id = m.prop(data.id);
                this.tabs = m.prop(data.tabs);
                this.isLock = m.prop(data.isLock);
                this.groupTitle = m.prop(data.groupTitle)
                this.isPined = m.prop(data.isPined)
            };

            // alias for Array
            tabs.TabGroupsList = Array;

            // view-model
            tabs.vm = new function () {
                let vm = {};
                vm.init = function () {
                    // list of tab groups
                    vm.list = new tabs.TabGroupsList();

                    vm.rmGroup = function (groupIndex) {
                        // remove from localStorage
                        let delTabGroups = tabGroups.splice(groupIndex, 1);
                        // save
                        saveTabGroups(tabGroups);
                        // save all deleted tab groups
                        // 如果是空组，就不发给回收站
                        if (delTabGroups[0].tabs.length > 0) {
                            saveDelTabGroups(delTabGroups[0])
                        }
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

                    vm.updateGroup = function (index, groupInfo) {
                        let isLock = groupInfo.isLock
                        let toTop = groupInfo.toTop
                        let groupTitle = groupInfo.groupTitle
                        if (isLock !== undefined) {
                            tabGroups[index].isLock = isLock
                            saveTabGroups(tabGroups);
                            showAllTabs();
                        }
                        if (toTop !== undefined) {
                            if (toTop) {
                                tabGroups[index].isPined = toTop
                                tabs.vm.moveGroup(index, 0)
                                showAllTabs();
                            } else {
                                let count = 0;
                                for (let i = 0; i < tabGroups.length; i++) {
                                    const currentElement = tabGroups[i];
                                    if (currentElement.isPined === undefined || currentElement.isPined === false) {
                                        break;
                                    }
                                    count++;
                                }
                                tabGroups[index].isPined = toTop
                                tabs.vm.moveGroup(index, count - 1)
                                showAllTabs();
                            }
                        }
                        if (groupTitle !== undefined) {
                            tabGroups[index].groupTitle = groupTitle
                            saveTabGroups(tabGroups);
                            showAllTabs();
                        }
                    };

                    vm.rmTab = function (groupIndex, index) {
                        let delTabs = tabGroups[groupIndex].tabs.splice(index, 1);
                        // save
                        saveTabGroups(tabGroups);
                        // save deleted tabs
                        saveDelTabGroups(makeTabGroup(delTabs))
                        showAllTabs();
                    };

                    vm.moveTab = function (groupIndex, index, tgroupIndex, tindex) {
                        if (groupIndex === tgroupIndex) {
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
                let i;
                tabs.vm.init();
                for (i = 0; i < tabGroups.length; i += 1) {
                    tabs.vm.list.push(new tabs.TabGroup(tabGroups[i]));
                }
            };

            tabs.view = function () {
                if (tabs.vm.list.length === 0) {
                    return m('div', [m('div.jumbotron', [m('div', {style: "text-align:center; margin-bottom:50px"}, `${chrome.i18n.getMessage("noTabs")}`)])])
                }
                // foreach tab group
                return tabs.vm.list.map(function (group, i) {
                    // console.log(tabs.vm.list);
                    // console.log(group.tabs());
                    // console.log(i);
                    // 如果标签组是空的，就自动删了
                    if (group.tabs().length === 0) {
                        tabs.vm.rmGroup(i);
                    }
                    let isLock = group.isLock()
                    let isPined = group.isPined()
                    let deleteLinkClass, lockStatus, lockImgClass, lockClass = ""
                    if (isLock) {
                        deleteLinkClass = ".no-delete-link"
                        lockStatus = `${chrome.i18n.getMessage("unLock")}`
                        lockImgClass = ".lock-img"
                        lockClass = ".filtered"
                    } else {
                        deleteLinkClass = ".delete-link"
                        lockStatus = `${chrome.i18n.getMessage("lock")}`
                        lockImgClass = ".no-lock-img"
                    }
                    let pinStatus, pinImgClass = ""
                    if (isPined) {
                        pinStatus = `${chrome.i18n.getMessage("noToTop")}`
                        pinImgClass = ".pin-img"
                        lockClass = ".filtered"
                    } else {
                        pinStatus = `${chrome.i18n.getMessage("toTop")}`
                        pinImgClass = ".no-pin-img"
                    }
                    let groupTitle = group.groupTitle()

                    return m('div.tabs' + titleClass + lockClass, {
                        id: i
                    }, [m('div.group-title', [m('img' + lockImgClass, {
                        src: "/images/lock.png"
                    }), m('span' + deleteLinkClass, {
                        onclick: function () {
                            if (isLock) {
                                showAlert(`${chrome.i18n.getMessage("showError")}`, `${chrome.i18n.getMessage("cannotDelete")}`)
                            } else {
                                showConfirmation(`${chrome.i18n.getMessage("confirm")}`, `${chrome.i18n.getMessage("confirmationDel")}`, function () {
                                    tabs.vm.rmGroup(i);
                                });
                            }
                        }
                    }), m('img' + pinImgClass, {
                        src: "/images/pin.png"
                    }), ' ', m('span.group-amount', {
                        onclick: function () {
                            $("#tabs_" + i).slideToggle();
                        }
                    }, group.tabs().length + `${chrome.i18n.getMessage("tabsNo")}`), ' ', m('span.group-name', {
                        id: "groupTitle" + i, onclick: function () {
                            let val = $("#groupTitle" + i).html();
                            $("#groupTitle" + i).slideToggle(100);
                            $("#groupTitleInput" + i).slideToggle(1000);
                            setTimeout(function () {
                                $("#groupTitleInput" + i).focus();
                            }, 100);
                            $("#groupTitleInput" + i).val(val)
                        }
                    }, groupTitle), ' ', m('input.group-title-input', {
                        id: "groupTitleInput" + i, style: "display:none", onchange: function () {
                            let val = $("#groupTitleInput" + i).val()
                            $("#groupTitle" + i).html(val)
                            $("#groupTitle" + i).slideToggle(1000);
                            $("#groupTitleInput" + i).slideToggle(100);
                            tabs.vm.updateGroup(i, {groupTitle: val})
                        }, onblur: function () {
                            let val = $("#groupTitleInput" + i).val()
                            $("#groupTitle" + i).html(val)
                            $("#groupTitle" + i).slideToggle(1000);
                            $("#groupTitleInput" + i).slideToggle(100);
                            tabs.vm.updateGroup(i, {groupTitle: val})
                        }
                    }), m('span.group-date', moment(group.date()).format('YYYY-MM-DD HH:mm:ss')), ' ', m('span.restore-all', {
                        onclick: function () {
                            let j;

                            // reason this goes first and not after is because it doesn't work otherwise
                            // I imagine it's because you changed tab and stuff
                            if (opts.deleteTabOnOpen === 'yes') {
                                if (!isLock) {
                                    tabs.vm.rmGroup(i);
                                }
                            }
                            for (j = 0; j < group.tabs().length; j += 1) {
                                chrome.tabs.create({
                                    url: group.tabs()[j].url
                                });
                            }
                        }
                    }, `${chrome.i18n.getMessage("restoreGroup")}`), m('span.delete-all', {
                        onclick: function () {
                            if (isLock) {
                                showAlert(`${chrome.i18n.getMessage("showError")}`, `${chrome.i18n.getMessage("cannotDelete")}`)
                            } else {
                                showConfirmation(`${chrome.i18n.getMessage("confirm")}`, `${chrome.i18n.getMessage("confirmationDel")}`, function () {
                                    tabs.vm.rmGroup(i);
                                });
                            }
                        }
                    }, `${chrome.i18n.getMessage("deleteAll")}`), m('span.about-lock', {
                        onclick: function () {
                            tabs.vm.updateGroup(i, {isLock: !isLock})
                        }
                    }, lockStatus), m('span.about-top', {
                        onclick: function () {
                            tabs.vm.updateGroup(i, {toTop: !isPined})
                        }
                    }, pinStatus), m('span.about-name', {
                        onclick: function () {
                            let val = $("#groupTitle" + i).html();
                            $("#groupTitle" + i).slideToggle(100);
                            $("#groupTitleInput" + i).slideToggle(1000);
                            setTimeout(function () {
                                $("#groupTitleInput" + i).focus();
                            }, 100);
                            $("#groupTitleInput" + i).val(val)
                        }
                    }, `${chrome.i18n.getMessage("nameThis")}`),]), // foreach tab
                        m('ul' + tabClass + lockClass, {
                            id: "tabs_" + i
                        }, group.tabs().map(function (tab, ii) {
                            return m('li.li-hover.li-standard', [m('span' + deleteLinkClass, {
                                onclick: function () {
                                    if (isLock) {
                                        showAlert(`${chrome.i18n.getMessage("showError")}`, `${chrome.i18n.getMessage("cannotDelete")}`)
                                    } else {
                                        tabs.vm.rmTab(i, ii);
                                    }
                                }
                            }), m('span.link', {
                                title: tab.title + "\n" + tab.url, onclick: function () {
                                    if (opts.deleteTabOnOpen === 'yes') {
                                        if (!isLock) {
                                            tabs.vm.rmTab(i, ii);
                                        }
                                    }
                                    chrome.tabs.create({
                                        url: tab.url, active: false
                                    });
                                }
                            }, tab.title)]);
                        }))]);
                });
            };


            // init the app
            m.module(document.getElementById('tabGroups'), {controller: tabs.controller, view: tabs.view});

            // 以下是超级拖曳的相关代码
            if (storage.dragType === "dragTitle") {
                if (sortableTabList.length > 0) {
                    let j;
                    for (j = 0; j < sortableTabList.length; j += 1) {
                        sortableTabList[j].option("disabled", true);
                    }
                }
                if (typeof (sortableTitle) != "undefined") {
                    sortableTitle.option("disabled", false);
                } else {
                    sortableTitle = Sortable.create(document.getElementById("tabGroups"), {
                        group: {
                            name: "tabGroups", pull: false, put: false
                        }, scroll: true, easing: "cubic-bezier(1, 0, 0, 1)", animation: 150, //动画参数
                        ghostClass: 'ghost', filter: '.filtered', onEnd: function (evt) { //拖拽完毕之后发生该事件
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
                }

            }

            if (storage.dragType === "dragUrls") {
                if (sortableTabList.length > 0) {
                    let j;
                    for (j = 0; j < sortableTabList.length; j += 1) {
                        sortableTabList[j].option("disabled", false);
                    }
                }
                let j;
                if (typeof (sortableTitle) != "undefined") {
                    sortableTitle.option("disabled", true);
                }
                sortableTabList.length = 0;
                for (j = 0; j < bridge.length; j += 1) {
                    let sortableTab = Sortable.create(document.getElementById("tabs_" + j), {
                        group: {
                            name: "tabs", pull: true, put: true
                        }, easing: "cubic-bezier(1, 0, 0, 1)", scroll: true, swapThreshold: 0.65, animation: 150, //动画参数
                        filter: '.filtered', onEnd: function (evt) {
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
                }

            }

        });
    }

    // 展示Log
    function showAllLogs() {
        chrome.storage.local.get(function (storage) {
            console.log(storage)
            let bridge = [];
            if (storage.gistLog) {
                bridge = storage.gistLog;
                console.log(bridge)
                document.getElementById('totals').innerHTML = `${bridge.length}${chrome.i18n.getMessage("totals")}`;
            } else {
                document.getElementById('totals').innerHTML = `0${chrome.i18n.getMessage("totals")}`;
            }
            let logs = {}, // to-be module
                logGroups = bridge || [];

            // model entity
            logs.LogGroup = function (data) {
                this.type = m.prop(data.handleGistType);
                this.id = m.prop(data.id);
                this.logs = m.prop(data.handleGistLogs);
            };

            // alias for Array
            logs.LogGroupsList = Array;

            // view-model
            logs.vm = new function () {
                let vm = {};
                vm.init = function () {
                    vm.list = new logs.LogGroupsList();
                };
                return vm;
            };

            logs.controller = function () {
                let i;
                logs.vm.init();
                for (i = 0; i < logGroups.length; i += 1) {
                    logs.vm.list.push(new logs.LogGroup(logGroups[i]));
                }
            };

            logs.view = function () {
                if (logs.vm.list.length === 0) {
                    return m('div', m('div.jumbotron', [m('div', {style: "text-align:center; margin-bottom:50px"}, `${chrome.i18n.getMessage("noLog")}`)]))
                }

                return logs.vm.list.map(function (group, i) {
                    return m('div.div-top', {
                        id: i
                    }, [m('div', [m('span.group-title', {
                        onclick: function () {
                            $("#logs_" + i).slideToggle();
                        }
                    }, group.type())]), m('ul', {
                        id: "logs_" + i
                    }, group.logs().map(function (log, ii) {
                        return m('li.li-hover li-standard', [m('span.line', {}, log)]);
                    }))]);
                });
            };
            // init the app
            m.module(document.getElementById('logs'), {controller: logs.controller, view: logs.view});
        });
    }

    // 展示配置
    function showOptions() {
        chrome.storage.local.get(null, function (storage) {
            let opts = storage.options || {};

            if (opts.deleteTabOnOpen === undefined) {
                $('input[name="deleteTabOnOpen"][value="no"]').prop('checked', 'checked');
            } else {
                $('input[name="deleteTabOnOpen"][value="' + opts.deleteTabOnOpen + '"]').prop('checked', 'checked');
            }
            if (opts.openBackgroundAfterSendTab === undefined) {
                $('input[name="openBackgroundAfterSendTab"][value="yes"]').prop('checked', 'checked');
            } else {
                $('input[name="openBackgroundAfterSendTab"][value="' + opts.openBackgroundAfterSendTab + '"]').prop('checked', 'checked');
            }

            // 如果已经有保存token就直接列出
            if (storage.githubGistToken) {
                document.getElementById("githubToken").value = storage.githubGistToken
            }
            if (storage.giteeGistToken) {
                document.getElementById("giteeToken").value = storage.giteeGistToken
            }
        });
        document.getElementById("options").innerHTML = `
            <div class="option">
                <div class="desc">
                    <p>${chrome.i18n.getMessage("restoreKey")}</p>
                </div>
                <div class="choices">
                    <p><label for="deleteTabOnOpen"><input type="radio" name="deleteTabOnOpen" value="yes"><span class="radio-label">${chrome.i18n.getMessage("restoreValueDelete")}</span></label></p>
                    <p><label for="deleteTabOnOpen"><input type="radio" name="deleteTabOnOpen" value="no"><span class="radio-label">${chrome.i18n.getMessage("restoreValueLive")}</span></label></p>
                </div>
            </div>
            <hr>
            <div class="option">
                <div class="desc">
                    <p>${chrome.i18n.getMessage("openBackgroundAfterSendTab")}</p>
                </div>
                <div class="choices">
                    <p><label for="openBackgroundAfterSendTab"><input type="radio" name="openBackgroundAfterSendTab" value="yes"><span class="radio-label">${chrome.i18n.getMessage("openBackgroundAfterSendTabYes")}</span></label></p>
                    <p><label for="openBackgroundAfterSendTab"><input type="radio" name="openBackgroundAfterSendTab" value="no"><span class="radio-label">${chrome.i18n.getMessage("openBackgroundAfterSendTabNo")}</span></label></p>
                </div>
            </div>
            <hr>
            <div class="form-group row">
              <label for="password" class="col-sm-2 control-label">${chrome.i18n.getMessage("githubToken")}:</label>
              <div class="col-sm-5">
                <div class="input-group">
                  <input type="password" class="form-control" id="githubToken" placeholder="${chrome.i18n.getMessage("input")}${chrome.i18n.getMessage("githubToken")}">
                  <div class="input-group-addon">
                    <span class="glyphicon glyphicon-eye-open" id="changeEye"></span>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="form-group row">
              <label for="password" class="col-sm-2 control-label">${chrome.i18n.getMessage("giteeToken")}:</label>
              <div class="col-sm-5">
                <div class="input-group">
                  <input type="password" class="form-control" id="giteeToken" placeholder="${chrome.i18n.getMessage("input")}${chrome.i18n.getMessage("giteeToken")}">
                  <div class="input-group-addon">
                    <span class="glyphicon glyphicon-eye-open" id="changeEye2"></span>
                  </div>
                </div>
              </div>
            </div>
            <hr>
            <button id="save">${chrome.i18n.getMessage("saveButtonValue")}</button>
            <div id="saved">${chrome.i18n.getMessage("savedValue")}</div>
        `
        // 给所有radio绑定一次性选择事件
        document.addEventListener('click', function (event) {
            if (event.target.classList.contains('radio-label')) {
                const input = event.target.parentNode.querySelector('input[type="radio"]');
                if (!input.checked) {
                    input.checked = true;
                }
            }
        });

        // 保存配置
        document.getElementById('save').addEventListener('click', function () {
            let deleteTabOnOpen = document.querySelector('input[name="deleteTabOnOpen"]:checked').value;
            let openBackgroundAfterSendTab = document.querySelector('input[name="openBackgroundAfterSendTab"]:checked').value;
            let githubGistToken = document.getElementById("githubToken").value
            let giteeGistToken = document.getElementById("giteeToken").value

            chrome.storage.local.set({
                options: {
                    deleteTabOnOpen: deleteTabOnOpen, openBackgroundAfterSendTab: openBackgroundAfterSendTab
                }, githubGistToken: githubGistToken, giteeGistToken: giteeGistToken
            }, function () { // show "settings saved" notice thing
                document.getElementById('saved').style.display = 'block';
                window.setTimeout(function () {
                    document.getElementById('saved').style.display = 'none';
                }, 1000);
            });
        });
        document.getElementById('changeEye').addEventListener('click', function () {
            let passwordInput = document.getElementById("githubToken");
            let visibilityIcon = document.getElementById("changeEye");

            if (passwordInput.type === "password") {
                passwordInput.type = "text";
                visibilityIcon.className = "glyphicon glyphicon-eye-close";
            } else {
                passwordInput.type = "password";
                visibilityIcon.className = "glyphicon glyphicon-eye-open";
            }
        });
        document.getElementById('changeEye2').addEventListener('click', function () {
            let passwordInput = document.getElementById("giteeToken");
            let visibilityIcon = document.getElementById("changeEye2");

            if (passwordInput.type === "password") {
                passwordInput.type = "text";
                visibilityIcon.className = "glyphicon glyphicon-eye-close";
            } else {
                passwordInput.type = "password";
                visibilityIcon.className = "glyphicon glyphicon-eye-open";
            }
        });
    }

    // 统一的弹窗提示
    function showAlert(title, message) {
        let modalHtml = `
        <div class="modal fade" id="alertModal" tabindex="-1" role="dialog" aria-labelledby="alertModalLabel" aria-hidden="true">
          <div class="modal-dialog" role="document">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title" id="alertModalLabel">${title}</h5>
                <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <div class="modal-body">
                ${message}
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-dismiss="modal">关闭</button>
              </div>
            </div>
          </div>
        </div>
      `;

        let modalContainer = document.createElement('div');
        modalContainer.innerHTML = modalHtml;
        document.body.appendChild(modalContainer);

        $('#alertModal').modal('show');
    }

    // 统一的2次确认弹窗
    function showConfirmation(title, message, onConfirm) {
        let modalHtml = `
        <div class="modal fade" id="confirmationModal" tabindex="-1" role="dialog" aria-labelledby="confirmationModalLabel" aria-hidden="true">
          <div class="modal-dialog" role="document">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title" id="confirmationModalLabel">${title}</h5>
                <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <div class="modal-body">
                ${message}
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-dismiss="modal">取消</button>
                <button type="button" class="btn btn-primary" id="confirmButton">确认</button>
              </div>
            </div>
          </div>
        </div>
            `;

        let modalContainer = document.createElement('div');
        modalContainer.innerHTML = modalHtml;
        document.body.appendChild(modalContainer);

        $('#confirmationModal').modal('show');

        $('#confirmButton').on('click', function () {
            $('#confirmationModal').modal('hide');
            onConfirm();
        });
    }

    // 刷新当前页
    function refresh() {
        chrome.tabs.query({active: true, currentWindow: true}, function (tabsArr) {
            chrome.tabs.reload(tabsArr[0].id, {}, function (tab) {
            });
        });
    }

    // 展示回收站内容
    function showAllDelTabs() {
        $("#tabGroups").addClass("hide")
        $("#options").addClass("hide")
        $("#importOneTab").addClass("hide")
        $("#importDefault").addClass("hide")
        $("#exportDefault").addClass("hide")
        $("#logs").addClass("hide")
        $("#tabGroupsBak").removeClass("hide")
        chrome.storage.local.get(function (storage) {
            let del_bridge = [];
            if (storage.del_tabGroups_num) {
                let tabGroupsStr = "";
                // 把分片数据组成字符串
                for (let i = 0; i < storage.del_tabGroups_num; i++) {
                    tabGroupsStr += storage["del_tabGroups_" + i];
                }
                del_bridge = JSON.parse(tabGroupsStr);
            }
            let i;
            let total = 0;
            for (i = 0; i < del_bridge.length; i += 1) {
                total += del_bridge[i].tabs.length;
            }
            document.getElementById('totals').innerHTML = `${chrome.i18n.getMessage("deleted")}${i}${chrome.i18n.getMessage("group")} / ${total}${chrome.i18n.getMessage("totals")}`;
            let titleClass, tabClass;
            if (storage.dragType === "dragTitle") {
                titleClass = ".my-handle"
                tabClass = ""
            } else {
                titleClass = ""
                tabClass = ".my-handle"
            }
            let tabs = {}, // to-be module
                tabGroups = del_bridge || [], // tab groups
                opts = storage.options || {
                    deleteTabOnOpen: 'no'
                };

            function saveTabGroups(json) {
                saveShardings(json, "del");
            }

            function saveDefaultTabGroups(json) {
                saveDefaultTabGroup(json, "object");
            }


            // model entity
            // 'data' is meant to be a tab group object from localStorage
            tabs.TabGroup = function (data) {
                this.date = m.prop(data.date);
                this.id = m.prop(data.id);
                this.tabs = m.prop(data.tabs);
                this.isLock = m.prop(data.isLock);
                this.groupTitle = m.prop(data.groupTitle)
                this.isPined = m.prop(data.isPined)
            };

            // alias for Array
            tabs.TabGroupsList = Array;

            // view-model
            tabs.vm = new function () {
                let vm = {};
                vm.init = function () {
                    // list of tab groups
                    vm.list = new tabs.TabGroupsList();

                    vm.rmGroup = function (groupIndex) {
                        // remove from localStorage
                        tabGroups.splice(groupIndex, 1);
                        // save
                        saveTabGroups(tabGroups);
                        showAllDelTabs();
                    };

                    vm.recoverGroup = function (groupIndex) {
                        // remove from localStorage
                        let defaultTabGroup = tabGroups.splice(groupIndex, 1);
                        // save
                        saveTabGroups(tabGroups);
                        saveDefaultTabGroups(defaultTabGroup[0])
                        showAllDelTabs();
                    }

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

                    vm.updateGroup = function (index, groupInfo) {
                        let isLock = groupInfo.isLock
                        let toTop = groupInfo.toTop
                        let groupTitle = groupInfo.groupTitle
                        if (isLock !== undefined) {
                            tabGroups[index].isLock = isLock
                            saveTabGroups(tabGroups);
                            showAllDelTabs();
                        }
                        if (toTop !== undefined) {
                            if (toTop) {
                                tabGroups[index].isPined = toTop
                                tabs.vm.moveGroup(index, 0)
                                showAllDelTabs();
                            } else {
                                let count = 0;
                                for (let i = 0; i < tabGroups.length; i++) {
                                    const currentElement = tabGroups[i];
                                    if (currentElement.isPined === undefined || currentElement.isPined === false) {
                                        break;
                                    }
                                    count++;
                                }
                                tabGroups[index].isPined = toTop
                                tabs.vm.moveGroup(index, count - 1)
                                showAllDelTabs();
                            }
                        }
                        if (groupTitle !== undefined) {
                            tabGroups[index].groupTitle = groupTitle
                            saveTabGroups(tabGroups);
                            showAllDelTabs();
                        }
                    };

                    vm.rmTab = function (groupIndex, index) {
                        let delTabs = tabGroups[groupIndex].tabs.splice(index, 1);
                        // save
                        saveTabGroups(tabGroups);
                        showAllDelTabs();
                    };

                    vm.moveTab = function (groupIndex, index, tgroupIndex, tindex) {
                        if (groupIndex === tgroupIndex) {
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
                let i;
                tabs.vm.init();
                for (i = 0; i < tabGroups.length; i += 1) {
                    tabs.vm.list.push(new tabs.TabGroup(tabGroups[i]));
                }
            };

            tabs.view = function () {
                if (tabs.vm.list.length === 0) {
                    return m('div', [m('div.jumbotron', [m('div', {style: "text-align:center; margin-bottom:50px"}, `${chrome.i18n.getMessage("noDelTabs")}`)])])
                }
                // foreach tab group
                return tabs.vm.list.map(function (group, i) {
                    // console.log(tabs.vm.list);
                    // console.log(group.tabs());
                    // console.log(i);
                    // 如果标签组是空的，就自动删了
                    if (group.tabs().length === 0) {
                        tabs.vm.rmGroup(i);
                    }
                    let isLock = group.isLock()
                    let isPined = group.isPined()
                    let deleteLinkClass, lockStatus, lockImgClass, lockClass = ""
                    if (isLock) {
                        deleteLinkClass = ".no-delete-link"
                        lockStatus = `${chrome.i18n.getMessage("unLock")}`
                        lockImgClass = ".lock-img"
                        lockClass = ".filtered"
                    } else {
                        deleteLinkClass = ".delete-link"
                        lockStatus = `${chrome.i18n.getMessage("lock")}`
                        lockImgClass = ".no-lock-img"
                    }
                    let pinStatus, pinImgClass = ""
                    if (isPined) {
                        pinStatus = `${chrome.i18n.getMessage("noToTop")}`
                        pinImgClass = ".pin-img"
                        lockClass = ".filtered"
                    } else {
                        pinStatus = `${chrome.i18n.getMessage("toTop")}`
                        pinImgClass = ".no-pin-img"
                    }
                    let groupTitle = group.groupTitle()

                    return m('div.tabs' + titleClass + lockClass, {
                        id: i
                    }, [m('div.group-title', [m('img' + lockImgClass, {
                        src: "/images/lock.png"
                    }), m('span' + deleteLinkClass, {
                        onclick: function () {
                            if (isLock) {
                                showAlert(`${chrome.i18n.getMessage("showError")}`, `${chrome.i18n.getMessage("cannotDelete")}`)
                            } else {
                                showConfirmation(`${chrome.i18n.getMessage("confirm")}`, `${chrome.i18n.getMessage("confirmationDel")}`, function () {
                                    tabs.vm.rmGroup(i);
                                });
                            }
                        }
                    }), m('img' + pinImgClass, {
                        src: "/images/pin.png"
                    }), ' ', m('span.group-amount', {
                        onclick: function () {
                            $("#del_tabs_" + i).slideToggle();
                        }
                    }, group.tabs().length + `${chrome.i18n.getMessage("tabsNo")}`), ' ', m('span.group-name', {
                        id: "del_groupTitle" + i, onclick: function () {
                            let val = $("#del_groupTitle" + i).html();
                            $("#del_groupTitle" + i).slideToggle(100);
                            $("#del_groupTitleInput" + i).slideToggle(1000);
                            setTimeout(function () {
                                $("#del_groupTitleInput" + i).focus();
                            }, 100);
                            $("#del_groupTitleInput" + i).val(val)
                        }
                    }, groupTitle), ' ', m('input.group-title-input', {
                        id: "del_groupTitleInput" + i, style: "display:none", onchange: function () {
                            let val = $("#del_groupTitleInput" + i).val()
                            $("#del_groupTitle" + i).html(val)
                            $("#del_groupTitle" + i).slideToggle(1000);
                            $("#del_groupTitleInput" + i).slideToggle(100);
                            tabs.vm.updateGroup(i, {groupTitle: val})
                        }, onblur: function () {
                            let val = $("#del_groupTitleInput" + i).val()
                            $("#del_groupTitle" + i).html(val)
                            $("#del_groupTitle" + i).slideToggle(1000);
                            $("#del_groupTitleInput" + i).slideToggle(100);
                            tabs.vm.updateGroup(i, {groupTitle: val})
                        }
                    }), m('span.group-date', moment(group.date()).format('YYYY-MM-DD HH:mm:ss')), ' ', m('span.restore-all', {
                        onclick: function () {
                            let j;

                            // reason this goes first and not after is because it doesn't work otherwise
                            // I imagine it's because you changed tab and stuff
                            if (opts.deleteTabOnOpen === 'yes') {
                                if (!isLock) {
                                    tabs.vm.rmGroup(i);
                                }
                            }
                            for (j = 0; j < group.tabs().length; j += 1) {
                                chrome.tabs.create({
                                    url: group.tabs()[j].url
                                });
                            }
                        }
                    }, `${chrome.i18n.getMessage("restoreGroup")}`), m('span.delete-all', {
                        onclick: function () {
                            if (isLock) {
                                showAlert(`${chrome.i18n.getMessage("showError")}`, `${chrome.i18n.getMessage("cannotDelete")}`)
                            } else {
                                showConfirmation(`${chrome.i18n.getMessage("confirm")}`, `${chrome.i18n.getMessage("confirmationDel")}`, function () {
                                    tabs.vm.rmGroup(i);
                                });
                            }
                        }
                    }, `${chrome.i18n.getMessage("deleteAll")}`), m('span.about-lock', {
                        onclick: function () {
                            tabs.vm.updateGroup(i, {isLock: !isLock})
                        }
                    }, lockStatus), m('span.about-top', {
                        onclick: function () {
                            tabs.vm.updateGroup(i, {toTop: !isPined})
                        }
                    }, pinStatus), m('span.about-name', {
                        onclick: function () {
                            let val = $("#del_groupTitle" + i).html();
                            $("#del_groupTitle" + i).slideToggle(100);
                            $("#del_groupTitleInput" + i).slideToggle(1000);
                            setTimeout(function () {
                                $("#del_groupTitleInput" + i).focus();
                            }, 100);
                            $("#del_groupTitleInput" + i).val(val)
                        }
                    }, `${chrome.i18n.getMessage("nameThis")}`), m('span.about-recover', {
                        onclick: function () {
                            if (isLock) {
                                showAlert(`${chrome.i18n.getMessage("showError")}`, `${chrome.i18n.getMessage("cannotRecover")}`)
                            } else {
                                showConfirmation(`${chrome.i18n.getMessage("confirm")}`, `${chrome.i18n.getMessage("confirmationRecover")}`, function () {
                                    tabs.vm.recoverGroup(i);
                                });
                            }
                        }
                    }, `${chrome.i18n.getMessage("recover")}`)]), // foreach tab
                        m('ul' + tabClass + lockClass, {
                            id: "del_tabs_" + i
                        }, group.tabs().map(function (tab, ii) {
                            return m('li.li-hover.li-standard.strikethrough', [m('span' + deleteLinkClass, {
                                onclick: function () {
                                    if (isLock) {
                                        showAlert(`${chrome.i18n.getMessage("showError")}`, `${chrome.i18n.getMessage("cannotDelete")}`)
                                    } else {
                                        tabs.vm.rmTab(i, ii);
                                    }
                                }
                            }), m('span.link', {
                                title: tab.title + "\n" + tab.url, onclick: function () {
                                    if (opts.deleteTabOnOpen === 'yes') {
                                        if (!isLock) {
                                            tabs.vm.rmTab(i, ii);
                                        }
                                    }
                                    chrome.tabs.create({
                                        url: tab.url, active: false
                                    });
                                }
                            }, tab.title)]);
                        }))]);
                });
            };


            // init the app
            m.module(document.getElementById('tabGroupsBak'), {controller: tabs.controller, view: tabs.view});

            // 以下是超级拖曳的相关代码
            if (storage.dragType === "dragTitle") {
                if (sortableDelTabList.length > 0) {
                    let j;
                    for (j = 0; j < sortableDelTabList.length; j += 1) {
                        sortableDelTabList[j].option("disabled", true);
                    }
                }
                if (typeof (sortableDelTitle) != "undefined") {
                    sortableDelTitle.option("disabled", false);
                } else {
                    sortableDelTitle = Sortable.create(document.getElementById("tabGroupsBak"), {
                        group: {
                            name: "tabGroupsBak", pull: false, put: false
                        }, scroll: true, easing: "cubic-bezier(1, 0, 0, 1)", animation: 150, //动画参数
                        ghostClass: 'ghost', filter: '.filtered', onEnd: function (evt) { //拖拽完毕之后发生该事件
                            // console.log(evt)
                            // console.log(evt.item);
                            // console.log(evt.to);
                            // console.log(evt.from);
                            // console.log(evt.oldIndex);
                            // console.log(evt.newIndex);
                            // console.log(evt.oldDraggableIndex);
                            // console.log(evt.newDraggableIndex);
                            tabs.vm.moveGroup(evt.oldIndex, evt.newIndex);
                            showAllDelTabs();
                        }
                    });
                }

            }

            if (storage.dragType === "dragUrls") {
                if (sortableDelTabList.length > 0) {
                    let j;
                    for (j = 0; j < sortableDelTabList.length; j += 1) {
                        sortableDelTabList[j].option("disabled", false);
                    }
                }
                let j;
                if (typeof (sortableDelTitle) != "undefined") {
                    sortableDelTitle.option("disabled", true);
                }
                sortableDelTabList.length = 0;
                for (j = 0; j < del_bridge.length; j += 1) {
                    let sortableTab = Sortable.create(document.getElementById("del_tabs_" + j), {
                        group: {
                            name: "tabs", pull: true, put: true
                        }, easing: "cubic-bezier(1, 0, 0, 1)", scroll: true, swapThreshold: 0.65, animation: 150, //动画参数
                        filter: '.filtered', onEnd: function (evt) {
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
                            showAllDelTabs();
                        }
                    })
                    sortableDelTabList.push(sortableTab);
                }

            }

        });
    }

}(m));
