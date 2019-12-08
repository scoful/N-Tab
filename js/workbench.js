; (function (m) {
    'use strict';
    var githubGistToken;
    var giteeGistToken;
    var githubGistId;
    var giteeGistId;
    var gitHubApiUrl = "https://api.github.com";
    var giteeApiUrl = "";
    var pushToGithubGistStatus;
    var pullFromGithubGistStatus;
    var pushToGiteeGistStatus;
    var sortableTitle;
    var sortableTabList = new Array();
    // 定义一个n次循环定时器
    var intervalId;

    document.addEventListener('DOMContentLoaded', function () {
        console.log("load完workbench了");
        checkGitHubStatus();
        chrome.storage.local.get(null, function (items) {
            var total = new Array();
            for (var i = 0; i < 100; i++) {
                total.push("tabGroups_" + i);
            };
            // 一load完就算一下storage占用了多少空间
            chrome.storage.local.getBytesInUse(total, function (bytes) {
                console.log("total is " + bytes);
            });
            var dragType = items.dragType;
            if (dragType == "dragUrls") {
                $('#dragUrls').prop("checked", true);
            }
            if (dragType == "dragTitle") {
                $('#dragTitle').prop("checked", true);
            }
        });
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
    });

    // 检查跟github的通讯是否正常
    function checkGitHubStatus() {
        $.ajax({
            type: "GET",
            url: gitHubApiUrl,
            success: function (data, status) {
                if (status == "success") {
                    console.log("跟github通讯正常！");
                    document.getElementById('githubStatus').innerHTML = "API status : AWESOME";
                } else {
                    document.getElementById('githubStatus').innerHTML = "API status : SAD";
                }
            },
            error: function (xhr, errorText, errorType) {
                document.getElementById('githubStatus').innerHTML = "API status : BAD NEWS";
            },
            complete: function () {
                //do something
            }
        })
    }

    // hide show gist 功能
    document.getElementById('hideShowGist').addEventListener('click', function () {
        $("#menu").slideToggle();
    });

    // hide show 导入oneTab的url功能
    document.getElementById('hideShowImport').addEventListener('click', function () {
        $("#importOneTab").slideToggle();
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
                let lineList = content[i].split(" | ")
                let tab = { "title": lineList[1], "url": lineList[0] }
                tabsArr.push(tab);
            }
            saveShardings(tabGroups, "object");
            chrome.tabs.query({ active: true, currentWindow: true }, function (tabsArr) {
                chrome.tabs.reload(tabsArr[0].id, {}, function (tab) {
                });
            });
        });
    });

    // 关闭当前tab
    function closeCurrentTab() {
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabsArr) {
            chrome.tabs.remove(tabsArr[0].id, function () { });
        });
    }

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

    // 响应推送到github的gist的动作
    document.getElementById('pushToGithubGist').addEventListener('click', function () {
        var confirm = prompt('请输入"确定"表示确认：', "会覆盖的，小心谨慎思考这操作到底要不要！！！");
        if (confirm == "确定") {
            console.log("yes");
            console.log(pushToGithubGistStatus);
            pushToGithubGistStatus = "开始push到github的gist的任务";
            console.log("开始push到github的gist的任务");
            if (typeof (pushToGithubGistStatus) != "undefined") {
                console.log("开始工作");
                intervalId = setInterval(function () {
                    if (typeof (pushToGithubGistStatus) != "undefined") {
                        console.log("秒等待");
                        document.getElementById('pushToGithubGistStatus').innerHTML = pushToGithubGistStatus;
                    } else {
                        clearInterval(intervalId);
                        document.getElementById('pushToGithubGistStatus').innerHTML = "push到github的gist的任务完成";
                        console.log("push到github的gist的任务完成");
                    }
                }, 1000);
                isStoredGithubTokenLocal("push_github");

            } else {
                console.log("push到github的gist的任务完成");
                clearInterval(intervalId);
                document.getElementById('pushToGithubGistStatus').innerHTML = "push到github的gist的任务完成";
            }
        } else {
            console.log("no");
        }
    });

    // 响应从github的gist拉取的动作
    document.getElementById('pullFromGithubGist').addEventListener('click', function () {
        var confirm = prompt('请输入"确定"表示确认：', "会覆盖的，小心谨慎思考这操作到底要不要！！！");
        if (confirm == "确定") {
            console.log("yes");
            console.log(pullFromGithubGistStatus);
            pullFromGithubGistStatus = "开始pull从github的gist的任务";
            console.log("开始pull从github的gist的任务");
            if (typeof (pullFromGithubGistStatus) != "undefined") {
                console.log("开始工作");
                intervalId = setInterval(function () {
                    if (typeof (pullFromGithubGistStatus) != "undefined") {
                        console.log("秒等待");
                        document.getElementById('pullFromGithubGistStatus').innerHTML = pullFromGithubGistStatus;
                    } else {
                        clearInterval(intervalId);
                        document.getElementById('pullFromGithubGistStatus').innerHTML = "pull从github的gist的任务完成";
                        console.log("pull从github的gist的任务完成");
                    }
                }, 1000);
                isStoredGithubTokenLocal("pull_github");

            } else {
                console.log("pull从github的gist的任务完成");
                clearInterval(intervalId);
                document.getElementById('pushToGithubGistStatus').innerHTML = "pull从github的gist的任务完成";
            }
        } else {
            console.log("no");
        }
    });

    // 更新github的gist
    function updateGithubGist(content) {
        pushToGithubGistStatus = "已经创建了gist，直接开始更新";
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
                } else {
                    console.log("更新失败！");
                }
            },
            error: function (xhr, errorText, errorType) {
                console.log(xhr);
                console.log(errorText);
                console.log(errorType);
                console.log("报错了！");
            },
            complete: function () {
                //do something
                pushToGithubGistStatus = undefined;
            }
        })
    }

    // 判断是否已经保存了github的gistId
    function isStoredGithubGistIdLocal(action) {
        console.log("开始检查gistId有没有保存");
        if (action == "push_github") {
            pushToGithubGistStatus = "开始检查gistId有没有保存";
        } else if (action == "pull_github") {
            pullFromGithubGistStatus = "开始检查gistId有没有保存";
        }
        chrome.storage.local.get("githubGistId", function (storage) {
            console.log(storage.githubGistId);
            if (storage.githubGistId) {
                console.log("gistId有保存");
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
                    getGistById();
                }
            } else {
                console.log("gistId没有保存");
                isHadCreateGithubGist(action);
            }
        });
    }

    // 通过gistId获取gist
    function getGistById() {
        console.log("根据gistId拉取gist");
        pullFromGithubGistStatus = "根据gistId拉取gist";
        $.ajax({
            type: "GET",
            url: gitHubApiUrl + "/gists/" + githubGistId,
            success: function (data, status) {
                if (status == "success") {
                    saveShardings(data.files['brower_Tabs.json'].content, "string");
                } else {
                    alert("根据gistId拉取gist失败了");
                }
            },
            error: function (xhr, errorText, errorType) {
                alert("根据gistId拉取gist报错了");
            },
            complete: function () {
                //do something
                pullFromGithubGistStatus = undefined;
                chrome.tabs.query({ active: true, currentWindow: true }, function (tabsArr) {
                    chrome.tabs.reload(tabsArr[0].id, {}, function (tab) {
                    });
                });
            }
        })
    }

    // 判断是否已经创建了github的gist
    function isHadCreateGithubGist(action) {
        console.log("检查是否已经创建了gist");
        if (action == "push_github") {
            pushToGithubGistStatus = "检查是否已经创建了gist";
        } else if (action == "pull_github") {
            pullFromGithubGistStatus = "检查是否已经创建了gist";
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
                            githubGistId = data[i].id;
                            chrome.storage.local.set({ githubGistId: data[i].id });
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
                            getGistById();
                        }
                    }
                } else {
                    alert("获取所有gists时失败了");
                }
            },
            error: function (xhr, errorText, errorType) {
                alert("获取所有gists时报错了");
            },
            complete: function () {
                //do something
            }
        })
    }

    // 判断是否已经保存github的Token
    function isStoredGithubTokenLocal(action) {
        console.log("开始检查githubtoken有没有保存");
        if (action == "push_github") {
            pushToGithubGistStatus = "开始检查githubtoken有没有保存";
        } else if (action == "pull_github") {
            pullFromGithubGistStatus = "开始检查githubtoken有没有保存";
        }
        chrome.storage.local.get("githubGistToken", function (storage) {
            console.log(storage.githubGistToken);
            if (storage.githubGistToken) {
                console.log("githubtoken有保存");
                githubGistToken = storage.githubGistToken;
                isStoredGithubGistIdLocal(action);
            } else {
                console.log("githubtoken没有保存");
                var token = prompt('请输入权限token：', "******");
                githubGistToken = token;
                chrome.storage.local.set({ githubGistToken: token });
                console.log("githubtoken保存完毕");
                isStoredGithubGistIdLocal(action);
            }
        });
    }

    // 创建github的gist
    function createGithubGist(content) {
        console.log("还没有创建gist,开始创建");
        pushToGithubGistStatus = "还没有创建gist,开始创建";
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
                } else {
                    console.log("创建失败！");
                }
            },
            error: function (xhr, errorText, errorType) {
                console.log(xhr);
                console.log(errorText);
                console.log(errorType);
                console.log("报错了！");
            },
            complete: function () {
                //do something
                pushToGithubGistStatus = undefined;
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
                    return m('p', 'No tab groups have been saved yet, or you deleted them all...');
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