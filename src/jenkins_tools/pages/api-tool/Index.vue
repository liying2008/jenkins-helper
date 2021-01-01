<template>
  <div id="api-tool-wrapper">
    <v-container>
      <div class="mx-auto mt-2">
        <form>
          <v-row align="center">
            <div class="d-flex full-width">
              <v-select
                v-model="httpMetod"
                dense
                hide-details
                :items="httpMethods"
                label="Method"
                solo
                class="method-select ml-4"
              ></v-select>

              <v-text-field
                v-model="url"
                dense
                label="Request URL"
                placeholder="Enter request URL"
                hide-details
                outlined
                class="full-width ml-6"
                @input="urlChange"
              ></v-text-field>

              <v-btn
                class="text-capitalize mx-6"
                :loading="false"
                :disabled="false"
                color="primary"
                @click="send"
              >
                Send
              </v-btn>
            </div>
          </v-row>
          <v-row>
            <v-tabs
              v-model="configTab"
              show-arrows
              class="mt-4 mx-4"
            >
              <v-tab class="text-capitalize">
                Query Params
              </v-tab>
              <v-tab class="text-capitalize">
                Authorization
              </v-tab>
              <v-tab class="text-capitalize">
                Headers
              </v-tab>
              <v-tab class="text-capitalize">
                Body
              </v-tab>
            </v-tabs>
            <v-tabs-slider color="yellow"></v-tabs-slider>
            <v-tabs-items
              v-model="configTab"
              class="full-width"
            >
              <v-tab-item>
                <PanelParams
                  :params="queryParams"
                  @params-changed="queryParamsChanged"
                />
              </v-tab-item>
              <v-tab-item>
                <PanelAuthorization />
              </v-tab-item>
              <v-tab-item>
                <PanelHeaders />
              </v-tab-item>
              <v-tab-item>
                <PanelBody />
              </v-tab-item>
            </v-tabs-items>
          </v-row>
        </form>
      </div>
      <v-snackbar
        v-model="snackbar.show"
        :color="snackbar.color"
      >
        {{ snackbar.message }}

        <template v-slot:action="{ attrs }">
          <v-btn
            text
            v-bind="attrs"
            @click="snackbar.show = false"
          >
            {{ strings.close }}
          </v-btn>
        </template>
      </v-snackbar>
    </v-container>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Watch } from 'vue-property-decorator'
import { MessageColor } from '@/models/message'
import PanelParams from './panel-params.vue'
import PanelAuthorization from './panel-authorization.vue'
import PanelHeaders from './panel-headers.vue'
import PanelBody from './panel-body.vue'
import { QueryParam } from './models'


const HTTP_METHOD_GET = 'GET'
const HTTP_METHOD_POST = 'POST'
const HTTP_METHOD_PUT = 'PUT'
const HTTP_METHOD_DELETE = 'DELETE'

@Component({
  components: {
    PanelParams,
    PanelAuthorization,
    PanelHeaders,
    PanelBody,
  }
})
export default class Index extends Vue {
  strings = {
  }
  httpMethods = [HTTP_METHOD_GET, HTTP_METHOD_POST, HTTP_METHOD_PUT, HTTP_METHOD_DELETE]
  httpMetod = HTTP_METHOD_GET
  url = ''
  configTab = ''
  queryParams: QueryParam[] = [new QueryParam()]

  snackbar = {
    show: false,
    message: '',
    color: MessageColor.Success,
  }

  urlChange(url: string) {
    console.log('urlChanged::url', url)
    // TODO 需要根据现有的queryParams进行修改，不能直接替换
    const sepIndex = url.indexOf('?')
    if (sepIndex === -1 || sepIndex === url.length - 1) {
      this.queryParams = [new QueryParam()]
      return
    }
    const queryParams = []
    const paramsStr = url.substring(sepIndex + 1)
    const paramsArray = paramsStr.split('&')
    for (const paramStr of paramsArray) {
      const kv = paramStr.split('=')
      if (kv.length === 1) {
        queryParams.push({
          key: kv[0],
          value: '',
          enable: true,
          initialState: false,
        })
      } else if (kv.length === 2) {
        queryParams.push({
          key: kv[0],
          value: kv[1],
          enable: true,
          initialState: false,
        })
      }
    }
    queryParams.push(new QueryParam())
    this.queryParams = queryParams

  }

  queryParamsChanged(newParams: QueryParam[]) {
    // console.log('queryParamsChanged::newParams', newParams)
    this.queryParams = newParams
    // 修改url
    this.updateUrlDisplay()
  }

  updateUrlDisplay() {
    const sepIndex = this.url.indexOf('?')
    let newUrl = ''
    if (sepIndex === -1) {
      newUrl = this.url
    } else {
      newUrl = this.url.substring(0, sepIndex)
    }

    let isFirstParam = true
    this.queryParams.forEach((item: QueryParam) => {
      if (!item.enable) return
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
    this.url = newUrl
  }

  send() {
    console.log('send')
  }
}
</script>

<style lang="scss">
#api-tool-wrapper {
  .full-width {
    width: 100%;
  }
  .method-select {
    width: 158px;
  }
}
</style>
