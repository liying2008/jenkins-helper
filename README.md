# Jenkins Helper   

[![Chrome Web Store](https://img.shields.io/chrome-web-store/stars/lkjoiakaidioklnfdejmnoebfbjcbemh.svg)](https://chrome.google.com/webstore/detail/jenkins-helper/lkjoiakaidioklnfdejmnoebfbjcbemh)
[![Chrome Web Store](https://img.shields.io/chrome-web-store/v/lkjoiakaidioklnfdejmnoebfbjcbemh.svg)](https://chrome.google.com/webstore/detail/jenkins-helper/lkjoiakaidioklnfdejmnoebfbjcbemh)
[![license](https://img.shields.io/github/license/liying2008/jenkins-helper.svg)](https://github.com/liying2008/jenkins-helper/blob/master/LICENSE)



一款能够极大地提高使用 **Jenkins** 的工作效率的 **Chrome浏览器扩展程序** 。

## 下载地址

在 Chrome Web Store 中搜索 **Jenkins Helper** 或 直接点击下面的链接：  
https://chrome.google.com/webstore/detail/jenkins-helper/lkjoiakaidioklnfdejmnoebfbjcbemh


## 功能介绍

该扩展程序可以：

1. **Job 监控**: 监控 Jenkins Job 的构建状态，构建完毕后显示通知。

![Monitor](screenshots/monitor.png)

> 注意：状态更新的频率以及通知频率可以在设置页更改。默认是60s更新一次状态，每次构建结束显示通知。


2. **构建参数查看**： 在 每一个 Build 页面及其子页面下可方便快速查看构建信息以及构建参数。

![Parameters](screenshots/params.png)

> 注意：只有在构建页面及其子页面下才有数据，如：`http://127.0.0.1:8080/jenkins/job/Pipeline2/4/` 是构建页面，`http://127.0.0.1:8080/jenkins/job/Pipeline2/4/console` 是子页面。  
> 支持 Pipeline 的 Blue Ocean 页面。


3. **节点磁盘空间监控**: 监控 Jenkins 节点的磁盘空间大小，如果节点剩余空间大小小于或等于给定的阈值，则弹框告警。

![Node Monitor](screenshots/node_monitor.png)

> 注意：状态更新的频率可以在设置页更改。默认是2小时更新一次状态，每次浏览器启动后会自动检查最新的状态。


4. **地址栏智能搜索**： 在地址栏输入 **`jk`**，按 <kbd>Space</kbd> 或 <kbd>Tab</kbd> 键进入 Jenkins Job 智能搜索模式，输入Job名称可快速匹配到对应的 Jenkins Job 链接。

![Omnibox](screenshots/omnibox.png)

> 注意：使用此功能需要提前在设置页配置好 **地址栏智能搜索（Omnibox Intelligent Search）** 。

5. **Job 统计**： 统计Job的 **运行节点** / **定时构建时间表** / **是否禁用** / **是否允许并发** 等信息。

![Job Statistics](screenshots/job_statistics.png)

> 注意：使用此功能需要提前在设置页配置好 **Job 统计设置（Job Statistics Settings）** 。

6. **自定义设置**： 可以针对自己的独特需求进行一些个性化的设置。

![Settings](screenshots/settings.png)

> 注意：更改设置之后，记得点击页面底部的 **保存设置（Save Settings）** 以应用更改。


## Thanks

监视器界面（Monitor Page）布局参考了 [ggirou/yet-another-jenkins-notifier](https://github.com/ggirou/yet-another-jenkins-notifier) ，在此感谢。


## License

[MIT LICENSE](LICENSE)