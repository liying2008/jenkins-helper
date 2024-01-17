<script lang="ts" setup>
import { computed, ref, watch } from 'vue'
import type { FormInst } from 'naive-ui'
import type { FormRules } from 'naive-ui/es/form/src/interface'
import { t } from '~/libs/extension'

interface Props {
  show: boolean
  title: string
  positiveText?: string
  negativeText?: string
  label?: string
  placeholder?: string
  inputType?: string
  style?: Record<string, unknown>
  rules?: FormRules
}

const props = withDefaults(defineProps<Props>(), {
  positiveText: t('ok'),
  negativeText: t('cancel'),
  label: '',
  placeholder: '',
  inputType: 'text',
  style: () => ({}),
  rules: () => ({}),
})

const emit = defineEmits<{
  (e: 'visibleUpdate', value: boolean): void
  (e: 'submit', value: string, validation: boolean): void
  (e: 'cancel'): void
}>()

const modalVisible = computed({
  get() {
    return props.show
  },
  set(newVal) {
    emit('visibleUpdate', newVal)
  },
})

// 为了解决 NInput type 类型不匹配的问题
const _inputType = computed(() => {
  return props.inputType as any
})

const promptModalFormRef = ref<FormInst>()
const formValue = ref({
  value: '',
})

watch(modalVisible, (newVal: boolean) => {
  if (newVal) {
    // modal dialog 打开时，清空表单数据，重置表单验证状态
    promptModalFormRef.value?.restoreValidation()
    formValue.value.value = ''
  }
})

async function submit() {
  try {
    await promptModalFormRef.value!.validate()
    emit('submit', formValue.value.value, true)
  } catch (e: unknown) {
    console.log('validate error', e)
    emit('submit', formValue.value.value, false)
  }
  // 返回 false 可以阻止模态框关闭
  return false
}

function cancel() {
  // modalVisible.value = false
  emit('cancel')
}
</script>

<template>
  <n-modal
    v-model:show="modalVisible"
    class="prompt-modal"
    preset="dialog"
    :title="title"
    :positive-text="positiveText"
    :negative-text="negativeText"
    :style="style"
    type="info"
    :close-on-esc="false"
    :mask-closable="false"
    @positive-click="submit"
    @negative-click="cancel"
    @close="cancel"
  >
    <n-form
      ref="promptModalFormRef"
      label-width="auto"
      :model="formValue"
      :rules="rules"
    >
      <n-form-item
        :label="label"
        path="value"
      >
        <n-input
          v-model:value="formValue.value"
          :placeholder="placeholder"
          :type="_inputType"
        />
      </n-form-item>
    </n-form>
  </n-modal>
</template>

<style lang="scss">
.creation-modal {
}
</style>
