<script lang="ts" setup>
import { darkTheme, lightTheme } from 'naive-ui'
import Main from './Main.vue'
import { useThemeStore } from '~/store'

const themeStore = useThemeStore()
</script>

<template>
  <n-config-provider
    :theme="themeStore.darkMode ? darkTheme : lightTheme"
    :theme-overrides="themeStore.theme"
  >
    <!-- 使用 n-global-style 组件，将主题应用到全局 -->
    <n-global-style />
    <n-dialog-provider>
      <n-message-provider>
        <n-notification-provider>
          <div
            id="app"
            class="app"
          >
            <Main />
          </div>
        </n-notification-provider>
      </n-message-provider>
    </n-dialog-provider>
  </n-config-provider>
</template>

<style lang="scss">

</style>
