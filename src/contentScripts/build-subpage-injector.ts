import type { ContentResp } from '~/models/content-message'
import { createApp } from 'vue'
import { JenkinsBuildUtils } from '~/libs/jenkins/build'
import { CMD_GET_CURRENT_TAB, ContentMessage } from '~/models/content-message'
import { applyThemeForContentScripts } from '~/theme'
import { defaultTheme } from '~/theme/theme_default'
import { BUILD_SUBPAGE_INJECTOR_DOM_ID } from './constants'
import App from './views/App.vue'

export function inject() {
  const message = new ContentMessage(CMD_GET_CURRENT_TAB)

  chrome.runtime.sendMessage(message).then((resp: ContentResp<chrome.tabs.Tab>) => {
    console.log('content-script::resp', resp)
    if (resp.status !== 'ok') {
      console.log('获取 content features 失败！')
      return
    }

    const url = resp.data?.url
    if (!url) {
      return
    }

    const buildUrl = JenkinsBuildUtils.getBuildUrlIfExist(url)
    if (!buildUrl) {
      return
    }
    // mount component to context window
    const container = document.createElement('div')
    container.id = BUILD_SUBPAGE_INJECTOR_DOM_ID
    container.setAttribute('build-url', buildUrl)

    const appDiv = document.createElement('div')
    container.appendChild(appDiv)

    document.body.appendChild(container)

    const app = createApp(App, {
      buildUrl,
    })

    applyThemeForContentScripts(defaultTheme)
    app.mount(appDiv)
  })
}
