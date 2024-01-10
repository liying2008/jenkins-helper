import { BrowserUtils } from '~/libs/browser'
import type { StorageChangeWrapper } from '~/libs/storage'
import { StorageService } from '~/libs/storage'
import type { ContentFeatures } from '~/models/content-message'
import { CMD_GET_CONTENT_FEATURES, CMD_GET_CURRENT_TAB, CMD_RECOVER_PARAMS, CMD_STASH_PARAMS, ContentResp } from '~/models/content-message'
import { Options } from '~/models/option'
import { useLocalDataStore } from '~/composables/useLocalDataStore'

export class ContentService {
  private static instance?: ContentService
  private static readonly KEY_STASHED_PARAMS = 'stashed_params'
  private options = Options.default()
  private readonly localDataStore = useLocalDataStore()

  private static getInstance() {
    if (!ContentService.instance) {
      ContentService.instance = new ContentService()
    }
    return ContentService.instance
  }

  static launch() {
    ContentService.getInstance().start()
  }

  private start() {
    // 添加 options 变动监听
    StorageService.addStorageListener(this.storageChange)

    StorageService.getOptions().then((options) => {
      this.options = options
    })

    // 处理来自 content_scripts 的消息
    browser.runtime.onMessage.addListener(async (message) => {
      // console.log('message', message)
      // NOTE: Returning a Promise is the preferred way to send a reply from an onMessage/onMessageExternal listener, as the sendResponse will be removed from the specs (See https://developer.mozilla.org/docs/Mozilla/Add-ons/WebExtensions/API/runtime/onMessage) Error

      // use local data indexeddb
      const cmd = message.cmd
      switch (cmd) {
        case CMD_STASH_PARAMS:
          // 保存参数
          try {
            await this.localDataStore.setItem(ContentService.KEY_STASHED_PARAMS, message.data)
            return Promise.resolve(ContentResp.fromObj({ status: 'ok' }))
          } catch (e) {
            return Promise.resolve(ContentResp.fromObj({ status: 'error', message: `An error occurred while stashing parameters: ${e}` }))
          }
        case CMD_RECOVER_PARAMS:
          // 读取参数
          try {
            const params = await this.localDataStore.getItem(ContentService.KEY_STASHED_PARAMS)
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
              enableParamsStashAndRecover: this.options.enableParamsStashAndRecover,
              enableParamNamesColor: this.options.enableParamNamesColor,
              paramNamesColor: this.options.paramNamesColor,
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

  private storageChange = (changes: StorageChangeWrapper) => {
    // 使用箭头函数解决 this 指向问题
    // console.log('this', this)
    if (StorageService.keyForOptions in changes) {
      // 设置有改变
      // console.log('changes', changes)
      this.options = changes[StorageService.keyForOptions].newValue
    }
  }
}
