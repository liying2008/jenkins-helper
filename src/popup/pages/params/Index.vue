<script lang="ts" setup>
import { ref, watch } from 'vue'
import { ArrowBackSharp, ArrowForwardCircleSharp, ArrowForwardSharp, CloudDownloadSharp, CopyOutline, FlashSharp, PricetagSharp, RefreshCircleSharp, Reload, SettingsSharp, TimeSharp } from '@vicons/ionicons5'
import type { TableColumns } from 'naive-ui/es/data-table/src/interface'
import { useMessage } from 'naive-ui'
import { useClipboard } from '@vueuse/core'
import type { Tabs } from 'webextension-polyfill'
import { Tools } from '~/libs/tools'
import { useThemeStore } from '~/store'


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
const headers: TableColumns<BuildParameter> = [
  { title: 'Name', align: 'left', key: 'name', className: 'param-item-key' },
  { title: 'Value', align: 'left', key: 'value', className: 'param-item-value' },
]
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

const themeStore = useThemeStore()
const message = useMessage()
const builtOnText = ref('')
const clipboard = useClipboard({ source: builtOnText })

watch(clipboard.copied, (value) => {
  if (value) {
    message.success(strings.copied)
  }
})

getParameters()

function getResultColor(label: string) {
  switch (label) {
    case 'SUCCESS': return 'successColorPressed'
    case 'FAILURE': return 'errorColorPressed'
    case 'UNSTABLE': return 'warningColorPressed'
    case 'ABORTED': return 'aborted'
    default: return 'orange darken-2'
  }
}

function getBuildingChipColor() {
  if (themeStore.darkMode) {
    return 'infoColorPressed'
  } else {
    return 'infoColor'
  }
}

function rowProps(row: BuildParameter) {
  if (row.hidden) {
    return {
      class: 'param-item hidden-param-item',
    }
  } else {
    return {
      class: 'param-item',
    }
  }
}

