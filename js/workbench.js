; (function (m) {
    'use strict';
    var githubGistToken;
    var giteeGistToken;
    var githubGistId;
    var giteeGistId;
    var gitHubApiUrl = "https://api.github.com";
    var giteeApiUrl = "";
    var pushToGithubGistStatus;
    var pushToGiteeGistStatus;
    // 定义一个n次循环定时器
    var intervalId;

    document.addEventListener('DOMContentLoaded', function () {
        console.log("load完workbench了")
        checkGitHubStatus();
    });

    function checkGitHubStatus() {
        $.ajax({
            type: "GET",
            url: gitHubApiUrl,
            success: function (data, status) {
                if (status == "success") {
                    console.log("通的！");
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
        console.log(pushToGithubGistStatus)
        pushToGithubGistStatus = "开始push到github的gist的任务"
        console.log("开始push到github的gist的任务")
        if (typeof (pushToGithubGistStatus) != "undefined") {
            console.log("开始工作")
            intervalId = setInterval(function () {
                if (typeof (pushToGithubGistStatus) != "undefined") {
                    console.log("秒等待");
                    document.getElementById('pushToGithubGist').innerHTML = pushToGithubGistStatus
                } else {
                    clearInterval(intervalId);
                    document.getElementById('pushToGithubGist').innerHTML = "push到github的gist的任务完成"
                    console.log("push到github的gist的任务完成")
                }
            }, 1000);
            isStoredGithubTokenLocal()

        } else {
            console.log("push到github的gist的任务完成")
            clearInterval(intervalId);
            document.getElementById('pushToGithubGist').innerHTML = "push到github的gist的任务完成"
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

    function isStoredGithubGistIdLocal() {
        console.log("开始检查gistId有没有保存")
        pushToGithubGistStatus = "开始检查gistId有没有保存"
        chrome.storage.sync.get("githubGistId", function (storage) {
            console.log(storage.githubGistId)
            if (storage.githubGistId) {
                console.log("gistId有保存")
                githubGistId = storage.githubGistId
                getShardings(function (callback) {
                    if (!callback || typeof callback == 'undefined' || callback == undefined) {
                        console.log("没有值")
                        updateGithubGist([])
                    } else {
                        console.log(callback)
                        updateGithubGist(callback)
                    }
                })
            } else {
                console.log("gistId没有保存")
                isHadCreateGithubGist()
            }
        });
    }

    function isHadCreateGithubGist() {
        console.log("检查是否已经创建了gist")
        pushToGithubGistStatus = "检查是否已经创建了gist"
        $.ajax({
            type: "GET",
            url: gitHubApiUrl + "/gists?access_token=" + githubGistToken,
            success: function (data, status) {
                if (status == "success") {
                    console.log("查到所有gists！");
                    console.log(data)
                    var i;
                    var flag;
                    for (i = 0; i < data.length; i += 1) {
                        if (data[i].description == "myCloudSkyMonster") {
                            console.log("已经创建了gist")
                            githubGistId = data[i].id
                            chrome.storage.sync.set({ githubGistId: data[i].id });
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
                        getShardings(function (callback) {
                            if (!callback || typeof callback == 'undefined' || callback == undefined) {
                                console.log("没有值")
                                createGithubGist([])
                            } else {
                                console.log(callback)
                                createGithubGist(callback)
                            }
                        })
                    } else {
                        getShardings(function (callback) {
                            if (!callback || typeof callback == 'undefined' || callback == undefined) {
                                console.log("没有值")
                                updateGithubGist([])
                            } else {
                                console.log(callback)
                                updateGithubGist(callback)
                            }
                        })
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

    function isStoredGithubTokenLocal() {
        console.log("开始检查githubtoken有没有保存")
        pushToGithubGistStatus = "开始检查githubtoken有没有保存"
        chrome.storage.sync.get("githubGistToken", function (storage) {
            console.log(storage.githubGistToken)
            if (storage.githubGistToken) {
                console.log("githubtoken有保存")
                githubGistToken = storage.githubGistToken
                isStoredGithubGistIdLocal()
            } else {
                console.log("githubtoken没有保存")
                var token = prompt('请输入权限token：', "******");
                githubGistToken = token
                chrome.storage.sync.set({ githubGistToken: token });
                console.log("githubtoken保存完毕")
                isStoredGithubGistIdLocal()
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

    function saveShardings(tabGroup) {
        var tabGroupStr = JSON.stringify(tabGroup);
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

    chrome.storage.sync.get(function (storage) {
        console.log(storage)
        var bridge = [];
        if (storage.tabGroups_num) {
            var tabGroupsStr = "";
            // 把分片数据组成字符串
            for (var i = 0; i < storage.tabGroups_num; i++) {
                tabGroupsStr += storage["tabGroups_" + i];
            }
            console.log(JSON.parse(tabGroupsStr))
            bridge = JSON.parse(tabGroupsStr)
        }
        var tabs = {}, // to-be module
            tabGroups = bridge || [], // tab groups
            opts = storage.options || {
                deleteTabOnOpen: 'no'
            };
        // console.log(tabGroups)
        // console.log(JSON.stringify(tabGroups))
        function saveTabGroups(json) {
            // chrome.storage.sync.set({ tabGroups: json });
            saveShardings(json)
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
                                        url: group.tabs()[i].url,
                                        pinned: group.tabs()[i].pinned
                                    });
                                }
                            }
                        }, 'Restore group')
                    ]),

                    // foreach tab
                    m('ul', group.tabs().map(function (tab, ii) {
                        return m('li', [
                            m('span.delete-link', {
                                onclick: function () {
                                    tabs.vm.rmTab(i, ii);
                                }
                            }),
                            m('img', { src: tab.favIconUrl, height: '16', width: '16' }),
                            ' ',
                            m('span.link', {
                                onclick: function () {
                                    if (opts.deleteTabOnOpen === 'yes') {
                                        tabs.vm.rmTab(i, ii);
                                    }

                                    chrome.tabs.create({
                                        url: tab.url,
                                        pinned: tab.pinned
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
