document.getElementById('mySuperSave').addEventListener('click', function () {
    var sekey = prompt("请输入提取码：", "");
    var shareId = yunData.SHARE_ID
    var from = yunData.SHARE_UK
    var bdstoken = yunData.MYBDSTOKEN
    var data = { sekey: sekey.trim(), shareId: shareId, from: from, bdstoken: bdstoken }
    window.postMessage({ action: 'super-save', data: data }, '*');
    alert("已点击，等弹窗通知！");
});

