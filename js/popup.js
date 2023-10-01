;(function (m) {
    'use strict';
    console.log("popup_js is done!");
    // 定义一个n次循环定时器
    var intervalId;

    document.addEventListener('DOMContentLoaded', function () {
        console.log("load完popup了");
        // 点击插件图标直接跳到后台管理页
        var bg = chrome.extension.getBackgroundPage();
        bg.openBackgroundPage(); // 访问bg的函数
        // 适配QQ浏览器
        if (navigator.userAgent.toLowerCase().match(/qqbrowser/) != null) {

            document.getElementById("menu").innerHTML = `
            <div class="row">
                <div id="surplusTime" class="menu-entry"></div>
            </div>
            <div class="row">
                <div id="open-background-page" class="menu-entry">${chrome.i18n.getMessage("showAllTabs")}</div>
            </div>
            <div class="row">
                <div id="save-all" class="menu-entry">${chrome.i18n.getMessage("sendAllTabs")}</div>
            </div>
            <div class="row">
                <div id="save-current" class="menu-entry">${chrome.i18n.getMessage("sendCurrentTab")}</div>
            </div>
            <div class="row">
                <div id="save-others" class="menu-entry">${chrome.i18n.getMessage("sendOtherTabs")}</div>
            </div>
            <div class="row">
                <div id="five-minute" class="menu-entry">${chrome.i18n.getMessage("fiveMinuteRemind")}</div>
            </div>
            <div class="row">
                <div id="ten-minute" class="menu-entry">${chrome.i18n.getMessage("tenMinuteRemind")}</div>
            </div>
            <div class="row">
                <div id="forty-minute" class="menu-entry">${chrome.i18n.getMessage("fortyMinuteRemind")}</div>
            </div>
            <div class="row">
                <div id="custom-minute" class="menu-entry">${chrome.i18n.getMessage("customMinuteRemind")}</div>
            </div>
            <div class="row">
                <div id="" class="menu-entry" style="color:red;">${chrome.i18n.getMessage("cuttingLine")}</div>
            </div>
            `;

            // 发送所有tab
            document.getElementById('save-all').addEventListener('click', function () {
                chrome.tabs.query({url: ["https://*/*", "http://*/*"], currentWindow: true}, function (tabsArr) {
                    chrome.runtime.sendMessage({action: 'save-all', tabsArr: tabsArr}, function (res) {
                        if (res === 'ok') {
                            window.close();
                        }
                    });
                });
            });

            // 发送其他tab
            document.getElementById('save-others').addEventListener('click', function () {
                chrome.tabs.query({
                    url: ["https://*/*", "http://*/*"], active: false, currentWindow: true
                }, function (tabsArr) {
                    chrome.runtime.sendMessage({action: 'save-others', tabsArr: tabsArr}, function (res) {
                        if (res === 'ok') {
                            window.close();
                        }
                    });
                });
            });

            // 发送当前tab
            document.getElementById('save-current').addEventListener('click', function () {
                chrome.tabs.query({
                    url: ["https://*/*", "http://*/*"], highlighted: true, currentWindow: true
                }, function (tabsArr) {
                    chrome.runtime.sendMessage({action: 'save-current', tabsArr: tabsArr}, function (res) {
                        if (res === 'ok') {
                            window.close();
                        }
                    });
                });
            });

            // open background page
            document.getElementById('open-background-page').addEventListener('click', function () {
                chrome.runtime.sendMessage({action: 'openbackgroundpage'}, function (res) {
                    if (res === 'ok') {
                        window.close();
                    }
                });
            });

            // 5分钟定时提醒
            document.getElementById('five-minute').addEventListener('click', function () {
                chrome.runtime.sendMessage({action: 'five-minute'}, function (res) {
                    if (res === 'ok') {
                        window.close();
                    }
                });
            });

            // 10分钟定时提醒
            document.getElementById('ten-minute').addEventListener('click', function () {
                chrome.runtime.sendMessage({action: 'ten-minute'}, function (res) {
                    if (res === 'ok') {
                        window.close();
                    }
                });
            });

            // 40分钟定时提醒
            document.getElementById('forty-minute').addEventListener('click', function () {
                chrome.runtime.sendMessage({action: 'forty-minute'}, function (res) {
                    if (res === 'ok') {
                        window.close();
                    }
                });
            });

            // 自定义分钟数的定时提醒
            document.getElementById('custom-minute').addEventListener('click', function () {
                var minute = prompt(`${chrome.i18n.getMessage("pleaseInputCustomMinute")}`, 120);
                if (!isInt(parseInt(minute.trim()))) {
                    alert(`${chrome.i18n.getMessage("inputNumber")}`)
                } else {
                    chrome.runtime.sendMessage({action: 'custom-minute', message: minute.trim()}, function (res) {
                        if (res === 'ok') {
                            window.close();
                        }
                    });
                }
            });

            // 通过定时器获取倒计时的样子
            var bg = chrome.extension.getBackgroundPage();
            if (typeof (bg.surplusTime) != "undefined") {
                intervalId = setInterval(function () {
                    if (typeof (bg.surplusTime) != "undefined") {
                        document.getElementById('surplusTime').innerHTML = bg.surplusTime;
                    } else {
                        clearInterval(intervalId);
                        document.getElementById('surplusTime').innerHTML = `${chrome.i18n.getMessage("remindStatus")}`;
                    }
                }, 1000);
            } else {
                clearInterval(intervalId);
                document.getElementById('surplusTime').innerHTML = `${chrome.i18n.getMessage("remindStatus")}`;
            }
            ;
        }

        document.getElementById("deadLine").innerHTML = `
        <div class="row">
            <div id="" class="menu-entry" style="color:red;">${chrome.i18n.getMessage("deadLine")}</div>
        </div>
        `;

    });

    // 判断是否int
    function isInt(i) {
        return typeof i == "number" && !(i % 1) && !isNaN(i);
    }

    // 列出当前窗口打开的tab，方便浏览
    chrome.tabs.query({currentWindow: true}, function (allTabs) {
        var tabs = {};

        tabs.TabsList = Array;

        tabs.vm = new function () {
            var vm = {};
            vm.init = function () {
                vm.list = new tabs.TabsList();
            };
            vm.rmTab = function (index) {
                chrome.tabs.remove(tabs.vm.list[index].id, function callback() {
                });
                tabs.vm.list.splice(index, 1);
            };
            return vm;
        };

        tabs.controller = function () {
            var i;
            tabs.vm.init();
            for (i = 0; i < allTabs.length; i += 1) {
                var tab = {"title": allTabs[i].title, "id": allTabs[i].id, "favIconUrl": allTabs[i].favIconUrl};
                tabs.vm.list.push(tab);
            }
        };

        tabs.view = function () {
            return tabs.vm.list.map(function (tab, i) {
                var favIconUrl = tab.favIconUrl
                if (favIconUrl && typeof (favIconUrl) != undefined && favIconUrl.indexOf("chrome") != -1) {
                    favIconUrl = "./images/48.png"
                }
                if (!favIconUrl) {
                    favIconUrl = "./images/48.png"
                }
                if (typeof (favIconUrl) == undefined) {
                    favIconUrl = "./images/48.png"
                }
                return m('div.row', {
                    onclick: function () {
                        chrome.tabs.highlight({tabs: i}, function callback() {
                        });
                    }
                }, [m("div.menu-entry", [m('span.delete-link', {
                    onclick: function (event) {
                        tabs.vm.rmTab(i);
                        event.stopPropagation();
                    }
                }), m('img', {
                    src: favIconUrl, height: '15', width: '15'
                }), ' ', m("span", {}, tab.title)])]);
            });
        };

        // init the app
        m.module(document.getElementById('allTabs'), {controller: tabs.controller, view: tabs.view});
    });

}(m));
