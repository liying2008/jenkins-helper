<template>
  <div id="options-settings-wrapper">
    <v-container>
      <!--全局设置-->
      <v-card
        class="mx-auto"
        max-width="900"
      >
        <v-container>
          <v-card-title>{{ strings.globalOptionTitle }}</v-card-title>
          <v-card-text class="my-4">
            <v-select
              v-model="defaultTab"
              :label="strings.defaultTab"
              :items="defaultTabs"
              outlined
            ></v-select>
            <div>{{ strings.jenkinsToken }}</div>
            <v-row>
              <v-col cols="4">
                <v-text-field
                  outlined
                  dense
                  label="Jenkins url (prefix)"
                ></v-text-field>
              </v-col>

              <v-col cols="4">
                <v-text-field
                  label="Username"
                  outlined
                  dense
                ></v-text-field>
              </v-col>

              <v-col cols="4">
                <v-text-field
                  label="Token or password"
                  outlined
                  dense
                ></v-text-field>
              </v-col>
            </v-row>
            <v-btn
              color="primary"
              dark
              outlined
              width="100%"
            >
              <v-icon left>
                mdi-plus-circle
              </v-icon> {{ strings.addNewTokenBtn }}
            </v-btn>
          </v-card-text>
        </v-container>
      </v-card>
      <div class="my-6" />
      <!--智能搜索设置-->
      <v-card
        class="mx-auto"
        max-width="900"
      >
        <v-container>
          <v-card-title>{{ strings.omniboxOptionTitle }}</v-card-title>
          <v-card-text class="my-4">
            <v-textarea
              v-model="omniboxJenkinsUrl"
              outlined
              :hint="strings.searchFromJenkinsTips"
              persistent-hint
              rows="4"
              :placeholder="strings.searchFromJenkinsPlaceholder"
              :label="strings.searchFromJenkins"
            ></v-textarea>
          </v-card-text>
        </v-container>
      </v-card>
      <div class="my-6" />
      <!--监视器设置-->
      <v-card
        class="mx-auto"
        max-width="900"
      >
        <v-container>
          <v-card-title>{{ strings.monitorOptionTitle }}</v-card-title>
          <v-card-text class="my-4">
            <v-select
              v-model="showNotificationOption"
              :label="strings.showNotification"
              :items="showNotificationOptions"
              outlined
            ></v-select>
            <div>{{ strings.refreshTime }}</div>
            <v-slider
              v-model="refreshTime"
              :min="constants.monitorMinRefreshTime"
              :max="constants.monitorMaxRefreshTime"
              class="remove-message-height remove-margin-x"
              step="5"
            >
            </v-slider>
            <i v-html="refreshTimeTip"></i>
          </v-card-text>
        </v-container>
      </v-card>
      <div class="my-6" />
      <!--节点监控设置-->
      <v-card
        class="mx-auto"
        max-width="900"
      >
        <v-container>
          <v-card-title>{{ strings.nodeOptionTitle }}</v-card-title>
          <v-card-text class="my-4">
            <div>{{ strings.nodeRefreshTime }}</div>
            <v-slider
              v-model="nodeRefreshTime"
              :min="constants.nodeMinRefreshTime"
              :max="constants.nodeMaxRefreshTime"
              class="remove-message-height remove-margin-x"
              step=".5"
            >
            </v-slider>
            <i v-html="nodeRefreshTimeTip"></i>
          </v-card-text>
        </v-container>
      </v-card>
    </v-container>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'

