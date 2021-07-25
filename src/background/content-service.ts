import { StorageChangeWrapper, StorageService } from '@/libs/storage'
import { CMD_IS_ENABLE_STASH_AND_RECOVER, CMD_RECOVER_PARAMS, CMD_STASH_PARAMS, ContentResp } from '@/models/content-message'

export class ContentService {
  private static KEY_STASHED_PARAMS = 'stashed_params'
  private static enableParamsStashAndRecover = false

  static start() {
    StorageService.getOptions().then((options) => {
      ContentService.enableParamsStashAndRecover = options.enableParamsStashAndRecover
    })
    // 添加 options 变动监听
    StorageService.addStorageListener(ContentService.storageChange)


    // 处理来自 content_scripts 的消息
    browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
      // console.log('message', message)
      // console.log('sender', sender)
      const cmd = message.cmd
      switch (cmd) {
        case CMD_STASH_PARAMS:
          // 保存参数
          localStorage.setItem(ContentService.KEY_STASHED_PARAMS, JSON.stringify(message.data))
          sendResponse(ContentResp.fromObj({ status: 'ok' }))
          break
        case CMD_RECOVER_PARAMS:
          // 读取参数
          const paramsStr = localStorage.getItem(ContentService.KEY_STASHED_PARAMS)
          if (paramsStr === null) {
            sendResponse(ContentResp.fromObj({ status: 'error', message: 'Stashed parameters do not exist.' }))
            break
          }
          const params = JSON.parse(paramsStr)
          sendResponse(ContentResp.fromObj({ status: 'ok', data: params }))
          break
        case CMD_IS_ENABLE_STASH_AND_RECOVER:
          // 是否启用 参数暂存&恢复 功能
          sendResponse(ContentResp.fromObj({
            status: 'ok',
            data: ContentService.enableParamsStashAndRecover
          }))
          break
      }
    })
  }

  private static storageChange(changes: StorageChangeWrapper) {
    if (StorageService.keyForOptions in changes) {
      // 设置有改变
      // console.log('changes', changes)
      const newOptions = changes[StorageService.keyForOptions].newValue
      ContentService.enableParamsStashAndRecover = newOptions.enableParamsStashAndRecover
    }
  }
}
