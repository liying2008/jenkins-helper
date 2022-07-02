<script lang="ts" setup>
import { darkTheme, lightTheme } from 'naive-ui'
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
.app {
  /*设置 min-width 之后，Firefox上会有横向滚动条*/
  /*min-width: 700;*/
  width: 700px;
  margin: auto;
}
</style>
