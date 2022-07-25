<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  visible: boolean
}>()

// eslint-disable-next-line func-call-spacing
const emit = defineEmits<{
  (e: 'close'): void
}>()

const editableVisible = computed({
  get() {
    return props.visible
  },
  set(value: boolean) {
    if (!value) {
      emit('close')
    }
  },
})
</script>

<template>
  <n-modal v-model:show="editableVisible">
    <n-card
      style="width: 600px;"
      title="模态框"
      :bordered="false"
      size="huge"
      role="dialog"
      aria-modal="true"
    >
      <template #header-extra>
        噢！
      </template>
      内容
      <template #footer>
        尾部
      </template>
    </n-card>
  </n-modal>
</template>

<style scoped lang="scss">

</style>
