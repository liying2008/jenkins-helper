<script lang="ts" setup>
import { computed, ref, watch } from 'vue'
import type { FormInst, FormItemRule, FormRules } from 'naive-ui'
import { useMessage } from 'naive-ui'
import { StorageService } from '~/libs/storage'
import { t } from '~/libs/extension'

const props = defineProps<{
  show: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const strings = {
  ok: t('ok'),
  cancel: t('cancel'),
  createMonitoringTaskTitle: t('createMonitoringTaskTitle'),
  url: t('url'),
  inputUrlLabel: t('inputUrlLabel'),
  inputUrlPlaceholder: t('inputUrlPlaceholder'),
  urlCannotEmpty: t('urlCannotEmpty'),
  urlInvalid: t('urlInvalid'),
  addMonitorUrlTip: t('addMonitorUrlTip'),
}
const message = useMessage()

const modalVisible = computed({
  get() {
    return props.show
  },
  set(newVal) {
    if (!newVal) {
      emit('close')
    }
  },
})

const formRef = ref<FormInst>()
const formValue = ref({
  inputUrlValue: '',
})

const rules: FormRules = {
  inputUrlValue: [
    {
      required: true,
      validator(rule: FormItemRule, value: string) {
        if (!value) {
          // 不能为空
          return new Error(strings.urlCannotEmpty)
        } else {
          const expression = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/
          const regex = new RegExp(expression)
          if (!regex.test(value)) {
            // 需要是一个合法的URL
            return new Error(strings.urlInvalid)
          }
        }
        return true
      },
      trigger: ['input', 'blur'],
    },
  ],
}

watch(modalVisible, (newVal: boolean) => {
  if (newVal) {
    // modal dialog 打开时，清空表单数据，重置表单验证状态
    formRef.value?.restoreValidation()
    formValue.value.inputUrlValue = ''
  }
})

/**
 * 添加新 Jenkins URL
 */
async function addJenkinsUrl() {
  let url = formValue.value.inputUrlValue
  url = url.charAt(url.length - 1) === '/' ? url : `${url}/`
  // console.log('url', url)
  await StorageService.addJenkinsUrl(url)
  console.log('addJenkinsUrl success')
}

async function submit() {
  try {
    await formRef.value!.validate()
    // 添加 Jenkins URL
    await addJenkinsUrl()
    message.success(strings.addMonitorUrlTip)
    return true
  } catch (e: unknown) {
    console.log('validate error', e)
    return false
  }
}

function cancel() {
  modalVisible.value = false
}
</script>

<template>
  <n-modal
    v-model:show="modalVisible"
    class="creation-modal"
    preset="dialog"
    :title="strings.createMonitoringTaskTitle"
    :positive-text="strings.ok"
    :negative-text="strings.cancel"
    style="width: 80%;"
    type="info"
    @positive-click="submit"
    @negative-click="cancel"
  >
    <n-form
      ref="formRef"
      :label-width="80"
      :model="formValue"
      :rules="rules"
    >
      <n-form-item
        :label="strings.inputUrlLabel"
        path="inputUrlValue"
      >
        <n-input
          v-model:value="formValue.inputUrlValue"
          :placeholder="strings.inputUrlPlaceholder"
        />
      </n-form-item>
    </n-form>
  </n-modal>
</template>

<style lang="scss">
.creation-modal {
}
</style>
