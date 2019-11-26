# cloudSkyMonster

## 背景介绍 ##

1. 本项目是一个Chrome插件

2. 量身定做的，根据个人使用浏览器习惯，需要的一些功能的集合，重点就在于集合，虽然很多功能在不同的插件都有实现了，但是个人感觉开太多插件严重占用内存，用一个插件就搞定所有功能是本插件的目的:smirk:。

3. 再一个就是onetab插件，刚开始使用的童鞋都会相见恨晚，怎么那么好用呢，特别对于开很多tab但是就不想关的童鞋，一按就收集起来了，后面慢慢看。但是长时间使用呢，有几率触发bug，所有保存的tab都不见了，找不回来的那种痛，本人经历了三次Orz:sob:，因为onetab数据是存储在本地的，丢了后真的就找不回来了，而且onetab已经好久好久没更新了，作者也联系不上。痛定思痛，本插件简单实现了类似onetab的功能，并且利用gist来远程保存，本地远程双保险，从此不再担心丢了收集好久的网址，想等等再看然后几年都没去看的那些网址:flushed:，一切都有记录在案。
4. 本人前端技能匮乏，这个技能树一直没有机会点亮，所以本插件呢，代码结构简单粗暴，一把梭，能用就行:smiley:

## **实现功能**

1. 划词翻译
2. 当前网址生成二维码
3. 类似onetab的功能
   - 支持全部发送并关闭
   - 支持只发送当前页面并关闭
   - 支持发送其他页面并关闭
   - 支持右键菜单只发送当前页面并关闭
4. 定时提醒功能
   - 5分钟提醒
   - 10分钟提醒
   - 40分钟提醒
   - 自定义事件提醒

5. 手动push或pull收集的网址到gist上

6. 显示当前一共打开了多少个tab

   


## 安装方法： ##

1. 所有文件下载下来，保存在一个不会删掉的文件目录下；

2. 打开Chrome浏览器，点击“菜单”按钮，从弹出的扩展菜单中选择“更多工具”->“扩展程序”项；

3. 在打开的新页面中，勾选“开发者模式”，点击“加载正在开发的拓展程序”按钮；

4. 从打开的“浏览文件夹”窗口中，选择插件所在的文件夹，点击“确定”按钮；

5. 此时该插件就正式启动了。



## 使用方法： ##

返回chrome，右上角应该出现一个新图标；

1. 当前页面，文字翻译，用法如下：

   双击或是鼠标滑动选择文字，自动弹框，得到翻译结果；

2. 当前网址生成二维码，用法如下：

   点击这个新图标，会出现一个二维码，手机扫描二维码，就能手机打开当前网址；

3. 类似onetab功能的使用

   点击新图标，会列出功能列表，点击就ok

4. 定时提醒功能的使用

   点击新图标，会列出功能列表，点击就ok

5. 手动push或pull收集的网址到gist上功能的使用

   点击新图标，会列出功能列表，点击就ok，进入后台页后，最上面的API status 显示当前跟github通讯是否正常，按字面意思点击就能实现相关功能。

   **PS1：**这里面会有个token的要求，获取token的方法，进入github，登录后，右上角头像点击，选择setting，拉到下面，选择Developer settings，点击Personal access tokens，再点击Generate new token，输入密码，输入一个看起来有意义能明白啥用途的名字，比如： my-onetab-syncing-scoful-settings ，拉下来，只勾选gist，其他的不要勾选，生成后，要把展示的token另外找地方备份记录一下，只有在第一次创建的时候才会显示的，错过了只能重来。

   **PS2：** 本插件存的网址是放在浏览器的storage里的，然后chrome理论上登录了后可以同步sync storage，但是呢，sync storage的总存放空间太小了，只有102400字节=100kb，所以本插件改成了local storage，总大小有5242880字节=5mb，不过能push到gist，再从另一台机子pull下来，其实也没差多少。

6. 新图标上会显示当前一共打开了多少个tab



## To Do List ##

- 优化代码，修改bug
- 根据需求再添加新功能
- 对一些网站的自动签到(比如v2ex，福利吧等)
- 是否可利用gist，记录一些零散idea？
- todo功能？
- 格式化json



## Discussing ##
- [在github上提问](https://github.com/scoful/cloudSkyMonster/issues/new "在github上提问")
- wechat：scoful
- QQ：1269717999
- email：1269717999@qq.com



------

## 感谢以下大神的肩膀

[chrome插件官网](https://developer.chrome.com/extensions)

[chrome api官网](https://developer.chrome.com/extensions/api_index)

[【干货】Chrome插件(扩展)开发全攻略](https://www.cnblogs.com/liuxianan/p/chrome-plugin-develop.html#%E9%95%BF%E8%BF%9E%E6%8E%A5%E5%92%8C%E7%9F%AD%E8%BF%9E%E6%8E%A5)

[chrome-plugin-demo](https://github.com/sxei/chrome-plugin-demo)

[chrome-ext-tabulator](https://github.com/greduan/chrome-ext-tabulator)

[ContextSearch](https://github.com/lo0kup/ContextSearch)



