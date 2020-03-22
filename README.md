# cloudSkyMonster(云空)

**目录**
----
* [cloudSkyMonster(云空)](#cloudskymonster云空)
    * [快速使用](#快速使用)
    * [背景介绍](#背景介绍)
    * [实现功能](#实现功能)
    * [安装方法](#安装方法)
    * [使用方法](#使用方法)
    * [一些总结](#一些总结)
    * [To Do List](#to-do-list)
    * [Discussing](#discussing)
    * [感谢以下大神的肩膀](#感谢以下大神的肩膀)


## 快速使用

**PS：** 不想看长篇大论的介绍和功能说明，直接看[安装方法](#安装方法)

## 背景介绍

1. 本项目是一个Chrome插件
2. 量身定做的，根据个人使用浏览器习惯，需要的一些功能的集合，突出重点**集合**，虽然很多功能在不同的插件都有实现了，但是开太多插件严重占用内存，用一个插件就搞定所有功能是本插件的目的:smirk:。
3. 接着说说onetab插件，刚开始使用的童鞋估计都会感觉相见恨晚，惊叹怎么那么好用呢！特别是对于那些喜欢开很多tab但是就不想关的童鞋，鼠标一点就所有tab全部关闭并收集到后台管理页了，方便后面慢慢看，简直不要太舒服。但是呢，如果长时间使用，有几率触发bug，所有保存的tab都不见了。找不回来的那种痛！本人经历了至少三次了Orz:sob:！onetab的数据是存储在浏览器的storage里的，丢了后真的就找不回来了，而且onetab已经好久好久没更新了，作者也联系不上。痛定思痛，本插件简单实现了类似onetab的功能，并且利用了github和gitee的gist来远程保存，本地远程双保存双保险，妈妈再也不用担心我丢了收集了好久的网址了。那些历史久远的，想等等再看，然后几年都没去看的那些网址:flushed:，一切都有记录在案。
4. 本人前端技能匮乏，这个技能树一直没有机会点亮，所以本插件呢，代码结构简单粗暴，一把梭，目标是能用就行:smiley:

## 实现功能

1. 划词翻译
   - 支持配置是否启用
2. 当前网址生成二维码
3. 类似onetab的功能
   - 支持**发送所有标签**并关闭页面
   - 支持**发送当前标签**并关闭页面
   - 支持**发送其他标签**并关闭页面
   - 支持右键菜单**发送当前标签**并关闭页面
   - 支持快捷键Ctrl+q，触发**发送所有标签**
   - 支持快捷键Alt+q，触发**发送当前标签**
   - 支持在新增标签和删除标签的时候自动同步到gitee的gist，ps：基于某个墙和网络的原因，只同步到gitee，并且默认要求初始就必须添加gitee的权限，为了更好的体验
   - 支持把从onetab导出的内容直接导入本插件
   - 支持导出本插件格式的内容
   - 支持把从本插件导出的内容直接导入
   - 支持配置，单个tab和tab组恢复后是删除还是保留
   - 支持配置，**发送当前标签**后是否打开展示页
   - 展示页支持超级拖曳tab组和单个tab
   - 显示当前已用storage/总storage
   - 支持手动push或pull到github的gist
   - 支持自动push到github的gist，即自动同步到github的gist
   - 支持手动push或pull到gitee的gist
   - 支持自动push到gitee的gist，即自动同步到gitee的gist
   - 支持查看跟gist操作有关的log记录，日志记录只保存最新100条
   - 支持单击标签组显示的**标签个数**时，收起或放下效果
   - 支持锁定或解锁整个标签组，即锁定后标签组和标签不能删除，不能拖曳，但能被占位
   - 支持快速上浮某个标签组到顶部
   - 支持命名标签组
4. 定时任务平台
   - 支持定时任务的管理，可用于定时签到、定时刷新等用途，PS：这个功能要求必须保持登录gitee状态
5. 定时提醒功能
   - 5分钟弹窗提醒
   - 10分钟弹窗提醒
   - 40分钟弹窗提醒
   - 自定义时间弹窗提醒
6. 插件图标显示当前一共打开了多少个tab
7. 点击插件图标，列出当前所有打开的tab的标题，并可以直接点击标题切换、关闭
8. 集成json工具页，目前只有格式化json功能
9. 匹配广州图书馆wifi登录页，登录后会自动2小时倒计时弹窗提醒(广图的wifi有效期2小时)
10. 匹配百度网盘外链转存页，支持不需勾选一键转存，打破超过3000文件数限制(只支持最新的外链分享，即那种生成分享链接和提取码的方式)
11. 中英国际化切换，渣渣英语，渣渣翻译，包涵包涵
12. Markdown目录生成器，支持github的readme


## 安装方法

1. 第一次使用本插件会弹窗要求输入一个token，是gitee的，用于自动同步备份标签等信息，获取gitee的token的方法：

   进入[gitee](https://gitee.com)，登录后，右上角头像点击，选择设置，往下拉，左边找私人令牌，点击进入后，右上角生成新令牌，输入一个看起来有意义能明白啥用途的名字，比如： my-onetab-syncing-settings ，**注意只勾选gist，其他的不要勾选**，提交后，输入密码，生成后，要**把展示的token另外找地方备份记录一下**，只有在第一次创建的时候才会显示的，错过了只能重来。PS：假如不小心输入错误，把插件删了重新加载就行了，注意导出备份。

2. 下载[最新的crx](https://github.com/scoful/cloudSkyMonster/releases)文件，要选择解压缩到文件名，不要解压缩到当前目录，或者直接下载源码；

3. 打开Chrome浏览器或其他支持Chrome内核的浏览器，找到并点开“扩展程序”项；

4. 在打开的新页面中，勾选“开发者模式”，点击“加载已解压的拓展程序”按钮；

5. 从打开的“浏览文件夹”窗口中，选择插件所在的文件夹，点击“确定”按钮；

6. 此时该插件就正式启动了，观察浏览器右上角是否有新的插件图标。

7. 建议插件安装成功后，关闭开发者模式。



## 使用方法

1. 打开某个网页，文字翻译，用法如下：

   - 双击或是鼠标滑动选择文字，自动弹框，得到翻译结果，弹框有2种方式消除，一种是鼠标在页面再点一下就直接消除，一种是等3秒自动消除。
   - 在后台页菜单**其他功能**，**是否划词翻译**，配置是否启用，默认关闭

2. 当前网址生成二维码，用法如下：

   点击插件图标，会出现一个二维码，手机扫描二维码，就能手机打开当前网址；

3. 类似onetab功能的使用

   - 点击插件图标，第一行用于显示倒计时，如有的话
   
4. 点击插件图标，第二行**展示收集的标签**，点击会打开后台展示页；

    - 点击插件图标，第三行**发送所有标签**，点击会发送所有标签到后台展示页并关闭所有页面
    - 点击插件图标，第四行**发送当前标签**，点击会发送当前标签到后台展示页并关闭当前页面
    - 点击插件图标，第五行**发送其他标签**，点击会发送除了当前标签的其他标签到后台展示页并关闭其他页面
    - 点击插件图标，第六行**5分钟提醒**，点击5分钟后右下角会弹窗提醒
    - 点击插件图标，第七行**10分钟提醒**，点击10分钟后右下角会弹窗提醒
    - 点击插件图标，第八行**40分钟提醒**，点击40分钟后右下角会弹窗提醒
    - 点击插件图标，第九行**自定义分钟提醒**，点击输入自定义分钟后右下角会弹窗提醒
    - 点击插件图标，第十行**打开JSON工具**，点击打开JSON工具页
    - 右键菜单**发送当前标签**并关闭当前页面
    - 右键插件图标，点击**选项**，进入配置页，配置单个tab和tab组恢复后是删除还是保留
    - 按快捷键**Ctrl+Q**，会触发**发送所有标签**
    - 按快捷键**Alt+Q**，会触发**发送当前标签**

5. 超级拖曳tab组和单个tab

   进入后台页，点击菜单**其他功能**，有拖曳tab组和拖曳单个tab的配置项，这2个是互斥的，一次只能配置一种

6. 按快捷键Ctrl+Q会触发**发送所有标签**

7. 把从onetab导出的地址直接导入本插件

   进入展示页，点击菜单**其他功能**，**导入onetab格式**，把从onetab导出的地址直接复制过来，点**导入**。PS：导入的数据和最后生成的tab组的关系，下空一行表示是一个tab组的，即用空行来分割。

8. 导出本插件格式的内容

   进入展示页，点击菜单**其他功能**，**导出**，会导出本插件格式的内容，包括标签组标题，是否锁定等。

9. 导入本插件格式的内容

   进入展示页，点击菜单**其他功能**，**导入默认格式**，把导出的本插件格式的内容复制过来，点**导入**。

10. 手动push或pull到github或者gitee的gist

    进入展示页，最上面的**Github API 状态** 显示当前跟github通讯是否正常，**Gitee API 状态** 显示当前跟gitee通讯是否正常，点击**gist功能**，有五个选项，**推送到github的gist里**，**从github的gist里拉取**，**推送到gitee的gist里**，**从gitee的gist里拉取**，按字面意思选择功能，这里面会有个token的强制要求，这个token用于授权。

       - 获取github的token的步骤，进入[github](https://github.com)，登录后，右上角头像点击，选择setting，拉到下面，选择Developer settings，点击Personal access tokens，再点击Generate new token，输入密码，输入一个看起来有意义能明白啥用途的名字，比如： my-onetab-syncing-settings ，拉下来，**注意只勾选gist，其他的不要勾选**，生成后，要**把展示的token另外找地方备份记录一下**，只有在第一次创建的时候才会显示的，错过了只能重来。

       - 获取gitee的token的步骤，进入[gitee](https://gitee.com)，登录后，右上角头像点击，选择设置，往下拉，左边找私人令牌，点击进入后，右上角生成新令牌，输入一个看起来有意义能明白啥用途的名字，比如： my-onetab-syncing-settings ，**注意只勾选gist，其他的不要勾选**，提交后，输入密码，生成后，要**把展示的token另外找地方备份记录一下**，只有在第一次创建的时候才会显示的，错过了只能重来。

11. 自动同步功能

     点击**gist功能**，勾选了自动同步后，会定时自动同步到github(每隔90分钟)和gitee(每隔70分钟)，目前是写死的时间间隔，同步操作记录会写在日志里

12. 日志功能

     点击**其他功能**，**查看日志**，日志页面显示操作github和gitee的过程，日志记录只保存最新100条

13. 配置功能

     点击**其他功能**，**配置页**，进入配置页，配置单个tab和tab组恢复后是删除还是保留
     点击**其他功能**，**配置页**，进入配置页，配置"发送当前标签"后，是否打开展示页

14. 通过插件图标切换或关闭标签

     点击插件图标，会列出当前所有打开的tab的标题，并可以直接点击标题切换、关闭

15. 匹配广州图书馆wifi登录页

     在打开链接为http://10.0.18.10:9098/Radius/reader/routerFirst 才会触发，输入账号密码登录后会自动在2小时后弹窗提醒(广图的wifi有效期2小时)

16. JSON工具页

     格式化json结构

17. 匹配百度网盘(只支持最新的外链分享，即那种生成分享链接和提取码的方式)

     在打开链接为https://pan.baidu.com/s/ 才会触发，页面上多一个按钮，不用勾选要转存的文件，直接点击按钮，默认一次性转存这个外链分享的所有文件，用于突破百度网盘的文件外链转存个数限制(目前是一个文件夹调用一次转存api，效率有点低，还需多多测试)

18. 中英文国际化切换

     切换英文chrome的方法：如果打开了chrome，先关闭，然后新建一个chrom浏览器快捷方式，右键快捷方式，属性，在目标栏的最后面加上，（--前面有空格）

     ```
      --args --lang=en
     ```

     通过这个快捷方式打开的chrome就是英文版的。

     **PS：** 假如不生效，检查是否chrom真的关闭，查看任务管理器，进程是否还在，这是chrome的一个设置选项，**关闭 Google Chrome 后继续运行后台应用**，关闭这个选项就能真正关闭chrome，再尝试切换英文chrome。

     

19. 定时任务平台的使用

     - 严重依赖gitee，所以这个功能必须已经添加了gitee的权限token，并且要保持gitee的登录状态

     - 任务代号=js脚本里的函数名

     - 脚本的编写有要求，通过捕获throw出的结果来反馈结果

     - 调用频率指的是每隔N分钟调用一次脚本

     - 操作的启用、停用是定时调用的开关

     - 操作的运行是用于立即运行一次看结果，每次编辑改动了js后，等5秒后再尝试，运行的结果会显示在调用结果和最近调用时间上，同时使用开发者工具，体验更佳

     - 附上一个脚本例子，用于签到v2ex的

       ```
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
       ```

       

20. Markdown目录生成器

    用于生成Markdown目录，支持github的readme
    
21. 未完待续

      

## 一些总结

- 万丈高楼平地起，感谢小茗同学的这个博文，看完这个就懂怎么开发插件了，[《Chrome插件开发全攻略》配套完整Demo](https://github.com/sxei/chrome-plugin-demo)

- 本插件存的网址是放在浏览器的storage里的，chrome的storage分sync storage和local storage，顾名思义，一种是可同步的，一种是只本地的，sync storage需要登录chrome的设备之间才会同步。但是呢，sync storage的总存放空间太小了，只有102400字节=100kb，而local storage，总大小有5242880字节=5mb，所以本插件使用的是local storage，如果想实现tab同步的话，可以push到gist，再从另一台机子pull下来。

- 不明来历的插件不要随便装，插件的权限太高了，很危险，比如可以直接替换原来的js里的function，可以直接获取原来js里定义的变量，可以直接覆盖掉原来的html结构，可以直接使用cookies，可以在对方没有公开api的情况下直接模拟，可以随便跨域，可以直接对http请求做拦截，注入，加Referer等等。

- 终于搞明白了，如何让异步回调的代码按顺序for循环，asyc+await+promise，promise的话推荐这个博文，看完就懂了，[JS如何让异步回调的代码在for循环里按顺序一个执行完再执行下一个，使用asyc+await+promise](https://blog.csdn.net/Scoful/article/details/103701308)

- 学了个超简单的前端框架，名字很拗口，**Mithril** 是一个现代化的 JavaScript 框架，用于构建单页面应用。它非常小巧（< 8kb gzip），且内置了路由和 XHR 工具。[源码](https://github.com/MithrilJS/mithril.js)，[中文教程](http://www.mithriljs.net/index.html)，非常简单，看一下例子就懂了。

- 学了超级拖曳，**Sortable**是一个功能强大，简单，还有动画效果的工具，[官方多种demo](https://sortablejs.github.io/Sortable/)，[源码](https://github.com/SortableJS/Sortable)，主要关注一下事件处理，还有就是嵌套拖曳的时候，数据保存问题。

- 学习了[momentjs](http://momentjs.cn/)，用于时间日期处理。

- 学习了boostrap，用于响应式布局，[英文官网](https://getbootstrap.com/)，[中文网](https://www.bootcss.com/)

- gitee用的数据库是mysql，而且是不支持保存emoji表情的，:weary:，可能是版本太低也可能是字符集问题。​

- github的api，如果返回的数据太大，会进行截断，需要注意，而gitee的就不会，可能没考虑过这个问题

- 翻译用的是有道api，这是好早以前申请的，请求频率限制为每小时1000次，[文档](http://fanyi.youdao.com/openapi?path=data-mode)

- 生成二维码用的是网上找的一个api，http://qr.topscan.com/api.php?text=https://www.baidu.com text后加要生成的二维码的内容就ok，侵 告 删。

- github的根据gistId获取gist，居然不用token也能获取私有的，理论上存在被人撞到私有gist的可能，gitee则需要

- 已测试过，展示页存放1w+标签都支持，只是渲染的时候开始卡了，应该很少人有1w+保存的标签吧，虽然在chrome插件商店看过有人的onetab有1w+标签，:joy: ,如果需要，后面再加分页。

- 简单讲一下定时任务平台的实现思路，新增一个任务后，会同步到gitee的gist里，生成一个js文件，然后再重载这个js文件，就可以调用了。

- github的Markdown目录生成，跟普通的目录不一样，普通的用

  ```
  @[TOC](自定义标题)
  ```

  github有自己的规则，用

  ```
   [第一级目录](#第一级目录)
  ```
  
  总结一下：
  
  - 中文
    - 中文没啥说的，就照搬，
  - 英文
    - 所有字母都变成小写，空格用-来代替
  - 不管中英文，都要去掉特殊字符




## To Do List

- 优化代码，修改bug
- 根据需求再添加新功能
- 是否可利用gist，记录一些零散点子，便利贴功能？
- todo功能，弹窗提醒，微信提醒？
- js demo运行测试？jsbin已有
- etc...



## Discussing

- [在github上提问](https://github.com/scoful/cloudSkyMonster/issues/new "在github上提问")
- wechat：scoful
- QQ：1269717999
- email：1269717999@qq.com



![微信赞赏码](http://ww1.sinaimg.cn/large/692b2078gy1gbslrzhjmfj20gh0ettca.jpg)

![支付宝收款码](http://ww1.sinaimg.cn/large/692b2078gy1gbslud4dosj20c30enju7.jpg)





------

## 感谢以下大神的肩膀

[chrome插件官网](https://developer.chrome.com/extensions)

[chrome api官网](https://developer.chrome.com/extensions/api_index)

[【干货】Chrome插件(扩展)开发全攻略](https://www.cnblogs.com/liuxianan/p/chrome-plugin-develop.html#%E9%95%BF%E8%BF%9E%E6%8E%A5%E5%92%8C%E7%9F%AD%E8%BF%9E%E6%8E%A5)

[chrome-plugin-demo插件](https://github.com/sxei/chrome-plugin-demo)

[chrome-ext-tabulator插件](https://github.com/greduan/chrome-ext-tabulator)

[ContextSearch插件](https://github.com/lo0kup/ContextSearch)

[一篇文章搞定Github API 调用 (v3）](https://segmentfault.com/a/1190000015144126)

[Sortable官网](https://github.com/SortableJS/Sortable)

[Sortable.js拖拽排序使用方法解析](https://www.jb51.net/article/96446.htm)

[js数组内元素移动，适用于拖动排序](https://www.cnblogs.com/zwhblog/p/7941744.html)

[gitHubApi文档](https://developer.github.com/v3/)

[giteeAPI文档](https://gitee.com/api/v5/)

[百度网盘API文档](https://pan.baidu.com/union/document/entrance)

[Bootstrap中文网](https://www.bootcss.com/)

[二维码生成api](http://www.topscan.com/pingtai)