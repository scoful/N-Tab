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
            sendMessageToBackground("translate", txt.toString())
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
    // TODO 本来想实现在空标签页和chrome://extensions/这种特殊页面也可以按x直接关闭，问题：1找不到焦点在哪里，在文本框里输入x也会关闭；2空标签页和chrome://extensions/想实现的话估计要再background里，contentscript需要有dom承载。
    // $(document).keyup(function (event) {
    //     console.log($(document).activeElement)
    //     if (event.key == 'x') {
    //         console.log("按下了小写x")
    //         // sendMessageToBackground("command-x", "按下了小写x")
    //     }
    //     if (event.key == 'X') {
    //         console.log("按下了大写X")
    //         // sendMessageToBackground("command-X", "按下了大写x")
    //     }
    // });
});


// 主动发送消息给后台
function sendMessageToBackground(action, message) {
    chrome.runtime.sendMessage({ action: action, message: message }, function (res) {
        if (res === 'ok') {
            console.log("content-->background发送的消息被消费了")
        }
    });
}

// 持续监听发送给contentscript的消息
chrome.runtime.onMessage.addListener(function (req, sender, sendRes) {
    switch (req.action) {
        case 'translateResult':
            sendRes('ok'); // acknowledge
            tip(req.message)
            break;
        default:
            sendRes('nope'); // acknowledge
            break;
    }
});

function deleteDiv() {
    var my = document.getElementById("descDiv");
    if (my != null)
        my.parentNode.removeChild(my);
}

// 简单的消息通知
function tip(info) {
    info = info || '';
    var ele = document.createElement('div');
    ele.id = 'descDiv'
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