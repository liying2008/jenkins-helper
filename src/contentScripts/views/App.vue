<script lang="ts" setup>
import 'virtual:windi.css'
import Main from './Main.vue'
import { useMoveStyle } from '~/contentScripts/hooks/move-style/useMoveStyle'

useMoveStyle()
</script>

<template>
  <n-config-provider>
    <!-- 使用 n-global-style 组件，将主题应用到全局 -->
    <n-global-style />
    <n-dialog-provider>
      <n-message-provider>
        <Main />
      </n-message-provider>
    </n-dialog-provider>
  </n-config-provider>
</template>
