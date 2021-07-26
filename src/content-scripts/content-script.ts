import { CMD_IS_ENABLE_STASH_AND_RECOVER, ContentMessage, ContentResp } from '@/models/content-message'
import { enableParamsStashAndRecoverV1 } from './params-stash-recover/v1'
import { enableParamsStashAndRecoverV2 } from './params-stash-recover/v2'

// console.log('Hello from the content-script')

const message = new ContentMessage(CMD_IS_ENABLE_STASH_AND_RECOVER)

browser.runtime.sendMessage(message).then((resp: ContentResp) => {
  console.log('content-script::resp', resp)
  if (resp.status !== 'ok') {
    console.log('是否开启stash & recover 未知！')
    return
  }

  if (resp.data) {
    const ok = enableParamsStashAndRecoverV1()
    console.log('content-script::contentenableParamsStashAndRecoverV1:ok', ok)
    if (!ok) {
      enableParamsStashAndRecoverV2()
    }
  }
})
