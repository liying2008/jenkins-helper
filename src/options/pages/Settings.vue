<template>
  <div id="options-settings-wrapper">
    <v-container>
      <div
        class="mx-auto"
        style="max-width: 900px;"
      >
        <v-row>
          <v-col
            cols="12"
            style="text-align: end;"
          >
            <v-btn
              text
              small
              color="primary"
              @click="switchView"
              v-text="isJsonView ? 'View UI' : 'View JSON'"
            >
            </v-btn>
          </v-col>
        </v-row>
      </div>
      <div v-show="!isJsonView">
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
              <v-row
                v-for="(token, index) in jenkinsTokens"
                :key="index"
                class="mt-2"
                dense
              >
                <v-col cols="4">
                  <v-text-field
                    v-model="token.url"
                    outlined
                    dense
                    type="url"
                    :title="token.url"
                    class="remove-text-field-mb"
                    label="Jenkins url (prefix)"
                  ></v-text-field>
                </v-col>

                <v-col cols="3">
                  <v-text-field
                    v-model="token.username"
                    label="Username"
                    :title="token.username"
                    type="text"
                    outlined
                    class="remove-text-field-mb"
                    dense
                  ></v-text-field>
                </v-col>

                <v-col cols="5">
                  <v-text-field
                    v-model="token.token"
                    label="Token or password"
                    outlined
                    type="password"
                    class="remove-text-field-mb"
                    dense
                  ></v-text-field>
                </v-col>
              </v-row>
              <v-row>
                <v-col cols="12">
                  <v-btn
                    color="primary"
                    dark
                    outlined
                    width="100%"
                    @click="addNewToken"
                  >
                    <v-icon left>
                      mdi-plus-circle
                    </v-icon> {{ strings.addNewTokenBtn }}
                  </v-btn>
                </v-col>
              </v-row>
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
        <div class="my-6" />
        <!--Job统计设置-->
        <v-card
          class="mx-auto"
          max-width="900"
        >
          <v-container>
            <v-card-title>{{ strings.jobStatsTitle }}</v-card-title>
            <v-card-text class="my-4">
              <v-textarea
                v-model="jobStatsJenkinsUrl"
                outlined
                rows="4"
                :placeholder="strings.jobStatsJenkinsPlaceholder"
                :label="strings.jobStatsTitleTip"
              ></v-textarea>

              <div>{{ strings.jobStatsNodeParamTip }}</div>
              <v-text-field
                v-model="nodeParam"
                label="Job Parameters"
                class="mt-4 remove-text-field-mb"
                dense
                :placeholder="strings.jobStatsNodeParamPlaceholder"
                outlined
              ></v-text-field>
            </v-card-text>
          </v-container>
        </v-card>
        <div class="my-6" />
        <!--其他设置-->
        <v-card
          class="mx-auto"
          max-width="900"
        >
          <v-container>
            <v-card-title>{{ strings.otherTitle }}</v-card-title>
            <v-card-text class="my-4">
              <v-checkbox
                v-model="enableParamsStashAndRecover"
                :label="strings.enableParamsStashAndRecover"
                :hint="strings.paramsStashAndRecoverTips"
                persistent-hint
              ></v-checkbox>
            </v-card-text>
          </v-container>
        </v-card>
        <div class="my-6" />
        <!--保存按钮-->
        <v-card
          class="mx-auto"
          flat
          max-width="900"
        >
          <v-btn
            color="primary"
            dark
            width="100%"
            @click="saveOptions"
          >
            {{ strings.saveOptions }}
          </v-btn>
        </v-card>
      </div>
      <div v-show="isJsonView">
        <v-card
          class="mx-auto"
          max-width="900"
        >
          <v-container>
            <v-card-title>{{ strings.editing }}</v-card-title>
            <v-card-text class="my-4">
              <v-textarea
                v-model="optionsJson"
                outlined
                rows="26"
              ></v-textarea>
            </v-card-text>
          </v-container>
        </v-card>
      </div>
      <div class="my-6" />
      <v-snackbar
        v-model="snackbar"
        color="success"
      >
        {{ message }}

        <template v-slot:action="{ attrs }">
          <v-btn
            text
            v-bind="attrs"
            @click="snackbar = false"
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
import { StorageService } from '@/libs/storage'
import { Options, JenkinsToken } from '@/models/option'

@Component
export default class Settings extends Vue {
  strings = {
    extName: browser.i18n.getMessage('extName'),
    settings: browser.i18n.getMessage('settings'),
    editing: browser.i18n.getMessage('editing'),
    close: browser.i18n.getMessage('close'),
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
  jenkinsTokens: JenkinsToken[] = []
  enableParamsStashAndRecover = true
  showDisabledJobs = true
  optionsJson = ''
  isJsonView = false
  constants = {
    monitorMinRefreshTime: 5,
    monitorMaxRefreshTime: 300,
    nodeMinRefreshTime: 1,
    nodeMaxRefreshTime: 6,
  }
  snackbar = false
  message = ''

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
    StorageService.getOptions().then((result: Options) => {
      // console.log('result', result);
      this.optionsToData(result)
    })
  }

