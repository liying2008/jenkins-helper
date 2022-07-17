import { BrowserUtils } from '~/libs/browser'
import type { StorageChangeWrapper } from '~/libs/storage'
import { StorageService } from '~/libs/storage'
import type { ContentFeatures } from '~/models/content-message'
import { CMD_GET_CONTENT_FEATURES, CMD_GET_CURRENT_TAB, CMD_RECOVER_PARAMS, CMD_STASH_PARAMS, ContentResp } from '~/models/content-message'
import { defaultOptionsValue } from '~/models/option'

export class ContentService {
  private static readonly KEY_STASHED_PARAMS = 'stashed_params'
  private static options = defaultOptionsValue

  static start() {
    StorageService.getOptions().then((options) => {
      ContentService.options = options
    })
    // 添加 options 变动监听
    StorageService.addStorageListener(ContentService.storageChange)


    // 处理来自 content_scripts 的消息
    browser.runtime.onMessage.addListener(async (message, sender) => {
      // console.log('message', message)
      // console.log('sender', sender)
      // NOTE: Returning a Promise is the preferred way to send a reply from an onMessage/onMessageExternal listener, as the sendResponse will be removed from the specs (See https://developer.mozilla.org/docs/Mozilla/Add-ons/WebExtensions/API/runtime/onMessage) Error
      const cmd = message.cmd
      switch (cmd) {
        case CMD_STASH_PARAMS:
          // 保存参数
          localStorage.setItem(ContentService.KEY_STASHED_PARAMS, JSON.stringify(message.data))
          return Promise.resolve((ContentResp.fromObj({ status: 'ok' })))
        case CMD_RECOVER_PARAMS:
          // 读取参数
          const paramsStr = localStorage.getItem(ContentService.KEY_STASHED_PARAMS)
          if (paramsStr === null) {
            return Promise.resolve((ContentResp.fromObj({ status: 'error', message: 'Stashed parameters do not exist.' })))
          }
          const params = JSON.parse(paramsStr)
          return Promise.resolve((ContentResp.fromObj({ status: 'ok', data: params })))
        case CMD_GET_CONTENT_FEATURES:
          // 获取支持的 content features
          return Promise.resolve((ContentResp.fromObj({
            status: 'ok',
            data: {
              enableParamsStashAndRecover: ContentService.options.enableParamsStashAndRecover,
              enableParamNamesColor: ContentService.options.enableParamNamesColor,
              paramNamesColor: ContentService.options.paramNamesColor,
            } as ContentFeatures,
          })))
        case CMD_GET_CURRENT_TAB:
          // 获取当前活跃标签页
          return Promise.resolve((ContentResp.fromObj({
            status: 'ok',
            data: await BrowserUtils.getCurrentTab(),
          })))
        default:
          break
      }
    })
  }

  private static storageChange(changes: StorageChangeWrapper) {
    if (StorageService.keyForOptions in changes) {
      // 设置有改变
      // console.log('changes', changes)
      ContentService.options = changes[StorageService.keyForOptions].newValue
    }
  }
}
