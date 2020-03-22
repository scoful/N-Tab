var select_all_on_click = function (textBox) {
    textBox.onfocus = function () {
        textBox.select();
        textBox.onmouseup = function () {
            textBox.onmouseup = null;
            return false;
        };
    };
};

select_all_on_click(document.getElementById('md'));
select_all_on_click(document.getElementById('toc'));

document.getElementById('generate').addEventListener('click', function () {
    $('#toc').val("")
    var mdTextarea = $('#md').val();
    if (!mdTextarea) {
        alert(`${chrome.i18n.getMessage("importTextareaTip")}`)
        return;
    }
    var content = mdTextarea.split("\n");
    let result = "**目录**\n----\n"
    var flag = false;
    for (let i = 0; i < content.length; i++) {
        if (content[i].indexOf("```") != -1) {
            let a = content[i].split("```")[0];
            if (a.length <= 0) {
                flag = !flag;
            }
        }
        if (content[i].indexOf("$$") != -1) {
            let a = content[i].split("$$")[0];
            if (a.length <= 0) {
                flag = !flag;
            }
        }
        if (flag) {
            continue;
        }
        if (content[i] == "") {
            continue;
        }
        if (content[i].indexOf("#") == -1) {
            continue;
        }
        let lineList = content[i].trim().split(" ");
        let element = lineList[0];
        if (element.indexOf("#") != -1) {
            let eleLength = element.split("#").length - 1;

            if (eleLength == element.length && eleLength != 0) {
                let mid1 = textFilter(content[i].substring(eleLength + 1).trim().replace(/ /g, "-")).toLowerCase();
                let mid2 = "* [" + content[i].substring(eleLength + 1) + "](#" + mid1 + ")\n";
                if (eleLength == 2) {
                    mid2 = "    " + mid2
                }
                if (eleLength == 3) {
                    mid2 = "        " + mid2
                }
                if (eleLength == 4) {
                    mid2 = "            " + mid2
                }
                if (eleLength == 5) {
                    mid2 = "                " + mid2
                }
                if (eleLength == 6) {
                    mid2 = "                    " + mid2
                }
                result += mid2;
            }
        }
    }
    $('#toc').val(result)
});


//去掉特殊符号的方法
function textFilter(str) {
    var pattern = new RegExp("[`~%!@#^=''?~！@#￥……&—‘”“'？*()（），,。.、]"); //[]内输入你要过滤的字符
    var rs = "";
    for (var i = 0; i < str.length; i++) {
        rs += str.substr(i, 1).replace(pattern, '');
    }
    return rs;
}