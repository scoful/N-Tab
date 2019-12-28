console.log("gzLibrary is done!!");

// 也是contentScript，只在打开http://10.0.18.10:9098/Radius/reader/routerFirst，广图局域网wifi地址的时候触发
document.addEventListener('DOMContentLoaded', function () {
    injectCustomJs();
    initCustomPanel();
});


// 向页面注入自定义JS
function injectCustomJs(jsPath) {
    jsPath = jsPath || 'js/gzLibraryInject.js';
    var temp = document.createElement('script');
    temp.setAttribute('type', 'text/javascript');
    temp.src = chrome.extension.getURL(jsPath);
    temp.onload = function () {
        console.log("gzLibraryInject.js on loaded");
    };
    document.body.appendChild(temp);
}

// 直接覆盖本来的html，即修改了本来的html结构，改成自己想要的
function initCustomPanel() {
    document.getElementById("tab-1").innerHTML = `
    <form action="" method="post" class="loginform">
    <div class="form-group">
        <span class="formicoper"></span>
        <input type="text" class="inputsty" id="rdid" name="rdid" placeholder="用户名" />
    </div>
    <div class="form-group">
        <span class="formicoper fpwd"></span>
        <input type="password" class="inputsty" id="rdPsd" name="rdPsd" placeholder="密码" />
    </div>
    <p class="login-state" id="msg"></p>
    <div class="agree">
        <i class="fang">
            <div class="chose"></div>
        </i>
        <span>本人已阅读"读者须知"并同意遵守互联网相关法律责任</span>
    </div>
    <div class="form-group logbtn">
        <input type="button" class="inputsty logbtnfont" onclick="rdidLogin()" value="登录并倒计时" />
    </div>
</form>
<div class="tishi">
    <i class="tsico"></i>
    <span>账号为读者证号前13位数字，使用身份证号码注册的账号则输入身份证号码。若没有账号请移步到图书馆总台服务台办理</span>
</div>    `;

}

// 监听inject发送过来的消息
window.addEventListener("message", function (e) {
    // console.log(e.data);
    // console.log(e.data.action);
    sendMessageToBackground(e.data.action, e.data.minute);
}, false);

// 主动发送消息给后台
function sendMessageToBackground(action, message) {
    chrome.runtime.sendMessage({ action: action, message: message }, function (res) {
        if (res === 'ok') {
            console.log("content-->background发送的消息被消费了");
        }
    });
}