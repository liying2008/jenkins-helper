import { createApp } from 'vue'
import type { Tabs } from 'webextension-polyfill'
import App from './views/App.vue'
import { BUILD_SUBPAGE_INJECTOR_DOM_ID } from './constants'
import type { ContentResp } from '~/models/content-message'
import { CMD_GET_CURRENT_TAB, ContentMessage } from '~/models/content-message'
import { JenkinsBuild } from '~/libs/jenkins/build'
import { applyThemeForContentScripts } from '~/theme'
import { defaultTheme } from '~/theme/theme_default'

export function inject() {
  const message = new ContentMessage(CMD_GET_CURRENT_TAB)

  browser.runtime.sendMessage(message).then((resp: ContentResp<Tabs.Tab>) => {
    console.log('content-script::resp', resp)
    if (resp.status !== 'ok') {
      console.log('获取 content features 失败！')
      return
    }

    const url = resp.data?.url
    if (!url) {
      return
    }

    const buildUrl = JenkinsBuild.getBuildUrlIfExist(url)
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

    // <link rel="stylesheet" href="chrome-extension://{id}/dist/contentScripts/style.css">
    const styleEl = document.createElement('link')
    styleEl.setAttribute('rel', 'stylesheet')
    styleEl.setAttribute('href', browser.runtime.getURL('dist/contentScripts/style.css'))
    document.head.appendChild(styleEl)

    const app = createApp(App, {
      buildUrl,
    })

    applyThemeForContentScripts(defaultTheme)
    app.mount(appDiv)
  })
}
