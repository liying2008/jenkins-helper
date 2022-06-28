<script lang="ts" setup>
</script>

<template>
  <div
    id="app"
    class="app"
  >
    <n-dialog-provider>
      <n-message-provider>
        <router-view />
      </n-message-provider>
    </n-dialog-provider>
  </div>
</template>


<style lang="scss">
.app {
  min-height: 200px;
  /*设置 min-width 之后，Firefox上会有横向滚动条*/
  /*min-width: 700;*/
  width: 700px;
  margin: auto;
  // a 链接文本颜色
  .a-link-color {
    color: var(--v-link-base);
  }
  font-family: system-ui, —apple-system, Segoe UI, Rototo, Emoji, Helvetica, Arial, sans-serif;
}
</style>
