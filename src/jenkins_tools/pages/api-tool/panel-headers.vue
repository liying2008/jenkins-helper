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

<script lang="ts">
import { Vue, Component, Watch } from 'vue-property-decorator'
import { Header } from './models'

@Component({
  name: 'PanelHeaders'
})
export default class PanelHeaders extends Vue {

  headers: Header[] = [new Header()]

  @Watch('headers', { deep: true })
  watchHeaders() {
    console.log('0-headers', this.headers)

    const headersLength = this.headers.length
    // 判断最后一个条目是否为空，不为空则添加一个空条目
    const lastItem = this.headers[headersLength - 1]
    if (lastItem.key !== '' || lastItem.value !== '') {
      if (lastItem.initialState) {
        this.headers[headersLength - 1].enable = true
        this.headers[headersLength - 1].initialState = false
      }
      this.headers.push(new Header())
    }
    console.log('1-headers', this.headers)
    // 根据当前Header列表生成实际使用的Header
    this.updateActualHeaders()
  }

  mounted() {
  }

  updateActualHeaders() {
    const actualHeaders = this.headers.filter((item: Header) => item.enable)
    this.$emit('headers-changed', actualHeaders)
  }

  /**
   * 删除指定位置的请求头
   *
   * @param index 请求头位置
   */
  deleteHeader(index: number) {
    this.headers.splice(index, 1)
  }

}
</script>

<style lang="scss">
#api-tool-panel-headers {
  .header-enable-cb {
    margin-top: 4px;
  }
}
</style>
