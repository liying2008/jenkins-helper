import { Tools } from '@/libs/tools'
import { Omnibox } from '@/background/omnibox'
import { JobService } from '@/background/job-service'
import { NodeService } from '@/background/node-service'
import PermissionLevel = browser.notifications.PermissionLevel;

// NOTE:
// 1、如果开启 Windows 10 系统的专注助手，则 Chrome 通知不会在屏幕右下角弹出，而是收在通知中心里面。
// 2、火狐浏览器建议设置“打开链接在新标签页而非新窗口(W)”。

if (Tools.isChrome) {
  // Chrome 浏览器
  // 是否允许显示通知
  // @ts-ignore
  chrome.notifications.getPermissionLevel((level: PermissionLevel) => {
    console.log('PermissionLevel', level)
  })
}
// ContentServices.start();
Omnibox.start()
JobService.start()
NodeService.start()
