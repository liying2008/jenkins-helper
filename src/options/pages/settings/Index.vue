<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import type { SelectMixedOption } from 'naive-ui/es/select/src/interface'
import { AddCircleSharp, RemoveCircleOutline, SaveOutline } from '@vicons/ionicons5'
import { useMessage } from 'naive-ui'
import { StorageService } from '~/libs/storage'
import { JenkinsToken, Options } from '~/models/option'
import { initTheme } from '~/theme'
import { sapphireTheme } from '~/theme/theme_sapphire'
import { perillaTheme } from '~/theme/theme_perilla'
import { coffeeTheme } from '~/theme/theme_coffee'
import { defaultTheme } from '~/theme/theme_default'
import { t } from '~/libs/extension'
import { tealTheme } from '~/theme/theme_teal'

type SettingsOptions = Pick<Options, 'defaultTab' | 'jenkinsTokens' | 'jobStatsJenkinsUrl' | 'nodeParam' | 'omniboxJenkinsUrl' | 'refreshTime' | 'nodeRefreshTime' | 'showNotificationOption' | 'currentTheme' | 'enableDarkMode' | 'enableParamsStashAndRecover' | 'enableParamNamesColor' | 'paramNamesColor'>

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
  jobStatsJenkinsHint: t('jobStatsJenkinsHint'),
  jobStatsNodeParamTip: t('jobStatsNodeParamTip'),
  jobStatsNodeParamPlaceholder: t('jobStatsNodeParamPlaceholder'),
  jobStatsNodeParamHint: t('jobStatsNodeParamHint'),
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

const message = useMessage()

const defaultOptionsValue = Options.default()

const refreshTime = ref(parseInt(defaultOptionsValue.refreshTime))
const nodeRefreshTime = ref(parseInt(defaultOptionsValue.nodeRefreshTime))
const defaultTab = ref(defaultOptionsValue.defaultTab)
const defaultTabs: SelectMixedOption[] = [
  {
    label: t('monitor'),
    value: 'monitor',
  },
  {
    label: t('params'),
    value: 'params',
  },
  {
    label: t('computer'),
    value: 'computer',
  },
]

const showNotificationOption = ref(defaultOptionsValue.showNotificationOption)
const showNotificationOptions: SelectMixedOption[] = [
  {
    label: t('showNotificationOption_all'),
    value: 'all',
  },
  {
    label: t('showNotificationOption_unstable'),
    value: 'unstable',
  },
  {
    label: t('showNotificationOption_none'),
    value: 'none',
  },
]

const omniboxJenkinsUrl = ref(defaultOptionsValue.omniboxJenkinsUrl)
const nodeParam = ref(defaultOptionsValue.nodeParam)
const jobStatsJenkinsUrl = ref(defaultOptionsValue.jobStatsJenkinsUrl)
const jenkinsTokens = ref<JenkinsToken[]>(defaultOptionsValue.jenkinsTokens)
const themes: SelectMixedOption[] = [
  {
    label: t('defaultTheme'),
    value: defaultTheme.name,
  },
  {
    label: t('tealTheme'),
    value: tealTheme.name,
  },
  {
    label: t('sapphireTheme'),
    value: sapphireTheme.name,
  },
  {
    label: t('perillaTheme'),
    value: perillaTheme.name,
  },
  {
    label: t('coffeeTheme'),
    value: coffeeTheme.name,
  },
]

const currentTheme = ref(defaultOptionsValue.currentTheme)
const enableDarkMode = ref(defaultOptionsValue.enableDarkMode)
const enableParamsStashAndRecover = ref(defaultOptionsValue.enableParamsStashAndRecover)
const enableParamNamesColor = ref(defaultOptionsValue.enableParamNamesColor)
const paramNamesColor = ref(defaultOptionsValue.paramNamesColor)
const constants = {
  monitorMinRefreshTime: 5,
  monitorMaxRefreshTime: 300,
  nodeMinRefreshTime: 1,
  nodeMaxRefreshTime: 6,
}

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

function dataToOptions(): SettingsOptions {
  const options = {
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
    enableParamNamesColor: enableParamNamesColor.value,
    paramNamesColor: paramNamesColor.value,
  }
  return options
}

