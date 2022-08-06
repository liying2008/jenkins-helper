<script lang="ts" setup>
import { darkTheme, lightTheme } from 'naive-ui'
import { useThemeStore } from '~/store'

const themeStore = useThemeStore()
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
      <n-notification-provider>
        <n-message-provider>
          <div
            id="app"
            class="app"
          >
            <router-view />
          </div>
        </n-message-provider>
      </n-notification-provider>
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
