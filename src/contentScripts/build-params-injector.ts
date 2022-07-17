import { enableParamNamesColor } from './param-names-color'
import { enableParamsStashAndRecoverV1 } from './params-stash-recover/v1'
import { enableParamsStashAndRecoverV2 } from './params-stash-recover/v2'
import { CMD_GET_CONTENT_FEATURES, ContentMessage } from '~/models/content-message'
import type { ContentFeatures, ContentResp } from '~/models/content-message'

export function inject() {
  const message = new ContentMessage(CMD_GET_CONTENT_FEATURES)

  browser.runtime.sendMessage(message).then((resp: ContentResp<ContentFeatures>) => {
  // console.log('content-script::resp', resp)
    if (resp.status !== 'ok') {
      console.log('获取 content features 失败！')
      return
    }

    const data = resp.data!

    if (data.enableParamsStashAndRecover) {
    // 使能 参数暂存&恢复 功能
      const ok = enableParamsStashAndRecoverV1()
      // console.log('content-script::contentenableParamsStashAndRecoverV1:ok', ok)
      if (!ok) {
        enableParamsStashAndRecoverV2()
      }
    }

    if (data.enableParamNamesColor) {
    // 使能 参数名称着色 功能
      enableParamNamesColor(data.paramNamesColor)
    }
  })
}
