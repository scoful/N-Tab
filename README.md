# CloudSkyMonster

**目录**
----
* [CloudSkyMonster](#CloudSkyMonster)
    * [背景介绍](#背景介绍)
    * [快速使用](#快速使用)
    * [安装方法](#安装方法)
    * [获取token方法](#获取token方法)
    * [To Do List](#to-do-list)
    * [Discussing](#discussing)
    * [感谢以下大神的肩膀](#感谢以下大神的肩膀)
    * [Star历史](#Star历史)


## 背景介绍

1. 本项目是一个Chrome插件
2. 经过4年时间自用，敢保证永不丢失数据，速度超快，可存储数据超多，绝对是效率提升工具！
3. 说说OneTab插件，刚开始使用的童鞋估计都会跟我一样感觉相见恨晚，惊叹怎么那么好用呢！特别是对于那些喜欢开很多tab但是就不想关的童鞋，鼠标一点就所有tab全部关闭并收集到后台管理页了，方便后面慢慢看，简直不要太舒服。但是呢，如果长时间使用，有几率触发bug，所有保存的tab的记录都不见了。找不回来的那种痛！本人经历了至少三次了Orz:sob:！OneTab的数据是存储在浏览器的storage里的，丢了后真的就找不回来了，~~而且OneTab已经好久好久没更新了，作者也联系不上~~，已经有更新了，但还不如不更新，会有同步bug，直接丢失所有数据。痛定思痛，本插件实现了类似OneTab的功能，并且利用了GitHub和Gitee的gist来**实时**远程保存，本地+远程=双保存双保险，妈妈再也不用担心我丢了收集了好久的数据了。那些历史久远的，想等等再看，然后几年都没去看的那些网址:flushed:，一切都有记录在案。甚至可以帮助回忆某年某日做了什么，为什么会打开这些网址！


## 快速使用

- **PS：** 不想看长篇大论的介绍和功能说明，直接看[安装方法](#安装方法)
- 点击插件图标，会打开后台管理页
- 在任何打开的网页，空白处直接右键点击，可以**发送当前标签**
- 在任何打开的网页，按快捷键Ctrl+Q，可以**发送所有标签**
- 在任何打开的网页，按快捷键Alt+Q，可以**发送当前标签**
- 如需要定时同步功能，请配置GitHub或Gitee的token，可二选一或全配置
- [详细介绍](README_ALL.md)
- 关于暗黑模式，折腾了一下发现，Chrome浏览器自带的暗黑模式效果就很不错，就没有另外添加了。[暗黑模式开启方法](#暗黑模式开启方法)

## 安装方法

1. 下载[最新的crx或zip](https://github.com/scoful/cloudSkyMonster/releases)文件，右键选择解压缩到文件名，不要解压缩到当前目录，或者直接下载源码；

2. 打开Chrome浏览器或其他支持Chrome内核的浏览器，找到并点开“扩展程序”项；

3. 在打开的新页面中，勾选“开发者模式”，点击“加载已解压的拓展程序”按钮；

4. 从打开的“浏览文件夹”窗口中，选择第1步解压缩的的文件夹，点击“确定”按钮；

5. 此时该插件就正式启动了，观察浏览器右上角是否有新的插件图标，新版Chrome浏览器要手动固定才会显示。

6. 建议插件安装成功后，关闭开发者模式。

7. 现在就可以正常使用了，假如需要同步功能，先[获取GitHub和Gitee的token](#获取token方法)，在“其他功能”-“查看配置”里对应的地方填写token，然后在“同步功能”-“是否自动同步”选是；

8. 2个同步平台，可以同时配置，也可以只配置1个，不冲突，假如选了自动同步，会自动无感知的**定时**同步到2个平台里，注意：Gitee特别设置了只要有修改就无感知自动**实时**同步，也就是说只要有修改，删除，移动等动作，就自动实时同步到Gitee，选Gitee更保险，真.理论上永不丢失数据。


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


## 暗黑模式开启方法
### (可选)Win10本身变成暗黑模式
- Windows 设置--个性化--颜色--选择颜色(自定义)--选择默认应用模式(暗)--这就是系统级别的暗黑模式，所有支持暗黑模式的软件都会自动变成暗黑模式

### 只是网页内容变成暗黑模式
- 打开Chrome浏览器，输入 **Chrome://flags**，在搜索框输入**Auto Dark Mode for Web Contents**，在找到的设置右边改成**Enabled**
- 重启Chrome浏览器，这样本插件就自动变成暗黑模式了！

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

[腾讯交互翻译](https://transmart.qq.com/zh-CN/index)

[辅助生成百度统计插件](https://github.com/krapnikkk/baidutongji-generator)

## Star历史

[![Star History Chart](https://starchart.cc/scoful/cloudSkyMonster.svg)](https://starchart.cc/scoful/cloudSkyMonster)

You are my ![Visitor Count](https://profile-counter.glitch.me/scoful/count.svg)th visitor

