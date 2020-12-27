<template>
  <div id="api-tool-wrapper">
    <v-container>
      <div class="mx-auto mt-2">
        <form>
          <v-row align="center">
            <v-col cols="2">
              <v-select
                v-model="httpMetod"
                dense
                hide-details
                :items="httpMethods"
                label="Method"
                solo
              ></v-select>
            </v-col>
            <v-col cols="8">
              <v-text-field
                v-model="url"
                dense
                label="Request URL"
                placeholder="Enter request URL"
                hide-details
                outlined
              ></v-text-field>
            </v-col>
            <v-col cols="2">
              <v-btn
                class="mr-4 text-capitalize"
                :loading="false"
                :disabled="false"
                color="primary"
                @click="send"
              >
                Send
              </v-btn>
            </v-col>
          </v-row>
          <v-row>
            <v-tabs
              v-model="configTab"
              show-arrows
              class="mt-4 mx-4"
            >
              <v-tab class="text-capitalize">
                Params
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
                <PanelParams />
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
import { Vue, Component } from 'vue-property-decorator'
import { MessageColor } from '@/models/message'
import PanelParams from './panel-params.vue'
import PanelAuthorization from './panel-authorization.vue'
import PanelHeaders from './panel-headers.vue'
import PanelBody from './panel-body.vue'


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
  snackbar = {
    show: false,
    message: '',
    color: MessageColor.Success,
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
}
</style>
