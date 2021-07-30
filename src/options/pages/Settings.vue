<template>
  <div id="options-settings-wrapper">
    <v-container class="content">
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
            <v-card-text class="mt-4">
              <v-select
                v-model="defaultTab"
                :label="strings.defaultTab"
                :items="defaultTabs"
                outlined
                dense
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
                  <div style="display: flex;">
                    <v-text-field
                      v-model="token.token"
                      label="Token or password"
                      outlined
                      type="password"
                      class="remove-text-field-mb"
                      dense
                    ></v-text-field>
                    <v-btn
                      icon
                      class="token-delete-btn"
                      @click="deleteToken(index)"
                    >
                      <v-icon color="grey lighten-1">
                        mdi-minus-circle
                      </v-icon>
                    </v-btn>
                  </div>
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
            <v-card-text class="mt-4">
              <v-textarea
                v-model="omniboxJenkinsUrl"
                outlined
                :hint="strings.searchFromJenkinsTips"
                persistent-hint
                rows="1"
                auto-grow
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
            <v-card-text class="mt-4">
              <v-select
                v-model="showNotificationOption"
                :label="strings.showNotification"
                :items="showNotificationOptions"
                outlined
                dense
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
            <v-card-text class="mt-4">
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
            <v-card-text class="mt-4">
              <v-textarea
                v-model="jobStatsJenkinsUrl"
                outlined
                rows="1"
                auto-grow
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
        <!--主题设置-->
        <v-card
          class="mx-auto"
          max-width="900"
        >
          <v-container>
            <v-card-title>{{ strings.themeTitle }}</v-card-title>
            <v-card-text class="mt-4">
              <v-select
                v-model="currentTheme"
                :label="strings.theme"
                :items="themes"
                outlined
                dense
              ></v-select>
              <v-checkbox
                v-model="enableDarkMode"
                class="mt-0 remove-message-height"
                :label="strings.enableDarkMode"
              ></v-checkbox>
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
            <v-card-text class="mt-4">
              <!-- 参数暂存&恢复 -->
              <v-checkbox
                v-model="enableParamsStashAndRecover"
                :label="strings.enableParamsStashAndRecover"
                :hint="strings.enableParamsStashAndRecoverTips"
                persistent-hint
              ></v-checkbox>

              <v-divider class="mt-4"></v-divider>
              <!-- 参数名称着色 -->
              <v-checkbox
                v-model="enableParamNamesColor"
                :label="strings.enableParamNamesColor"
                :hint="strings.enableParamNamesColorTips"
                persistent-hint
                class="pt-0"
              ></v-checkbox>
              <div class="py-4">
                {{ strings.pickColor }}
              </div>
              <!-- 颜色选择器 -->
              <v-color-picker
                v-model="paramNamesColor"
                mode="hexa"
                hide-mode-switch
                :disabled="!enableParamNamesColor"
              ></v-color-picker>
            </v-card-text>
          </v-container>
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

      <j-snackbar :snackbar-data="snackbar" />
    </v-container>
    <div
      v-show="!isJsonView"
      class="bottom-actions-area"
    >
      <v-card
        class="bottom-actions-card"
        tile
        elevation="2"
      >
        <v-card-text>
          <!--保存按钮-->
          <v-btn
            color="primary"
            dark
            max-width="900"
            width="100%"
            @click="saveOptions"
          >
            {{ strings.saveOptions }}
          </v-btn>
        </v-card-text>
      </v-card>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import { StorageService } from '@/libs/storage'
import { Options, JenkinsToken, defaultOptionsValue, PopupTab, NotificationShowing } from '@/models/option'
import { SnackbarData } from '@/models/message'
import { SelectionOption } from '@/models/vuetify'
import { defaultTheme, initTheme } from '@/theme'
import { sapphireTheme } from '@/theme/theme_sapphire'
import { perillaTheme } from '@/theme/theme_perilla'
import { coffeeTheme } from '@/theme/theme_coffee'

