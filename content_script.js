console.log("content_script is done!!");
var pageX;
var pageY;
var scrollTop;
var scrollLeft;
var localUrl;
$(document).ready(function() {
	localUrl = window.location.href;
	console.log(localUrl);
	chrome.runtime.sendMessage({
		localUrl: localUrl
	}, function(response) {
		console.log(response.farewell);
	});
	$(document).mouseup(function(e) {
		var txt;
		txt = window.getSelection();
		if (txt.toString().length > 0) {
			translateFunc(txt.toString());
		}
	});

	$(document).click(function() {
		deleteDiv();
		if (!typeof(document.getElementById("descDiv"))) {
			document.getElementById("descDiv").className = "";
		}
		scrollTop = $(document).scrollTop();
		scrollLeft = $(document).scrollLeft();
		//console.log("x is " + pageX + ", y is " + pageY);
		//console.log("scrollTop is " + scrollTop + ", scrollLeft is " + scrollLeft);
		//console.log("x1 is " + parseInt(pageY - scrollTop) + ", y1 is " + parseInt(pageX - scrollLeft));
	});

	$(document).mousemove(function(e) {
		pageX = e.pageX;
		pageY = e.pageY;

	});

});

function translateFunc(txt) {
	var url = "https://fanyi.youdao.com/openapi.do?keyfrom=lulua-net&key=620584095&type=data&doctype=json&version=1.1&q=" + txt;
	$.get(url, function(data, status) {
		console.log(data.translation[0]);
		//alert("翻译结果是: " + data.translation[0]);
		createDiv(data.translation[0]);

	});

};

function createDiv(innerHtml) {
	//首先创建div
	var descDiv = document.createElement('div');
	document.body.appendChild(descDiv);
	//给div设置样式，比如大小、位置
	var cssStr = "border-radius:25px;background:#8AC007;padding:20px;position:fixed;left:" + parseInt(pageX - scrollLeft) + 'px;top:' + parseInt(pageY - scrollTop + 20) + 'px;';
	//将样式添加到div上，显示div
	descDiv.style.cssText = cssStr;
	descDiv.innerHTML = innerHtml;
	descDiv.id = 'descDiv';
	descDiv.style.display = 'block';
}

function deleteDiv() {
	var my = document.getElementById("descDiv");
	if (my != null)
		my.parentNode.removeChild(my);
}