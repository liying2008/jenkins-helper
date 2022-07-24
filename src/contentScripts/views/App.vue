<script lang="ts" setup>
import 'virtual:windi.css'
</script>

<template>
  <n-config-provider>
    <!-- 使用 n-global-style 组件，将主题应用到全局 -->
    <n-global-style />
    <n-dialog-provider>
      <n-message-provider>
        <div class="wrapper">
          <n-button
            strong
            secondary
            type="info"
          >
            Info
          </n-button>
        </div>
      </n-message-provider>
    </n-dialog-provider>
  </n-config-provider>
</template>

<style lang="scss" scoped>
.wrapper {
  position: fixed;
  right: 0;
  bottom: 10px;
  z-index: 100;
  display: flex;
  margin: 20px;
  user-select: none;
}
</style>
