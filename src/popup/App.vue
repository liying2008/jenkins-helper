<template>
  <div id="wrapper">
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
              v-model="tab"
              align-with-title
            >
              <v-tabs-slider color="yellow"></v-tabs-slider>

              <v-tab>{{ strings.monitor }}</v-tab>
              <v-tab>{{ strings.params }}</v-tab>
              <v-tab>{{ strings.computer }}</v-tab>
              <v-tab>{{ strings.tools }}</v-tab>
            </v-tabs>
          </template>
        </v-toolbar>

        <v-tabs-items v-model="tab">
          <v-tab-item>
            <v-card flat>
              <monitor></monitor>
            </v-card>
          </v-tab-item>
          <v-tab-item>
            <v-card flat>
              <params></params>
            </v-card>
          </v-tab-item>
          <v-tab-item>
            <v-card flat>
              <computer></computer>
            </v-card>
          </v-tab-item>
          <v-tab-item>
            <v-card flat>
              <jenkins-tools></jenkins-tools>
            </v-card>
          </v-tab-item>
        </v-tabs-items>
      </v-card>
    </v-app>
  </div>
</template>

<script lang="ts">
  import {Vue, Component} from "vue-property-decorator";
  import Monitor from "@/popup/pages/Monitor.vue";
  import Params from "@/popup/pages/Params.vue";
  import Computer from "@/popup/pages/Computer.vue";
  import JenkinsTools from "@/popup/pages/JenkinsTools.vue";

  @Component({
    name: 'App',
    components: {
      Monitor,
      Params,
      Computer,
      JenkinsTools,
    }
  })
  export default class App extends Vue {
    private strings = {
      extName: browser.i18n.getMessage("extName"),
      monitor: browser.i18n.getMessage("monitor"),
      params: browser.i18n.getMessage("params"),
      computer: browser.i18n.getMessage("computer"),
      tools: browser.i18n.getMessage("tools"),
    }
    private tab = null
  }
</script>

<style scoped lang="scss">
  #wrapper {
    min-height: 200px;
    /*设置 min-width 之后，Firefox上会有横向滚动条*/
    /*min-width: 700;*/
    width: 700px;
    margin: auto;
  }
</style>
