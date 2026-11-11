<!-- Popup 和 ContentScripts 共用组件，不要依赖 unocss、store、router 和 不支持的API -->
<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  description: string | null
}

const props = defineProps<Props>()

const isHtml = computed(() => {
  if (!props.description) {
    return false
  }
  if (props.description.includes('</') && props.description.includes('>')) {
    return true
  } else if (props.description.includes('<br>')
    || props.description.includes('<br/>')
    || props.description.includes('<br />')
    || props.description.includes('<hr>')
    || props.description.includes('<hr/>')
    || props.description.includes('<hr />')
    || props.description.includes('<img ')
    || props.description.includes('<source ')) {
    return true
  } else {
    return false
  }
})
</script>

<template>
  <n-card class="description-block">
    <div
      v-if="props.description"
      class="description-content"
    >
      <div
        v-if="isHtml"
        v-html="description"
      ></div>
      <div
        v-else
        class="text-content"
        v-text="description"
      ></div>
    </div>
  </n-card>
</template>

<style lang="scss" scoped>
.description-block {
  padding: 4px 10px;

  :deep(.n-card-content) {
    padding: 0 !important;
  }

  .description-content {
    font-size: 12px;

    .text-content {
      word-break: break-all;
      overflow-wrap: break-word;
      white-space: pre-wrap;
    }
  }
}
</style>