@Component
export default class Settings extends Vue {
  strings = {
    extName: browser.i18n.getMessage('extName'),
    settings: browser.i18n.getMessage('settings'),
    importAndExportSettings: browser.i18n.getMessage('importAndExportSettings'),
    about: browser.i18n.getMessage('about'),
    jsonParsingFailed: browser.i18n.getMessage('jsonParsingFailed'),
    monitorOptionTitle: browser.i18n.getMessage('monitorOptionTitle'),
    showNotification: browser.i18n.getMessage('showNotification'),
    refreshTime: browser.i18n.getMessage('refreshTime'),
    nodeOptionTitle: browser.i18n.getMessage('nodeOptionTitle'),
    nodeRefreshTime: browser.i18n.getMessage('nodeRefreshTime'),
    optionsSaved: browser.i18n.getMessage('optionsSaved'),
    globalOptionTitle: browser.i18n.getMessage('globalOptionTitle'),
    defaultTab: browser.i18n.getMessage('defaultTab'),
    jenkinsToken: browser.i18n.getMessage('jenkinsToken'),
    addNewTokenBtn: browser.i18n.getMessage('addNewTokenBtn'),
    omniboxOptionTitle: browser.i18n.getMessage('omniboxOptionTitle'),
    searchFromJenkins: browser.i18n.getMessage('searchFromJenkins'),
    searchFromJenkinsPlaceholder: browser.i18n.getMessage('searchFromJenkinsPlaceholder'),
    searchFromJenkinsTips: browser.i18n.getMessage('searchFromJenkinsTips'),
    saveOptions: browser.i18n.getMessage('saveOptions'),
    jobStatsTitle: browser.i18n.getMessage('jobStatsTitle'),
    jobStatsTitleTip: browser.i18n.getMessage('jobStatsTitleTip'),
    jobStatsJenkinsPlaceholder: browser.i18n.getMessage('jobStatsJenkinsPlaceholder'),
    jobStatsNodeParamTip: browser.i18n.getMessage('jobStatsNodeParamTip'),
    jobStatsNodeParamPlaceholder: browser.i18n.getMessage('jobStatsNodeParamPlaceholder'),
    otherTitle: browser.i18n.getMessage('otherTitle'),
    enableParamsStashAndRecover: browser.i18n.getMessage('enableParamsStashAndRecover'),
    paramsStashAndRecoverTips: browser.i18n.getMessage('paramsStashAndRecoverTips'),
  }
  refreshTime = '60'
  nodeRefreshTime = '2'
  defaultTab = 'monitor'
  defaultTabs = [
    {
      text: browser.i18n.getMessage('monitor'),
      value: 'monitor',
    },
    {
      text: browser.i18n.getMessage('params'),
      value: 'params',
    },
    {
      text: browser.i18n.getMessage('computer'),
      value: 'computer',
    },
    {
      text: browser.i18n.getMessage('tools'),
      value: 'tools',
    },
  ]
  showNotificationOption = 'all'
  showNotificationOptions = [
    {
      text: browser.i18n.getMessage('showNotificationOption_all'),
      value: 'all'
    },
    {
      text: browser.i18n.getMessage('showNotificationOption_unstable'),
      value: 'unstable'
    },
    {
      text: browser.i18n.getMessage('showNotificationOption_none'),
      value: 'none'
    },
  ]
  omniboxJenkinsUrl = ''
  nodeParam = ''
  jobStatsJenkinsUrl = ''
  jenkinsTokens = []
  enableParamsStashAndRecover = true
  optionsJson = ''
  isJsonView = false
  constants = {
    monitorMinRefreshTime: 5,
    monitorMaxRefreshTime: 300,
    nodeMinRefreshTime: 1,
    nodeMaxRefreshTime: 6,
  }

  get refreshTimeTip() {
    const tip = browser.i18n.getMessage('refreshTimeTip_1') + this.refreshTime +
      browser.i18n.getMessage('refreshTimeTip_2')
    console.log(tip)
    return tip
  }

  get nodeRefreshTimeTip() {
    const tip = browser.i18n.getMessage('nodeRefreshTimeTip_1') + this.nodeRefreshTime +
      browser.i18n.getMessage('nodeRefreshTimeTip_2')
    console.log(tip)
    return tip
  }

  mounted() {

  }
}
</script>

<style lang="scss">
#options-settings-wrapper {
  .remove-message-height {
    div.v-messages {
      height: 0;
      min-height: 0;
    }
  }
  .remove-margin-x {
    div.v-slider--horizontal {
      margin-left: 0;
      margin-right: 0;
    }
  }
}
</style>
