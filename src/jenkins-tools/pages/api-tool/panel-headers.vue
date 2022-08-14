<script lang="ts" setup>
import { CloseCircleOutline } from '@vicons/ionicons5'
import type { DataTableColumns } from 'naive-ui'
import { NButton, NCheckbox, NIcon, NInput } from 'naive-ui'
import { h, ref, watch } from 'vue'
import { Header } from './models'

// eslint-disable-next-line func-call-spacing
const emit = defineEmits<{
  (e: 'headersChanged', value: Header[]): void
}>()

const headers = ref<Header[]>([new Header()])

const columns: DataTableColumns<Header> = [
  {
    title: '',
    key: 'enabled',
    render(row, index) {
      return h(NCheckbox, {
        checked: row.enabled,
        class: 'parameter-enabled-cb',
        onUpdateChecked(v) {
          headers.value[index].enabled = v
        },
      })
    },
  },
  {
    title: 'Name',
    key: 'name',
    render(row, index) {
      return h(NInput, {
        value: row.name,
        placeholder: 'Name',
        disabled: !row.enabled && index !== headers.value.length - 1,
        onUpdateValue(v) {
          headers.value[index].name = v
        },
      })
    },
  },
  {
    title: 'Value',
    key: 'value',
    render(row, index) {
      return h(NInput, {
        value: row.value,
        placeholder: 'Value',
        disabled: !row.enabled && index !== headers.value.length - 1,
        onUpdateValue(v) {
          headers.value[index].value = v
        },
      })
    },
  },
  {
    title: 'Action',
    key: 'actions',
    render(row, index) {
      if (index !== headers.value.length - 1) {
        return h(
          NButton,
          {
            text: true,
            title: 'Remove this header',

            class: 'parameter-remove-btn',
            onClick: () => deleteHeader(index),
          },
          { default: () => h(NIcon, { component: CloseCircleOutline }) },
        )
      }
    },
  },
]

watch(headers, () => {
  console.log('0-headers', headers.value)

  const headersLength = headers.value.length
  // 判断最后一个条目是否为空，不为空则添加一个空条目
  const lastItem = headers.value[headersLength - 1]
  if (lastItem.name !== '' || lastItem.value !== '') {
    if (lastItem.initialState) {
      headers.value[headersLength - 1].enabled = true
      headers.value[headersLength - 1].initialState = false
    }
    headers.value.push(new Header())
  }
  console.log('1-headers', headers.value)
  // 根据当前Header列表生成实际使用的Header
  updateActualHeaders()
}, { deep: true })

function updateActualHeaders() {
  const actualHeaders = headers.value.filter((item: Header) => item.enabled)
  emit('headersChanged', actualHeaders)
}

/**
 * 删除指定位置的请求头
 *
 * @param index 请求头位置
 */
function deleteHeader(index: number) {
  headers.value.splice(index, 1)
}
</script>

<template>
  <div id="api-tool-panel-headers">
    <n-data-table
      :columns="columns"
      :data="headers"
    />
  </div>
</template>

<style lang="scss">
#api-tool-panel-headers {
}
</style>
