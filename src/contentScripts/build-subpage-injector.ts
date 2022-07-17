import { createApp } from 'vue'
import type { Tabs } from 'webextension-polyfill'
import App from './views/App.vue'
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
    const root = document.createElement('div')
    const styleEl = document.createElement('link')
    const shadowDOM = container.attachShadow?.({ mode: 'open' }) || container
    styleEl.setAttribute('rel', 'stylesheet')
    styleEl.setAttribute('href', browser.runtime.getURL('dist/contentScripts/style.css'))
    shadowDOM.appendChild(styleEl)
    shadowDOM.appendChild(root)
    document.body.appendChild(container)
    createApp(App).mount(root)
  })
}
