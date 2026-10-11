import type { ContentFeatures, ContentResp } from '~/models/content-message'
import { CMD_GET_CONTENT_FEATURES, ContentMessage } from '~/models/content-message'
import { enableParamNamesColor } from './param-names-color'
import { enableParamsStashAndRecover } from './params-stash-recover'

export function inject() {
  const message = new ContentMessage(CMD_GET_CONTENT_FEATURES)

  chrome.runtime.sendMessage(message).then((resp: ContentResp<ContentFeatures>) => {
    // console.log('content-script::resp', resp)
    if (resp.status !== 'ok') {
      console.log('获取 content features 失败！')
      return
    }

    const data = resp.data!

    if (data.enableParamsStashAndRecover) {
      // 使能 参数暂存&恢复 功能
      enableParamsStashAndRecover()
    }

    if (data.enableParamNamesColor) {
      // 使能 参数名称着色 功能
      enableParamNamesColor(data.paramNamesColor)
    }
  })
}
