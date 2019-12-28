//直接通过方法名覆盖本来的js，增加发消息的功能
function loginSuccess() {
    changeElement($("#msg"), "blue", "登录成功，跳转中......");
    setTimeout(function () {
        window.location.href = "/Radius/reader/success?type=b&rdid=" + rdid + "&rdPsd=" + rdPsd + "";
    }, 500);
    window.postMessage({ action: 'custom-minute', minute: 120 }, '*');
}

