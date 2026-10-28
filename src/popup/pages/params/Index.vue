<script lang="ts" setup>
import { computed, ref } from 'vue'
import BuildInfoView from '~/commonViews/BuildInfoView.vue'
import { BrowserUtils } from '~/libs/browser'
import { JenkinsBuildUtils } from '~/libs/jenkins/build'
import { useThemeStore } from '~/store'

const buildUrl = ref('')
const themeStore = useThemeStore()

const darkMode = computed(() => {
  return themeStore.darkMode
})

// 检测是否是构建页面或其子页面
detectBuildUrl()

function detectBuildUrl() {
  BrowserUtils.getCurrentTab().then((tab: chrome.tabs.Tab | null) => {
    // console.log(tab)
    // const title = tab.title
    if (!tab) {
      console.log('tab is null!')
      return
    }
    buildUrl.value = JenkinsBuildUtils.getBuildUrlIfExist(tab.url!) || ''
  })
}
</script>

<template>
  <BuildInfoView
    :build-url="buildUrl"
    :dark-mode="darkMode"
  />
</template>
