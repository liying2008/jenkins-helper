<script lang="ts" setup>
import { computed, ref } from 'vue'
import { Reload } from '@vicons/ionicons5'
import { useDialog } from 'naive-ui'
import type { Tabs } from 'webextension-polyfill'
import { Tools } from '~/libs/tools'
import type { DisplayedBuildCause, DisplayedBuildParameter } from '~/libs/jenkins/build'
import { JenkinsBuild } from '~/libs/jenkins/build'
import { BrowserUtils } from '~/libs/browser'
import { t } from '~/libs/extension'
import { useThemeStore } from '~/store'
import BuildInfoView from '~/commonViews/build-info-view/BuildInfoView.vue'
import BuildParamsView from '~/commonViews/build-params-view/BuildParamsView.vue'
import BuildParamsPageActions from '~/commonViews/build-params-page-actions/BuildParamsPageActions.vue'

const strings = {
  paramsList: t('paramsList'),
  noData: t('noData'),
  noPrevBuild: t('noPrevBuild'),
  fetching: t('fetching'),
  warmTip: t('warmTip'),
  ok: t('ok'),
}

const dialog = useDialog()
const themeStore = useThemeStore()

// status 的状态说明：
// 0：无数据
// 1：正在请求数据
// 2：请求完成（有数据）
// -1：请求失败
const status = ref(0)
// 之前的状态（上一次的状态）
const preStatus = ref(0)
const number = ref(0)
const fullDisplayName = ref('')
const url = ref('')
const building = ref(false)
const result = ref('')
const buildTime = ref('')
const builtOn = ref('')
const causes = ref<DisplayedBuildCause[]>([])
const parameters = ref<DisplayedBuildParameter[]>([])

const darkMode = computed(() => {
  return themeStore.darkMode
})

// 获取构建参数
getParameters()

function getParameters() {
  BrowserUtils.getCurrentTab().then((tab: Tabs.Tab | null) => {
    // console.log(tab)
    // const title = tab.title
    if (!tab) {
      console.log('tab is null!')
      return
    }
    const buildUrl = JenkinsBuild.getBuildUrlIfExist(tab.url!)
    console.log('buildUrl', buildUrl)
    if (!buildUrl) {
      // 不是 Jenkins 构建页面或子页面，不做任何处理
      return
    }
    getParametersByUrl(buildUrl)
  })
}

function getParametersByUrl(_url: string) {
  status.value = 1
  const jsonUrl = `${_url}/api/json`
  // console.log("jsonUrl", jsonUrl);
  Tools.getFetchOption(jsonUrl).then((header) => {
    fetch(jsonUrl, header).then((res) => {
      if (res.ok) {
        return res.json()
      } else {
        return Promise.reject(res)
      }
    }).then((data) => {
      status.value = 2
      preStatus.value = 2
      number.value = data.number
      fullDisplayName.value = data.fullDisplayName
      url.value = data.url // jenkins 设置的 jenkins 网站 url
      building.value = data.building
      result.value = data.result
      buildTime.value = new Date(data.timestamp).toLocaleString()
      builtOn.value = data.builtOn
      const actions = data.actions
      // console.log('actions', actions)
      parameters.value = JenkinsBuild.getBuildParametersFromActions(actions)
      causes.value = JenkinsBuild.getBuildCausesFromActions(actions, data.url, data.fullDisplayName)
    }).catch((e: Error) => {
      console.log('获取参数失败', e)
      status.value = preStatus.value
      dialog.info({
        title: strings.warmTip,
        content: strings.noData,
        positiveText: strings.ok,
      })
    })
  })
}

// 显示前一次构建信息
function prevBuild() {
  // url: http://127.0.0.1:8080/jenkins/job/Test1/21/
  let _url = url.value.substring(0, url.value.length - 1)
  _url = _url.substring(0, _url.lastIndexOf('/'))
  if (number.value > 1) {
    _url = `${_url}/${number.value - 1}`
    getParametersByUrl(_url)
  } else {
    dialog.info({
      title: strings.warmTip,
      content: strings.noPrevBuild,
      positiveText: strings.ok,
    })
  }
}

// 显示后一次构建信息
function nextBuild() {
  let _url = url.value.substring(0, url.value.length - 1)
  _url = _url.substring(0, _url.lastIndexOf('/'))
  _url = `${_url}/${number.value + 1}`
  getParametersByUrl(_url)
}
</script>

<template>
  <div class="params-wrapper">
    <BuildInfoView
      v-show="status === 2"
      :build-url="url"
      :full-display-name="fullDisplayName"
      :built-on="builtOn"
      :building="building"
      :build-result="result"
      :build-time="buildTime"
      :causes="causes"
      :dark-mode="darkMode"
    />

    <!-- 参数列表 -->
    <div
      v-show="status === 2 && parameters.length > 0"
      class="params-area"
    >
      <div style="font-weight: bold;">
        {{ strings.paramsList }}
      </div>
      <BuildParamsView
        class="parameters-table"
        :parameters="parameters"
      />
    </div>

    <!-- Prev/Next Button & 快捷按钮 -->
    <div style="margin-top: 16px;"></div>
    <BuildParamsPageActions
      v-show="status === 2"
      :build-url="url"
      :full-display-name="fullDisplayName"
      @prev-build="prevBuild"
      @next-build="nextBuild"
    />

    <!-- No Data -->
    <div v-show="status === 0">
      <n-empty :description="strings.noData ">
      </n-empty>
    </div>
    <!-- Fetching -->
    <div v-show="status === 1">
      <n-empty :description="strings.fetching">
        <template #icon>
          <n-icon>
            <Reload class="jk-is-loading" />
          </n-icon>
        </template>
      </n-empty>
    </div>
  </div>
</template>

<style lang="scss">
.params-wrapper {
  font-size: 12px;

  .params-area {
    margin-top: 10px;

    .parameters-table {
      margin-top: 6px;
    }
  }
}
</style>
