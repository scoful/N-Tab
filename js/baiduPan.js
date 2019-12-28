console.log("baiduPan is done!!");

// 也是contentScript，只在打开https://pan.baidu.com/s/的时候触发
document.addEventListener('DOMContentLoaded', function () {
    injectCustomJs();
    initCustomPanel();
});


// 向页面注入自定义JS
function injectCustomJs(jsPath) {
    jsPath = jsPath || 'js/baiduPanInject.js';
    var temp = document.createElement('script');
    temp.setAttribute('type', 'text/javascript');
    temp.src = chrome.extension.getURL(jsPath);
    temp.onload = function () {
        console.log("baiduPanInject.js on loaded");
    };
    document.body.appendChild(temp);
}

// 直接覆盖本来的html，即修改了本来的html结构，改成自己想要的
function initCustomPanel() {
    if (document.getElementsByClassName("slide-header-funcs")[0]) {
        document.getElementsByClassName("slide-header-funcs")[0].innerHTML = `
            <a id="mySuperSave" class="g-button g-button-blue"><span class="g-button-right"><em class="icon icon-save-disk" title="直接插件转存"></em><span class="text" style="width: auto;">直接插件转存</span></span></a>
        `;
    }
}

// 监听inject发送过来的消息
window.addEventListener("message", function (e) {
    // console.log(e.data);
    // console.log(e.data.data);
    sendMessageToBackground(e.data.action, e.data.data);
}, false);

// 主动发送消息给后台
function sendMessageToBackground(action, data) {
    chrome.runtime.sendMessage({ action: action, message: data }, function (res) {
        if (res === 'ok') {
            console.log("content-->background发送的消息被消费了");
        }
    });
}