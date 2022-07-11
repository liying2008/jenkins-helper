<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue'
import type { SelectMixedOption } from 'naive-ui/es/select/src/interface'
import { StorageService } from '~/libs/storage'
import type { Options } from '~/models/option'
import { JenkinsToken, defaultOptionsValue } from '~/models/option'
import { SnackbarData } from '~/models/message'
import { initTheme } from '~/theme'
import { sapphireTheme } from '~/theme/theme_sapphire'
import { perillaTheme } from '~/theme/theme_perilla'
import { coffeeTheme } from '~/theme/theme_coffee'
import { defaultTheme } from '~/theme/theme_default'
import { t } from '~/libs/extension'

const strings = {
  editing: t('editing'),
  close: t('close'),
  jsonParsingFailed: t('jsonParsingFailed'),
  monitorOptionTitle: t('monitorOptionTitle'),
  showNotification: t('showNotification'),
  refreshTime: t('refreshTime'),
  nodeOptionTitle: t('nodeOptionTitle'),
  nodeRefreshTime: t('nodeRefreshTime'),
  optionsSaved: t('optionsSaved'),
  globalOptionTitle: t('globalOptionTitle'),
  defaultTab: t('defaultTab'),
  jenkinsToken: t('jenkinsToken'),
  addNewTokenBtn: t('addNewTokenBtn'),
  omniboxOptionTitle: t('omniboxOptionTitle'),
  searchFromJenkins: t('searchFromJenkins'),
  searchFromJenkinsPlaceholder: t('searchFromJenkinsPlaceholder'),
  searchFromJenkinsTips: t('searchFromJenkinsTips'),
  saveOptions: t('saveOptions'),
  jobStatsTitle: t('jobStatsTitle'),
  jobStatsTitleTip: t('jobStatsTitleTip'),
  jobStatsJenkinsPlaceholder: t('jobStatsJenkinsPlaceholder'),
  jobStatsNodeParamTip: t('jobStatsNodeParamTip'),
  jobStatsNodeParamPlaceholder: t('jobStatsNodeParamPlaceholder'),
  themeTitle: t('themeTitle'),
  theme: t('theme'),
  defaultTheme: t('defaultTheme'),
  enableDarkMode: t('enableDarkMode'),
  otherTitle: t('otherTitle'),
  enableParamsStashAndRecover: t('enableParamsStashAndRecover'),
  enableParamsStashAndRecoverTips: t('enableParamsStashAndRecoverTips'),
  enableParamNamesColor: t('enableParamNamesColor'),
  enableParamNamesColorTips: t('enableParamNamesColorTips'),
  pickColor: t('pickColor'),
}

const refreshTime = ref(defaultOptionsValue.refreshTime)
const nodeRefreshTime = ref(defaultOptionsValue.nodeRefreshTime)
const defaultTab = ref(defaultOptionsValue.defaultTab)
const defaultTabs: SelectMixedOption[] = [
  {
    text: t('monitor'),
    value: 'monitor',
  },
  {
    text: t('params'),
    value: 'params',
  },
  {
    text: t('computer'),
    value: 'computer',
  },
]

const showNotificationOption = ref(defaultOptionsValue.showNotificationOption)
const showNotificationOptions: SelectMixedOption[] = [
  {
    text: t('showNotificationOption_all'),
    value: 'all',
  },
  {
    text: t('showNotificationOption_unstable'),
    value: 'unstable',
  },
  {
    text: t('showNotificationOption_none'),
    value: 'none',
  },
]

const omniboxJenkinsUrl = ref(defaultOptionsValue.omniboxJenkinsUrl)
const nodeParam = ref(defaultOptionsValue.nodeParam)
const jobStatsJenkinsUrl = ref(defaultOptionsValue.jobStatsJenkinsUrl)
const jenkinsTokens = ref<JenkinsToken[]>(defaultOptionsValue.jenkinsTokens)
const themes: SelectMixedOption[] = [
  {
    text: t('defaultTheme'),
    value: defaultTheme.name,
  },
  {
    text: t('sapphireTheme'),
    value: sapphireTheme.name,
  },
  {
    text: t('perillaTheme'),
    value: perillaTheme.name,
  },
  {
    text: t('coffeeTheme'),
    value: coffeeTheme.name,
  },
]

