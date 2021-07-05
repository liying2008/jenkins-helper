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
import { Vue, Component } from 'vue-property-decorator'
import { MessageColor, SnackbarData } from '@/models/message'
import PanelParams from './panel-params.vue'
import PanelAuthorization from './panel-authorization.vue'
import PanelHeaders from './panel-headers.vue'
import PanelBody from './panel-body.vue'
import { AuthorizationEntity, Header } from './models'


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
    close: browser.i18n.getMessage('close'),
  }
  httpMethods = [HTTP_METHOD_GET, HTTP_METHOD_POST, HTTP_METHOD_PUT, HTTP_METHOD_DELETE]
  httpMetod = HTTP_METHOD_GET
  url = ''
  configTab = ''
  authorizationEntity: AuthorizationEntity = new AuthorizationEntity()
  headers: Header[] = []

  snackbar = SnackbarData.empty()

  urlChanged(newUrl: string) {
    // console.log('urlChanged::newUrl', newUrl)
    this.url = newUrl
  }

  authorizationChanged(newAuthorizationEntity: AuthorizationEntity) {
    // console.log('authorizationChanged::newAuthorizationEntity', newAuthorizationEntity)
    this.authorizationEntity = newAuthorizationEntity
  }

  headersChanged(newHeaders: Header[]) {
    console.log('headersChanged::newHeaders', newHeaders)
    this.headers = newHeaders
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
