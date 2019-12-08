; (function (m) {
    'use strict';
    console.log("popup_js is done!");
    // 定义一个n次循环定时器
    var intervalId;

    // 一打开popup就获取当前tab的地址并生成二维码
    document.addEventListener('DOMContentLoaded', function () {
        console.log("load完popup了");
        var data;
        chrome.tabs.query({ active: true, currentWindow: true }, function (tab) {
            data = tab[0].url;
            $("#qr").attr("src", "http://qr.topscan.com/api.php?text=" + data);
        });

        // 发送所有tab
        document.getElementById('save-all').addEventListener('click', function () {
            chrome.tabs.query({ url: ["https://*/*", "http://*/*"], currentWindow: true }, function (tabsArr) {
                chrome.runtime.sendMessage({ action: 'save-all', tabsArr: tabsArr }, function (res) {
                    if (res === 'ok') {
                        window.close();
                    }
                });
            });
        });

        // 发送其他tab
        document.getElementById('save-others').addEventListener('click', function () {
            chrome.tabs.query({ url: ["https://*/*", "http://*/*"], active: false, currentWindow: true }, function (tabsArr) {
                chrome.runtime.sendMessage({ action: 'save-others', tabsArr: tabsArr }, function (res) {
                    if (res === 'ok') {
                        window.close();
                    }
                });
            });
        });

        // 发送当前tab
        document.getElementById('save-current').addEventListener('click', function () {
            chrome.tabs.query({ url: ["https://*/*", "http://*/*"], active: true, currentWindow: true }, function (tabsArr) {
                chrome.runtime.sendMessage({ action: 'save-current', tabsArr: tabsArr }, function (res) {
                    if (res === 'ok') {
                        window.close();
                    }
                });
            });
        });

        // open background page
        document.getElementById('open-background-page').addEventListener('click', function () {
            chrome.runtime.sendMessage({ action: 'openbackgroundpage' }, function (res) {
                if (res === 'ok') {
                    window.close();
                }
            });
        });

        // 打开json工具页
        document.getElementById('open_json_html').addEventListener('click', function () {
            chrome.tabs.create({ index: 0, url: chrome.extension.getURL('json.html') });
        });

        // 测试用
        // document.getElementById('open_test_html').addEventListener('click', function () {
        //     // chrome.tabs.create({ index: 0, url: chrome.extension.getURL('woc.html') });
        //     chrome.notifications.create(null, {
        //         type: 'basic',
        //         iconUrl: 'images/favicon.png',
        //         title: 'TIME UP',
        //         message: '分钟时间到了！',
        //         buttons: [{ "title": "111" }, { "title": "222" }],
        //         requireInteraction: true
        //     });
        // });

        // 5分钟定时提醒
        document.getElementById('five-minute').addEventListener('click', function () {
            chrome.runtime.sendMessage({ action: 'five-minute' }, function (res) {
                if (res === 'ok') {
                    window.close();
                }
            });
        });

        // 10分钟定时提醒
        document.getElementById('ten-minute').addEventListener('click', function () {
            chrome.runtime.sendMessage({ action: 'ten-minute' }, function (res) {
                if (res === 'ok') {
                    window.close();
                }
            });
        });

        // 40分钟定时提醒
        document.getElementById('forty-minute').addEventListener('click', function () {
            chrome.runtime.sendMessage({ action: 'forty-minute' }, function (res) {
                if (res === 'ok') {
                    window.close();
                }
            });
        });

        // 自定义分钟数的定时提醒
        document.getElementById('custom-minute').addEventListener('click', function () {
            var minute = prompt('请输入指定分钟数：', 120);
            chrome.runtime.sendMessage({ action: 'custom-minute', message: minute }, function (res) {
                if (res === 'ok') {
                    window.close();
                }
            });
        });

        // 通过定时器获取倒计时的样子
        var bg = chrome.extension.getBackgroundPage();
        if (typeof (bg.surplusTime) != "undefined") {
            intervalId = setInterval(function () {
                if (typeof (bg.surplusTime) != "undefined") {
                    document.getElementById('surplusTime').innerHTML = bg.surplusTime;
                } else {
                    clearInterval(intervalId);
                    document.getElementById('surplusTime').innerHTML = "暂无定时任务";
                }
            }, 1000);
        } else {
            clearInterval(intervalId);
            document.getElementById('surplusTime').innerHTML = "暂无定时任务";
        }

    });

    // 列出当前窗口打开的tab，方便浏览
    chrome.tabs.query({ currentWindow: true }, function (allTabs) {
        var tabs = {};

        tabs.TabsList = Array;

        tabs.vm = new function () {
            var vm = {};
            vm.init = function () {
                vm.list = new tabs.TabsList();
            };
            vm.rmTab = function (index) {
                chrome.tabs.remove(tabs.vm.list[index].id, function callback() { });
                tabs.vm.list.splice(index, 1);
            };
            return vm;
        };

        tabs.controller = function () {
            var i;
            tabs.vm.init();
            for (i = 0; i < allTabs.length; i += 1) {
                var tab = { "title": allTabs[i].title, "id": allTabs[i].id };
                tabs.vm.list.push(tab);
            }
        };

        tabs.view = function () {
            return tabs.vm.list.map(function (tab, i) {
                return m('div.row', {
                    onclick: function () {
                        chrome.tabs.highlight({ tabs: i }, function callback() {
                        });
                    }
                }, [
                    m("div.menu-entry", [m('span.delete-link', {
                        onclick: function (event) {
                            tabs.vm.rmTab(i);
                            event.stopPropagation();
                        }
                    }), m("span", {}, tab.title)])
                ]);
            });
        };

        // init the app
        m.module(document.getElementById('allTabs'), { controller: tabs.controller, view: tabs.view });
    });

}(m));
