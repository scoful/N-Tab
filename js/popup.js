;(function (m) {
    'use strict';
    console.log("popup_js is done!");
    // 定义一个n次循环定时器
    let intervalId;

    document.addEventListener('DOMContentLoaded', function () {
        console.log("load完popup了");
        // 点击插件图标直接跳到后台管理页
        sendMessageToBackground("openbackgroundpage", "");

        document.getElementById("deadLine").innerHTML = `
        <div class="row">
            <div id="" class="menu-entry" style="color:red;">${chrome.i18n.getMessage("deadLine")}</div>
        </div>
        `;

    });

    // 主动发送消息给后台
    function sendMessageToBackground(action, message) {
        chrome.runtime.sendMessage({action: action, message: message}, function (res) {
            if (res === 'ok') {
                console.log("content-->background发送的消息被消费了");
            }
        });
    }

    // 列出当前窗口打开的tab，方便浏览
    chrome.tabs.query({currentWindow: true}, function (allTabs) {
        let tabs = {};

        tabs.TabsList = Array;

        tabs.vm = new function () {
            let vm = {};
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
            let i;
            tabs.vm.init();
            for (i = 0; i < allTabs.length; i += 1) {
                let tab = {"title": allTabs[i].title, "id": allTabs[i].id, "favIconUrl": allTabs[i].favIconUrl};
                tabs.vm.list.push(tab);
            }
        };

        tabs.view = function () {
            return tabs.vm.list.map(function (tab, i) {
                let favIconUrl = tab.favIconUrl
                if (favIconUrl && typeof (favIconUrl) !== undefined && favIconUrl.indexOf("chrome") !== -1) {
                    favIconUrl = "./images/48.png"
                }
                if (!favIconUrl) {
                    favIconUrl = "./images/48.png"
                }
                if (typeof (favIconUrl) === undefined) {
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
