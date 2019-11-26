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
    // 定义一个n次循环定时器
    var intervalId;

    document.addEventListener('DOMContentLoaded', function () {
        console.log("load完workbench了")
        checkGitHubStatus();
        chrome.storage.local.get(null, function (items) {
            var total = new Array();
            for (var i = 0; i < 100; i++) {
                total.push("tabGroups_" + i)
            }
            chrome.storage.local.getBytesInUse(total, function (bytes) {
                console.log("total is " + bytes);
            });
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
                    document.getElementById('githubStatus').innerHTML = "API status : AWESOME"
                } else {
                    document.getElementById('githubStatus').innerHTML = "API status : SAD"
                }
            },
            error: function (xhr, errorText, errorType) {
                document.getElementById('githubStatus').innerHTML = "API status : BAD NEWS"
            },
            complete: function () {
                //do something
            }
        })
    }

    document.getElementById('pushToGithubGist').addEventListener('click', function () {
        var confirm = prompt('请输入"确定"表示确认：', "小心谨慎思考这操作到底要不要！！！");
        if (confirm == "确定") {
            console.log("yes")
            console.log(pushToGithubGistStatus)
            pushToGithubGistStatus = "开始push到github的gist的任务"
            console.log("开始push到github的gist的任务")
            if (typeof (pushToGithubGistStatus) != "undefined") {
                console.log("开始工作")
                intervalId = setInterval(function () {
                    if (typeof (pushToGithubGistStatus) != "undefined") {
                        console.log("秒等待");
                        document.getElementById('pushToGithubGistStatus').innerHTML = pushToGithubGistStatus
                    } else {
                        clearInterval(intervalId);
                        document.getElementById('pushToGithubGistStatus').innerHTML = "push到github的gist的任务完成"
                        console.log("push到github的gist的任务完成")
                    }
                }, 1000);
                isStoredGithubTokenLocal("push_github")

            } else {
                console.log("push到github的gist的任务完成")
                clearInterval(intervalId);
                document.getElementById('pushToGithubGistStatus').innerHTML = "push到github的gist的任务完成"
            }
        } else {
            console.log("no")
        }
    });

    document.getElementById('pullFromGithubGist').addEventListener('click', function () {
        var confirm = prompt('请输入"确定"表示确认：', "小心谨慎思考这操作到底要不要！！！");
        if (confirm == "确定") {
            console.log("yes")
            console.log(pullFromGithubGistStatus)
            pullFromGithubGistStatus = "开始pull从github的gist的任务"
            console.log("开始pull从github的gist的任务")
            if (typeof (pullFromGithubGistStatus) != "undefined") {
                console.log("开始工作")
                intervalId = setInterval(function () {
                    if (typeof (pullFromGithubGistStatus) != "undefined") {
                        console.log("秒等待");
                        document.getElementById('pullFromGithubGistStatus').innerHTML = pullFromGithubGistStatus
                    } else {
                        clearInterval(intervalId);
                        document.getElementById('pullFromGithubGistStatus').innerHTML = "pull从github的gist的任务完成"
                        console.log("pull从github的gist的任务完成")
                    }
                }, 1000);
                isStoredGithubTokenLocal("pull_github")

            } else {
                console.log("pull从github的gist的任务完成")
                clearInterval(intervalId);
                document.getElementById('pushToGithubGistStatus').innerHTML = "pull从github的gist的任务完成"
            }
        } else {
            console.log("no")
        }
    });


    function updateGithubGist(content) {
        pushToGithubGistStatus = "已经创建了gist，直接开始更新"
        console.log("已经创建了gist，直接开始更新")
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
            dataType: "json",
            data: JSON.stringify(data),
            success: function (data, status) {
                if (status == "success") {
                    console.log("更新成功！");
                } else {
                    console.log("更新失败！")
                }
            },
            error: function (xhr, errorText, errorType) {
                console.log(xhr)
                console.log(errorText)
                console.log(errorType)
                console.log("报错了！")
            },
            complete: function () {
                //do something
                pushToGithubGistStatus = undefined
            }
        })
    }

    function isStoredGithubGistIdLocal(action) {
        console.log("开始检查gistId有没有保存")
        if (action == "push_github") {
            pushToGithubGistStatus = "开始检查gistId有没有保存"
        } else if (action == "pull_github") {
            pullFromGithubGistStatus = "开始检查gistId有没有保存"
        }
        chrome.storage.local.get("githubGistId", function (storage) {
            console.log(storage.githubGistId)
            if (storage.githubGistId) {
                console.log("gistId有保存")
                githubGistId = storage.githubGistId
                if (action == "push_github") {
                    getShardings(function (callback) {
                        if (!callback || typeof callback == 'undefined' || callback == undefined) {
                            console.log("本地storage里没有内容")
                            updateGithubGist([])
                        } else {
                            updateGithubGist(callback)
                        }
                    })
                } else if (action == "pull_github") {
                    getGistById()
                }
            } else {
                console.log("gistId没有保存")
                isHadCreateGithubGist(action)
            }
        });
    }

    function getGistById() {
        console.log("根据gistId拉取gist")
        pullFromGithubGistStatus = "根据gistId拉取gist"
        $.ajax({
            type: "GET",
            url: gitHubApiUrl + "/gists/" + githubGistId,
            success: function (data, status) {
                if (status == "success") {
                    saveShardings(data.files['brower_Tabs.json'].content, "string")
                } else {
                    alert("根据gistId拉取gist失败了")
                }
            },
            error: function (xhr, errorText, errorType) {
                alert("根据gistId拉取gist报错了")
            },
            complete: function () {
                //do something
                pullFromGithubGistStatus = undefined
                chrome.tabs.query({ active: true, currentWindow: true }, function (tabsArr) {
                    chrome.tabs.reload(tabsArr[0].id, {}, function (tab) {
                    });
                });
            }
        })
    }


    function isHadCreateGithubGist(action) {
        console.log("检查是否已经创建了gist")
        if (action == "push_github") {
            pushToGithubGistStatus = "检查是否已经创建了gist"
        } else if (action == "pull_github") {
            pullFromGithubGistStatus = "检查是否已经创建了gist"
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
                            console.log("已经创建了gist")
                            githubGistId = data[i].id
                            chrome.storage.local.set({ githubGistId: data[i].id });
                            console.log("获取gistId并保存完毕")
                            console.log(githubGistId)
                            flag = true;
                            break
                        } else {
                            console.log("还没有创建gist")
                            flag = false;
                        }
                    }
                    if (!flag) {
                        if (action == "push_github") {
                            getShardings(function (callback) {
                                if (!callback || typeof callback == 'undefined' || callback == undefined) {
                                    console.log("本地storage里没有内容")
                                    createGithubGist([])
                                } else {
                                    createGithubGist(callback)
                                }
                            })
                        } else if (action == "pull_github") {
                            console.log("还没有创建gist,没有内容可以拉,结束任务")
                            pullFromGithubGistStatus = undefined
                        }
                    } else {
                        if (action == "push_github") {
                            getShardings(function (callback) {
                                if (!callback || typeof callback == 'undefined' || callback == undefined) {
                                    console.log("本地storage里没有内容")
                                    updateGithubGist([])
                                } else {
                                    updateGithubGist(callback)
                                }
                            })
                        } else if (action == "pull_github") {
                            getGistById()
                        }
                    }
                } else {
                    alert("获取所有gists时失败了")
                }
            },
            error: function (xhr, errorText, errorType) {
                alert("获取所有gists时报错了")
            },
            complete: function () {
                //do something
            }
        })
    }

    function isStoredGithubTokenLocal(action) {
        console.log("开始检查githubtoken有没有保存")
        if (action == "push_github") {
            pushToGithubGistStatus = "开始检查githubtoken有没有保存"
        } else if (action == "pull_github") {
            pullFromGithubGistStatus = "开始检查githubtoken有没有保存"
        }
        chrome.storage.local.get("githubGistToken", function (storage) {
            console.log(storage.githubGistToken)
            if (storage.githubGistToken) {
                console.log("githubtoken有保存")
                githubGistToken = storage.githubGistToken
                isStoredGithubGistIdLocal(action)
            } else {
                console.log("githubtoken没有保存")
                var token = prompt('请输入权限token：', "******");
                githubGistToken = token
                chrome.storage.local.set({ githubGistToken: token });
                console.log("githubtoken保存完毕")
                isStoredGithubGistIdLocal(action)
            }
        });
    }



    function createGithubGist(content) {
        console.log("还没有创建gist,开始创建")
        pushToGithubGistStatus = "还没有创建gist,开始创建"
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
                    console.log("创建失败！")
                }
            },
            error: function (xhr, errorText, errorType) {
                console.log(xhr)
                console.log(errorText)
                console.log(errorType)
                console.log("报错了！")
            },
            complete: function () {
                //do something
                pushToGithubGistStatus = undefined
            }
        })
    }

    function getShardings(cb) {
        chrome.storage.local.get(null, function (items) {
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

    function removeShardings(cb) {
        chrome.storage.local.get(null, function (items) {
            if (items.tabGroups_num >= 1) {
                for (var i = 0; i < items.tabGroups_num; i++) {
                    chrome.storage.local.remove("tabGroups_" + i, function callback() { });
                }
                chrome.storage.local.remove("tabGroups_num", function callback() { });
            }
        });
        cb("ok")
    }

    function saveShardings(tabGroup, type) {
        var tabGroupStr;
        if (type == "object") {
            tabGroupStr = JSON.stringify(tabGroup);
        } else if (type == "string") {
            tabGroupStr = tabGroup
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

    chrome.storage.local.get(function (storage) {
        var bridge = [];
        if (storage.tabGroups_num) {
            var tabGroupsStr = "";
            // 把分片数据组成字符串
            for (var i = 0; i < storage.tabGroups_num; i++) {
                tabGroupsStr += storage["tabGroups_" + i];
            }
            bridge = JSON.parse(tabGroupsStr)
            var i;
            var total = 0;
            for (i = 0; i < bridge.length; i += 1) {
                total += bridge[i].tabs.length
            }
            document.getElementById('totalTabs').innerHTML = total
        }
        var tabs = {}, // to-be module
            tabGroups = bridge || [], // tab groups
            opts = storage.options || {
                deleteTabOnOpen: 'no'
            };
        function saveTabGroups(json) {
            // chrome.storage.local.set({ tabGroups: json });
            saveShardings(json, "object")
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

                vm.rmGroup = function (i) {
                    // remove view from array
                    vm.list.splice(i, 1);
                    // remove from localStorage
                    tabGroups.splice(i, 1)
                    // save
                    saveTabGroups(tabGroups);
                };

                vm.rmTab = function (i, ii) {
                    // remove from view array
                    //vm.list[i].tabs().splice(ii, 1);
                    // remove from localStorage
                    tabGroups[i].tabs.splice(ii, 1);
                    // save
                    saveTabGroups(tabGroups);
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
                // group
                return m('div.group', [
                    m('div.group-title', [
                        m('span.delete-link', {
                            onclick: function () {
                                tabs.vm.rmGroup(i);
                            }
                        }),
                        m('span.group-amount', group.tabs().length + ' Tabs'),
                        ' ',
                        m('span.group-date', moment(group.date()).format('YYYY-MM-DD, HH:mm:ss')),
                        ' ',
                        m('span.restore-all', {
                            onclick: function () {
                                var i;

                                // reason this goes first and not after is because it doesn't work otherwise
                                // I imagine it's because you changed tab and stuff
                                if (opts.deleteTabOnOpen === 'yes') {
                                    tabs.vm.rmGroup(i);
                                }

                                for (i = 0; i < group.tabs().length; i += 1) {
                                    chrome.tabs.create({
                                        url: group.tabs()[i].url
                                    });
                                }
                            }
                        }, 'Restore group')
                    ]),

                    // foreach tab
                    m('ul', { id: "items" }, group.tabs().map(function (tab, ii) {
                        return m('li', [
                            m('span.delete-link', {
                                onclick: function () {
                                    tabs.vm.rmTab(i, ii);
                                }
                            }),
                            // m('img', { src: tab.favIconUrl, height: '16', width: '16' }),
                            // ' ',
                            m('span.link', {
                                onclick: function () {
                                    if (opts.deleteTabOnOpen === 'yes') {
                                        tabs.vm.rmTab(i, ii);
                                    }

                                    chrome.tabs.create({
                                        url: tab.url
                                    });
                                }
                            }, tab.title)
                        ]);
                    }))
                ]);
            });
        };

        // init the app
        m.module(document.getElementById('groups'), { controller: tabs.controller, view: tabs.view });

    });

}(m));