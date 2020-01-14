; (function () {
    'use strict';
    document.addEventListener('DOMContentLoaded', function () {
        console.log("load完json了");
    });

    document.getElementById('copyJson').addEventListener('click', function () {
        var code = $('#code').val()
        console.log(code)
        copyText(code)
    });

    // 复制到剪贴板
    function copyText(text) {
        var textarea = document.createElement("textarea"); //创建input对象
        var currentFocus = document.activeElement; //当前获得焦点的元素
        var toolBoxwrap = document.getElementById('main'); //将文本框插入到main之后
        toolBoxwrap.appendChild(textarea); //添加元素
        textarea.value = text;
        textarea.focus();
        if (textarea.setSelectionRange) {
            textarea.setSelectionRange(0, textarea.value.length); //获取光标起始位置到结束位置
        } else {
            textarea.select();
        }
        try {
            var flag = document.execCommand("copy"); //执行复制
        } catch (eo) {
            var flag = false;
        }
        toolBoxwrap.removeChild(textarea); //删除元素
        currentFocus.focus();
        return flag;
    }

}());