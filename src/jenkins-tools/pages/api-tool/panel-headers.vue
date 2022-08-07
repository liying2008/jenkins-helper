<script lang="ts" setup>
import { ref, watch } from 'vue'
import { Header } from './models'

// eslint-disable-next-line func-call-spacing
const emit = defineEmits<{
  (e: 'headersChanged', value: Header[]): void
}>()

const headers = ref<Header[]>([new Header()])


watch(headers, () => {
  console.log('0-headers', headers.value)

  const headersLength = headers.value.length
  // 判断最后一个条目是否为空，不为空则添加一个空条目
  const lastItem = headers.value[headersLength - 1]
  if (lastItem.key !== '' || lastItem.value !== '') {
    if (lastItem.initialState) {
      headers.value[headersLength - 1].enable = true
      headers.value[headersLength - 1].initialState = false
    }
    headers.value.push(new Header())
  }
  console.log('1-headers', headers.value)
  // 根据当前Header列表生成实际使用的Header
  updateActualHeaders()
})

function updateActualHeaders() {
  const actualHeaders = headers.value.filter((item: Header) => item.enable)
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
        v-for="(header, index) in headers"
        :key="index"
        class="mt-2"
      >
        <v-col cols="3">
          <div class="d-flex">
            <v-checkbox
              v-model="header.enable"
              dense
              hide-details
              class="header-enable-cb"
            ></v-checkbox>
            <v-text-field
              v-model="header.key"
              dense
              hide-details
              :disabled="!header.enable && index !== headers.length - 1"
              placeholder="Key"
            ></v-text-field>
          </div>
        </v-col>
        <v-col cols="8">
          <v-text-field
            v-model="header.value"
            dense
            hide-details
            :disabled="!header.enable && index !== headers.length - 1"
            placeholder="Value"
          ></v-text-field>
        </v-col>
        <v-col cols="1">
          <v-btn
            v-if="index !== headers.length - 1"
            dense
            icon
            title="Remove this header"
            x-small
            class="header-remove-btn"
            color="grey"
            @click="deleteHeader(index)"
          >
            <v-icon>mdi-close-circle-outline</v-icon>
          </v-btn>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<style lang="scss">
#api-tool-panel-headers {
  .header-enable-cb {
    margin-top: 4px;
  }
}
</style>