  addNewToken() {
    this.jenkinsTokens.push({ url: '' })
  }

  arrangeJenkinsTokens() {
    const arrangedJenkinsTokens = []
    for (let i = 0; i < this.jenkinsTokens.length; i++) {
      const token = this.jenkinsTokens[i]
      if (token.hasOwnProperty('url') && token.url) {
        arrangedJenkinsTokens.push(token)
      }
    }
    // console.log('arrangedJenkinsTokens', arrangedJenkinsTokens);
    return arrangedJenkinsTokens
  }

  dataToOptions() {
    const options: Options = {
      defaultTab: this.defaultTab,
      jenkinsTokens: this.arrangeJenkinsTokens(),
      refreshTime: this.refreshTime.toString(),
      nodeRefreshTime: this.nodeRefreshTime.toString(),
      showNotificationOption: this.showNotificationOption,
      omniboxJenkinsUrl: this.omniboxJenkinsUrl,
      nodeParam: this.nodeParam,
      jobStatsJenkinsUrl: this.jobStatsJenkinsUrl,
      enableParamsStashAndRecover: this.enableParamsStashAndRecover,
      showDisabledJobs: this.showDisabledJobs,
    }
    return options
  }

  optionsToData(options: Options) {
    //// refreshTime
    if (options.refreshTime === undefined) {
      this.refreshTime = '60'
    } else if (parseInt(options.refreshTime) > this.constants.monitorMaxRefreshTime) {
      this.refreshTime = this.constants.monitorMaxRefreshTime.toString()
    } else if (parseInt(options.refreshTime) < this.constants.monitorMinRefreshTime) {
      this.refreshTime = this.constants.monitorMinRefreshTime.toString()
    } else {
      this.refreshTime = parseInt(options.refreshTime).toString()
    }

    //// nodeRefreshTime
    if (options.nodeRefreshTime === undefined) {
      this.nodeRefreshTime = '2'
    } else if (parseInt(options.nodeRefreshTime) > this.constants.nodeMaxRefreshTime) {
      this.nodeRefreshTime = this.constants.nodeMaxRefreshTime.toString()
    } else if (parseInt(options.nodeRefreshTime) < this.constants.nodeMinRefreshTime) {
      this.nodeRefreshTime = this.constants.nodeMinRefreshTime.toString()
    } else {
      this.nodeRefreshTime = parseInt(options.nodeRefreshTime).toString()
    }

    //// showNotificationOption
    const allShowNotificationOptions = this.showNotificationOptions.map((value) => value.value)
    // console.log('allShowNotificationOptions', allShowNotificationOptions);
    if (allShowNotificationOptions.indexOf(options.showNotificationOption) >= 0) {
      this.showNotificationOption = options.showNotificationOption
    }

    //// defaultTab
    const allDefaultTabs = this.defaultTabs.map((value) => value.value)
    // console.log('allDefaultTabs', allDefaultTabs);
    if (allDefaultTabs.indexOf(options.defaultTab) >= 0) {
      this.defaultTab = options.defaultTab
    }

    this.jenkinsTokens = options.jenkinsTokens || []
    this.omniboxJenkinsUrl = options.omniboxJenkinsUrl
    this.nodeParam = options.nodeParam
    this.jobStatsJenkinsUrl = options.jobStatsJenkinsUrl

    //// enableParamsStashAndRecover
    if (options.enableParamsStashAndRecover === undefined) {
      this.enableParamsStashAndRecover = true
    } else {
      this.enableParamsStashAndRecover = !!options.enableParamsStashAndRecover
    }

    //// showDisabledJobs
    if (options.showDisabledJobs === undefined) {
      this.showDisabledJobs = true
    } else {
      this.showDisabledJobs = !!options.showDisabledJobs
    }
  }

  saveOptions() {
    console.log('saveOptions')
    const option = this.dataToOptions()
    StorageService.saveOptions(option).then(() => {
      this.message = this.strings.optionsSaved
      this.snackbar = true
    })
  }

  optionsToJson() {
    this.optionsJson = JSON.stringify(this.dataToOptions(), null, 2)
  }

  jsonToOptions() {
    try {
      const options = JSON.parse(this.optionsJson)
      this.optionsToData(options)
      return true
    } catch (e) {
      console.log('JSON解析失败：', e)
      this.isJsonView = true
      alert(this.strings.jsonParsingFailed + ' :\n' + e)
      return false
    }
  }

  switchView() {
    if (this.isJsonView) {
      // 需要切换到 UI View
      const result = this.jsonToOptions()
      if (result) {
        this.isJsonView = false
      }
    } else {
      // 需要切换到 JSON View
      this.optionsToJson()
      this.isJsonView = true
    }
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
  .remove-text-field-mb {
    div.v-text-field__details {
      margin-bottom: 0;
      min-height: 0;

      div.v-messages {
        min-height: 0;
      }
    }
  }
}
</style>
