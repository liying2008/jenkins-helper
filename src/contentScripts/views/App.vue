<script lang="ts" setup>
import '~/styles/naive-ui-overrides.scss'
import '~/styles/common.scss'
import { lightTheme } from 'naive-ui'
import Main from './Main.vue'
import { defaultTheme } from '~/theme/theme_default'
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
