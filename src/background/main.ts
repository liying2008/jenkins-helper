import { ContentService } from '~/background/content-service'
import { Omnibox } from '~/background/omnibox'
import { JobService } from '~/background/job-service'
import { NodeService } from '~/background/node-service'

// NOTE:
// 1、如果开启 Windows 10 系统的专注助手，则 Chrome 通知不会在屏幕右下角弹出，而是收在通知中心里面。
// 2、火狐浏览器建议设置“打开链接在新标签页而非新窗口(W)”。、

// 参考：https://developer.chrome.com/docs/extensions/develop/concepts/service-workers/lifecycle
// 由于 background service worker 存在 dormant（休眠） & revive（复苏） ，所以当前js可能会被执行多次。

browser.runtime.onInstalled.addListener((): void => {
  console.log('Extension installed')
})

ContentService.start()
Omnibox.start()
JobService.start()
NodeService.start()
