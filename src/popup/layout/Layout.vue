<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { StorageService } from '~/libs/storage'
import type { Options, PopupTab } from '~/models/option'
import { defaultOptionsValue } from '~/models/option'

const router = useRouter()
const route = useRoute()

const strings = {
  extName: browser.i18n.getMessage('extName'),
  monitor: browser.i18n.getMessage('monitor'),
  params: browser.i18n.getMessage('params'),
  computer: browser.i18n.getMessage('computer'),
}

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
    browser.runtime.openOptionsPage() // Chrome 42+, Firefox 48
  } else {
    browser.tabs.create({ url: browser.runtime.getURL('options.html') })
  }
}

function openJobList() {
  browser.windows.create({
    url: 'job_stats.html',
    type: 'popup',
    width: 1200,
    height: 800,
  }).then((window) => {
    // console.log('window', window)
  })
}

function openTools() {
  browser.tabs.create({
    url: 'jenkins_tools.html',
  }).then((tab) => {
    // console.log('tab', tab)
  })
}
</script>

<template>
  <v-app class="layout-wrapper">
    <div>
      <v-toolbar
        color="primary"
        dark
        flat
      >
        <!-- <v-app-bar-nav-icon></v-app-bar-nav-icon> -->

        <v-toolbar-title>{{ strings.extName }}</v-toolbar-title>

        <v-spacer></v-spacer>

        <v-btn
          icon
          title="Open job statistics page"
          @click="openJobList"
        >
          <!-- <v-icon>{{ mdiViewList }}</v-icon> -->
          <v-icon>mdi-view-list</v-icon>
        </v-btn>

        <v-btn
          v-if="false"
          icon
          title="Open Jenkins tools page"
          @click="openTools"
        >
          <v-icon>mdi-toolbox</v-icon>
        </v-btn>

        <v-btn
          icon
          title="Open options page"
          @click="openOptions"
        >
          <v-icon>mdi-cog</v-icon>
        </v-btn>

        <template #extension>
          <v-tabs
            v-model="activeTab"
            show-arrows
            dark
            color="white"
            align-with-title
          >
            <!-- Vuetify 3 删除了 v-tabs-slider -->
            <!-- <v-tabs-slider color="yellow"></v-tabs-slider> -->

            <v-tab to="/monitor">
              {{ strings.monitor }}
            </v-tab>
            <v-tab to="/params">
              {{ strings.params }}
            </v-tab>
            <v-tab to="/computer">
              {{ strings.computer }}
            </v-tab>
          </v-tabs>
        </template>
      </v-toolbar>
      <v-main>
        <v-container
          fluid
          class="py-0"
        >
          <router-view :key="$route.fullPath" />
        </v-container>
      </v-main>
    </div>
  </v-app>
</template>


<style lang="scss">
.layout-wrapper {
  .v-application--wrap {
    min-height: inherit;
  }
}
</style>
