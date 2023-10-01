# CloudSkyMonster

**目录**
----
* [CloudSkyMonster](#CloudSkyMonster)
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

- **PS：** 不想看长篇大论的介绍和功能说明，直接看[安装方法](#安装方法)
- 点击插件图标，会打开后台管理页
- 在任何打开的网页，空白处直接右键点击，会**发送当前标签**
- 在任何打开的网页，按快捷键Ctrl+Q，会**发送所有标签**
- 在任何打开的网页，按快捷键Alt+Q，会**发送当前标签**
- 需要定时同步功能，请配置GitHub或Gitee的token

## 背景介绍

1. 本项目是一个Chrome插件，经过4年时间自用，敢保证永不丢失数据，速度超快，可存储数据超多，绝对是效率提升工具！
2. 接着说说OneTab插件，刚开始使用的童鞋估计都会感觉相见恨晚，惊叹怎么那么好用呢！特别是对于那些喜欢开很多tab但是就不想关的童鞋，鼠标一点就所有tab全部关闭并收集到后台管理页了，方便后面慢慢看，简直不要太舒服。但是呢，如果长时间使用，有几率触发bug，所有保存的tab都不见了。找不回来的那种痛！本人经历了至少三次了Orz:sob:！OneTab的数据是存储在浏览器的storage里的，丢了后真的就找不回来了，~~而且OneTab已经好久好久没更新了，作者也联系不上~~，已经有更新了，但还不如不更新，会有同步bug，直接丢失所有数据。痛定思痛，本插件简单实现了类似OneTab的功能，并且利用了GitHub和Gitee的gist来远程保存，本地远程双保存双保险，妈妈再也不用担心我丢了收集了好久的网址了。那些历史久远的，想等等再看，然后几年都没去看的那些网址:flushed:，一切都有记录在案。


## 实现功能

1. 划词翻译
   - 支持配置是否启用

2. 插件图标显示当前一共打开了多少个tab，多个窗口也能统计

3. 类似OneTab的功能
   - 支持**发送所有标签**并关闭页面
   - 支持**发送当前标签**并关闭页面
   - 支持**发送其他标签**并关闭页面
   - 支持右键菜单**发送当前标签**并关闭页面
   - 支持快捷键Ctrl+q，触发**发送所有标签**
   - 支持快捷键Alt+q，触发**发送当前标签**
   - 支持手动多选标签后，快捷键Alt+q，触发**发送当前标签**，而实现一次性发送多个标签
   - 支持在新增标签和删除标签的时候自动同步到Gitee的gist，ps：基于某个墙和网络的原因，只会实时自动同步到Gitee，定时自动同步功能2个平台都可以
   - 支持把从OneTab导出的内容直接导入本插件
   - 支持导出本插件格式的内容
   - 支持把从本插件导出的内容重新导入
   - 支持配置，单个tab和tab组打开后是删除还是保留
   - 支持配置，**发送当前标签**后是否打开后台管理页
   - 后台管理页支持超级拖曳tab组和单个tab
   - 支持显示当前已用存储空间storage/总存储空间storage
   - 支持手动push或pull到GitHub的gist
   - 支持自动push到GitHub的gist，即自动定时同步到GitHub的gist
   - 支持手动push或pull到Gitee的gist
   - 支持自动push到Gitee的gist，即自动定时同步到Gitee的gist
   - 支持查看跟gist操作有关的log记录，日志记录只保存最新100条
   - 支持单击标签组显示的**标签个数**时，收起或展开效果
   - 支持**锁定或解锁整个标签组**，即锁定后标签组和标签不能删除，不能拖曳，但能被占位
   - 支持快速上浮某个标签组到顶部
   - 支持命名标签组
4. 定时提醒功能
   - 5分钟弹窗提醒
   - 10分钟弹窗提醒
   - 40分钟弹窗提醒
   - 自定义时间弹窗提醒
   
5. 中英国际化切换，渣渣英语，渣渣翻译，包涵包涵


## 安装方法

1. 下载[最新的crx或zip](https://github.com/scoful/cloudSkyMonster/releases)文件，右键选择解压缩到文件名，不要解压缩到当前目录，或者直接下载源码；

2. 打开Chrome浏览器或其他支持Chrome内核的浏览器，找到并点开“扩展程序”项；

3. 在打开的新页面中，勾选“开发者模式”，点击“加载已解压的拓展程序”按钮；

4. 从打开的“浏览文件夹”窗口中，选择第1步解压缩的的文件夹，点击“确定”按钮；

5. 此时该插件就正式启动了，观察浏览器右上角是否有新的插件图标，新版Chrome浏览器要手动固定才会显示。

6. 建议插件安装成功后，关闭开发者模式。

7. 现在就可以正常使用了，假如需要同步功能，先[获取GitHub和Gitee的token](#获取token方法)，在“其他功能”-“查看配置”里对应的地方填写token，然后在“gist功能”-“是否自动同步”选是；

8. 2个同步平台，可以同时配置，也可以只配置1个，不冲突，假如选了自动同步，会自动无感知的**定时**同步到2个平台里，注意：Gitee特别设置了只要有修改就无感知自动同步，也就是说只要有修改，删除，移动等动作，就自动实时同步到Gitee，选Gitee更保险，真.理论上永不丢失数据。


## 获取token方法
### Gitee
- 打开[Gitee](https://gitee.com/)，登录后
- 打开[私人令牌](https://gitee.com/profile/personal_access_tokens)
- 右上角生成新令牌，输入一个看起来有意义能明白啥用途的名字，比如： my-onetab-syncing-settings ，注意只勾选gist(可Ctrl+F搜索一下)，其他的不要勾选，
- 提交后，输入密码，生成后，要把显示的token另外找地方备份记录一下，只有在第一次创建的时候才会显示的，错过了只能重来。

### GitHub
- 打开[GitHub](https://github.com/)，登录后
- 打开[私人令牌](https://github.com/settings/tokens)
- 右上角选择Generate new token (classic)，输入一个看起来有意义能明白啥用途的名字，比如： my-onetab-syncing-settings ，注意只勾选gist(可Ctrl+F搜索一下)，其他的不要勾选，
- 提交后，输入密码，生成后，要把显示的token另外找地方备份记录一下，只有在第一次创建的时候才会显示的，错过了只能重来。


## 使用方法
1. 打开某个网页，文字翻译，用法如下：

    - 在后台管理页菜单**其他功能**，**是否划词翻译**，配置是否启用，默认关闭
    - 双击或是鼠标滑动选择文字，自动弹框，得到翻译结果，弹框有2种方式消除，一种是鼠标在页面再点一下就直接消除，一种是等3秒自动消除。
   
2. 右键点击插件图标，第一行点击会到达项目地址

3. 右键点击插件图标，第二行用于显示倒计时，如有的话
   
4. 右键点击插件图标，第三行**标签功能菜单**
    - **展示收集的标签**，点击会打开后台管理页；
    - **发送所有标签**，点击会发送所有标签到后台管理页并关闭所有页面
    - **发送当前标签**，点击会发送当前标签到后台管理页并关闭当前页面
    - **发送其他标签**，点击会发送除了当前标签的其他标签到后台管理页并关闭其他页面

5. 右键点击插件图标，第四行**定时功能菜单**
    - **5分钟提醒**，点击5分钟后右下角会弹窗提醒
    - **10分钟提醒**，点击10分钟后右下角会弹窗提醒
    - **40分钟提醒**，点击40分钟后右下角会弹窗提醒
    - **自定义分钟提醒**，点击输入自定义分钟后右下角会弹窗提醒

6. 在任何打开的网页，空白处直接右键，**发送当前标签**，点击会发送当前标签到后台管理页并关闭当前页面

7. 在任何打开的网页
   - 按快捷键**Ctrl+Q**，会触发**发送所有标签**
   - 按快捷键**Alt+Q**，会触发**发送当前标签**

8. 超级拖曳tab组和单个tab，互斥

   进入后台管理页，点击菜单**其他功能**，有拖曳tab组和拖曳单个tab的配置项，这2个是**互斥**的，一次只能配置一种


9. 从OneTab导出的数据直接导入本插件

    进入后台管理页，点击菜单**其他功能**，**导入OneTab格式**，把从OneTab导出的地址直接复制过来，点**导入**。PS：导入的数据和最后生成的tab组的关系，下空一行表示是一个tab组的，即用空行来分割。

10. 导出本插件格式的内容

    进入后台管理页，点击菜单**其他功能**，**导出**，会导出本插件格式的内容，包括标签组标题，是否锁定等。

11. 导入本插件格式的内容

    进入后台管理页，点击菜单**其他功能**，**导入默认格式**，把导出的本插件格式的内容复制过来，点**导入**。

12. 手动push或pull到GitHub或者Gitee的gist

    进入后台管理页，最上面的**GitHub API 状态** 显示当前跟GitHub通讯是否正常，**Gitee API 状态** 显示当前跟Gitee通讯是否正常，点击**gist功能**，有五个选项，**推送到GitHub的gist里**，**从GitHub的gist里拉取**，**推送到Gitee的gist里**，**从Gitee的gist里拉取**，按字面意思选择功能，这里面会有个token的强制要求，这个token用于授权，[获取GitHub和Gitee的token](#获取token方法)


13. 自动定时同步功能

     点击**gist功能**，勾选了自动同步后
    - 会定时自动同步到GitHub(每隔90分钟)和Gitee(每隔70分钟)，目前是写死的时间间隔，同步操作记录会写在日志里(就算选了不自动同步也会有日志)
    - 2个同步平台，可以同时配置，也可以只配置1个，不冲突
    - 注意：Gitee特别设置了只要有修改就无感知自动实时同步，也就是说只要有修改，删除，移动等动作，就自动实时同步到Gitee，选Gitee更保险，真.理论上永不丢失数据。

15. 日志功能

     点击**其他功能**，**查看日志**，日志页面显示操作GitHub和Gitee的过程，日志记录只保存最新100条

16. 配置功能

     - 点击**其他功能**，**查看配置**，进入配置页，配置单个tab和tab组恢复后是删除还是保留
     - 点击**其他功能**，**查看配置**，进入配置页，配置"发送当前标签"后，是否打开后台管理页
     - 可手动修改配置GitHub和Gitee的token
     

17. 中英文国际化切换

     切换英文chrome的方法：如果打开了chrome，先关闭，然后新建一个chrom浏览器快捷方式，右键快捷方式，属性，在目标栏的最后面加上，（--前面有空格）

     ```
      --args --lang=en
     ```

     通过这个快捷方式打开的chrome就是英文版的。

     **PS：** 假如不生效，检查是否chrom真的关闭，查看任务管理器，进程是否还在，这是chrome的一个设置选项，**关闭 Google Chrome 后继续运行后台应用**，关闭这个选项就能真正关闭chrome，再尝试切换英文chrome。



      

## 一些总结

- 万丈高楼平地起，感谢小茗同学的这个博文，看完这个就懂怎么开发插件了，[《Chrome插件开发全攻略》配套完整Demo](https://github.com/sxei/chrome-plugin-demo)

- 本插件存的网址是放在浏览器的storage里的，chrome的storage分sync storage和local storage，顾名思义，一种是可同步的，一种是只本地的，sync storage需要登录chrome的设备之间才会同步。但是呢，sync storage的总存放空间太小了，只有102400字节=100kb，而local storage，总大小有5242880字节=5mb，所以本插件使用的是local storage，如果想实现tab同步的话，可以push到gist，再从另一台机子pull下来。

- 不明来历的插件不要随便装，插件的权限太高了，很危险，比如可以直接替换原来的js里的function，可以直接获取原来js里定义的变量，可以直接覆盖掉原来的html结构，可以直接使用cookies，可以在对方没有公开api的情况下直接模拟，可以随便跨域，可以直接对http请求做拦截，注入，加Referer等等。

- 终于搞明白了，如何让异步回调的代码按顺序for循环，asyc+await+promise，promise的话推荐这个博文，看完就懂了，[JS如何让异步回调的代码在for循环里按顺序一个执行完再执行下一个，使用asyc+await+promise](https://blog.csdn.net/Scoful/article/details/103701308)

- 学了个超简单的前端框架，名字很拗口，**Mithril** 是一个现代化的 JavaScript 框架，用于构建单页面应用。它非常小巧（< 8kb gzip），且内置了路由和 XHR 工具。[源码](https://github.com/MithrilJS/mithril.js)，[中文教程](http://www.mithriljs.net/index.html)，非常简单，看一下例子就懂了。

- 学了超级拖曳，**Sortable**是一个功能强大，简单，还有动画效果的工具，[官方多种demo](https://sortablejs.github.io/Sortable/)，[源码](https://github.com/SortableJS/Sortable)，主要关注一下事件处理，还有就是嵌套拖曳的时候，数据保存问题。

- 学习了[momentjs](http://momentjs.cn/)，用于时间日期处理。

- 学习了boostrap，用于响应式布局，[英文官网](https://getbootstrap.com/)，[中文网](https://www.bootcss.com/)

- Gitee用的数据库是mysql，而且是不支持保存emoji表情的，:weary:，可能是版本太低也可能是字符集问题。​

- GitHub的api，如果返回的数据太大，会进行截断，需要注意，而Gitee的就不会，可能没考虑过这个问题

- 翻译用的是有道api，这是好早以前申请的，请求频率限制为每小时1000次，[文档](http://fanyi.youdao.com/openapi?path=data-mode)

- GitHub的根据gistId获取gist，居然不用token也能获取私有的，理论上存在被人撞到私有gist的可能，Gitee则需要

- 已测试过，后台管理页存放1w+标签都支持，只是渲染的时候开始卡了，应该很少人有1w+保存的标签吧，虽然在chrome插件商店看过有人的OneTab有1w+标签，:joy: ,如果需要，后面再加分页。





## To Do List

- 优化代码，修改bug
- 根据需求再添加新功能
- etc...



## Discussing

- [在GitHub上提问](https://github.com/scoful/cloudSkyMonster/issues/new "在GitHub上提问")
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

[一篇文章搞定GitHub API 调用 (v3）](https://segmentfault.com/a/1190000015144126)

[Sortable官网](https://github.com/SortableJS/Sortable)

[Sortable.js拖拽排序使用方法解析](https://www.jb51.net/article/96446.htm)

[js数组内元素移动，适用于拖动排序](https://www.cnblogs.com/zwhblog/p/7941744.html)

[GitHubApi文档](https://developer.github.com/v3/)

[GiteeAPI文档](https://gitee.com/api/v5/swagger)

[Bootstrap中文网](https://www.bootcss.com/)

## Star历史

[![Star History Chart](https://starchart.cc/scoful/cloudSkyMonster.svg)](https://starchart.cc/scoful/cloudSkyMonster)

You are my ![Visitor Count](https://profile-counter.glitch.me/scoful/count.svg)th visitor

