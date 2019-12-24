console.log("nineone is done!!");

// 也是contentScript，只在打开http://91porn.com/的时候触发
document.addEventListener('DOMContentLoaded', function () {
    initCustomPanel();
});

// 直接覆盖本来的html，即修改了本来的html结构，改成自己想要的
function initCustomPanel() {
    var url = $('source')[0].src;
    var urlArea = `<textarea cols="80" rows="1" id="urlArea">${url}</textarea>`;
    $('#search').append(urlArea);
}
