<!-- Popup 和 ContentScripts 共用组件，不要依赖 windicss、store、router 和 不支持的API -->
<script setup lang="ts">
import { ArrowBackSharp, ArrowForwardSharp, CloudDownloadSharp, RefreshCircleSharp, SettingsSharp } from '@vicons/ionicons5'
import { useMessage } from 'naive-ui'
import { ref } from 'vue'

const props = defineProps<{
  buildUrl: string
  fullDisplayName: string
}>()

// eslint-disable-next-line func-call-spacing
const emit = defineEmits<{
  (e: 'prevBuild'): void
  (e: 'nextBuild'): void
}>()

const message = useMessage()

// 是否禁用下载按钮
const disableDownload = ref(false)

// 下载日志
function downloadConsoleLog() {
  disableDownload.value = true
  console.log('buildUrl', props.buildUrl)
  // TODO 需要兼容 content-scripts
  browser.downloads.download({
    url: `${props.buildUrl}logText/progressiveText?start=0`,
    filename: `${props.fullDisplayName} Console Log.log`,
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
  const _url = props.buildUrl.substring(0, props.buildUrl.length - 1)
  const configureUrl = `${_url.substring(0, _url.lastIndexOf('/'))}/configure`
  // console.log(`url=${url.value}, configureUrl=${configureUrl}`)
  // TODO 需要兼容 content-scripts
  browser.tabs.create({ url: configureUrl })
}

function rebuild() {
  // TODO 需要兼容 content-scripts
  browser.tabs.create({ url: `${props.buildUrl}rebuild` })
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
      class="go-to-configure-btn"
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
      class="rebuild-btn"
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
</template>

<style scoped lang="scss">
.action-wrapper {
  display: flex;

  .spacing {
    flex: 1;
  }

  .go-to-configure-btn {
    margin-left: 8px;
  }

  .rebuild-btn {
    margin-left: 8px;
  }
}
</style>