@Component
export default class Settings extends Vue {
  strings = {
    editing: browser.i18n.getMessage('editing'),
    close: browser.i18n.getMessage('close'),
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
    themeTitle: browser.i18n.getMessage('themeTitle'),
    theme: browser.i18n.getMessage('theme'),
    defaultTheme: browser.i18n.getMessage('defaultTheme'),
    enableDarkMode: browser.i18n.getMessage('enableDarkMode'),
    otherTitle: browser.i18n.getMessage('otherTitle'),
    enableParamsStashAndRecover: browser.i18n.getMessage('enableParamsStashAndRecover'),
    enableParamsStashAndRecoverTips: browser.i18n.getMessage('enableParamsStashAndRecoverTips'),
    enableParamNamesColor: browser.i18n.getMessage('enableParamNamesColor'),
    enableParamNamesColorTips: browser.i18n.getMessage('enableParamNamesColorTips'),
    pickColor: browser.i18n.getMessage('pickColor'),
  }
  refreshTime = defaultOptionsValue.refreshTime
  nodeRefreshTime = defaultOptionsValue.nodeRefreshTime
  defaultTab = defaultOptionsValue.defaultTab
  defaultTabs: SelectionOption<PopupTab>[] = [
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
  ]
  showNotificationOption = defaultOptionsValue.showNotificationOption
  showNotificationOptions: SelectionOption<NotificationShowing>[] = [
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
  omniboxJenkinsUrl = defaultOptionsValue.omniboxJenkinsUrl
  nodeParam = defaultOptionsValue.nodeParam
  jobStatsJenkinsUrl = defaultOptionsValue.jobStatsJenkinsUrl
  jenkinsTokens: JenkinsToken[] = defaultOptionsValue.jenkinsTokens
  themes: SelectionOption[] = [
    {
      text: browser.i18n.getMessage('defaultTheme'),
      value: defaultTheme.name,
    },
    {
      text: browser.i18n.getMessage('sapphireTheme'),
      value: sapphireTheme.name,
    },
    {
      text: browser.i18n.getMessage('perillaTheme'),
      value: perillaTheme.name,
    },
    {
      text: browser.i18n.getMessage('coffeeTheme'),
      value: coffeeTheme.name,
    },
  ]
  currentTheme = defaultOptionsValue.currentTheme
  enableDarkMode = defaultOptionsValue.enableDarkMode
  enableParamsStashAndRecover = defaultOptionsValue.enableParamsStashAndRecover
  enableParamNamesColor = defaultOptionsValue.enableParamNamesColor
  paramNamesColor = defaultOptionsValue.paramNamesColor
  showDisabledJobs = defaultOptionsValue.showDisabledJobs
  optionsJson = ''
  isJsonView = false
  constants = {
    monitorMinRefreshTime: 5,
    monitorMaxRefreshTime: 300,
    nodeMinRefreshTime: 1,
    nodeMaxRefreshTime: 6,
  }
  snackbar = SnackbarData.empty()

  get refreshTimeTip() {
    const tip = browser.i18n.getMessage('refreshTimeTip_1') + this.refreshTime +
      browser.i18n.getMessage('refreshTimeTip_2')
    // console.log(tip)
    return tip
  }

  get nodeRefreshTimeTip() {
    const tip = browser.i18n.getMessage('nodeRefreshTimeTip_1') + this.nodeRefreshTime +
      browser.i18n.getMessage('nodeRefreshTimeTip_2')
    // console.log(tip)
    return tip
  }

  mounted() {
    StorageService.getOptions().then((result: Options) => {
      // console.log('result', result);
      this.optionsToData(result)
    })
  }

  addNewToken() {
    this.jenkinsTokens.push(JenkinsToken.empty())
  }

  deleteToken(index: number) {
    this.jenkinsTokens.splice(index, 1)
  }

  dataToOptions() {
    const options: Options = {
      defaultTab: this.defaultTab,
      jenkinsTokens: this.jenkinsTokens,
      refreshTime: this.refreshTime.toString(),
      nodeRefreshTime: this.nodeRefreshTime.toString(),
      showNotificationOption: this.showNotificationOption,
      omniboxJenkinsUrl: this.omniboxJenkinsUrl,
      nodeParam: this.nodeParam,
      jobStatsJenkinsUrl: this.jobStatsJenkinsUrl,
      currentTheme: this.currentTheme,
      enableDarkMode: this.enableDarkMode,
      enableParamsStashAndRecover: this.enableParamsStashAndRecover,
      showDisabledJobs: this.showDisabledJobs,
      enableParamNamesColor: this.enableParamNamesColor,
      paramNamesColor: this.paramNamesColor,
    }
    return options
  }

  optionsToData(options: Options) {
    //// refreshTime
    if (options.refreshTime === undefined) {
      this.refreshTime = defaultOptionsValue.refreshTime
    } else if (parseInt(options.refreshTime) > this.constants.monitorMaxRefreshTime) {
      this.refreshTime = this.constants.monitorMaxRefreshTime.toString()
    } else if (parseInt(options.refreshTime) < this.constants.monitorMinRefreshTime) {
      this.refreshTime = this.constants.monitorMinRefreshTime.toString()
    } else {
      this.refreshTime = parseInt(options.refreshTime).toString()
    }

    //// nodeRefreshTime
    if (options.nodeRefreshTime === undefined) {
      this.nodeRefreshTime = defaultOptionsValue.nodeRefreshTime
    } else if (parseInt(options.nodeRefreshTime) > this.constants.nodeMaxRefreshTime) {
      this.nodeRefreshTime = this.constants.nodeMaxRefreshTime.toString()
    } else if (parseInt(options.nodeRefreshTime) < this.constants.nodeMinRefreshTime) {
      this.nodeRefreshTime = this.constants.nodeMinRefreshTime.toString()
    } else {
      this.nodeRefreshTime = parseInt(options.nodeRefreshTime).toString()
    }

    //// showNotificationOption
    const allShowNotificationOptions = this.showNotificationOptions.map((value) => value.value)
    // console.log('allShowNotificationOptions', allShowNotificationOptions)
    if (allShowNotificationOptions.indexOf(options.showNotificationOption) >= 0) {
      this.showNotificationOption = options.showNotificationOption
    }

    //// defaultTab
    const allDefaultTabs = this.defaultTabs.map((value) => value.value)
    // console.log('allDefaultTabs', allDefaultTabs)
    if (allDefaultTabs.indexOf(options.defaultTab) >= 0) {
      this.defaultTab = options.defaultTab
    }

    this.jenkinsTokens = options.jenkinsTokens || defaultOptionsValue.jenkinsTokens
    this.omniboxJenkinsUrl = options.omniboxJenkinsUrl
    this.nodeParam = options.nodeParam
    this.jobStatsJenkinsUrl = options.jobStatsJenkinsUrl

    //// theme
    const allThemes = this.themes.map((value) => value.value)
    // console.log('allThemes', allThemes)
    if (allThemes.indexOf(options.currentTheme) >= 0) {
      this.currentTheme = options.currentTheme
    }
    if (options.enableDarkMode === undefined) {
      this.enableDarkMode = defaultOptionsValue.enableDarkMode
    } else {
      this.enableDarkMode = !!options.enableDarkMode
    }

    //// enableParamsStashAndRecover
    if (options.enableParamsStashAndRecover === undefined) {
      this.enableParamsStashAndRecover = defaultOptionsValue.enableParamsStashAndRecover
    } else {
      this.enableParamsStashAndRecover = !!options.enableParamsStashAndRecover
    }

    //// enableParamNamesColor
    if (options.enableParamNamesColor === undefined) {
      this.enableParamNamesColor = defaultOptionsValue.enableParamNamesColor
    } else {
      this.enableParamNamesColor = !!options.enableParamNamesColor
    }
    this.paramNamesColor = options.paramNamesColor

    //// showDisabledJobs
    if (options.showDisabledJobs === undefined) {
      this.showDisabledJobs = defaultOptionsValue.showDisabledJobs
    } else {
      this.showDisabledJobs = !!options.showDisabledJobs
    }
  }

  saveOptions() {
    // console.log('saveOptions')
    StorageService.getOptions().then((result: Options) => {
      const option = this.dataToOptions()
      // 使用最新的 showDisabledJobs 设置
      option.showDisabledJobs = result.showDisabledJobs
      // console.log('option', option)
      StorageService.saveOptions(option).then(() => {
        // 应用主题
        initTheme(option.currentTheme, option.enableDarkMode)

        this.snackbar = SnackbarData.builder()
          .message(this.strings.optionsSaved)
          .color('success')
          .top()
          .build()
      })
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
  position: relative;
  .content {
    padding-bottom: 60px;
    .token-delete-btn {
      margin-left: 6px;
    }
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
  .bottom-actions-area {
    position: fixed;
    bottom: 8px;
    // 左侧 sidebar 宽度 256px
    left: 256px;
    right: 0;
    height: 60px;
    text-align: center;

    .bottom-actions-card {
    }
  }
}
</style>
