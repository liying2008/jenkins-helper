<script lang="ts" setup>
import { darkTheme, lightTheme } from 'naive-ui'
import { useMagicKeys, whenever } from '@vueuse/core'
import { onMounted } from 'vue'
import { useThemeStore } from '~/store'
import { initTheme } from '~/theme'
const themeStore = useThemeStore()
const keys = useMagicKeys()

// TODO 测试用，正式发布前删除
whenever(keys.shift_w, () => {
  // toggle dark theme
  initTheme(undefined, !themeStore.darkMode)
})

onMounted(() => {
  console.log('lifecycle: ', 'App mounted!')
})
</script>

<template>
  <n-config-provider
    style="height: 100%;"
    :theme="themeStore.darkMode ? darkTheme : lightTheme"
    :theme-overrides="themeStore.theme"
  >
    <!-- 使用 n-global-style 组件，将主题应用到全局 -->
    <n-global-style />
    <n-dialog-provider>
      <n-message-provider>
        <div
          id="app"
          class="app"
        >
          <router-view />
        </div>
      </n-message-provider>
    </n-dialog-provider>
  </n-config-provider>
</template>

<style lang="scss">
html {
  height: 100%;

  .app {
    height: 100%;
  }
}
</style>
