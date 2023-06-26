<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Briefcase, Leaf, Options as OptionsIcon } from '@vicons/ionicons5'
import MonitorPage from '../pages/monitor/Index.vue'
import ParamsPage from '../pages/params/Index.vue'
import ComputerPage from '../pages/computer/Index.vue'
import { StorageService } from '~/libs/storage'
import type { PopupTab } from '~/models/option'
import { Options } from '~/models/option'
import jenkinsIcon from '~/assets/img/icon128.png'
import { t } from '~/libs/extension'

const router = useRouter()
const route = useRoute()

const strings = {
  extName: t('extName'),
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
  if (browser.runtime.openOptionsPage) {
    browser.runtime.openOptionsPage()
  } else {
    browser.tabs.create({ url: browser.runtime.getURL('options.html') })
  }
}

function openJobList() {
  browser.windows.create({
    url: 'job-stats.html',
    type: 'popup',
    width: 1200,
    height: 800,
  }).then((window) => {
    // console.log('window', window)
  })
}

function openTools() {
  browser.tabs.create({
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
            class="header-icon"
            title="Open job statistics page"
            @click="openJobList"
          >
            <n-icon><Leaf /></n-icon>
          </n-button>

          <n-button
            text
            class="header-icon"
            title="Open Jenkins tools page"
            @click="openTools"
          >
            <n-icon><Briefcase /></n-icon>
          </n-button>

          <n-button
            text
            class="header-icon"
            title="Open options page"
            @click="openOptions"
          >
            <n-icon><OptionsIcon /></n-icon>
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

    .header-icon {
      font-size: 20px;
    }

    .header-extra {

    }
  }

  .tabs {
    margin-top: 20px;
  }
}
</style>
