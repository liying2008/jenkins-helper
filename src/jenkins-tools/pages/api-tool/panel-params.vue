<script lang="ts" setup>
import { CloseCircleOutline } from '@vicons/ionicons5'
import type { DataTableColumns } from 'naive-ui'
import { NButton, NCheckbox, NIcon, NInput } from 'naive-ui'
import { computed, h, ref, watch } from 'vue'
import { QueryParam } from './models'

const props = defineProps<{
  url: string
  triggeredBySelf: boolean
}>()

// eslint-disable-next-line func-call-spacing
const emit = defineEmits<{
  (e: 'urlChanged', value: string): void
}>()


const editableUrl = computed({
  get() {
    return props.url
  },
  set(newVal) {
    // TODO
  },
})

const params = ref<QueryParam[]>([new QueryParam()])
const endWithEqualSign = ref(false) // url 参数部分末尾是否是 =

const createColumns = (): DataTableColumns<QueryParam> => [
  {
    title: '',
    key: 'enabled',
    render(row, index) {
      return h(NCheckbox, {
        checked: row.enabled,
        class: 'parameter-enabled-cb',
        onUpdateChecked(v) {
          params.value[index].enabled = v
        },
      })
    },
  },
  {
    title: 'Key',
    key: 'key',
    render(row, index) {
      return h(NInput, {
        value: row.key,
        placeholder: 'Key',
        disabled: !row.enabled && index !== params.value.length - 1,
        onUpdateValue(v) {
          params.value[index].key = v
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
        disabled: !row.enabled && index !== params.value.length - 1,
        onUpdateValue(v) {
          params.value[index].value = v
        },
      })
    },
  },
  {
    title: 'Action',
    key: 'actions',
    render(row, index) {
      if (index !== params.value.length - 1) {
        return h(
          NButton,
          {
            text: true,
            title: 'Remove this parameter',

            class: 'parameter-remove-btn',
            onClick: () => deleteParam(index),
          },
          { default: () => h(NIcon, { component: CloseCircleOutline }) },
        )
      }
    },
  },
]

watch(editableUrl, (url) => {
  console.log('watchUrl::url', url, 'triggeredBySelf', props.triggeredBySelf)
  if (props.triggeredBySelf) {
    return
  }
  const queryParams: QueryParam[] = []
  const sepIndex = url.indexOf('?')
  if (sepIndex === -1 || sepIndex === url.length - 1) {
    // url 没有参数，nothing to do
  } else {
    if (url[url.length - 1] === '=') {
      console.log('watchUrl::endWithEqualSign', true)
      endWithEqualSign.value = true
      // 去掉末尾的 =
      url = url.substring(0, url.length - 1)
    } else {
      console.log('watchUrl::endWithEqualSign', false)
      endWithEqualSign.value = false
    }
    const paramsStr = url.substring(sepIndex + 1)
    const paramsArray = paramsStr.split('&')
    for (const paramStr of paramsArray) {
      const equalSignIndex = paramStr.indexOf('=')
      if (equalSignIndex === -1) {
        queryParams.push({
          key: paramStr,
          value: '',
          enabled: true,
          initialState: false,
        })
      } else if (equalSignIndex === paramStr.length - 1) {
        queryParams.push({
          key: paramStr.substring(0, paramStr.length - 1),
          value: '',
          enabled: true,
          initialState: false,
        })
      } else {
        queryParams.push({
          key: paramStr.substring(0, equalSignIndex),
          value: paramStr.substring(equalSignIndex + 1),
          enabled: true,
          initialState: false,
        })
      }
    }
  }

  console.log('watchUrl::oldParams', params.value.slice(0))
  console.log('watchUrl::queryParams', queryParams.slice(0))
  // 根据 queryParams 修改 this.params
  const newParams: QueryParam[] = []

  const oldParamsLength = params.value.length
  params.value.forEach((item: QueryParam, index: number) => {
    if (index === oldParamsLength - 1) {
      return
    }
    const curKey = item.key
    if (item.enabled) {
      const { matchedItem, matchedIndex } = getItemAndIndex(curKey, item.value, queryParams)
      console.log('watchUrl::matchedItem', matchedItem)
      console.log('watchUrl::matchedIndex', matchedIndex)
      if (matchedIndex !== -1) {
        queryParams.splice(matchedIndex, 1)
        newParams.push({
          key: curKey,
          value: matchedItem!.value,
          enabled: true,
          initialState: false,
        })
      }
    } else {
      newParams.push(item)
    }
  })

  newParams.push(...(JSON.parse(JSON.stringify(queryParams))))
  newParams.push(new QueryParam())
  console.log('watchUrl::newParams', newParams)
  params.value = newParams
})

watch(params, () => {
  console.log('0-params', params.value)

  const paramsLength = params.value.length
  // 处理 key 和 value 中的一些特殊字符
  for (let i = 0; i < paramsLength; i++) {
    const key = params.value[i].key
    const value = params.value[i].value
    params.value[i].key = key.replaceAll('=', '%3D').replaceAll('&', '%26').replaceAll('#', '%23')
    params.value[i].value = value.replaceAll('&', '%26').replaceAll('#', '%23')
  }
  // 判断最后一个条目是否为空，不为空则添加一个空条目
  const lastItem = params.value[paramsLength - 1]
  if (lastItem.key !== '' || lastItem.value !== '') {
    if (lastItem.initialState) {
      params.value[paramsLength - 1].enabled = true
      params.value[paramsLength - 1].initialState = false
    }
    params.value.push(new QueryParam())
  }
  console.log('1-params', params.value)
  // 根据当前参数列表生成URL
  updateUrl()
}, { deep: true })


function getItemAndIndex(key: string, value: string, arr: QueryParam[]) {
  let matchedItem: QueryParam | null = null
  let matchedIndex: number = -1

  let isFullMatch = false

  for (let index = 0; index < arr.length; index++) {
    if (arr[index].key === key) {
      if (matchedIndex === -1) {
        matchedIndex = index
        matchedItem = Object.assign({}, arr[index])
        if (arr[index].value === value) {
          isFullMatch = true
          break
        }
      } else {
        if (!isFullMatch && arr[index].value === value) {
          matchedIndex = index
          matchedItem = Object.assign({}, arr[index])
          isFullMatch = true
          break
        }
      }
    }
  }
  return {
    matchedItem,
    matchedIndex,
  }
}

function updateUrl() {
  const sepIndex = editableUrl.value.indexOf('?')
  let newUrl = ''
  if (sepIndex === -1) {
    newUrl = editableUrl.value
  } else {
    newUrl = editableUrl.value.substring(0, sepIndex)
  }

  let isFirstParam = true
  params.value.forEach((item: QueryParam) => {
    if (!item.enabled) {
      return
    }
    if (isFirstParam) {
      newUrl += '?'
      isFirstParam = false
    } else {
      newUrl += '&'
    }
    if (item.key !== '' && item.value === '') {
      newUrl += `${item.key}`
    } else if (item.value !== '') {
      newUrl += `${item.key}=${item.value}`
    }
  })
  if (endWithEqualSign.value) {
    if (!newUrl.endsWith('=')) {
      newUrl += '='
    }
  } else {
    if (newUrl.endsWith('=')) {
      newUrl = newUrl.substring(0, newUrl.length - 1)
    }
  }
  console.log('newUrl', newUrl)
  if (editableUrl.value !== newUrl) {
    emit('urlChanged', newUrl)
  }
}

/**
 * 删除指定位置的参数
 *
 * @param index 参数位置
 */
function deleteParam(index: number) {
  params.value.splice(index, 1)
}
</script>

<template>
  <div id="api-tool-panel-params">
    <n-data-table
      :columns="createColumns()"
      :data="params"
    />
  </div>
</template>

<style lang="scss">
#api-tool-panel-params {
  .parameter-enabled-cb {
  }
}
</style>
