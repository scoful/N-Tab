console.log("popup_js is done!");
var data;
document.addEventListener('DOMContentLoaded', function() {
	data = chrome.extension.getBackgroundPage().urlData;
	console.log(data.LocalURL);
	generateQr(data.LocalURL);
});

function generateQr(qrCode) {
	var url = "http://apis.baidu.com/3023/qr/qrcode";
	var result = $.ajax({
		url: url,
		data: {
			size: 8,
			qr: qrCode
		},
		type: "GET",
		beforeSend: function(xhr) {
			xhr.setRequestHeader('apikey', 'c97de18f7db3a58d820576cb83b049d1');
		}, //这里设置header
		success: function(data) {
			console.log("成功了！" + data.url);
			$("#qr").attr("src", data.url);
		}
	});
};