// 定时任务平台可用的脚本

// 网易云音乐签到
async function signIn163Music() {
    try {
        console.log("signIn163Music")
        // 手机签到
        var { data } = await axios.get('http://music.163.com/api/point/dailyTask?type=0');
        if (data.code != 200 && data.code != -2) throw data.msg;
        // 电脑签到
        var { data } = await axios.get('http://music.163.com/api/point/dailyTask?type=1');
        if (data.code == -2) throw '重复签到';
        if (data.code != 200) throw data.msg;
    } catch (error) {
        chrome.storage.local.set({ "signIn163Music": { "feedback": error, "lastRun": moment().format('YYYY-MM-DD HH:mm:ss') } });
    }
};

// v2ex签到
async function signInV2ex() {
    try {
        console.log("signInV2ex")
        var ret = await axios.get('https://www.v2ex.com/mission/daily');
        if (/登录</.test(ret.data)) throw '需要登录';
        if (/每日登录奖励已领取/.test(ret.data)) throw '已领取';
        let m = /redeem\?once=(.*?)'/.exec(ret.data);
        if (!m) throw '失败1';
        await axios.get('https://www.v2ex.com/mission/daily/redeem?once=' + m[1]);
        var ret = await axios.get('https://www.v2ex.com/mission/daily');
        if (/每日登录奖励已领取/.test(ret.data)) return '成功';
        throw '失败2';
    } catch (error) {
        chrome.storage.local.set({ "signInV2ex": { "feedback": error, "lastRun": moment().format('YYYY-MM-DD HH:mm:ss') } });
    }
};

// 什么值得买签到
async function signInSmzdm() {
    try {
        console.log("signInSmzdm")
        var { data } = await axios.get('https://zhiyou.smzdm.com/user/checkin/jsonp_checkin');
        if (data.error_code == 0) return '签到成功';
        throw data.error_msg || "失败";
    } catch (error) {
        chrome.storage.local.set({ "signInSmzdm": { "feedback": error, "lastRun": moment().format('YYYY-MM-DD HH:mm:ss') } });
    }
};
// 需要请求头的操作
chrome.webRequest.onBeforeSendHeaders.addListener(function (details) {
    if (details.method === 'GET' && details.url.indexOf("https://zhiyou.smzdm.com") != -1) {
        console.log(details)
        details.requestHeaders.push({ name: 'Referer', value: 'https://www.smzdm.com/' });
        return { requestHeaders: details.requestHeaders };
    }
},
    { urls: ["<all_urls>"] },
    ["blocking", "requestHeaders"]);


// 京东签到
async function signInJd() {
    try {
        console.log("signInJd")
        var { data } = await axios.get('https://vip.jd.com/sign/index');
        if (/签到成功/.test(data)) throw '签到成功';
        if (/请明日再来/.test(data)) throw '请明日再来';
        throw '失败';
    } catch (error) {
        chrome.storage.local.set({ "signInJd": { "feedback": error, "lastRun": moment().format('YYYY-MM-DD HH:mm:ss') } });
    }
};

// csdn刷访问量
async function refreshCsdn() {
    try {
        console.log("refreshCsdn")
        var { data } = await axios.get('https://blog.csdn.net/Scoful/article/details/104352581');
        throw '失败';
    } catch (error) {
        chrome.storage.local.set({ "refreshCsdn": { "feedback": error, "lastRun": moment().format('YYYY-MM-DD HH:mm:ss') } });
    }
};