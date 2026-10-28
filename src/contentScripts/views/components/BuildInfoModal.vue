<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import BuildInfoView from '~/commonViews/BuildInfoView.vue'
import { getRoot } from '~/contentScripts/libs/app-dom'

const props = defineProps<{
  visible: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const buildUrl = ref('')

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

watch(editableVisible, (newVal: boolean) => {
  if (newVal) {
    // Dialog 打开时，获取当前页面的构建参数
    buildUrl.value = getRoot()?.getAttribute('build-url') || ''
  }
})
</script>

<template>
  <n-modal v-model:show="editableVisible">
    <n-card
      class="modal-card"
      title="构建参数"
      :bordered="false"
      size="medium"
      role="dialog"
      closable
      preset="card"
      aria-modal="true"
      @close="editableVisible = false"
    >
      <BuildInfoView
        :build-url="buildUrl"
        :dark-mode="false"
      />
    </n-card>
  </n-modal>
</template>

<style scoped lang="scss">
.modal-card {
  max-width: min(800px, 60%);
}
</style>
