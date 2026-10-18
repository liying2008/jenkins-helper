<!-- Popup 和 ContentScripts 共用组件，不要依赖 unocss、store、router 和 不支持的API -->
<script setup lang="ts">
import { ArrowBackSharp, ArrowForwardSharp, ChevronDownOutline, DownloadOutline, RefreshOutline, SettingsOutline } from '@vicons/ionicons5'
import { useMessage } from 'naive-ui'
import { ref } from 'vue'
import { removeEnd } from '~/libs/common'

interface Props {
  buildUrl: string
  fullDisplayName: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'prevBuild'): void
  (e: 'nextBuild'): void
}>()

const message = useMessage()

const optionKeys = {
  logWithTimestamps: 'log-with-timestamps',
}

const options = [
  { label: 'Download the log with timestamps (Rely on the `Timestamper` plugin)', key: optionKeys.logWithTimestamps },
]

// 是否禁用下载按钮
const disableDownload = ref(false)

// 下载日志
function downloadConsoleLog(withTimestamps?: boolean) {
  console.log('buildUrl', props.buildUrl)
  let downloadUrl = `${props.buildUrl}logText/progressiveText?start=0`
  let filename = `${props.fullDisplayName} Console Log.log`
  if (withTimestamps) {
    // 此功能依赖 Timestamper 插件
    downloadUrl = `${props.buildUrl}timestamps?time=HH:mm:ss&appendLog`
    filename = `${props.fullDisplayName} Console Log with timestamps.log`
  }

  if (browser && chrome.downloads) {
    // 使用 浏览器扩展 功能下载文件
    console.log('download file by browser')
    disableDownload.value = true
    chrome.downloads.download({
      url: downloadUrl,
      filename,
      saveAs: true,
    }).then((downloadId) => {
      disableDownload.value = false
      console.log('downloadId', downloadId)
    }).catch((e: Error) => {
      console.log('下载失败', e)
      message.error(`Fail to download: ${e.message}`)
      disableDownload.value = false
    })
  } else {
    // content-scripts 无法访问 browser 对象，使用模拟点击下载文件
    console.log('download file by content-scripts')
    const aId = 'jk-download-log-link'
    document.getElementById(aId)?.remove()
    const a = document.createElement('a')
    a.id = aId
    a.download = filename
    a.href = downloadUrl
    a.click()
  }
}

function handleDownloadDropdownSelect(key: string | number) {
  if (key === optionKeys.logWithTimestamps) {
    downloadConsoleLog(true)
  }
}

// 去“配置”页
function goToConfigure() {
  const url = removeEnd(props.buildUrl, '/')
  const configureUrl = `${url.substring(0, url.lastIndexOf('/'))}/configure`
  // console.log(`url=${url}, configureUrl=${configureUrl}`)
  if (browser && chrome.tabs) {
    // 使用 浏览器扩展 功能新建标签页
    chrome.tabs.create({ url: configureUrl })
  } else {
    // content-scripts 无法访问 browser 对象，使用 window.open 新建标签页
    window.open(configureUrl)
  }
}

function rebuild() {
  const rebuildUrl = `${props.buildUrl}rebuild`
  if (browser && chrome.tabs) {
    // 使用 浏览器扩展 功能新建标签页
    chrome.tabs.create({ url: rebuildUrl })
  } else {
    // content-scripts 无法访问 browser 对象，使用 window.open 新建标签页
    window.open(rebuildUrl)
  }
}
</script>

<template>
  <div class="action-wrapper">
    <n-button-group>
      <n-button
        type="default"
        round
        title="Previous Build"
        :retain-focus-on-click="false"
        @click="emit('prevBuild')"
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
        @click="emit('nextBuild')"
      >
        <template #icon>
          <n-icon><ArrowForwardSharp /></n-icon>
        </template>
      </n-button>
    </n-button-group>
    <div class="spacing"></div>
    <!-- 下载日志 -->
    <n-button
      type="default"
      class="no-right-round-corner"
      title="Download the console log"
      :disabled="disableDownload"
      @click="downloadConsoleLog(false)"
    >
      <template #icon>
        <n-icon>
          <DownloadOutline />
        </n-icon>
      </template>
    </n-button>
    <n-dropdown
      trigger="hover"
      :options="options"
      :disabled="disableDownload"
      @select="handleDownloadDropdownSelect"
    >
      <n-button
        type="default"
        class="no-left-round-corner no-border-left thin-btn"
        :disabled="disableDownload"
      >
        <template #icon>
          <n-icon>
            <ChevronDownOutline />
          </n-icon>
        </template>
      </n-button>
    </n-dropdown>

    <!-- 打开Job配置页面 -->
    <n-button
      type="default"
      class="go-to-configure-btn"
      title="Configure"
      @click="goToConfigure"
    >
      <template #icon>
        <n-icon>
          <SettingsOutline />
        </n-icon>
      </template>
    </n-button>
    <!-- 打开 Rebuild 页面 -->
    <n-button
      type="default"
      class="rebuild-btn"
      title="Rebuild (Rely on the `Rebuilder` plugin)"
      @click="rebuild"
    >
      <template #icon>
        <n-icon size="20">
          <RefreshOutline />
        </n-icon>
      </template>
    </n-button>
  </div>
</template>

<style scoped lang="scss">
.action-wrapper {
  display: flex;

  .spacing {
    flex: 1;
  }

  .no-right-round-corner {
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
  }

  .no-left-round-corner {
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
  }

  .no-border-left {
    border-left: hidden;
  }

  .thin-btn {
    min-width: 0;
    padding: 0 4px;
  }

  .go-to-configure-btn {
    margin-left: 8px;
  }

  .rebuild-btn {
    margin-left: 8px;
  }
}
</style>