function optionsToData(options: SettingsOptions) {
  /// / refreshTime
  if (options.refreshTime === undefined) {
    refreshTime.value = parseInt(defaultOptionsValue.refreshTime)
  } else if (parseInt(options.refreshTime) > constants.monitorMaxRefreshTime) {
    refreshTime.value = constants.monitorMaxRefreshTime
  } else if (parseInt(options.refreshTime) < constants.monitorMinRefreshTime) {
    refreshTime.value = constants.monitorMinRefreshTime
  } else {
    refreshTime.value = parseInt(options.refreshTime)
  }

  /// / nodeRefreshTime
  if (options.nodeRefreshTime === undefined) {
    nodeRefreshTime.value = parseInt(defaultOptionsValue.nodeRefreshTime)
  } else if (parseInt(options.nodeRefreshTime) > constants.nodeMaxRefreshTime) {
    nodeRefreshTime.value = constants.nodeMaxRefreshTime
  } else if (parseInt(options.nodeRefreshTime) < constants.nodeMinRefreshTime) {
    nodeRefreshTime.value = constants.nodeMinRefreshTime
  } else {
    nodeRefreshTime.value = parseInt(options.nodeRefreshTime)
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
}

function saveOptions() {
  const option = dataToOptions()
  // console.log('option', JSON.parse(JSON.stringify(option)))
  StorageService.savePartialOptions(option).then(() => {
    // 应用主题
    initTheme(option.currentTheme, option.enableDarkMode)
    message.success(strings.optionsSaved)
  })
}
</script>

<template>
  <div class="options-settings-wrapper">
    <div
      ref="contentRef"
      class="content"
    >
      <!-- 全局设置 -->
      <n-card
        :title="strings.globalOptionTitle"
        embedded
      >
        <div class="control-label">
          {{ strings.defaultTab }}
        </div>
        <n-select
          v-model:value="defaultTab"
          :options="defaultTabs"
        />
        <div class="control-label mt-14px">
          {{ strings.jenkinsToken }}
        </div>
        <div
          v-for="(token, index) in jenkinsTokens"
          :key="index"
          class="mt-2"
          style="display: flex; align-items: center;"
        >
          <div style="flex: 4;">
            <n-input
              v-model:value="token.url"
              type="text"
              :title="token.url"
              placeholder="Jenkins url (prefix)"
            />
          </div>

          <div style="flex: 3; margin-left: 8px;">
            <n-input
              v-model:value="token.username"
              type="text"
              :title="token.username"
              placeholder="Username"
            />
          </div>

          <div style="flex: 5; margin-left: 8px;">
            <div style="display: flex;">
              <n-input
                v-model:value="token.token"
                type="password"
                placeholder="Token or password"
              />

              <n-button
                text
                class="token-delete-btn"
                @click="deleteToken(index)"
              >
                <n-icon
                  :component="RemoveCircleOutline"
                  size="20"
                >
                </n-icon>
              </n-button>
            </div>
          </div>
        </div>

        <div>
          <n-button
            secondary
            strong
            style="width: 100%; margin-top: 10px;"
            @click="addNewToken"
          >
            <template #icon>
              <n-icon
                :component="AddCircleSharp"
                size="20"
              >
              </n-icon>
            </template>
            {{ strings.addNewTokenBtn }}
          </n-button>
        </div>
      </n-card>

      <!-- 智能搜索设置 -->
      <n-card
        :title="strings.omniboxOptionTitle"
        class="mt-16px"
        embedded
      >
        <div class="control-label">
          {{ strings.searchFromJenkins }}
        </div>
        <n-input
          v-model:value="omniboxJenkinsUrl"
          type="textarea"
          :placeholder="strings.searchFromJenkinsPlaceholder"
        />
        <div
          class="control-hint"
          v-html="strings.searchFromJenkinsTips"
        >
        </div>
      </n-card>
      <!-- 监视器设置 -->
      <n-card
        :title="strings.monitorOptionTitle"
        class="mt-16px"
        embedded
      >
        <div class="control-label">
          {{ strings.showNotification }}
        </div>
        <n-select
          v-model:value="showNotificationOption"
          :options="showNotificationOptions"
        />
        <div class="control-label mt-14px">
          {{ strings.refreshTime }}
        </div>
        <n-slider
          v-model:value="refreshTime"
          :min="constants.monitorMinRefreshTime"
          :max="constants.monitorMaxRefreshTime"
          :step="5"
        />
        <div
          class="control-hint"
          v-html="t('refreshTimeTip', [refreshTime.toString()])"
        ></div>
      </n-card>
      <div class="my-6" />
      <!-- 节点监控设置 -->
      <n-card
        :title="strings.nodeOptionTitle"
        class="mt-16px"
        embedded
      >
        <div class="control-label">
          {{ strings.nodeRefreshTime }}
        </div>
        <n-slider
          v-model:value="nodeRefreshTime"
          :min="constants.nodeMinRefreshTime"
          :max="constants.nodeMaxRefreshTime"
          :step="0.5"
        />
        <div
          class="control-hint"
          v-html="t('nodeRefreshTimeTip', [nodeRefreshTime.toString()])"
        ></div>
      </n-card>
      <div class="my-6" />
      <!-- Job统计设置 -->
      <n-card
        :title="strings.jobStatsTitle"
        class="mt-16px"
        embedded
      >
        <div class="control-label">
          {{ strings.jobStatsTitleTip }}
        </div>
        <n-input
          v-model:value="jobStatsJenkinsUrl"
          type="textarea"
          :placeholder="strings.jobStatsJenkinsPlaceholder"
        />
        <div
          class="control-hint"
          v-html="strings.jobStatsJenkinsHint"
        >
        </div>

        <div class="control-label mt-14px">
          {{ strings.jobStatsNodeParamTip }}
        </div>
        <n-input
          v-model:value="nodeParam"
          type="text"
          :placeholder="strings.jobStatsNodeParamPlaceholder"
        />
        <div
          class="control-hint"
          v-html="strings.jobStatsNodeParamHint"
        >
        </div>
      </n-card>
      <!-- 主题设置 -->
      <n-card
        :title="strings.themeTitle"
        class="mt-16px"
        embedded
      >
        <div class="control-label">
          {{ strings.theme }}
        </div>
        <n-select
          v-model:value="currentTheme"
          :options="themes"
        />

        <n-checkbox
          v-model:checked="enableDarkMode"
          class="mt-14px"
        >
          {{ strings.enableDarkMode }}
        </n-checkbox>
      </n-card>
      <!-- 其他设置 -->
      <n-card
        :title="strings.otherTitle"
        class="mt-16px"
        embedded
      >
        <!-- 参数暂存&恢复 -->
        <n-checkbox v-model:checked="enableParamsStashAndRecover">
          {{ strings.enableParamsStashAndRecover }}
        </n-checkbox>
        <div class="control-hint">
          {{ strings.enableParamsStashAndRecoverTips }}
        </div>

        <!-- 参数名称着色 -->
        <n-checkbox
          v-model:checked="enableParamNamesColor"
          class="mt-14px"
        >
          {{ strings.enableParamNamesColor }}
        </n-checkbox>
        <div class="control-hint">
          {{ strings.enableParamNamesColorTips }}
        </div>

        <!-- 颜色选择器 -->
        <div class="control-label mt-6px">
          {{ strings.pickColor }}
        </div>
        <n-color-picker
          v-model:value="paramNamesColor"
          :modes="['hex']"
          :disabled="!enableParamNamesColor"
        />
      </n-card>
      <div class="mt-40px" />
    </div>
    <n-el class="bottom-actions-area">
      <fix-area
        position="bottom"
        container=".options-settings-wrapper"
        class="bottom-fix"
      >
        <!-- 保存按钮 -->
        <n-button
          type="primary"
          strong
          class="save-btn"
          @click="saveOptions"
        >
          <template #icon>
            <n-icon>
              <SaveOutline />
            </n-icon>
          </template>
          {{ strings.saveOptions }}
        </n-button>
      </fix-area>
    </n-el>
  </div>
</template>

<style lang="scss">
.options-settings-wrapper {
  position: relative;
  padding: 24px;

  .content {
    max-width: 900px;
    padding-bottom: 60px;
    margin: 0 auto;

    .control-label {
      margin-bottom: 6px;
    }

    .control-hint {
      margin-top: 4px;
      font-size: 12px;
      color: #888888;
    }

    .token-delete-btn {
      margin-left: 6px;
    }
  }

  .bottom-actions-area {
    .bottom-fix {
      background-color: var(--base-color);
      border-top: 1px solid var(--divider-color);
      box-shadow: var(--box-shadow-1);

      .save-btn {
        margin: 8px auto;
      }
    }
  }
}
</style>
