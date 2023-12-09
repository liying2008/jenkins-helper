import { BrowserUtils } from '~/libs/browser'
import type { StorageChangeWrapper } from '~/libs/storage'
import { StorageService } from '~/libs/storage'
import type { ContentFeatures } from '~/models/content-message'
import { CMD_GET_CONTENT_FEATURES, CMD_GET_CURRENT_TAB, CMD_RECOVER_PARAMS, CMD_STASH_PARAMS, ContentResp } from '~/models/content-message'
import { Options } from '~/models/option'
import { configLocalDataStore } from '~/libs/idb'

export class ContentService {
  private static readonly KEY_STASHED_PARAMS = 'stashed_params'
  private static options = Options.default()

  static start() {
    StorageService.getOptions().then((options) => {
      ContentService.options = options
    })
    // 添加 options 变动监听
    StorageService.addStorageListener(ContentService.storageChange)

    // 处理来自 content_scripts 的消息
    browser.runtime.onMessage.addListener(async (message) => {
      // console.log('message', message)
      // NOTE: Returning a Promise is the preferred way to send a reply from an onMessage/onMessageExternal listener, as the sendResponse will be removed from the specs (See https://developer.mozilla.org/docs/Mozilla/Add-ons/WebExtensions/API/runtime/onMessage) Error

      // use local data indexeddb
      const idbClient = configLocalDataStore()
      const cmd = message.cmd
      switch (cmd) {
        case CMD_STASH_PARAMS:
          // 保存参数
          try {
            await idbClient.setItem(ContentService.KEY_STASHED_PARAMS, message.data)
            return Promise.resolve(ContentResp.fromObj({ status: 'ok' }))
          } catch (e) {
            return Promise.resolve(ContentResp.fromObj({ status: 'error', message: `An error occurred while stashing parameters: ${e}` }))
          }
        case CMD_RECOVER_PARAMS:
          // 读取参数
          try {
            const params = await idbClient.getItem(ContentService.KEY_STASHED_PARAMS)
            if (params) {
              return Promise.resolve(ContentResp.fromObj({ status: 'ok', data: params }))
            } else {
              return Promise.resolve(ContentResp.fromObj({ status: 'error', message: 'Stashed parameters do not exist.' }))
            }
          } catch (e) {
            return Promise.resolve(ContentResp.fromObj({ status: 'error', message: `An error occurred while recovering parameters: ${e}` }))
          }
        case CMD_GET_CONTENT_FEATURES:
          // 获取支持的 content features
          return Promise.resolve(ContentResp.fromObj({
            status: 'ok',
            data: {
              enableParamsStashAndRecover: ContentService.options.enableParamsStashAndRecover,
              enableParamNamesColor: ContentService.options.enableParamNamesColor,
              paramNamesColor: ContentService.options.paramNamesColor,
            } as ContentFeatures,
          }))
        case CMD_GET_CURRENT_TAB:
          // 获取当前活跃标签页
          return Promise.resolve(ContentResp.fromObj({
            status: 'ok',
            data: await BrowserUtils.getCurrentTab(),
          }))
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
