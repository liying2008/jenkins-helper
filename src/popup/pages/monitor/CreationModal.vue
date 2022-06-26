<script lang="ts" setup>
import { computed, ref } from 'vue'
import type { FormInst } from 'naive-ui'
import { useMessage } from 'naive-ui'

const props = defineProps<{
  show: boolean
}>()

// eslint-disable-next-line func-call-spacing
const emit = defineEmits<{
  (e: 'visibleUpdate', value: boolean): void
}>()

const strings = {
  noFilterValue: '-',
  createMonitoringTaskTitle: browser.i18n.getMessage('createMonitoringTaskTitle'),
  url: browser.i18n.getMessage('url'),
  inputUrlPlaceholder: browser.i18n.getMessage('inputUrlPlaceholder'),
  showDisabledJobs: browser.i18n.getMessage('showDisabledJobs'),
  filterLabel: browser.i18n.getMessage('filterLabel'),
  urlCannotEmpty: browser.i18n.getMessage('urlCannotEmpty'),
  urlInvalid: browser.i18n.getMessage('urlInvalid'),
  addMonitorUrlTip: browser.i18n.getMessage('addMonitorUrlTip'),
  removeMonitorUrlTip: browser.i18n.getMessage('removeMonitorUrlTip'),
}
const message = useMessage()

const modalVisible = computed({
  get() {
    return props.show
  },
  set(newVal) {
    emit('visibleUpdate', newVal)
  },
})

const formRef = ref<FormInst>()
const formValue = ref({
  user: {
    name: '',
    age: '',
  },
  phone: '',
})
const rules = {
  user: {
    name: {
      required: true,
      message: '请输入姓名',
      trigger: 'blur',
    },
    age: {
      required: true,
      message: '请输入年龄',
      trigger: ['input', 'blur'],
    },
  },
  phone: {
    required: true,
    message: '请输入电话号码',
    trigger: ['input'],
  },
}

function handleValidateClick(e: MouseEvent) {
  e.preventDefault()
  formRef.value?.validate((errors) => {
    if (!errors) {
      message.success('Valid')
    } else {
      console.log(errors)
      message.error('Invalid')
    }
  })
}
</script>

<template>
  <n-modal
    v-model:show="modalVisible"
    class="creation-modal"
    preset="dialog"
    :title="strings.createMonitoringTaskTitle"
    positive-text="确认"
    negative-text="算了"
    style="width: 80%"
  >
    <!-- <template #header-extra>
        <n-button
          text
          @click="modalVisible = false"
        >
          <n-icon>
            <CloseOutline class="close-icon" />
          </n-icon>
        </n-button>
      </template> -->
    <n-form
      ref="formRef"
      inline
      :label-width="80"
      :model="formValue"
      :rules="rules"
    >
      <n-form-item
        label="姓名"
        path="user.name"
      >
        <n-input
          v-model:value="formValue.user.name"
          placeholder="输入姓名"
        />
      </n-form-item>
      <n-form-item>
        <n-button
          attr-type="button"
          @click="handleValidateClick"
        >
          验证
        </n-button>
      </n-form-item>
    </n-form>
  </n-modal>
</template>

<style lang="scss">
.creation-modal {
}
</style>
