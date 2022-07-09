<script lang="ts" setup>
import { ref, watch } from 'vue'
import { ArrowBackSharp, ArrowForwardCircleSharp, ArrowForwardSharp, CloudDownloadSharp, CopyOutline, FlagSharp, FlashSharp, RefreshCircleSharp, Reload, SettingsSharp, TimeSharp } from '@vicons/ionicons5'
import type { TableColumns } from 'naive-ui/es/data-table/src/interface'
import { useDialog, useMessage } from 'naive-ui'
import { useClipboard } from '@vueuse/core'
import type { Tabs } from 'webextension-polyfill'
import { Tools } from '~/libs/tools'
import { useThemeStore } from '~/store'
import type { BuildCause, BuildParameter } from '~/models/jenkins/build'
import { JenkinsBuild } from '~/libs/jenkins/build'
import { BrowserUtils } from '~/libs/browser'


const strings = {
  close: browser.i18n.getMessage('close'),
  buildStatus_: browser.i18n.getMessage('buildStatus_'),
  runLabel_: browser.i18n.getMessage('runLabel_'),
  copied: browser.i18n.getMessage('copied'),
  paramsList: browser.i18n.getMessage('paramsList'),
  noData: browser.i18n.getMessage('noData'),
  noPrevBuild: browser.i18n.getMessage('noPrevBuild'),
  fetching: browser.i18n.getMessage('fetching'),
  warmTip: browser.i18n.getMessage('warmTip'),
  ok: browser.i18n.getMessage('ok'),
  building: 'BUILDING',
}
const headers: TableColumns<BuildParameter> = [
  { title: 'Name', align: 'left', key: 'name', sorter: 'default', className: 'param-item-key' },
  { title: 'Value', align: 'left', key: 'value', sorter: 'default', className: 'param-item-value' },
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

const themeStore = useThemeStore()
const message = useMessage()
const dialog = useDialog()
const clipboard = useClipboard({ source: builtOn })

watch(clipboard.copied, (value) => {
  if (value) {
    message.success(strings.copied)
  }
})

// 获取构建参数
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
  BrowserUtils.getCurrentTab().then((tab: Tabs.Tab | null) => {
    // console.log(tab)
    // const title = tab.title
    if (!tab) {
      console.log('tab is null!')
      return
    }
    const buildUrl = JenkinsBuild.getBuildUrlIfExist(tab.url!)
    console.log('buildUrl', buildUrl)
    if (!buildUrl) {
      // 不是 Jenkins 构建页面或子页面，不做任何处理
      return
    }
    getParametersByUrl(buildUrl)
  })
}

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
      const actions = data.actions
      // console.log('actions', actions)
      parameters.value = JenkinsBuild.getBuildParametersFromActions(actions)
      causes.value = JenkinsBuild.getBuildCausesFromActions(actions, data.url, data.fullDisplayName)
    }).catch((e: Error) => {
      console.log('获取参数失败', e)
      status.value = preStatus.value
      dialog.info({
        title: strings.warmTip,
        content: strings.noData,
        positiveText: strings.ok,
      })
    })
  })
}

// 复制运行节点
function copyBuiltOn() {
  if (!clipboard.isSupported) {
    message.error('Your browser does not support clipboard')
    return
  }
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
    dialog.info({
      title: strings.warmTip,
      content: strings.noPrevBuild,
      positiveText: strings.ok,
    })
  }
}

// 显示后一次构建信息
function nextBuild() {
  let _url = url.value.substring(0, url.value.length - 1)
  _url = _url.substring(0, _url.lastIndexOf('/'))
  _url = `${_url}/${number.value + 1}`
  getParametersByUrl(_url)
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
            <FlagSharp />
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
            class="build-tag building"
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
            class="build-tag"
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
          v-show="builtOn"
          class="info-col"
        >
          {{ strings.runLabel_ }}<span>{{ builtOn }}</span>
          <n-button
            v-show="builtOn"
            text
            class="info-icon-btn ml-8px"
            title="Copy"
            @click="copyBuiltOn"
          >
            <template #icon>
              <n-icon size="16px">
                <CopyOutline class="copy-built-on-icon" />
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
            class="info-icon-btn ml-8px"
            title="Go"
            tag="a"
            :href="cause.url"
            text
            target="_blank"
          >
            <n-icon size="17px">
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

    <!-- Prev/Next Button & 快捷按钮 -->
    <div
      v-show="status === 2"
      class="flex mt-16px"
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
        class="ml-8px"
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
        class="ml-8px"
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
    padding: 10px;

    .info-row {
      align-items: center;
      height: 28px;

      .info-col {
        align-items: center;
        font-size: 12px;
        color: var(--jk-title);

        .n-icon {
          vertical-align: middle;
        }

        .display-name {
          text-decoration-line: none;
          word-break: break-all;
          word-wrap: break-word;
        }

        .build-tag {
          transform: scale(0.8);
        }

        .building {
          animation-name: building;
          animation-duration: 1.4s;
          animation-play-state: running;
          animation-timing-function: ease-out;
          animation-iteration-count: infinite;
          animation-direction: alternate;
          animation-fill-mode: none;
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
          vertical-align: middle;

          .copy-built-on-icon {
            font-size: 14px;
          }
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
          font-style: italic;
          color: var(--jk-subtitle);
        }
      }
    }
  }
}
</style>
