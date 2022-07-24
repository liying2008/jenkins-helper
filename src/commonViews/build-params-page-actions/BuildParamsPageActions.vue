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
  browser.tabs.create({ url: configureUrl })
}

function rebuild() {
  browser.tabs.create({ url: `${props.buildUrl}rebuild` })
}
</script>

<template>
  <!-- Prev/Next Button & 快捷按钮 -->
  <div class="flex mt-16px">
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
</template>

<style scoped lang="scss">

</style>
