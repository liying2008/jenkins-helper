import { CMD_IS_ENABLE_STASH_AND_RECOVER, ContentMessage, ContentResp } from '@/models/content-message'
import { enable as enableParamsStashRecover } from './params-stash-recover'

// console.log('Hello from the content-script')

const message = new ContentMessage(CMD_IS_ENABLE_STASH_AND_RECOVER)

browser.runtime.sendMessage(message).then((resp: ContentResp) => {
  console.log('content_scripts::resp', resp)
  if (resp.status !== 'ok') {
    console.log('是否开启stash & recover 未知！')
    return
  }
  if (resp.data) {
    enableParamsStashRecover()
  }
})
