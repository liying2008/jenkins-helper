<script lang="ts" setup>
import { ref } from 'vue'
import type { SelectMixedOption } from 'naive-ui/es/select/src/interface'
import PanelParams from './panel-params.vue'
import PanelAuthorization from './panel-authorization.vue'
import PanelHeaders from './panel-headers.vue'
import PanelBody from './panel-body.vue'
import type { Header } from './models'
import { AuthorizationEntity } from './models'


const HTTP_METHOD_GET = 'GET'
const HTTP_METHOD_POST = 'POST'
const HTTP_METHOD_PUT = 'PUT'
const HTTP_METHOD_DELETE = 'DELETE'

const httpMethods: SelectMixedOption[] = [
  {
    label: HTTP_METHOD_GET,
    value: HTTP_METHOD_GET,
  },
  {
    label: HTTP_METHOD_POST,
    value: HTTP_METHOD_POST,
  },
  {
    label: HTTP_METHOD_PUT,
    value: HTTP_METHOD_PUT,
  },
  {
    label: HTTP_METHOD_DELETE,
    value: HTTP_METHOD_DELETE,
  },
]
const httpMetod = HTTP_METHOD_GET
const url = ref('')
const triggeredByParamsPanel = ref(false)
const tabs = ['Query Params', 'Authorization', 'Headers', 'Body']
const configTab = ref(tabs[0])
const authorizationEntity = ref(new AuthorizationEntity())
const headers = ref<Header[]>([])

function urlChanged(newUrl: string) {
  console.log('urlChanged::newUrl', newUrl)
  triggeredByParamsPanel.value = true
  url.value = newUrl
}

function urlChangedBySelf(newUrl: string) {
  console.log('urlChangedBySelf::newUrl', newUrl)
  triggeredByParamsPanel.value = false
  url.value = newUrl
}

function authorizationChanged(newAuthorizationEntity: AuthorizationEntity) {
  console.log('authorizationChanged::newAuthorizationEntity', newAuthorizationEntity)
  authorizationEntity.value = newAuthorizationEntity
}

function headersChanged(newHeaders: Header[]) {
  console.log('headersChanged::newHeaders', newHeaders)
  headers.value = newHeaders
}
function send() {
  console.log('send')
}
</script>

<template>
  <div id="api-tool-wrapper">
    <div style="display: flex;">
      <n-select
        v-model:value="httpMetod"
        :options="httpMethods"
        style="width: 100px;"
      />
      <n-input
        v-model:value="url"
        :input-props="{ type: 'url' }"
        placeholder="Enter request URL"
        style="flex: 1;margin-right: 16px; margin-left: 8px;"
        @update:value="urlChangedBySelf"
      />
      <n-button
        type="primary"
        :loading="false"
        :disabled="false"
        style="width: 100px;"
        @click="send"
      >
        Send
      </n-button>
    </div>
    <div style="margin-top: 10px;">
      <n-tabs
        v-model:value="configTab"
        type="line"
      >
        <n-tab-pane
          :name="tabs[0]"
          :tab="tabs[0]"
        >
          <PanelParams
            :url="url"
            :triggered-by-self="triggeredByParamsPanel"
            @url-changed="urlChanged"
          />
        </n-tab-pane>
        <n-tab-pane
          :name="tabs[1]"
          :tab="tabs[1]"
        >
          <PanelAuthorization @authorization-changed="authorizationChanged" />
        </n-tab-pane>
        <n-tab-pane
          :name="tabs[2]"
          :tab="tabs[2]"
        >
          <PanelHeaders @headers-changed="headersChanged" />
        </n-tab-pane>
        <n-tab-pane
          :name="tabs[3]"
          :tab="tabs[3]"
        >
          <PanelBody />
        </n-tab-pane>
      </n-tabs>
    </div>
  </div>
</template>

<style lang="scss">
#api-tool-wrapper {
  padding: 24px;
}
</style>
