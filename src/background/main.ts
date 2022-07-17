import { Tools } from '~/libs/tools'
import { ContentService } from '~/background/content-service'
import { Omnibox } from '~/background/omnibox'
import { JobService } from '~/background/job-service'
import { NodeService } from '~/background/node-service'

// NOTE:
// 1、如果开启 Windows 10 系统的专注助手，则 Chrome 通知不会在屏幕右下角弹出，而是收在通知中心里面。
// 2、火狐浏览器建议设置“打开链接在新标签页而非新窗口(W)”。


// only on dev mode
if (import.meta.hot) {
  // @ts-expect-error for background HMR
  import('/@vite/client')
  // load latest content script
  import('./contentScriptHMR')
}

browser.runtime.onInstalled.addListener((): void => {
  console.log('Extension installed')
})

if (Tools.isChrome) {
  // Chrome 浏览器
  // 是否允许显示通知
  // @ts-expect-error chrome is not defined
  chrome.notifications.getPermissionLevel((level) => {
    console.log('PermissionLevel', level)
  })
}
ContentService.start()
Omnibox.start()
JobService.start()
NodeService.start()
