<script lang="ts" setup>
import { computed, onMounted, ref, watch } from 'vue'
import type { SelectMixedOption } from 'naive-ui/es/select/src/interface'
import { AddCircleSharp, RemoveCircleOutline } from '@vicons/ionicons5'
import { useCssVar } from '@vueuse/core'
import { useMessage } from 'naive-ui'
import { StorageService } from '~/libs/storage'
import type { Options } from '~/models/option'
import { JenkinsToken, defaultOptionsValue } from '~/models/option'
import { initTheme } from '~/theme'
import { sapphireTheme } from '~/theme/theme_sapphire'
import { perillaTheme } from '~/theme/theme_perilla'
import { coffeeTheme } from '~/theme/theme_coffee'
import { defaultTheme } from '~/theme/theme_default'
import { t } from '~/libs/extension'
import { BrowserUtils } from '~/libs/browser'

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

const message = useMessage()

const containerRef = ref<HTMLDivElement>()
const bottomFixRef = ref<HTMLDivElement>()
const bottomFixLeftCssVar = useCssVar('--bottom-fix-left', containerRef)
const bottomFixWidthCssVar = useCssVar('--bottom-fix-width', containerRef)

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
const showDisabledJobs = ref(defaultOptionsValue.showDisabledJobs)
const constants = {
  monitorMinRefreshTime: 5,
  monitorMaxRefreshTime: 300,
  nodeMinRefreshTime: 1,
  nodeMaxRefreshTime: 6,
}

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

watch(containerRef, (newVal) => {
  if (newVal) {
    // console.log('newVal', newVal)
    bottomFixWidthCssVar.value = `${newVal.offsetWidth}px`
    const containerCoordinate = BrowserUtils.getElementCoordinate(newVal)
    bottomFixLeftCssVar.value = `${containerCoordinate.x}px`
  }
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
      message.success(strings.optionsSaved)
    })
  })
}
</script>

<template>
  <div
    ref="containerRef"
    class="options-settings-wrapper"
  >
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
        <div class="control-label mt-12px">
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
        <div class="control-hint">
          {{ strings.searchFromJenkinsTips }}
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
        <div class="control-label">
          {{ strings.refreshTime }}
        </div>
        <n-slider
          v-model:value="refreshTime"
          :min="constants.monitorMinRefreshTime"
          :max="constants.monitorMaxRefreshTime"
          :step="5"
        />
        <i v-html="refreshTimeTip"></i>
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
        <i v-html="nodeRefreshTimeTip"></i>
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
        <div class="control-label">
          {{ strings.jobStatsNodeParamTip }}
        </div>
        <n-input
          v-model:value="nodeParam"
          type="text"
          :placeholder="strings.jobStatsNodeParamPlaceholder"
        />
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

        <n-checkbox v-model:checked="enableDarkMode">
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
        <n-checkbox v-model:checked="enableParamNamesColor">
          {{ strings.enableParamNamesColor }}
        </n-checkbox>
        <div class="control-hint">
          {{ strings.enableParamNamesColorTips }}
        </div>

        <!-- 颜色选择器 -->
        <div class="control-label">
          {{ strings.pickColor }}
        </div>
        <n-color-picker
          v-model:value="paramNamesColor"
          :modes="['hex']"
          :disabled="!enableParamNamesColor"
        />
      </n-card>
    </div>
    <n-el class="bottom-actions-area">
      <div
        ref="bottomFixRef"
        class="bottom-fix"
      >
        <!-- 保存按钮 -->
        <n-button
          type="primary"
          class="save-btn"
          @click="saveOptions"
        >
          {{ strings.saveOptions }}
        </n-button>
      </div>
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

    .token-delete-btn {
      margin-left: 6px;
    }
  }

  .bottom-actions-area {
    .bottom-fix {
      position: fixed;
      bottom: 0;
      left: var(--bottom-fix-left);

      // left: 0;
      z-index: 90999;
      width: var(--bottom-fix-width);
      height: 60px;

      // height: 60px;

      // background-color: var(--base-color);
      // border-top: 1px solid var(--divider-color);

      // 左侧 sidebar 宽度 256px
      // left: 0;

      // width: 100%;

      // height: 60px;
      text-align: center;
      background-color: aqua;
    }
  }
}
</style>
