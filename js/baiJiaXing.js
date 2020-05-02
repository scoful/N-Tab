var select_all_on_click = function (textBox) {
    textBox.onfocus = function () {
        textBox.select();
        textBox.onmouseup = function () {
            textBox.onmouseup = null;
            return false;
        };
    };
};

select_all_on_click(document.getElementById('original'));
select_all_on_click(document.getElementById('family'));

var obja = {
    "赵": "0", "钱": "1", "孙": "2", "李": "3", "周": "4", "吴": "5", "郑": "6", "王": "7", "冯": "8", "陈": "9",
    "褚": "a", "卫": "b", "蒋": "c", "沈": "d", "韩": "e", "杨": "f", "朱": "g", "秦": "h", "尤": "i", "许": "j",
    "何": "k", "吕": "l", "施": "m", "张": "n", "孔": "o", "曹": "p", "严": "q", "华": "r", "金": "s", "魏": "t",
    "陶": "u", "姜": "v", "戚": "w", "谢": "x", "邹": "y", "喻": "z", "福": "A", "水": "B", "窦": "C", "章": "D",
    "云": "E", "苏": "F", "潘": "G", "葛": "H", "奚": "I", "范": "J", "彭": "K", "郎": "L", "鲁": "M", "韦": "N",
    "昌": "O", "马": "P", "苗": "Q", "凤": "R", "花": "S", "方": "T", "俞": "U", "任": "V", "袁": "W", "柳": "X",
    "唐": "Y", "罗": "Z", "薛": ".", "伍": "-", "余": "_", "米": "+", "贝": "=", "姚": "/", "孟": "?", "顾": "#",
    "尹": "%", "江": "&", "钟": "*", "宋": ":"
};

document.getElementById('toFamily').addEventListener('click', function () {
    $('#family').val("")
    var originalTextarea = $('#original').val();
    if (!originalTextarea) {
        alert(`${chrome.i18n.getMessage("importTextareaTip")}`)
        return;
    }
    originalTextarea = originalTextarea.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
    var strc = originalTextarea.split("");
    var a = '';
    for (var i = 0; i < strc.length; i++) {
        a += ay(obja, strc[i]);
    }
    $('#family').val(a)
})

document.getElementById('toOriginal').addEventListener('click', function () {
    $('#original').val("")
    var familyTextarea = $('#family').val();
    if (!familyTextarea) {
        alert(`${chrome.i18n.getMessage("importTextareaTip")}`)
        return;
    }
    familyTextarea = familyTextarea.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
    var strc = familyTextarea.split("");
    var c = '';
    for (var i = 0; i < strc.length; i++) {
        var o = cy(obja, strc[i]);
        c += o;
    }
    $('#original').val(c)
})


function cy(array, val) {
    for (var key in array) {
        if (key == val) {
            return array[key];
        }
    }
    return '';
}
function ay(array, val) {
    for (var key in array) {
        if (array[key] == val) {
            return key;
        }
    }
    return '';
}

