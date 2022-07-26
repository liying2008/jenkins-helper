<script lang="ts" setup>
// import 'virtual:windi.css'
import Main from './Main.vue'
</script>

<template>
  <n-config-provider preflight-style-disabled>
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
