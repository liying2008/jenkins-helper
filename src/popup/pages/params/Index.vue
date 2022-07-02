<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import { Tools } from '~/libs/tools'
import { SnackbarData } from '~/models/message'


interface BuildCause {
  shortDescription: string
  url: string
}

interface BuildParameter {
  hidden: boolean
  name: string
  value: unknown
}

const strings = {
  close: browser.i18n.getMessage('close'),
  buildStatus_: browser.i18n.getMessage('buildStatus_'),
  runLabel_: browser.i18n.getMessage('runLabel_'),
  copied: browser.i18n.getMessage('copied'),
  paramsList: browser.i18n.getMessage('paramsList'),
  noData: browser.i18n.getMessage('noData'),
  fetching: browser.i18n.getMessage('fetching'),
  passwordParameter: browser.i18n.getMessage('passwordParameter'),
  fileParameter: browser.i18n.getMessage('fileParameter'),
  credentialsParameter: browser.i18n.getMessage('credentialsParameter'),
  building: 'BUILDING',
}
const headers = [
  { text: 'Name', align: 'start', value: 'name', cellClass: 'param-item' },
  { text: 'Value', align: 'start', value: 'value', cellClass: 'param-item' },
]
const snackbar = ref(SnackbarData.empty())
// status 的状态说明：
// 0：无数据
// 1：正在请求数据
// 2：请求完成（有数据）
// -1：请求失败
const status = ref(0)
// 之前的状态（上一次的状态）
const preStatus = ref(0)
const number = ref(0)
const fullDisplayName = ref('')
const url = ref('')
const building = ref(false)
const result = ref('')
const buildTime = ref('')
const builtOn = ref('')
const causes = ref<BuildCause[]>([])
const parameters = ref<BuildParameter[]>([])
// 是否禁用下载按钮
const disableDownload = ref(false)
const builtOnSpan = ref<HTMLSpanElement>()

onMounted(() => {
  getParameters()
})

function getResultColor(label: string) {
  switch (label) {
    case 'SUCCESS': return 'success'
    case 'FAILURE': return 'error'
    case 'UNSTABLE': return 'warning'
    case 'ABORTED': return 'aborted'
    default: return 'orange darken-2'
  }
}

function getBuildingChipColor() {
  if (theme.current.value.dark) {
    return 'light-blue darken-3'
  } else {
    return 'light-blue'
  }
}

function getParameters() {
  getCurrentTab().then((tab: any | null) => {
    // console.log(tab)
    // const title = tab.title
    if (!tab) {
      console.log('tab is null!')
      return
    }
    const url = tab.url
    const urlRegExp = /^https*:\/\/.+\/job\/[^/]+\/\d+/
    const urlRegExpPipeline = /^(https*:\/\/.+\/)blue\/organizations\/jenkins\/.+\/detail\/([^/]+\/\d+)\//
    const urlRegExpPipelineLog = /^(https*:\/\/.+\/)blue\/rest\/organizations\/jenkins\/pipelines\/([^/]+)\/runs\/(\d+)\//
    let m = url.match(urlRegExp)
    let buildUrl = ''
    if (m == null) {
      // 普通Jenkins URL 没有匹配到
      m = url.match(urlRegExpPipeline)
      if (m == null) {
        // Jenkins Pipeline URL 没有匹配到
        m = url.match(urlRegExpPipelineLog)
        if (m == null) {
          // Jenkins Pipeline Log URL 没有匹配到
          return
        } else {
          buildUrl = `${m[1]}job/${m[2]}/${m[3]}`
        }
      } else {
        buildUrl = `${m[1]}job/${m[2]}`
      }
    } else {
      buildUrl = m[0]
    }
    console.log('buildUrl', buildUrl)
    getParametersByUrl(buildUrl)
  })
}

function getParametersByUrl(url: string) {
  status.value = 1
  const jsonUrl = `${url}/api/json`
  // console.log("jsonUrl", jsonUrl);
  Tools.getFetchOption(jsonUrl).then((header) => {
    fetch(jsonUrl, header).then((res) => {
      if (res.ok) {
        return res.json()
      } else {
        return Promise.reject(res)
      }
    }).then((data) => {
      status.value = 2
      preStatus.value = 2
      number.value = data.number
      fullDisplayName.value = data.fullDisplayName
      url = data.url // jenkins 设置的 jenkins 网站 url
      building.value = data.building
      result.value = data.result
      buildTime.value = new Date(data.timestamp).toLocaleString()
      builtOn.value = data.builtOn
      causes.value = []
      parameters.value = []
      const actions = data.actions
      for (let i = 0; i < actions.length; i++) {
        if (actions[i].hasOwnProperty('parameters')) {
          const parameters = actions[i].parameters
          for (let pIndex = 0; pIndex < parameters.length; pIndex++) {
            const _class = parameters[pIndex]._class
            const param = {
              hidden: false,
              name: parameters[pIndex].name,
              value: parameters[pIndex].value,
            }
            // 额外处理几个特殊类型的参数
            if (_class === 'hudson.model.PasswordParameterValue' && param.value === undefined) {
              // 密码参数
              param.hidden = true
              param.value = `<${strings.passwordParameter}>`
            } else if (_class === 'com.cloudbees.plugins.credentials.CredentialsParameterValue' && param.value === undefined) {
              // 凭据参数
              param.hidden = true
              param.value = `<${strings.credentialsParameter}>`
            } else if (_class === 'hudson.model.FileParameterValue' && param.value === undefined) {
              // 文件参数
              param.hidden = true
              param.value = `<${strings.fileParameter}>`
            } else if (_class === 'hudson.model.RunParameterValue') {
              // 运行时参数
              param.value = `${parameters[pIndex].jobName} #${parameters[pIndex].number}`
            }
            parameters.push(param)
          }
        } else if (actions[i].hasOwnProperty('causes')) {
          const causes = actions[i].causes
          for (let cIndex = 0; cIndex < causes.length; cIndex++) {
            const shortDescription = causes[cIndex].shortDescription
            let upstreamUrl = ''
            if (causes[cIndex].upstreamUrl && causes[cIndex].upstreamBuild) {
              const rootUrl = getJenkinsRootUrl(data.url, data.fullDisplayName)
              if (rootUrl) {
                upstreamUrl = `${rootUrl}/${causes[cIndex].upstreamUrl}${causes[cIndex].upstreamBuild}/`
              }
            }
            causes.push({
              shortDescription,
              url: upstreamUrl,
            })
          }
        }
      }
    }).catch((e: Error) => {
      console.log('获取参数失败', e)
      status.value = preStatus.value
      alert(strings.noData)
    })
  })
}

