<script lang="ts" setup>
import { computed, ref, watch } from 'vue'
import { QueryParam } from './models'

const props = defineProps<{
  url: string
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

watch(editableUrl, (url) => {
  console.log('watchUrl::url', url)
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
          enable: true,
          initialState: false,
        })
      } else if (equalSignIndex === paramStr.length - 1) {
        queryParams.push({
          key: paramStr.substring(0, paramStr.length - 1),
          value: '',
          enable: true,
          initialState: false,
        })
      } else {
        queryParams.push({
          key: paramStr.substring(0, equalSignIndex),
          value: paramStr.substring(equalSignIndex + 1),
          enable: true,
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
    if (item.enable) {
      const { matchedItem, matchedIndex } = getItemAndIndex(curKey, item.value, queryParams)
      console.log('watchUrl::matchedItem', matchedItem)
      console.log('watchUrl::matchedIndex', matchedIndex)
      if (matchedIndex !== -1) {
        queryParams.splice(matchedIndex, 1)
        newParams.push({
          key: curKey,
          value: matchedItem!.value,
          enable: true,
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
      params.value[paramsLength - 1].enable = true
      params.value[paramsLength - 1].initialState = false
    }
    params.value.push(new QueryParam())
  }
  console.log('1-params', params.value)
  // 根据当前参数列表生成URL
  updateUrl()
})


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
    if (!item.enable) {
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
    <v-container>
      <v-row>
        <v-col cols="3">
          <div class="ml-8">
            KEY
          </div>
        </v-col>
        <v-col cols="8">
          <div>VALUE</div>
        </v-col>
        <v-col cols="1">
          <div></div>
        </v-col>
      </v-row>
      <v-row
        v-for="(param, index) in params"
        :key="index"
        class="mt-2"
      >
        <v-col cols="3">
          <div class="d-flex">
            <!-- 最后一个条目不显示checkbox的设置方法，但有性能问题，暂不使用 -->
            <!-- :style="{ visibility: index === params.length - 1 ? 'hidden': 'visible' }" -->
            <v-checkbox
              v-model="param.enable"
              dense
              hide-details
              class="parameter-enable-cb"
            ></v-checkbox>
            <v-text-field
              v-model="param.key"
              dense
              hide-details
              :disabled="!param.enable && index !== params.length - 1"
              placeholder="Key"
            ></v-text-field>
          </div>
        </v-col>
        <v-col cols="8">
          <v-text-field
            v-model="param.value"
            dense
            hide-details
            :disabled="!param.enable && index !== params.length - 1"
            placeholder="Value"
          ></v-text-field>
        </v-col>
        <v-col cols="1">
          <v-btn
            v-if="index !== params.length - 1"
            dense
            icon
            title="Remove this parameter"
            x-small
            class="parameter-remove-btn"
            color="grey"
            @click="deleteParam(index)"
          >
            <v-icon>mdi-close-circle-outline</v-icon>
          </v-btn>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<style lang="scss">
#api-tool-panel-params {
  .parameter-enable-cb {
    margin-top: 4px;
  }
}
</style>
