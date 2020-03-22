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
    var sortableTask;
    var sortableTabList = new Array();
    // 定义一个n次循环定时器
    var intervalId;
    var usedSeconds;
    var emojiReg = /[\uD83C|\uD83D|\uD83E][\uDC00-\uDFFF][\u200D|\uFE0F]|[\uD83C|\uD83D|\uD83E][\uDC00-\uDFFF]|[0-9|*|#]\uFE0F\u20E3|[0-9|#]\u20E3|[\u203C-\u3299]\uFE0F\u200D|[\u203C-\u3299]\uFE0F|[\u2122-\u2B55]|\u303D|[\A9|\AE]\u3030|\uA9|\uAE|\u3030/gi;
    var startTime;
    var endTime;
    // 定义一个桌面通知框id
    var notificationId;
    // 是否锁屏或睡眠了
    var isLock = false;

    document.addEventListener('DOMContentLoaded', function () {
        console.log("load完workbench了");

        chrome.storage.local.get(null, function (items) {
            console.log(items)
            var script1 = document.createElement('script');
            script1.src = "js/axios.min.js";
            document.head.appendChild(script1);
            if (items.taskJsUrl) {
                var script2 = document.createElement('script');
                script2.src = items.taskJsUrl;
                script2.id = "taskJs";
                document.head.appendChild(script2);
            }
            if (!items.giteeGistToken) {
                console.log("giteetoken没有保存");
                var token = prompt(`${chrome.i18n.getMessage("saveTokenKey")}`, `${chrome.i18n.getMessage("saveTokenValue")}`);
                chrome.storage.local.set({ giteeGistToken: token.trim() });
                console.log("giteetoken保存完毕");
            }
        })

        chrome.alarms.getAll(function (alarms) {
            console.log(alarms)
        });
        document.body.innerHTML = `
        <nav class="navbar navbar-default navbar-fixed-top" style="position:relative">
            <div class="container">
                <div class="navbar-header">
                    <button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#navbar"
                        aria-expanded="false" aria-controls="navbar">
                        <span class="sr-only">Toggle navigation</span>
                        <span class="icon-bar"></span>
                        <span class="icon-bar"></span>
                        <span class="icon-bar"></span>
                    </button>
                    <a class="home navbar-brand" href="#">CloudSkyMonster</a>
                </div>
                <div id="navbar" class="navbar-collapse collapse">
                    <ul class="nav navbar-nav">
                        <li class="active home"><a href="#">${chrome.i18n.getMessage("home")}</a></li>
                        <li class="home">
                            <a href="#">
                                <span id="totals"></span>${chrome.i18n.getMessage("totals")}
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
                                <li><a href="#">${chrome.i18n.getMessage("autoSync")}<input id="autoSync"
                                            data-size="mini" type="checkbox"></a></li>
                            </ul>
                        </li>
                        <li class="dropdown">
                            <a href="#" class="dropdown-toggle" data-toggle="dropdown" role="button"
                                aria-haspopup="true" aria-expanded="false">${chrome.i18n.getMessage("otherFunction")}<span class="caret"></span></a>
                            <ul id="others" class="dropdown-menu">
                                <li id="openTools"><a href="#">${chrome.i18n.getMessage("openJsonTools")}</a></li>
                                <li id="timeTaskPlatform"><a href="#">定时任务平台</a></li>
                                <li id="markdownToc"><a href="#">${chrome.i18n.getMessage("markdownToc")}</a></li>
                                <li id="showLog"><a href="#">${chrome.i18n.getMessage("showLog")}</a></li>
                                <li id="showOptions"><a href="#">${chrome.i18n.getMessage("optionsValue")}</a></li>
                                <li role="separator" class="divider"></li>
                                <li id="openImportOnetab"><a href="#">${chrome.i18n.getMessage("hideShowImportOnetabFunction")}</a></li>
                                <li id="openImportDefault"><a href="#">${chrome.i18n.getMessage("hideShowImportDefaultFunction")}</a></li>
                                <li id="openExport"><a href="#">${chrome.i18n.getMessage("hideShowExportFunction")}</a></li>
                                <li role="separator" class="divider"></li>
                                <li><a href="#">${chrome.i18n.getMessage("dragTitle")}<input id="dragTitle" data-size="mini" type="checkbox"></a></li>
                                <li><a href="#">${chrome.i18n.getMessage("dragTabs")}<input id="dragUrls" data-size="mini" type="checkbox"></a></li>
                                <li role="separator" class="divider"></li>
                                <li><a href="#">${chrome.i18n.getMessage("dragOpenTranslate")}<input id="dragOpenTranslate" data-size="mini" type="checkbox"></a></li>
                            </ul>
                        </li>
                        <li class="home">
                            <a href="#"><span id="usage"></span></a>
                        </li>
                        <li class="home">
                            <a href="#"><span id="githubStatus"></span></a>
                        </li>
                        <li class="home">
                            <a href="#"><span id="giteeStatus"></span></a>
                        </li>
                    </ul>
                </div>
                <!--/.nav-collapse -->
            </div>
        </nav>
        <div class="container theme-showcase" role="main">
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
标签组名 | 锁定
https://www.baidu.com | BaiDu
https://www.google.com | Google

 | 解锁
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
                    <textarea id="exportTextarea" style="width: 100%; height: 200px;" margin-top:5px></textarea>
                    <div style="margin-bottom:5px">
                        <button id="export" type="button" class="btn btn-default">${chrome.i18n.getMessage("exportToLocal")}</button>
                        <span>${chrome.i18n.getMessage("exportWarn")}</span>
                    </div>
                </div>
                <div id="tabGroups"></div>
                <div id="logs"></div>
                <div id="options" class="div-top"></div>
                <div id="tasks"></div>
            </div>
            <hr>
            <div class="blog-footer">
            <p class="pull-right"><a href="#">${chrome.i18n.getMessage("backToTop")}</a></p>
            <p>${chrome.i18n.getMessage("sourceCode")}<a
                    href="https://github.com/scoful/cloudSkyMonster">GitHub</a>.</p>
            <hr>
            </div>
        </div>

        `;
        // 控制导航阴影
        $("#navbar ul li").click(function () {
            $(this).addClass("active").siblings().removeClass("active");
        })
        // 检查跟github的通讯是否正常
        checkGitHubStatus();
        // 检查跟gitee的通讯是否正常
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

            // 处理是否拖曳标签组和标签
            var dragType = items.dragType;
            if (dragType == "dragUrls") {
                $('#dragUrls').bootstrapSwitch({
                    state: true,
                    onText: `${chrome.i18n.getMessage("yes")}`,
                    offText: `${chrome.i18n.getMessage("no")}`,
                    onColor: "success",
                    offColor: "danger",
                    onSwitchChange: function (event, state) {
                        if (state == true) {
                            $('#dragTitle').bootstrapSwitch("state", false, true)
                            chrome.storage.local.set({ "dragType": "dragUrls" });
                            refresh()
                        } else {
                            $('#dragTitle').bootstrapSwitch("state", true, true)
                            chrome.storage.local.set({ "dragType": "dragTitle" });
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
                        if (state == true) {
                            $('#dragUrls').bootstrapSwitch("state", false, true)
                            chrome.storage.local.set({ "dragType": "dragTitle" });
                            refresh()
                        } else {
                            $('#dragUrls').bootstrapSwitch("state", true, true)
                            chrome.storage.local.set({ "dragType": "dragUrls" });
                            refresh()
                        }
                    }
                });
            } else if (dragType == "dragTitle") {
                $('#dragUrls').bootstrapSwitch({
                    state: false,
                    onText: `${chrome.i18n.getMessage("yes")}`,
                    offText: `${chrome.i18n.getMessage("no")}`,
                    onColor: "success",
                    offColor: "danger",
                    onSwitchChange: function (event, state) {
                        if (state == true) {
                            $('#dragTitle').bootstrapSwitch("state", false, true)
                            chrome.storage.local.set({ "dragType": "dragUrls" });
                            refresh()
                        } else {
                            $('#dragTitle').bootstrapSwitch("state", true, true)
                            chrome.storage.local.set({ "dragType": "dragTitle" });
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
                        if (state == true) {
                            $('#dragUrls').bootstrapSwitch("state", false, true)
                            chrome.storage.local.set({ "dragType": "dragTitle" });
                            refresh()
                        } else {
                            $('#dragUrls').bootstrapSwitch("state", true, true)
                            chrome.storage.local.set({ "dragType": "dragUrls" });
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
                        if (state == true) {
                            $('#dragTitle').bootstrapSwitch("state", false, true)
                            chrome.storage.local.set({ "dragType": "dragUrls" });
                            refresh()
                        } else {
                            $('#dragTitle').bootstrapSwitch("state", true, true)
                            chrome.storage.local.set({ "dragType": "dragTitle" });
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
                        if (state == true) {
                            $('#dragUrls').bootstrapSwitch("state", false, true)
                            chrome.storage.local.set({ "dragType": "dragTitle" });
                            refresh()
                        } else {
                            $('#dragUrls').bootstrapSwitch("state", true, true)
                            chrome.storage.local.set({ "dragType": "dragUrls" });
                            refresh()
                        }
                    }
                });
            }
            // 处理是否自动同步
            var autoSync = items.autoSync
            if (autoSync == true) {
                $('#autoSync').bootstrapSwitch({
                    state: true,
                    onText: `${chrome.i18n.getMessage("yes")}`,
                    offText: `${chrome.i18n.getMessage("no")}`,
                    onColor: "success",
                    offColor: "danger",
                    onSwitchChange: function (event, state) {
                        if (state == true) {
                            chrome.storage.local.set({ "autoSync": true });
                        } else {
                            chrome.storage.local.set({ "autoSync": false });
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
                        if (state == true) {
                            chrome.storage.local.set({ "autoSync": true });
                        } else {
                            chrome.storage.local.set({ "autoSync": false });
                        }
                    }
                });
            }
            // 处理是否划词翻译
            var dragOpenTranslate = items.dragOpenTranslate
            if (dragOpenTranslate) {
                $('#dragOpenTranslate').bootstrapSwitch({
                    state: true,
                    onText: `${chrome.i18n.getMessage("yes")}`,
                    offText: `${chrome.i18n.getMessage("no")}`,
                    onColor: "success",
                    offColor: "danger",
                    onSwitchChange: function (event, state) {
                        if (state == true) {
                            chrome.storage.local.set({ "dragOpenTranslate": true });
                        } else {
                            chrome.storage.local.set({ "dragOpenTranslate": false });
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
                        if (state == true) {
                            chrome.storage.local.set({ "dragOpenTranslate": true });
                        } else {
                            chrome.storage.local.set({ "dragOpenTranslate": false });
                        }
                    }
                });
            }
        });
        // 展示所有标签
        showAllTabs();
        // // TODO 本来想实现在空标签页和chrome://extensions/这种特殊页面也可以按x直接关闭，问题：空标签页和chrome://extensions/没有load contentscript，目前只是实现在后台展示页按x关闭
        // $(document).keyup(function (event) {
        //     if (event.key == 'x') {
        //         var inputs = document.getElementsByTagName('input');
        //         let flag = false;
        //         for (var i = 0; i < inputs.length; i++) {
        //             if (inputs[i].type == 'text') {
        //                 if (inputs[i] == document.activeElement) {
        //                     flag = true;
        //                 } else {
        //                     flag = false;
        //                 }
        //             }
        //         }
        //         var textareas = document.getElementsByTagName('textarea');
        //         for (var i = 0; i < textareas.length; i++) {
        //             if (textareas[i] == document.activeElement) {
        //                 flag = true;
        //             } else {
        //                 flag = false;
        //             }
        //         }
        //         if (!flag) {
        //             closeCurrentTab();
        //         }
        //     }
        //     if (event.key == 'X') {
        //         // todo，按下大写X
        //     }
        // });

        // 打开 导入oneTab的url功能
        document.getElementById('openImportOnetab').addEventListener('click', function () {
            $("#logs").addClass("hide");
            $("#tabGroups").addClass("hide");
            $("#options").addClass("hide");
            $("#tasks").addClass("hide")
            $("#importDefault").addClass("hide")
            $("#exportDefault").addClass("hide")
            $("#importOneTab").removeClass("hide")
        });

        // 打开 导入默认格式的url功能
        document.getElementById('openImportDefault').addEventListener('click', function () {
            $("#logs").addClass("hide");
            $("#tabGroups").addClass("hide");
            $("#options").addClass("hide");
            $("#importOneTab").addClass("hide")
            $("#tasks").addClass("hide")
            $("#exportDefault").addClass("hide")
            $("#importDefault").removeClass("hide")
        });

        // 打开 导出默认格式的url功能
        document.getElementById('openExport').addEventListener('click', function () {
            $("#logs").addClass("hide");
            $("#tabGroups").addClass("hide");
            $("#options").addClass("hide");
            $("#importOneTab").addClass("hide")
            $("#importDefault").addClass("hide")
            $("#tasks").addClass("hide")
            $("#exportDefault").removeClass("hide")
            $('#exportTextarea').val("");
        });

        // 打开 日志页
        document.getElementById('showLog').addEventListener('click', function () {
            $("#tabGroups").addClass("hide")
            $("#options").addClass("hide")
            $("#tasks").addClass("hide")
            $("#importOneTab").addClass("hide")
            $("#importDefault").addClass("hide")
            $("#exportDefault").addClass("hide")
            $("#logs").removeClass("hide")
            // 展示Log
            showAllLogs();
        });

        // 打开 首页
        var allHomeClass = document.getElementsByClassName('home')
        for (let i = 0; i < allHomeClass.length; i++) {
            allHomeClass[i].addEventListener('click', function () {
                $("#logs").addClass("hide");
                $("#options").addClass("hide");
                $("#tasks").addClass("hide")
                $("#importOneTab").addClass("hide")
                $("#importDefault").addClass("hide")
                $("#exportDefault").addClass("hide")
                $("#tabGroups").removeClass("hide");
                // 展示所有标签
                showAllTabs();
            });
        }

        // 打开 配置页
        document.getElementById('showOptions').addEventListener('click', function () {
            $("#logs").addClass("hide");
            $("#tabGroups").addClass("hide");
            $("#tasks").addClass("hide")
            $("#importOneTab").addClass("hide")
            $("#importDefault").addClass("hide")
            $("#exportDefault").addClass("hide")
            $("#options").removeClass("hide");
            // 展示配置
            showOptions();
        });

        // 打开 定时任务平台页
        document.getElementById('timeTaskPlatform').addEventListener('click', function () {
            $("#logs").addClass("hide");
            $("#tabGroups").addClass("hide");
            $("#options").addClass("hide");
            $("#importOneTab").addClass("hide")
            $("#importDefault").addClass("hide")
            $("#exportDefault").addClass("hide")
            $("#tasks").removeClass("hide")
            // 展示定时任务
            showTasks();
        });

        // 打开 JSON工具
        document.getElementById('openTools').addEventListener('click', function () {
            openJsonTools();
        });

        // 打开 Markdown目录生成器
        document.getElementById('markdownToc').addEventListener('click', function () {
            openMarkdownToc();
        });

        // 把从onetab导出的数据导入
        document.getElementById('importOnetabMode').addEventListener('click', function () {
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
                var importOnetabTextarea = $('#importOnetabTextarea').val();
                console.log(importOnetabTextarea)
                if (!importOnetabTextarea) {
                    alert(`${chrome.i18n.getMessage("importTextareaTip")}`)
                    return;
                }
                var content = importOnetabTextarea.split("\n");
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
                refresh()
            });
        });

        // 把从本插件导出的数据导入
        document.getElementById('importDefaultMode').addEventListener('click', function () {
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
                var importDefaultTextarea = $('#importDefaultTextarea').val();
                console.log(importDefaultTextarea)
                if (!importDefaultTextarea) {
                    alert(`${chrome.i18n.getMessage("importTextareaTip")}`)
                    return;
                }
                var content = importDefaultTextarea.split("\n");
                let tabsArr = new Array();
                for (let i = 0; i < content.length; i++) {
                    if (content[i] == "") {
                        console.log(tabsArr[0])
                        let isLock = false
                        let groupTitle = ""
                        if (tabsArr[0] != undefined) {
                            let _isLock = tabsArr[0].title
                            if (_isLock === '锁定') {
                                isLock = true
                            }
                            if (_isLock === '解锁') {
                                isLock = false
                            }
                            groupTitle = tabsArr[0].url
                        }
                        tabsArr.splice(0, 1)
                        tabGroups.push(makeTabGroup(tabsArr, isLock, groupTitle));
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
                refresh()
            });
        });

        // 导出本插件内容功能
        document.getElementById('export').addEventListener('click', function () {
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
                $('#exportTextarea').val();
                var exportTextarea = "";
                for (var i = 0; i < tabGroups.length; i++) {
                    let isLock = tabGroups[i].isLock ? "锁定" : "解锁"
                    let groupTitle = tabGroups[i].groupTitle
                    console.log(typeof (groupTitle))
                    console.log(groupTitle)
                    if (groupTitle === "undefined" || typeof (groupTitle) === "undefined") {
                        groupTitle = ""
                    }
                    let groupInfo = groupTitle + " | " + isLock + "\n"
                    exportTextarea += groupInfo
                    for (var j = 0; j < tabGroups[i].tabs.length; j++) {
                        let line = tabGroups[i].tabs[j].url + " | " + tabGroups[i].tabs[j].title + "\n"
                        exportTextarea += line;
                    }
                    exportTextarea += "\n"
                }
                $('#exportTextarea').val(exportTextarea)
            });
        });

        // 响应推送到github的gist的动作
        document.getElementById('pushToGithubGist').addEventListener('click', function () {
            var confirm = prompt(`${chrome.i18n.getMessage("confirmKey")}`, `${chrome.i18n.getMessage("confirmValue")}`);
            if (confirm.trim() == "确定" || confirm.trim() == "confirm") {
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
            if (confirm.trim() == "确定" || confirm.trim() == "confirm") {
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
            if (confirm.trim() == "确定" || confirm.trim() == "confirm") {
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
            if (confirm.trim() == "确定" || confirm.trim() == "confirm") {
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

        // 持续监听通知框的按钮点击事件，点了就清除通知框
        chrome.notifications.onButtonClicked.addListener(function callback(notificationId, buttonIndex) {
            chrome.notifications.clear(notificationId, function callback() {
            });
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
                        buttons: [{ "title": `${chrome.i18n.getMessage("close")}` }],
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
    };

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
                        buttons: [{ "title": `${chrome.i18n.getMessage("close")}` }],
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
    };

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
                        buttons: [{ "title": `${chrome.i18n.getMessage("close")}` }],
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
    };

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
                        buttons: [{ "title": `${chrome.i18n.getMessage("close")}` }],
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
                        refresh()
                    }
                } else {
                    var newArr = storage.gistLog;
                    newArr.unshift(handleGistLogMap);
                    chrome.storage.local.set({ gistLog: newArr });
                    if (isReload) {
                        refresh()
                    }
                }
            } else {
                console.log("gistLog没有值，第一次");
                chrome.storage.local.set({ gistLog: [handleGistLogMap] });
                if (isReload) {
                    refresh()
                }
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
        var _content = JSON.stringify(content);
        var data = {
            "description": "myCloudSkyMonster",
            "public": false,
            "files": {
                "brower_Tabs.json": { "content": _content }
            }
        }
        $.ajax({
            type: "PATCH",
            headers: { "Authorization": "token " + githubGistToken },
            url: gitHubApiUrl + "/gists/" + githubGistId,
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
                    console.log("更新成功！");
                    chrome.storage.local.set({ "taskJsUrl": data.files['brower_tasks.js'].raw_url })
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
            headers: { "Authorization": "token " + githubGistToken },
            url: gitHubApiUrl + "/gists/" + githubGistId,
            success: function (data, status) {
                if (status == "success") {
                    if (data.files['brower_Tabs.json'].truncated) {
                        var rawUrl = data.files['brower_Tabs.json'].raw_url;
                        console.log(rawUrl)
                        getGithubGistByRawUrl(rawUrl);
                    } else {
                        let content = data.files['brower_Tabs.json'].content
                        let _content = JSON.parse(content)
                        chrome.storage.local.set({ "taskJsUrl": _content.taskJsUrl, "taskList": _content.taskList });
                        delete _content.taskJsUrl
                        delete _content.taskList
                        saveShardings(_content.tabGroups, "object");
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
            headers: { "Authorization": "token " + githubGistToken },
            url: rawUrl,
            success: function (data, status) {
                if (status == "success") {
                    let _content = JSON.parse(data)
                    chrome.storage.local.set({ "taskJsUrl": _content.taskJsUrl, "taskList": _content.taskList });
                    delete _content.taskJsUrl
                    delete _content.taskList
                    saveShardings(_content.tabGroups, "object");
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
            headers: { "Authorization": "token " + giteeGistToken },
            url: giteeApiUrl + "/gists/" + giteeGistId,
            success: function (data, status) {
                if (status == "success") {
                    let content = data.files['brower_Tabs.json'].content
                    let _content = JSON.parse(content)
                    let taskGroups = _content.taskList
                    if (taskGroups) {
                        chrome.alarms.clearAll(function (wasCleared) {
                            console.log(wasCleared)
                            for (let i = 0; i < taskGroups.length; i++) {
                                if (taskGroups[i].isOpen) {
                                    chrome.alarms.create(taskGroups[i].functionName, { delayInMinutes: parseInt(taskGroups[i].rate), periodInMinutes: parseInt(taskGroups[i].rate) });
                                }
                            }
                            // 创建定时同步gitee任务
                            chrome.alarms.create("checkAutoSyncGitee", { delayInMinutes: 70, periodInMinutes: 70 });
                            // 创建定时同步github任务
                            chrome.alarms.create("checkAutoSyncGithub", { delayInMinutes: 90, periodInMinutes: 90 });

                        });
                    }
                    chrome.storage.local.set({ "taskJsUrl": _content.taskJsUrl, "taskList": _content.taskList });
                    delete _content.taskJsUrl
                    delete _content.taskList
                    saveShardings(_content.tabGroups, "object");
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
            headers: { "Authorization": "token " + giteeGistToken },
            url: giteeApiUrl + "/gists",
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
            headers: { "Authorization": "token " + githubGistToken },
            url: gitHubApiUrl + "/gists",
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
                chrome.storage.local.set({ githubGistToken: token.trim() });
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
                chrome.storage.local.set({ giteeGistToken: token.trim() });
                console.log("giteetoken保存完毕");
                handleGistLog.push(`${chrome.i18n.getMessage("giteeTokenSaveSuccess")}`)
                isStoredGiteeGistIdLocal(action);
            }
        });
    }

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

    // 创建github的gist
    function createGithubGist(content) {
        console.log("还没有创建gist,开始创建");
        handleGistLog.push(`${chrome.i18n.getMessage("startCreateGithubGist")}`)
        pushToGithubGistStatus = `${chrome.i18n.getMessage("startCreateGithubGist")}`;
        var _content = JSON.stringify(content);
        var data = {
            "description": "myCloudSkyMonster",
            "public": false,
            "files": {
                "brower_Tabs.json": { "content": _content }
            }
        }
        $.ajax({
            type: "POST",
            headers: { "Authorization": "token " + githubGistToken },
            url: gitHubApiUrl + "/gists",
            dataType: "json",
            data: JSON.stringify(data),
            success: function (data, status) {
                if (status == "success") {
                    console.log("创建成功！");
                    chrome.storage.local.set({ "githubGistId": data.id })
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
            type: "POST",
            headers: { "Authorization": "token " + giteeGistToken },
            url: giteeApiUrl + "/gists",
            dataType: "json",
            data: data,
            success: function (data, status) {
                if (status == "success") {
                    console.log("创建成功！");
                    chrome.storage.local.set({ "taskJsUrl": data.files['brower_tasks.js'].raw_url, "giteeGistId": data.id })
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
        tabGroup.isLock = false;
        tabGroup.groupTitle = '';
        return tabGroup;
    };

    // from the array of Tab objects it makes an object with date and the array
    function makeTabGroup(tabsArr, isLock, groupTitle) {
        var date;
        date = dateFormat("YYYY-mm-dd HH:MM:SS", new Date());
        var tabGroup = {
            date: date,
            id: genObjectId() // clever way to quickly get a unique ID
        };
        let res = tabsArr.map(({ title, url }) => ({ title, url }));
        tabGroup.tabs = res;
        tabGroup.isLock = isLock;
        tabGroup.groupTitle = groupTitle;
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
            var bridge = [];
            if (storage.tabGroups_num) {
                var tabGroupsStr = "";
                // 把分片数据组成字符串
                for (var i = 0; i < storage.tabGroups_num; i++) {
                    tabGroupsStr += storage["tabGroups_" + i];
                }
                bridge = JSON.parse(tabGroupsStr);
            }
            var i;
            var total = 0;
            for (i = 0; i < bridge.length; i += 1) {
                total += bridge[i].tabs.length;
            }
            document.getElementById('totals').innerHTML = total;
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
                document.getElementById('totals').innerHTML = total;
            }

            // model entity
            // 'data' is meant to be a tab group object from localStorage
            tabs.TabGroup = function (data) {
                this.date = m.prop(data.date);
                this.id = m.prop(data.id);
                this.tabs = m.prop(data.tabs);
                this.isLock = m.prop(data.isLock);
                this.groupTitle = m.prop(data.groupTitle)
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

                    vm.updateGroup = function (index, groupInfo) {
                        let isLock = groupInfo.isLock
                        let toTop = groupInfo.toTop
                        let groupTitle = groupInfo.groupTitle
                        if (isLock != undefined) {
                            tabGroups[index].isLock = isLock
                            saveTabGroups(tabGroups);
                            showAllTabs();
                        }
                        if (toTop != undefined) {
                            if (toTop) {
                                tabs.vm.moveGroup(index, 0)
                                showAllTabs();
                            }
                        }
                        if (groupTitle != undefined) {
                            tabGroups[index].groupTitle = groupTitle
                            saveTabGroups(tabGroups);
                            showAllTabs();
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
                    return m('div', [
                        m('div.jumbotron',
                            [m('div', { style: "text-align:center; margin-bottom:50px" }, `${chrome.i18n.getMessage("noTabs")}`)
                            ])])
                }
                // foreach tab group
                return tabs.vm.list.map(function (group, i) {
                    // console.log(tabs.vm.list);
                    // console.log(group.tabs());
                    // console.log(i);
                    // group
                    var isLock = group.isLock()
                    var deleteLinkClass, lockStatus, lockImgClass, lockClass = ""
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
                    var groupTitle = group.groupTitle()

                    return m('div.tabs' + titleClass + lockClass, {
                        id: i
                    }, [
                        m('div.group-title', [
                            m('img' + lockImgClass, {
                                src: "/images/lock.png"
                            }),
                            m('span' + deleteLinkClass, {
                                onclick: function () {
                                    tabs.vm.rmGroup(i);
                                }
                            }),
                            ' ',
                            m('span.group-amount', {
                                onclick: function () {
                                    $("#tabs_" + i).slideToggle();
                                }
                            }, group.tabs().length + `${chrome.i18n.getMessage("tabsNo")}`),
                            ' ',
                            m('span.group-name', {
                                id: "groupTitle" + i,
                                onclick: function () {
                                    let val = $("#groupTitle" + i).html();
                                    $("#groupTitle" + i).slideToggle(100);
                                    $("#groupTitleInput" + i).slideToggle(1000);
                                    $("#groupTitleInput" + i).focus()
                                    $("#groupTitleInput" + i).val(val)
                                }
                            }, groupTitle),
                            ' ',
                            m('input.group-title-input', {
                                id: "groupTitleInput" + i,
                                style: "display:none",
                                onchange: function () {
                                    let val = $("#groupTitleInput" + i).val()
                                    $("#groupTitle" + i).html(val)
                                    $("#groupTitle" + i).slideToggle(1000);
                                    $("#groupTitleInput" + i).slideToggle(100);
                                    tabs.vm.updateGroup(i, { groupTitle: val })
                                },
                                onblur: function () {
                                    let val = $("#groupTitleInput" + i).val()
                                    $("#groupTitle" + i).html(val)
                                    $("#groupTitle" + i).slideToggle(1000);
                                    $("#groupTitleInput" + i).slideToggle(100);
                                    tabs.vm.updateGroup(i, { groupTitle: val })
                                }
                            }),
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
                            }, `${chrome.i18n.getMessage("restoreGroup")}`),
                            m('span.delete-all', {
                                onclick: function () {
                                    tabs.vm.rmGroup(i);
                                }
                            }, `${chrome.i18n.getMessage("deleteAll")}`),
                            m('span.about-lock', {
                                onclick: function () {
                                    tabs.vm.updateGroup(i, { isLock: !isLock })
                                }
                            }, lockStatus),
                            m('span.about-top', {
                                onclick: function () {
                                    tabs.vm.updateGroup(i, { toTop: true })
                                }
                            }, `${chrome.i18n.getMessage("toTop")}`),
                            m('span.about-top', {
                                onclick: function () {
                                    let val = $("#groupTitle" + i).html();
                                    $("#groupTitle" + i).slideToggle(100);
                                    $("#groupTitleInput" + i).slideToggle(1000);
                                    $("#groupTitleInput" + i).focus()
                                    $("#groupTitleInput" + i).val(val)
                                }
                            }, `${chrome.i18n.getMessage("nameThis")}`),
                        ]),
                        // foreach tab
                        m('ul' + tabClass + lockClass, {
                            id: "tabs_" + i
                        }, group.tabs().map(function (tab, ii) {
                            return m('li.li-hover.li-standard', [
                                m('span' + deleteLinkClass, {
                                    onclick: function () {
                                        tabs.vm.rmTab(i, ii);
                                    }
                                }),
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

            // 以下是超级拖曳的相关代码
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
                        filter: '.filtered',
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
                        filter: '.filtered',
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

    // 展示Log
    function showAllLogs() {
        chrome.storage.local.get(function (storage) {
            console.log(storage)
            var bridge = [];
            if (storage.gistLog) {
                bridge = storage.gistLog;
                console.log(bridge)
                document.getElementById('totals').innerHTML = bridge.length;
            } else {
                document.getElementById('totals').innerHTML = 0;
            }
            var logs = {}, // to-be module
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
                var vm = {};
                vm.init = function () {
                    vm.list = new logs.LogGroupsList();
                };
                return vm;
            };

            logs.controller = function () {
                var i;
                logs.vm.init();
                for (i = 0; i < logGroups.length; i += 1) {
                    logs.vm.list.push(new logs.LogGroup(logGroups[i]));
                }
            };

            logs.view = function () {
                if (logs.vm.list.length === 0) {
                    return m('div',
                        m('div.jumbotron',
                            [m('div', { style: "text-align:center; margin-bottom:50px" }, `${chrome.i18n.getMessage("noLog")}`)
                            ]))
                }

                return logs.vm.list.map(function (group, i) {
                    return m('div.div-top', {
                        id: i
                    }, [
                        m('div', [
                            m('span.group-title', {
                                onclick: function () {
                                    $("#logs_" + i).slideToggle();
                                }
                            }, group.type())
                        ]),
                        m('ul', {
                            id: "logs_" + i
                        }, group.logs().map(function (log, ii) {
                            return m('li.li-hover li-standard', [
                                m('span.line', {
                                }, log)
                            ]);
                        }))
                    ]);
                });
            };
            // init the app
            m.module(document.getElementById('logs'), { controller: logs.controller, view: logs.view });
        });
    };

    // 展示配置
    function showOptions() {
        chrome.storage.local.get('options', function (storage) {
            var opts = storage.options || {};

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
        });
        document.getElementById("options").innerHTML = `
            <div class="option">
                <div class="desc">
                    <p>${chrome.i18n.getMessage("restoreKey")}</p>
                </div>
                <div class="choices">
                    <p><label for="deleteTabOnOpen"><input type="radio" name="deleteTabOnOpen" value="yes">${chrome.i18n.getMessage("restoreValueDelete")}</label></p>
                    <p><label for="deleteTabOnOpen"><input type="radio" name="deleteTabOnOpen" value="no">${chrome.i18n.getMessage("restoreValueLive")}</label></p>
                </div>
            </div>
            <div class="option">
            <div class="desc">
                <p>${chrome.i18n.getMessage("openBackgroundAfterSendTab")}</p>
            </div>
            <div class="choices">
                <p><label for="openBackgroundAfterSendTab"><input type="radio" name="openBackgroundAfterSendTab" value="yes">${chrome.i18n.getMessage("openBackgroundAfterSendTabYes")}</label></p>
                <p><label for="openBackgroundAfterSendTab"><input type="radio" name="openBackgroundAfterSendTab" value="no">${chrome.i18n.getMessage("openBackgroundAfterSendTabNo")}</label></p>
            </div>
        </div>
            <button id="save">${chrome.i18n.getMessage("saveButtonValue")}</button>
            <div id="saved">${chrome.i18n.getMessage("savedValue")}</div>
        `
        // 保存配置
        document.getElementById('save').addEventListener('click', function () {
            var deleteTabOnOpen = document.querySelector('input[name="deleteTabOnOpen"]:checked').value;
            var openBackgroundAfterSendTab = document.querySelector('input[name="openBackgroundAfterSendTab"]:checked').value;

            chrome.storage.local.set({
                options: {
                    deleteTabOnOpen: deleteTabOnOpen,
                    openBackgroundAfterSendTab: openBackgroundAfterSendTab
                }
            }, function () { // show "settings saved" notice thing
                document.getElementById('saved').style.display = 'block';
                window.setTimeout(function () {
                    document.getElementById('saved').style.display = 'none';
                }, 1000);
            });
        });
    };

    // 打开JSON工具页
    function openJsonTools() {
        chrome.tabs.query({ url: "chrome-extension://*/json.html*", currentWindow: true }, function (tab) {
            if (tab.length >= 1) {
                chrome.tabs.move(tab[0].id, { index: 0 }, function callback() {
                    chrome.tabs.highlight({ tabs: 0 }, function callback() {
                    });
                });
                chrome.tabs.reload(tab[0].id, {}, function (tab) {
                });
            } else {
                chrome.tabs.create({ index: 0, url: chrome.extension.getURL('json.html') });
            }
        });
    };

    // 打开 Markdown目录生成器
    function openMarkdownToc() {
        chrome.tabs.query({ url: "chrome-extension://*/markdownToc.html*", currentWindow: true }, function (tab) {
            if (tab.length >= 1) {
                chrome.tabs.move(tab[0].id, { index: 0 }, function callback() {
                    chrome.tabs.highlight({ tabs: 0 }, function callback() {
                    });
                });
                chrome.tabs.reload(tab[0].id, {}, function (tab) {
                });
            } else {
                chrome.tabs.create({ index: 0, url: chrome.extension.getURL('markdownToc.html') });
            }
        });
    };

    // 展示定时任务
    function showTasks() {
        chrome.storage.local.get(function (storage) {
            var bridge = [];
            var taskJsUrl = "";
            if (storage.taskList) {
                bridge = storage.taskList;
                taskJsUrl = storage.taskJsUrl;
                if (bridge.length > 0) {
                    document.getElementById('totals').innerHTML = bridge.length;
                } else {
                    document.getElementById('totals').innerHTML = 0;
                }
            } else {
                document.getElementById('totals').innerHTML = 0;
            }
            var taskObj = {}, // to-be module
                taskGroups = bridge || [];

            function saveTaskGroups(json) {
                chrome.storage.local.set({ "taskList": json });
            }

            // model entity
            taskObj.taskGroup = function (data) {
                this.description = m.prop(data.description);
                this.functionName = m.prop(data.functionName);
                this.rate = m.prop(data.rate);
                this.isOpen = m.prop(data.isOpen);
                this.script = m.prop(data.script);
            };

            // alias for Array
            taskObj.TaskGroupsList = Array;

            // view-model
            taskObj.vm = new function () {
                var vm = {};
                vm.init = function () {
                    vm.list = new taskObj.TaskGroupsList();
                };

                vm.rmTask = function (taskIndex) {
                    // remove from localStorage
                    taskGroups.splice(taskIndex, 1);
                    // save
                    saveTaskGroups(taskGroups);
                    if (taskGroups) {
                        chrome.alarms.clearAll(function (wasCleared) {
                            console.log(wasCleared)
                            for (let i = 0; i < taskGroups.length; i++) {
                                if (taskGroups[i].isOpen) {
                                    chrome.alarms.create(taskGroups[i].functionName, { delayInMinutes: parseInt(taskGroups[i].rate), periodInMinutes: parseInt(taskGroups[i].rate) });
                                }
                            }
                            // 创建定时同步gitee任务
                            chrome.alarms.create("checkAutoSyncGitee", { delayInMinutes: 70, periodInMinutes: 70 });
                            // 创建定时同步github任务
                            chrome.alarms.create("checkAutoSyncGithub", { delayInMinutes: 90, periodInMinutes: 90 });

                        });
                    }
                    showTasks();
                };

                vm.moveTask = function (index, tindex) {
                    if (index > tindex) {
                        taskGroups.splice(tindex, 0, taskGroups[index]);
                        taskGroups.splice(index + 1, 1);
                        saveTaskGroups(taskGroups);
                    } else {
                        taskGroups.splice(tindex + 1, 0, taskGroups[index]);
                        taskGroups.splice(index, 1);
                        saveTaskGroups(taskGroups);
                    }
                };

                vm.updateTask = function (index, taskInfo) {
                    let functionName = taskInfo.functionName
                    let description = taskInfo.description
                    let rate = taskInfo.rate
                    let isOpen = taskInfo.isOpen
                    let script = taskInfo.script
                    taskGroups[index].functionName = functionName
                    taskGroups[index].description = description
                    taskGroups[index].rate = rate
                    taskGroups[index].isOpen = JSON.parse(isOpen)
                    taskGroups[index].script = script
                    saveTaskGroups(taskGroups);
                    if (taskGroups) {
                        chrome.alarms.clearAll(function (wasCleared) {
                            console.log(wasCleared)
                            for (let i = 0; i < taskGroups.length; i++) {
                                if (taskGroups[i].isOpen) {
                                    chrome.alarms.create(taskGroups[i].functionName, { delayInMinutes: parseInt(taskGroups[i].rate), periodInMinutes: parseInt(taskGroups[i].rate) });
                                }
                            }
                            // 创建定时同步gitee任务
                            chrome.alarms.create("checkAutoSyncGitee", { delayInMinutes: 70, periodInMinutes: 70 });
                            // 创建定时同步github任务
                            chrome.alarms.create("checkAutoSyncGithub", { delayInMinutes: 90, periodInMinutes: 90 });

                        });
                    }
                    showTasks()
                };
                return vm;
            };

            taskObj.controller = function () {
                var i;
                taskObj.vm.init();
                for (i = 0; i < taskGroups.length; i += 1) {
                    taskObj.vm.list.push(new taskObj.taskGroup(taskGroups[i]));
                }
            };

            taskObj.view = function () {
                if (taskObj.vm.list.length === 0) {
                    return m('div', [m('button.btn btn-primary taskButtonGroup', {
                        id: "showAddTask",
                        type: "button",
                        onclick: function () {
                            $('#addTaskArea').slideToggle();
                            $('#functionName').val("")
                            $('#description').val("")
                            $('#rate').val("")
                            $('#script').val("")
                        }
                    }, `${chrome.i18n.getMessage("addTask")}`), m('button.btn btn-primary taskButtonGroup', {
                        id: "refresh",
                        type: "button",
                        onclick: function () {
                            showTasks()
                        },
                        onmouseover: function () {
                            chrome.alarms.getAll(function (alarms) {
                                console.log(alarms)
                                if (alarms.length > 0) {
                                    for (let i = 0; i < alarms.length; i++) {
                                        console.log(alarms[i].name)
                                    }
                                }
                            });
                        }
                    }, `${chrome.i18n.getMessage("refresh")}`), m('table.table table-hover', [m('thead', m('tr', [m('th', "任务代号"), m('th', "任务描述"), m('th', "调用频率(分钟)"), m('th', "调用结果"), m('th', "最近调用时间"), m('th', "是否启用"), m('th', "操作")]))]), m('div',
                        m('div.jumbotron',
                            [m('div', { style: "text-align:center; margin-bottom:50px" }, "还没有任务！")
                            ])), m('div', { id: "addTaskArea", style: "display:none" }, [
                                m('div', [m('label', "任务代号"), m('input.addTaskTextClass', { id: "functionName", type: "text" })]),
                                m('div', [m('label', "任务描述"), m('input.addTaskTextClass', { id: "description", type: "text" })]),
                                m('div', [m('label', "每隔"), m('input.addTaskTextClass', { id: "rate", type: "text" }), m('label', "分钟")]),
                                m('div', [m('div', "任务脚本"), m('textarea', { id: "script", type: "text", style: "width:260px;height:200px" })]),
                                m('div', [m('button.btn btn-primary addTaskTextClass', {
                                    id: "add",
                                    type: "button",
                                    onclick: function () {
                                        if ($('#functionName').val().trim().length <= 0) {
                                            tip("任务代号不能为空！")
                                        } else if ($('#description').val().trim().length <= 0) {
                                            tip("任务描述不能为空！")
                                        } else if ($('#rate').val().trim().length <= 0) {
                                            tip("调用频率不能为空！")
                                        } else if ($('#script').val().trim().length <= 0) {
                                            tip("任务脚本不能为空！")
                                        } else if (!isInt(parseInt($('#rate').val().trim()))) {
                                            tip("调用频率必须是整数")
                                        } else {
                                            var taskList = new Array()
                                            let functionName = $('#functionName').val().trim()
                                            let description = $('#description').val().trim()
                                            let rate = $('#rate').val().trim()
                                            let script = $('#script').val().trim()
                                            let task = { functionName: functionName, description: description, rate: rate, script: script, isOpen: false }
                                            chrome.storage.local.get(null, function (items) {
                                                if (items.taskList) {
                                                    taskList = items.taskList
                                                    let flag = false;
                                                    for (let i = 0; i < taskList.length; i++) {
                                                        if (taskList[i].functionName === functionName) {
                                                            flag = true;
                                                        }
                                                    }
                                                    if (flag) {
                                                        tip(functionName + "已存在，换一个")
                                                    } else {
                                                        taskList.push(task)
                                                        chrome.storage.local.set({ "taskList": taskList });
                                                        $('#addTaskArea').slideToggle();
                                                        $('#functionName').val("")
                                                        $('#description').val("")
                                                        $('#rate').val("")
                                                        $('#script').val("")
                                                        reloadAbleJSFn("taskJs", taskJsUrl)
                                                        showTasks()
                                                    }
                                                } else {
                                                    taskList.push(task)
                                                    chrome.storage.local.set({ "taskList": taskList });
                                                    $('#addTaskArea').slideToggle();
                                                    $('#functionName').val("")
                                                    $('#description').val("")
                                                    $('#rate').val("")
                                                    $('#script').val("")
                                                    reloadAbleJSFn("taskJs", taskJsUrl)
                                                    showTasks()
                                                }
                                            })
                                        }
                                    }
                                }, `${chrome.i18n.getMessage("add")}`), m('button.btn btn-primary addTaskTextClass', {
                                    id: "cancle",
                                    type: "button",
                                    onclick: function () {
                                        $('#addTaskArea').slideToggle();
                                        $('#functionName').val("")
                                        $('#description').val("")
                                        $('#rate').val("")
                                        $('#script').val("")
                                    }
                                }, `${chrome.i18n.getMessage("cancle")}`)])
                            ])])
                } else {
                    return m('div', [m('button.btn btn-primary taskButtonGroup', {
                        id: "showAddTask",
                        type: "button",
                        onclick: function () {
                            $('#addTaskArea').slideToggle();
                            $('#functionName').val("")
                            $('#description').val("")
                            $('#rate').val("")
                            $('#script').val("")
                        }
                    }, `${chrome.i18n.getMessage("addTask")}`), m('button.btn btn-primary taskButtonGroup', {
                        id: "refresh",
                        type: "button",
                        onclick: function () {
                            showTasks()
                        },
                        onmouseover: function () {
                            chrome.alarms.getAll(function (alarms) {
                                console.log(alarms)
                                if (alarms.length > 0) {
                                    for (let i = 0; i < alarms.length; i++) {
                                        console.log(alarms[i].name)
                                    }
                                }
                            });
                        }
                    }, `${chrome.i18n.getMessage("refresh")}`), m('table.table table-hover', [m('thead', m('tr', [m('th', "任务代号"), m('th', "任务描述"), m('th', "调用频率(分钟)"), m('th', "调用结果"), m('th', "最近调用时间"), m('th', "是否启用"), m('th', "操作")])), m('tbody', { id: "taskGroups" }, taskObj.vm.list.map(function (group, i) {
                        let isOpen
                        if (group.isOpen()) {
                            isOpen = "停用"
                        } else {
                            isOpen = "启用"
                        }
                        let functionName = group.functionName()
                        let info = storage[functionName]
                        let feedback, lastRun;
                        if (info) {
                            feedback = info.feedback
                            lastRun = info.lastRun
                        }
                        return m('tr', [m('th', group.functionName()), m('td', group.description()), m('td', group.rate()), m('td', feedback || '无'), m('td', lastRun || '无'), m('td', m('span', group.isOpen())), m('td', m('span.link', {
                            onclick: function () {
                                let functionName = group.functionName()
                                let description = group.description()
                                let rate = group.rate()
                                let isOpen = group.isOpen()
                                let script = group.script()
                                let task = { functionName: functionName, description: description, rate: rate, script: script, isOpen: !isOpen }
                                taskObj.vm.updateTask(i, task)
                            }
                        }, isOpen), [m('span.link', {
                            onclick: function () {
                                var functionName = group.functionName()
                                try {
                                    myRun(functionName)
                                    setTimeout(function () {
                                        showTasks()
                                    }, 2000);
                                }
                                catch (err) {
                                    alert("任务js报错啦！" + err)
                                }
                            }
                        }, '运行'), m('span.link', {
                            onclick: function () {
                                $('#updateTaskArea').slideToggle();
                                let functionName = group.functionName()
                                let description = group.description()
                                let rate = group.rate()
                                let isOpen = group.isOpen()
                                let script = group.script()
                                $('#functionName2').val(functionName)
                                $('#description2').val(description)
                                $('#rate2').val(rate)
                                $('#script2').val(script)
                                $('#isOpen2').val(isOpen)
                                $('#id2').val(i)
                            }
                        }, '编辑'), m('span.link', {
                            onclick: function () {
                                taskObj.vm.rmTask(i)
                                chrome.storage.local.remove(group.functionName(), function () {
                                })
                            }
                        }, '删除')])])
                    })

                    )]), m('div', { id: "addTaskArea", style: "display:none" }, [
                        m('div', [m('label', "任务代号"), m('input.addTaskTextClass', { id: "functionName", type: "text" })]),
                        m('div', [m('label', "任务描述"), m('input.addTaskTextClass', { id: "description", type: "text" })]),
                        m('div', [m('label', "每隔"), m('input.addTaskTextClass', { id: "rate", type: "text" }), m('label', "分钟")]),
                        m('div', [m('div', "任务脚本"), m('textarea', { id: "script", type: "text", style: "width:260px;height:200px" })]),
                        m('div', [m('button.btn btn-primary addTaskTextClass', {
                            id: "add",
                            type: "button",
                            onclick: function () {
                                if ($('#functionName').val().trim().length <= 0) {
                                    tip("任务代号不能为空！")
                                } else if ($('#description').val().trim().length <= 0) {
                                    tip("任务描述不能为空！")
                                } else if ($('#rate').val().trim().length <= 0) {
                                    tip("调用频率不能为空！")
                                } else if ($('#script').val().trim().length <= 0) {
                                    tip("任务脚本不能为空！")
                                } else if (!isInt(parseInt($('#rate').val().trim()))) {
                                    tip("调用频率必须是整数")
                                } else {
                                    var taskList = new Array()
                                    let functionName = $('#functionName').val().trim()
                                    let description = $('#description').val().trim()
                                    let rate = $('#rate').val().trim()
                                    let script = $('#script').val().trim()
                                    let task = { functionName: functionName, description: description, rate: rate, script: script, isOpen: false }
                                    chrome.storage.local.get(null, function (items) {
                                        if (items.taskList) {
                                            taskList = items.taskList
                                            let flag = false;
                                            for (let i = 0; i < taskList.length; i++) {
                                                if (taskList[i].functionName === functionName) {
                                                    flag = true;
                                                }
                                            }
                                            if (flag) {
                                                tip(functionName + "已存在，换一个")
                                            } else {
                                                taskList.push(task)
                                                chrome.storage.local.set({ "taskList": taskList });
                                                $('#addTaskArea').slideToggle();
                                                $('#functionName').val("")
                                                $('#description').val("")
                                                $('#rate').val("")
                                                $('#script').val("")
                                                reloadAbleJSFn("taskJs", taskJsUrl)
                                                showTasks()
                                            }
                                        } else {
                                            taskList.push(task)
                                            chrome.storage.local.set({ "taskList": taskList });
                                            $('#addTaskArea').slideToggle();
                                            $('#functionName').val("")
                                            $('#description').val("")
                                            $('#rate').val("")
                                            $('#script').val("")
                                            reloadAbleJSFn("taskJs", taskJsUrl)
                                            showTasks()
                                        }
                                    })
                                }
                            }
                        }, `${chrome.i18n.getMessage("add")}`), m('button.btn btn-primary addTaskTextClass', {
                            id: "cancle",
                            type: "button",
                            onclick: function () {
                                $('#addTaskArea').slideToggle();
                                $('#functionName').val("")
                                $('#description').val("")
                                $('#rate').val("")
                                $('#script').val("")
                            }
                        }, `${chrome.i18n.getMessage("cancle")}`)])
                    ]), m('div', { id: "updateTaskArea", style: "display:none" }, [
                        m('div', [m('label', "任务代号"), m('input.addTaskTextClass', { id: "functionName2", type: "text" })]),
                        m('div', [m('label', "任务描述"), m('input.addTaskTextClass', { id: "description2", type: "text" })]),
                        m('div', [m('input.addTaskTextClass', { id: "isOpen2", type: "text", style: "display:none" })]),
                        m('div', [m('input.addTaskTextClass', { id: "id2", type: "text", style: "display:none" })]),
                        m('div', [m('label', "每隔"), m('input.addTaskTextClass', { id: "rate2", type: "text" }), m('label', "分钟")]),
                        m('div', [m('div', "任务脚本"), m('textarea', { id: "script2", type: "text", style: "width:260px;height:200px" })]),
                        m('div', [m('button.btn btn-primary addTaskTextClass', {
                            id: "update",
                            type: "button",
                            onclick: function () {
                                if ($('#functionName2').val().trim().length <= 0) {
                                    tip("任务代号不能为空！")
                                } else if ($('#description2').val().trim().length <= 0) {
                                    tip("任务描述不能为空！")
                                } else if ($('#rate2').val().trim().length <= 0) {
                                    tip("调用频率不能为空！")
                                } else if ($('#script2').val().trim().length <= 0) {
                                    tip("任务脚本不能为空！")
                                } else if (!isInt(parseInt($('#rate2').val().trim()))) {
                                    tip("调用频率必须是整数")
                                } else {
                                    let functionName = $('#functionName2').val().trim()
                                    let description = $('#description2').val().trim()
                                    let rate = $('#rate2').val().trim()
                                    let script = $('#script2').val().trim()
                                    let isOpen = $('#isOpen2').val().trim()
                                    let id = $('#id2').val().trim()
                                    let task = { functionName: functionName, description: description, rate: rate, script: script, isOpen: isOpen }

                                    taskObj.vm.updateTask(id, task)
                                    reloadAbleJSFn("taskJs", taskJsUrl)
                                }
                            }
                        }, `${chrome.i18n.getMessage("update")}`), m('button.btn btn-primary addTaskTextClass', {
                            id: "cancle",
                            type: "button",
                            onclick: function () {
                                $('#updateTaskArea').slideToggle();
                                $('#functionName').val("")
                                $('#description').val("")
                                $('#rate').val("")
                                $('#script').val("")
                            }
                        }, `${chrome.i18n.getMessage("cancle")}`)])
                    ])])

                }

            };
            // init the app
            m.module(document.getElementById('tasks'), { controller: taskObj.controller, view: taskObj.view });

            // 以下是超级拖曳的相关代码
            if (document.getElementById("taskGroups")) {
                sortableTask = Sortable.create(document.getElementById("taskGroups"), {
                    group: {
                        name: "taskGroups",
                        pull: false,
                        put: false
                    },
                    scroll: true,
                    easing: "cubic-bezier(1, 0, 0, 1)",
                    animation: 150, //动画参数
                    ghostClass: 'ghost',
                    filter: '.filtered',
                    onEnd: function (evt) { //拖拽完毕之后发生该事件
                        console.log(evt)
                        // console.log(evt.item);
                        // console.log(evt.to);
                        // console.log(evt.from);
                        // console.log(evt.oldIndex);
                        // console.log(evt.newIndex);
                        // console.log(evt.oldDraggableIndex);
                        // console.log(evt.newDraggableIndex);
                        taskObj.vm.moveTask(evt.oldIndex, evt.newIndex);
                    }
                });
            }
        });
    }

    // 简单的消息通知
    function tip(info) {
        info = info || '';
        var ele = document.createElement('div');
        ele.id = 'descDiv';
        ele.className = 'chrome-plugin-simple-tip';
        ele.style.top = '20px';
        ele.style.left = '500px';
        ele.innerHTML = `<div>${info}</div>`;
        document.body.appendChild(ele);
        ele.classList.add('animated');
        setTimeout(() => {
            ele.style.top = '-100px';
            setTimeout(() => {
                ele.remove();
            }, 400);
        }, 3000);
    }

    // 判断是否int
    function isInt(i) {
        return typeof i == "number" && !(i % 1) && !isNaN(i);
    }

    // 刷新当前页
    function refresh() {
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabsArr) {
            chrome.tabs.reload(tabsArr[0].id, {}, function (tab) {
            });
        });
    }

    // 重新加载自定义的任务js
    function reloadAbleJSFn(id, newJS) {
        setTimeout(function () {
            var oldjs = null;
            var oldjs = document.getElementById(id);
            if (oldjs) oldjs.parentNode.removeChild(oldjs);
            var scriptObj = document.createElement("script");
            scriptObj.src = newJS;
            scriptObj.type = "text/javascript";
            scriptObj.id = id;
            document.head.appendChild(scriptObj);
            console.log('执行完成');
        }, 2000);
    }

    // 持续监听，假如锁屏或者睡眠就清空定时任务，激活再重新定时任务
    chrome.idle.onStateChanged.addListener(function (newState) {
        console.log(newState)
        if (newState == "active") {
            if (isLock) {
                chrome.storage.local.get(null, function (items) {
                    let taskList = items.taskList
                    for (let i = 0; i < taskList.length; i++) {
                        if (taskList[i].isOpen) {
                            chrome.alarms.create(taskList[i].functionName, { delayInMinutes: parseInt(taskList[i].rate), periodInMinutes: parseInt(taskList[i].rate) });
                        }
                    }
                    // 创建定时同步gitee任务
                    chrome.alarms.create("checkAutoSyncGitee", { delayInMinutes: 70, periodInMinutes: 70 });
                    // 创建定时同步github任务
                    chrome.alarms.create("checkAutoSyncGithub", { delayInMinutes: 90, periodInMinutes: 90 });

                })
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

}(m));
