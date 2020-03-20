console.log("content_script is done!!");
var pageX;
var pageY;
var scrollTop;
var scrollLeft;

document.addEventListener('DOMContentLoaded', function () {
    $(document).mouseup(function (e) {
        var txt;
        txt = window.getSelection();
        if (txt.toString().length > 0) {
            chrome.storage.local.get('dragOpenTranslate', function (storage) {
                if (storage.dragOpenTranslate) {
                    sendMessageToBackground("translate", txt.toString());
                }
            });
        }
    });

    $(document).click(function () {
        deleteDiv();
        if (!typeof (document.getElementById("descDiv"))) {
            document.getElementById("descDiv").className = "";
        }
        scrollTop = $(document).scrollTop();
        scrollLeft = $(document).scrollLeft();
        // console.log("x is " + pageX + ", y is " + pageY);
        // console.log("scrollTop is " + scrollTop + ", scrollLeft is " + scrollLeft);
        // console.log("x1 is " + parseInt(pageY - scrollTop) + ", y1 is " + parseInt(pageX - scrollLeft));
    });

    $(document).mousemove(function (e) {
        pageX = e.pageX;
        pageY = e.pageY;

    });
});


// 主动发送消息给后台
function sendMessageToBackground(action, message) {
    chrome.runtime.sendMessage({ action: action, message: message }, function (res) {
        if (res === 'ok') {
            console.log("content-->background发送的消息被消费了");
        }
    });
}

// 持续监听发送给contentscript的消息
chrome.runtime.onMessage.addListener(function (req, sender, sendRes) {
    switch (req.action) {
        case 'translateResult':
            sendRes('ok'); // acknowledge
            tip(req.message);
            break;
        case 'generateQr':
            sendRes('ok'); // acknowledge
            var screenWidth = document.body.clientWidth + document.body.scrollLeft;
            pageX = screenWidth / 2
            pageY = 70
            scrollTop = 0
            tip(req.message);
            break;
        default:
            sendRes('nope'); // acknowledge
            break;
    }
});

// 删除生成的div
function deleteDiv() {
    var my = document.getElementById("descDiv");
    if (my != null)
        my.parentNode.removeChild(my);
}

// 简单的消息通知
function tip(info) {
    info = info || '';
    var ele = document.createElement('div');
    ele.id = 'descDiv';
    ele.className = 'chrome-plugin-simple-tip';
    ele.style.top = parseInt(pageY - scrollTop) + 20 + 'px';
    ele.style.left = pageX + 'px';
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