function getParameters() {
  getCurrentTab().then((tab: Tabs.Tab | null) => {
    // console.log(tab)
    // const title = tab.title
    if (!tab) {
      console.log('tab is null!')
      return
    }
    const _url = tab.url!
    const urlRegExp = /^https*:\/\/.+\/job\/[^/]+\/\d+/
    const urlRegExpPipeline = /^(https*:\/\/.+\/)blue\/organizations\/jenkins\/.+\/detail\/([^/]+\/\d+)\//
    const urlRegExpPipelineLog = /^(https*:\/\/.+\/)blue\/rest\/organizations\/jenkins\/pipelines\/([^/]+)\/runs\/(\d+)\//
    let m = _url.match(urlRegExp)
    let buildUrl = ''
    if (m == null) {
      // 普通Jenkins URL 没有匹配到
      m = _url.match(urlRegExpPipeline)
      if (m == null) {
        // Jenkins Pipeline URL 没有匹配到
        m = _url.match(urlRegExpPipelineLog)
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

// TODO 此处有BUG需要修复。
// http://local.net:8080/jenkins/job/FreeJob01/1/
// Next Build -> Previous Build 会出现问题
function getParametersByUrl(_url: string) {
  status.value = 1
  const jsonUrl = `${_url}/api/json`
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
      url.value = data.url // jenkins 设置的 jenkins 网站 url
      building.value = data.building
      result.value = data.result
      buildTime.value = new Date(data.timestamp).toLocaleString()
      builtOn.value = data.builtOn
      causes.value = []
      parameters.value = []
      const actions = data.actions
      console.log('actions', actions)
      for (let i = 0; i < actions.length; i++) {
        if (actions[i].hasOwnProperty('parameters')) {
          const _parameters = actions[i].parameters
          for (let pIndex = 0; pIndex < _parameters.length; pIndex++) {
            const _class = _parameters[pIndex]._class
            const param = {
              hidden: false,
              name: _parameters[pIndex].name,
              value: _parameters[pIndex].value,
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
              param.value = `${_parameters[pIndex].jobName} #${_parameters[pIndex].number}`
            }
            parameters.value.push(param)
          }
        } else if (actions[i].hasOwnProperty('causes')) {
          const _causes = actions[i].causes
          for (let cIndex = 0; cIndex < _causes.length; cIndex++) {
            const shortDescription = _causes[cIndex].shortDescription
            let upstreamUrl = ''
            if (_causes[cIndex].upstreamUrl && _causes[cIndex].upstreamBuild) {
              const rootUrl = getJenkinsRootUrl(data.url, data.fullDisplayName)
              if (rootUrl) {
                upstreamUrl = `${rootUrl}/${_causes[cIndex].upstreamUrl}${_causes[cIndex].upstreamBuild}/`
              }
            }
            causes.value.push({
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
  if (!clipboard.isSupported) {
    message.error('Your browser does not support clipboard')
    return
  }
  const text = builtOnSpan.value!.innerText
  builtOnText.value = text
  clipboard.copy()
}

// 下载日志
function downloadConsoleLog() {
  disableDownload.value = true
  console.log('url', url.value)
  browser.downloads.download({
    url: `${url.value}logText/progressiveText?start=0`,
    filename: `${fullDisplayName.value} Console Log.log`,
    saveAs: true,
  }).then((downloadId) => {
    disableDownload.value = false
    console.log('downloadId', downloadId)
  }).catch((e: Error) => {
    console.log('下载失败', e)
    message.error(`Fail to download: ${e.message}`)
    disableDownload.value = false
  })
}

// 去“配置”页
function goToConfigure() {
  const _url = url.value.substring(0, url.value.length - 1)
  const configureUrl = `${_url.substring(0, _url.lastIndexOf('/'))}/configure`
  // console.log(`url=${url.value}, configureUrl=${configureUrl}`)
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

function getJenkinsRootUrl(_url: string, _fullDisplayName: string) {
  if (_url[_url.length - 1] === '/') {
    _url = _url.substring(0, _url.length - 1)
  }
  _fullDisplayName = encodeURIComponent(_fullDisplayName)
  // %20%C2%BB%20: »
  // %20%23: #
  let path = _fullDisplayName.replace('%20%C2%BB%20', '/job/').replace('%20%23', '/')
  path = `/job/${path}`
  const index = _url.lastIndexOf(path)
  if (index > 0) {
    const rootUrl = _url.substring(0, index)
    console.log('rootUrl', rootUrl)
    return rootUrl
  } else {
    console.log('error: _url:', _url, '_fullDisplayName', _fullDisplayName, 'path:', path)
    return ''
  }
}
</script>

<template>
  <div class="params-wrapper">
    <n-card
      v-show="status === 2"
      class="info-block"
    >
      <!-- Display name & 构建状态 -->
      <n-grid
        x-gap="12"
        :cols="2"
        class="info-row"
      >
        <n-gi class="info-col">
          <n-icon
            title="Full DisplayName"
            size="16"
          >
            <PricetagSharp />
          </n-icon>
          <a
            :href="url"
            target="_blank"
            style="margin-left: 8px;"
            class="display-name a-link-color"
          >{{ fullDisplayName }}</a>
        </n-gi>
        <n-gi class="info-col">
          {{ strings.buildStatus_ }}
          <!-- 构建中 -->
          <n-tag
            v-if="building"
            :color="{ color: `var(--jk-${getBuildingChipColor()})`, textColor: 'white' }"
            class="building"
            size="small"
            round
            strong
            :bordered="false"
          >
            {{ strings.building }}
          </n-tag>
          <!-- 构建已完成 -->
          <n-tag
            v-else
            :color="{ color: `var(--jk-${getResultColor(result)})`, textColor: 'white' }"
            size="small"
            round
            strong
            :bordered="false"
          >
            {{ result }}
          </n-tag>
        </n-gi>
      </n-grid>
      <!-- 构建时间 & 执行节点 -->
      <n-grid
        x-gap="12"
        :cols="2"
        class="info-row"
      >
        <n-gi class="info-col">
          <n-icon
            size="16"
            title="Build Timestamp"
          >
            <TimeSharp />
          </n-icon>
          <span style="margin-left: 8px;">{{ buildTime }}</span>
        </n-gi>
        <n-gi
          v-show="builtOn !== ''"
          class="info-col"
        >
          {{ strings.runLabel_ }}<span ref="builtOnSpan">{{ builtOn }}</span>
          <n-button
            text
            class="info-icon-btn ml-2"
            title="Copy"
            @click="copyBuiltOn"
          >
            <template #icon>
              <n-icon size="16">
                <CopyOutline />
              </n-icon>
            </template>
          </n-button>
        </n-gi>
      </n-grid>
      <!-- Build Causes -->
      <n-grid
        v-for="cause in causes"
        :key="cause.url"
        :cols="1"
        class="info-row"
      >
        <n-gi
          cols="12"
          class="info-col"
        >
          <n-icon
            size="16"
            title="Build Cause"
          >
            <FlashSharp />
          </n-icon>
          <span style="margin-left: 8px;">{{ cause.shortDescription }}</span>
          <n-button
            v-if="cause.url"
            class="info-icon-btn ml-2"
            title="Go"
            tag="a"
            :href="cause.url"
            target="_blank"
          >
            <n-icon size="16px">
              <ArrowForwardCircleSharp />
            </n-icon>
          </n-button>
        </n-gi>
      </n-grid>
    </n-card>

    <!-- 参数列表 -->
    <div
      v-show="status === 2 && parameters.length > 0"
      class="params-table"
    >
      <div style="font-weight: bold;">
        {{ strings.paramsList }}
      </div>
      <n-data-table
        class="data-table"
        :columns="headers"
        :data="parameters"
        :row-props="rowProps"
        size="small"
      >
      </n-data-table>
    </div>

    <!-- Prev/Next Button -->
    <div
      v-show="status === 2"
      class="flex mt-4"
    >
      <n-button-group>
        <n-button
          type="default"
          round
          title="Previous Build"
          :retain-focus-on-click="false"
          @click="prevBuild"
        >
          <template #icon>
            <n-icon><ArrowBackSharp /></n-icon>
          </template>
        </n-button>
        <n-button
          type="default"
          round
          title="Next Build"
          :retain-focus-on-click="false"
          @click="nextBuild"
        >
          <template #icon>
            <n-icon><ArrowForwardSharp /></n-icon>
          </template>
        </n-button>
      </n-button-group>
      <div class="flex-1"></div>
      <!-- 下载日志 -->
      <n-button
        type="default"
        title="Download Console Log"
        :disabled="disableDownload"
        @click="downloadConsoleLog"
      >
        <template #icon>
          <n-icon>
            <CloudDownloadSharp />
          </n-icon>
        </template>
      </n-button>
      <!-- 打开Job配置页面 -->
      <n-button
        type="default"
        class="ml-2"
        title="Configure"
        @click="goToConfigure"
      >
        <template #icon>
          <n-icon>
            <SettingsSharp />
          </n-icon>
        </template>
      </n-button>
      <!-- 打开 Rebuild 页面 -->
      <n-button
        type="default"
        class="ml-2"
        title="Rebuild"
        @click="rebuild"
      >
        <template #icon>
          <n-icon size="20">
            <RefreshCircleSharp />
          </n-icon>
        </template>
      </n-button>
    </div>

    <!-- No Data -->
    <div v-show="status === 0">
      <n-empty :description="strings.noData ">
      </n-empty>
    </div>
    <!-- Fetching -->
    <div v-show="status === 1">
      <n-empty :description="strings.fetching">
        <template #icon>
          <n-icon>
            <Reload class="is-loading" />
          </n-icon>
        </template>
      </n-empty>
    </div>
  </div>
</template>


<style lang="scss">
.params-wrapper {
  font-size: 12px;

  .n-card > .n-card__content {
    padding: 0;
  }

  .info-block {
    .info-row {
      align-items: center;

      .info-col {
        font-size: 12px;
        padding: 6px 14px;
        color: var(--jk-title);

        .n-icon {
          vertical-align: top;
        }

        .display-name {
          text-decoration-line: none;
          word-break: break-all;
          word-wrap: break-word;
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
          // align-items: baseline;
          vertical-align: top;
        }
      }
    }
  }

  .params-table {
    margin-top: 10px;

    .data-table {
      margin-top: 6px;

      .param-item {
        .param-item-key {
          font-size: 12px;
          word-break: break-all;
          word-wrap: break-word;
        }

        .param-item-value {
          font-size: 12px;
          word-break: break-all;
          word-wrap: break-word;
        }
      }

      .hidden-param-item {
        .param-item-value {
          color: var(--jk-subtitle);
          font-style: italic;
        }
      }
    }
  }
}
</style>
