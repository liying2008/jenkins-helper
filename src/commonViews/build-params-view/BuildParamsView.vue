<!-- Popup 和 ContentScripts 共用组件，不要依赖 unocss、store、router 和 不支持的API -->
<script setup lang="ts">
import type { TableColumns } from 'naive-ui/es/data-table/src/interface'
import { h } from 'vue'
import type { DisplayedBuildParameter } from '~/libs/jenkins/build'

defineProps<{
  parameters: DisplayedBuildParameter[]
}>()

const headers: TableColumns<DisplayedBuildParameter> = [
  {
    title: 'Name',
    align: 'left',
    key: 'name',
    sorter: 'default',
    className: 'param-item-key',
  },
  {
    title: 'Value',
    align: 'left',
    key: 'value',
    sorter: 'default',
    className: 'param-item-value',
    render(row) {
      return h(
        'span',
        {
        },
        {
          default: () => {
            if (row.value) {
              return row.value
            } else {
              return row.hint
            }
          },
        },
      )
    },

  },
]

function rowProps(row: DisplayedBuildParameter) {
  if (!row.value) {
    return {
      class: 'param-item hidden-param-item',
    }
  } else {
    return {
      class: 'param-item',
    }
  }
}
</script>

<template>
  <n-data-table
    class="data-table"
    :columns="headers"
    :data="parameters"
    :row-props="rowProps"
    size="small"
  >
  </n-data-table>
</template>

<style lang="scss" scoped>
.data-table {
  :deep(.param-item) {
    .param-item-key {
      font-size: 12px;
      word-break: break-all;
      word-wrap: break-word;
    }

    .param-item-value {
      font-size: 12px;
      word-break: break-all;
      word-wrap: break-word;
    }
  }

  :deep(.hidden-param-item) {
    .param-item-value {
      font-style: italic;
      color: var(--jk-subtitle);
    }
  }
}
</style>
