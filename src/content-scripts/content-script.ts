import { CMD_IS_ENABLE_STASH_AND_RECOVER, ContentMessage, ContentResp } from '@/models/content-message'
import { enableParamsStashAndRecoverV1 } from './params-stash-recover/v1'

// console.log('Hello from the content-script')

const message = new ContentMessage(CMD_IS_ENABLE_STASH_AND_RECOVER)

browser.runtime.sendMessage(message).then((resp: ContentResp) => {
  console.log('content_scripts::resp', resp)
  if (resp.status !== 'ok') {
    console.log('是否开启stash & recover 未知！')
    return
  }
  if (resp.data) {
    enableParamsStashAndRecoverV1()
  }
})
