<script lang="ts" setup>
import { lightTheme } from 'naive-ui'
import { defaultTheme } from '~/theme/theme_default'
import Main from './Main.vue'
import '~/styles/naive-ui-overrides.scss'
import '~/styles/common.scss'
</script>

<template>
  <n-config-provider
    preflight-style-disabled
    :theme="lightTheme"
    :theme-overrides="defaultTheme.light"
  >
    <n-dialog-provider>
      <n-message-provider>
        <div class="app">
          <Main />
        </div>
      </n-message-provider>
    </n-dialog-provider>
  </n-config-provider>
</template>

<style scoped lang="scss">
</style>