async function getCurrentTab() {
  const tabs = await browser.tabs.query({ active: true, currentWindow: true })
  return tabs.length ? tabs[0] : null
}

// 复制运行节点
function copyBuiltOn() {
  const text = builtOnSpan.value!.innerText
  const tempInput = document.createElement('input')
  tempInput.value = text
  document.body.appendChild(tempInput)
  tempInput.select() // 选择对象
  document.execCommand('Copy') // 执行浏览器复制命令
  tempInput.style.display = 'none'

  snackbar.value = SnackbarData.builder()
    .message(strings.copied)
    .color('success')
    .build()
}

// 下载日志
function downloadConsoleLog() {
  disableDownload.value = true
  browser.downloads.download({
    url: `${url.value}logText/progressiveText?start=0`,
    filename: `${fullDisplayName.value} Console Log.log`,
    saveAs: true,
  }).then((downloadId) => {
    disableDownload.value = false
    console.log('downloadId', downloadId)
  })
}

// 去“配置”页
function goToConfigure() {
  const _url = url.value.substring(0, url.value.length - 1)
  const configureUrl = `${_url.substring(0, _url.lastIndexOf('/'))}/configure`
  // console.log('url=' + url + ', configureUrl=' + configureUrl)
  browser.tabs.create({ url: configureUrl })
}

function rebuild() {
  browser.tabs.create({ url: `${url.value}rebuild` })
}

// 显示前一次构建信息
function prevBuild() {
  // url: http://127.0.0.1:8080/jenkins/job/Test1/21/
  let _url = url.value.substring(0, url.value.length - 1)
  _url = _url.substring(0, _url.lastIndexOf('/'))
  if (number.value > 1) {
    _url = `${_url}/${number.value - 1}`
    getParametersByUrl(_url)
  } else {
    alert(browser.i18n.getMessage('noPrevBuild'))
  }
}

// 显示后一次构建信息
function nextBuild() {
  let _url = url.value.substring(0, url.value.length - 1)
  _url = _url.substring(0, _url.lastIndexOf('/'))
  _url = `${_url}/${number.value + 1}`
  getParametersByUrl(_url)
}

function getJenkinsRootUrl(url: string, fullDisplayName: string) {
  if (url[url.length - 1] === '/') {
    url = url.substring(0, url.length - 1)
  }
  fullDisplayName = encodeURIComponent(fullDisplayName)
  // %20%C2%BB%20: »
  // %20%23: #
  let path = fullDisplayName.replace('%20%C2%BB%20', '/job/').replace('%20%23', '/')
  path = `/job/${path}`
  const index = url.lastIndexOf(path)
  if (index > 0) {
    const rootUrl = url.substring(0, index)
    console.log('rootUrl', rootUrl)
    return rootUrl
  } else {
    console.log('error: url:', url, 'fullDisplayName', fullDisplayName, 'path:', path)
    return ''
  }
}
</script>

<template>
  <div id="params-wrapper">
  </div>
</template>


<style lang="scss">
#params-wrapper {
  .v-btn:not(.v-btn--text):not(.v-btn--outlined).v-btn--active:before {
    opacity: 0;
  }

  #info-block {
    .info-col {
      font-size: 0.8rem;
      padding: 0.4rem;
      line-height: 0.875rem;
      color: var(--jk-title);

      .display-name {
        text-decoration-line: none;
        word-break: break-all;
        word-wrap: break-word;
      }

      .dense-chip {
        height: inherit;
      }

      .building {
        animation-name: building;
        animation-duration: 1.4s;
        animation-timing-function: ease-out;
        animation-direction: alternate;
        animation-iteration-count: infinite;
        animation-fill-mode: none;
        animation-play-state: running;
      }

      @keyframes building {
        0% {
          opacity: 1;
        }
        100% {
          opacity: 0.3;
        }
      }

      .info-icon-btn {
        align-items: baseline;
      }
    }
  }
  #params-table {
    .param-item {
      font-size: 0.785rem;
    }
    .hidden-param {
      font-size: 0.8em;
      color: var(--jk-subtitle);
      font-style: italic;
    }
  }
}
</style>
