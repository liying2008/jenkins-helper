<script lang="ts" setup>
import type { PopupTab } from '~/models/option'
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import jenkinsIcon from '~/assets/img/icon128.png'
import { t } from '~/libs/extension'
import { StorageService } from '~/libs/storage'
import { Options } from '~/models/option'
import ComputerPage from '../pages/computer/Index.vue'
import MonitorPage from '../pages/monitor/Index.vue'
import ParamsPage from '../pages/params/Index.vue'

const router = useRouter()
const route = useRoute()

const strings = {
  extName: t('extName'),
  jobStatisticsTitle: t('jobStatisticsTitle'),
  tools: t('tools'),
  options: t('options'),
  monitor: t('monitor'),
  params: t('params'),
  computer: t('computer'),
}

const defaultOptionsValue = Options.default()

const defaultTab = defaultOptionsValue.defaultTab
const activeTab = ref(defaultTab)
const allowTabs: PopupTab[] = ['monitor', 'params', 'computer']

function initData() {
  StorageService.getOptions().then((option: Options) => {
    // 设置默认激活页面
    if (option.defaultTab && allowTabs.includes(option.defaultTab)) {
      activeTab.value = option.defaultTab
    } else {
      activeTab.value = defaultTab
    }
    router.replace(activeTab.value)
  })
}

initData()

onMounted(() => {
  console.log('popup::fullPath', route.fullPath)
})

function openOptions() {
  if (chrome.runtime.openOptionsPage) {
    chrome.runtime.openOptionsPage()
  } else {
    chrome.tabs.create({ url: chrome.runtime.getURL('options.html') })
  }
}

function openJobList() {
  chrome.windows.create({
    url: 'job-stats.html',
    type: 'popup',
    width: 1200,
    height: 800,
  }).then((window) => {
    // console.log('window', window)
  })
}

function openTools() {
  chrome.tabs.create({
    url: 'jenkins-tools.html',
  }).then((tab) => {
    // console.log('tab', tab)
  })
}
</script>

<template>
  <div class="layout-wrapper">
    <n-page-header class="page-header">
      <template #title>
        <div>{{ strings.extName }}</div>
      </template>
      <template #avatar>
        <n-avatar
          :src="jenkinsIcon"
          class="ext-avatar"
        />
      </template>
      <template #extra>
        <n-space class="header-extra">
          <n-button
            text
            type="primary"
            title="Open job statistics page"
            @click="openJobList"
          >
            {{ strings.jobStatisticsTitle }}
          </n-button>
          <n-divider vertical />
          <n-button
            text
            type="primary"
            title="Open Jenkins tools page"
            @click="openTools"
          >
            {{ strings.tools }}
          </n-button>
          <n-divider vertical />
          <n-button
            text
            type="primary"
            title="Open options page"
            @click="openOptions"
          >
            {{ strings.options }}
          </n-button>
        </n-space>
      </template>
    </n-page-header>
    <n-tabs
      class="tabs"
      :default-value="activeTab"
      animated
      type="segment"
    >
      <n-tab-pane
        name="monitor"
        :tab="strings.monitor"
      >
        <MonitorPage />
      </n-tab-pane>
      <n-tab-pane
        name="params"
        :tab="strings.params"
      >
        <ParamsPage />
      </n-tab-pane>
      <n-tab-pane
        name="computer"
        :tab="strings.computer"
      >
        <ComputerPage />
      </n-tab-pane>
    </n-tabs>
  </div>
</template>

<style lang="scss">
.layout-wrapper {
  margin: 20px;

  .page-header {
    .ext-avatar {
      background-color: inherit;
    }

    .header-extra {
      gap: 4px !important;
    }
  }

  .tabs {
    margin-top: 20px;
  }
}
</style>
