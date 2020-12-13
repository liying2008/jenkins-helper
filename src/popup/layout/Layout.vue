<template>
  <v-app id="layout-wrapper">
    <v-card elevation="0">
      <v-toolbar
        color="teal"
        dark
        flat
      >
        <!--<v-app-bar-nav-icon></v-app-bar-nav-icon>-->

        <v-toolbar-title>{{ strings.extName }}</v-toolbar-title>

        <v-spacer></v-spacer>

        <v-btn
          icon
          @click="openJobList"
        >
          <v-icon>mdi-view-list</v-icon>
        </v-btn>

        <v-btn
          icon
          @click="openOptions"
        >
          <v-icon>mdi-cog</v-icon>
        </v-btn>

        <template v-slot:extension>
          <v-tabs
            v-model="activeTab"
            show-arrows
            align-with-title
          >
            <v-tabs-slider color="yellow"></v-tabs-slider>

            <v-tab to="/monitor">
              {{ strings.monitor }}
            </v-tab>
            <v-tab to="/params">
              {{ strings.params }}
            </v-tab>
            <v-tab to="/computer">
              {{ strings.computer }}
            </v-tab>
            <v-tab to="/tools">
              {{ strings.tools }}
            </v-tab>
          </v-tabs>
        </template>
      </v-toolbar>
      <v-main>
        <v-container
          fluid
          class="py-0"
        >
          <router-view :key="$route.fullPath" />
        </v-container>
      </v-main>
    </v-card>
  </v-app>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import { StorageService } from '@/libs/storage'
import { Options } from '@/models/option'

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

  defaultTab = 'monitor'
  activeTab = this.defaultTab

  created() {
    StorageService.getOptions().then((option: Options) => {
      // 切换页面
      if (option.defaultTab) {
        this.activeTab = option.defaultTab
        this.$router.replace(this.activeTab)
      } else {
        this.activeTab = this.defaultTab
        this.$router.replace(this.defaultTab)
      }
    })
  }

  mounted() {
    // console.log('popup::fullPath', this.$route.fullPath)
  }

  openOptions() {
    if (browser.runtime.openOptionsPage) {
      browser.runtime.openOptionsPage() // Chrome 42+, Firefox 48
    } else {
      browser.tabs.create({ 'url': browser.runtime.getURL('options.html') })
    }
  }

  openJobList() {
    browser.windows.create({
      url: 'job_stats.html',
      type: 'popup',
      width: 1200,
      height: 800,
    }).then((window) => {
      console.log('window', window)
    })
  }

}
</script>

<style lang="scss">
#layout-wrapper {
  .v-application--wrap {
    min-height: inherit;
  }
}
</style>
