<template>
  <v-app>
    <v-card elevation="0">
      <v-toolbar
        color="teal"
        dark
        flat
      >
        <!--<v-app-bar-nav-icon></v-app-bar-nav-icon>-->

        <v-toolbar-title>{{ strings.extName }}</v-toolbar-title>

        <v-spacer></v-spacer>

        <v-btn icon>
          <v-icon>mdi-view-list</v-icon>
        </v-btn>

        <v-btn icon>
          <v-icon>mdi-cog</v-icon>
        </v-btn>

        <template v-slot:extension>
          <v-tabs
            show-arrows
            align-with-title
          >
            <v-tabs-slider color="yellow"></v-tabs-slider>

            <v-tab to="monitor">
              {{ strings.monitor }}
            </v-tab>
            <v-tab to="params">
              {{ strings.params }}
            </v-tab>
            <v-tab to="computer">
              {{ strings.computer }}
            </v-tab>
            <v-tab to="jenkins-tools">
              {{ strings.tools }}
            </v-tab>
          </v-tabs>
        </template>
      </v-toolbar>
      <v-main>
        <v-container>
          <router-view></router-view>
        </v-container>
      </v-main>
    </v-card>
  </v-app>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'

@Component({
  name: 'Layout'
})
export default class Layout extends Vue {
  strings = {
    extName: browser.i18n.getMessage('extName'),
    monitor: browser.i18n.getMessage('monitor'),
    params: browser.i18n.getMessage('params'),
    computer: browser.i18n.getMessage('computer'),
    tools: browser.i18n.getMessage('tools'),
  }
}
</script>