const currentTheme = ref(defaultOptionsValue.currentTheme)
const enableDarkMode = ref(defaultOptionsValue.enableDarkMode)
const enableParamsStashAndRecover = ref(defaultOptionsValue.enableParamsStashAndRecover)
const enableParamNamesColor = ref(defaultOptionsValue.enableParamNamesColor)
const paramNamesColor = ref(defaultOptionsValue.paramNamesColor)
const showDisabledJobs = ref(defaultOptionsValue.showDisabledJobs)
const optionsJson = ref('')
const isJsonView = ref(false)
const constants = {
  monitorMinRefreshTime: 5,
  monitorMaxRefreshTime: 300,
  nodeMinRefreshTime: 1,
  nodeMaxRefreshTime: 6,
}

const snackbar = ref(SnackbarData.empty())

const refreshTimeTip = computed(() => {
  const tip = t('refreshTimeTip_1') + refreshTime.value
      + t('refreshTimeTip_2')
  // console.log(tip)
  return tip
})


const nodeRefreshTimeTip = computed(() => {
  const tip = t('nodeRefreshTimeTip_1') + nodeRefreshTime.value
      + t('nodeRefreshTimeTip_2')
  // console.log(tip)
  return tip
})

onMounted(() => {
  StorageService.getOptions().then((result: Options) => {
    // console.log('result', result);
    optionsToData(result)
  })
})

function addNewToken() {
  jenkinsTokens.value.push(JenkinsToken.empty())
}

function deleteToken(index: number) {
  jenkinsTokens.value.splice(index, 1)
}

function dataToOptions() {
  const options: Options = {
    defaultTab: defaultTab.value,
    jenkinsTokens: jenkinsTokens.value,
    refreshTime: refreshTime.value.toString(),
    nodeRefreshTime: nodeRefreshTime.value.toString(),
    showNotificationOption: showNotificationOption.value,
    omniboxJenkinsUrl: omniboxJenkinsUrl.value,
    nodeParam: nodeParam.value,
    jobStatsJenkinsUrl: jobStatsJenkinsUrl.value,
    currentTheme: currentTheme.value,
    enableDarkMode: enableDarkMode.value,
    enableParamsStashAndRecover: enableParamsStashAndRecover.value,
    showDisabledJobs: showDisabledJobs.value,
    enableParamNamesColor: enableParamNamesColor.value,
    paramNamesColor: paramNamesColor.value,
  }
  return options
}

