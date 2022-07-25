import { createApp } from 'vue'
import type { Tabs } from 'webextension-polyfill'
import App from './views/App.vue'
import { BUILD_SUBPAGE_INJECTOR_DOM_ID } from './constants'
import type { ContentResp } from '~/models/content-message'
import { CMD_GET_CURRENT_TAB, ContentMessage } from '~/models/content-message'
import { JenkinsBuild } from '~/libs/jenkins/build'

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
    const shadowDOM = container.attachShadow?.({ mode: 'open' }) || container

    const head = document.createElement('head')

    // <link rel="stylesheet" href="chrome-extension://{id}/dist/contentScripts/style.css">
    const styleEl = document.createElement('link')
    styleEl.setAttribute('rel', 'stylesheet')
    styleEl.setAttribute('href', browser.runtime.getURL('dist/contentScripts/style.css'))
    head.appendChild(styleEl)

    shadowDOM.appendChild(head)

    const body = document.createElement('body')
    const appDiv = document.createElement('div')
    body.appendChild(appDiv)
    shadowDOM.appendChild(body)

    document.body.appendChild(container)
    const app = createApp(App)
    app.mount(appDiv)
  })
}
