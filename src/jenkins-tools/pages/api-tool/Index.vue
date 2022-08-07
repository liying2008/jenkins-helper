<script lang="ts" setup>
import { ref } from 'vue'
import PanelParams from './panel-params.vue'
import PanelAuthorization from './panel-authorization.vue'
import PanelHeaders from './panel-headers.vue'
import PanelBody from './panel-body.vue'
import type { Header } from './models'
import { AuthorizationEntity } from './models'
import { t } from '~/libs/extension'


const HTTP_METHOD_GET = 'GET'
const HTTP_METHOD_POST = 'POST'
const HTTP_METHOD_PUT = 'PUT'
const HTTP_METHOD_DELETE = 'DELETE'

const strings = {
  close: t('close'),
}
const httpMethods = [HTTP_METHOD_GET, HTTP_METHOD_POST, HTTP_METHOD_PUT, HTTP_METHOD_DELETE]
const httpMetod = HTTP_METHOD_GET
const url = ref('')
const configTab = ref('')
const authorizationEntity = ref(new AuthorizationEntity())
const headers = ref<Header[]>([])

// const snackbar = SnackbarData.empty()

function urlChanged(newUrl: string) {
  // console.log('urlChanged::newUrl', newUrl)
  url.value = newUrl
}

function authorizationChanged(newAuthorizationEntity: AuthorizationEntity) {
  // console.log('authorizationChanged::newAuthorizationEntity', newAuthorizationEntity)
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
            <v-tabs-slider></v-tabs-slider>
            <v-tabs-items
              v-model="configTab"
              class="full-width"
            >
              <v-tab-item>
                <PanelParams
                  :url="url"
                  @url-changed="urlChanged"
                />
              </v-tab-item>
              <v-tab-item>
                <PanelAuthorization
                  :authorization-entity="authorizationEntity"
                  @authorization-changed="authorizationChanged"
                />
              </v-tab-item>
              <v-tab-item>
                <PanelHeaders @headers-changed="headersChanged" />
              </v-tab-item>
              <v-tab-item>
                <PanelBody />
              </v-tab-item>
            </v-tabs-items>
          </v-row>
        </form>
      </div>
    </v-container>
  </div>
</template>

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