function optionsToData(options: Options) {
  /// / refreshTime
  if (options.refreshTime === undefined) {
    refreshTime.value = defaultOptionsValue.refreshTime
  } else if (parseInt(options.refreshTime) > constants.monitorMaxRefreshTime) {
    refreshTime.value = constants.monitorMaxRefreshTime.toString()
  } else if (parseInt(options.refreshTime) < constants.monitorMinRefreshTime) {
    refreshTime.value = constants.monitorMinRefreshTime.toString()
  } else {
    refreshTime.value = parseInt(options.refreshTime).toString()
  }

  /// / nodeRefreshTime
  if (options.nodeRefreshTime === undefined) {
    nodeRefreshTime.value = defaultOptionsValue.nodeRefreshTime
  } else if (parseInt(options.nodeRefreshTime) > constants.nodeMaxRefreshTime) {
    nodeRefreshTime.value = constants.nodeMaxRefreshTime.toString()
  } else if (parseInt(options.nodeRefreshTime) < constants.nodeMinRefreshTime) {
    nodeRefreshTime.value = constants.nodeMinRefreshTime.toString()
  } else {
    nodeRefreshTime.value = parseInt(options.nodeRefreshTime).toString()
  }

  /// / showNotificationOption
  const allShowNotificationOptions = showNotificationOptions.map((value) => value.value)
  // console.log('allShowNotificationOptions', allShowNotificationOptions)
  if (allShowNotificationOptions.includes(options.showNotificationOption)) {
    showNotificationOption.value = options.showNotificationOption
  }

  /// / defaultTab
  const allDefaultTabs = defaultTabs.map((value) => value.value)
  // console.log('allDefaultTabs', allDefaultTabs)
  if (allDefaultTabs.includes(options.defaultTab)) {
    defaultTab.value = options.defaultTab
  }

  jenkinsTokens.value = options.jenkinsTokens || defaultOptionsValue.jenkinsTokens
  omniboxJenkinsUrl.value = options.omniboxJenkinsUrl
  nodeParam.value = options.nodeParam
  jobStatsJenkinsUrl.value = options.jobStatsJenkinsUrl

  /// / theme
  const allThemes = themes.map((value) => value.value)
  // console.log('allThemes', allThemes)
  if (allThemes.includes(options.currentTheme)) {
    currentTheme.value = options.currentTheme
  }
  if (options.enableDarkMode === undefined) {
    enableDarkMode.value = defaultOptionsValue.enableDarkMode
  } else {
    enableDarkMode.value = !!options.enableDarkMode
  }

  /// / enableParamsStashAndRecover
  if (options.enableParamsStashAndRecover === undefined) {
    enableParamsStashAndRecover.value = defaultOptionsValue.enableParamsStashAndRecover
  } else {
    enableParamsStashAndRecover.value = !!options.enableParamsStashAndRecover
  }

  /// / enableParamNamesColor
  if (options.enableParamNamesColor === undefined) {
    enableParamNamesColor.value = defaultOptionsValue.enableParamNamesColor
  } else {
    enableParamNamesColor.value = !!options.enableParamNamesColor
  }
  paramNamesColor.value = options.paramNamesColor

  /// / showDisabledJobs
  if (options.showDisabledJobs === undefined) {
    showDisabledJobs.value = defaultOptionsValue.showDisabledJobs
  } else {
    showDisabledJobs.value = !!options.showDisabledJobs
  }
}

function saveOptions() {
  // console.log('saveOptions')
  StorageService.getOptions().then((result: Options) => {
    const option = dataToOptions()
    // 使用最新的 showDisabledJobs 设置
    option.showDisabledJobs = result.showDisabledJobs
    // console.log('option', option)
    StorageService.saveOptions(option).then(() => {
      // 应用主题
      initTheme(option.currentTheme, option.enableDarkMode)

      snackbar.value = SnackbarData.builder()
        .message(strings.optionsSaved)
        .color('success')
        .top()
        .build()
    })
  })
}

function optionsToJson() {
  optionsJson.value = JSON.stringify(dataToOptions(), null, 2)
}

function jsonToOptions() {
  try {
    const options = JSON.parse(optionsJson.value)
    optionsToData(options)
    return true
  } catch (e) {
    console.log('JSON解析失败：', e)
    isJsonView.value = true
    alert(`${strings.jsonParsingFailed} :\n${e}`)
    return false
  }
}

function switchView() {
  if (isJsonView.value) {
    // 需要切换到 UI View
    const result = jsonToOptions()
    if (result) {
      isJsonView.value = false
    }
  } else {
    // 需要切换到 JSON View
    optionsToJson()
    isJsonView.value = true
  }
}
</script>

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
        <!-- 全局设置 -->
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
        <!-- 智能搜索设置 -->
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
        <!-- 监视器设置 -->
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
        <!-- 节点监控设置 -->
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
        <!-- Job统计设置 -->
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
        <!-- 主题设置 -->
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
        <!-- 其他设置 -->
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
          <!-- 保存按钮 -->
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
        margin-right: 0;
        margin-left: 0;
      }
    }

    .remove-text-field-mb {
      div.v-text-field__details {
        min-height: 0;
        margin-bottom: 0;

        div.v-messages {
          min-height: 0;
        }
      }
    }
  }

  .bottom-actions-area {
    position: fixed;
    right: 0;
    bottom: 8px;

    // 左侧 sidebar 宽度 256px
    left: 256px;
    height: 60px;
    text-align: center;

    .bottom-actions-card {
    }
  }
}
</style>
