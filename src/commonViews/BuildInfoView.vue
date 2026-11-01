<script lang="ts" setup>
import type { DisplayedBadge, DisplayedBuildEnvVar, DisplayedBuildParameter } from '~/libs/jenkins/build'
import type { BadgeAction, BuildCause, CauseAction, HtmlBadgeAction, InterruptionCause, JenkinsBuild, ParametersAction, WorkflowEnvAction } from '~/models/jenkins/build'
import { Reload } from '@vicons/ionicons5'
import { onMounted, onUnmounted, ref, watch } from 'vue'
import BuildBadgesView from '~/commonViews/build-badges-view/BuildBadgesView.vue'
import BuildGeneralInfoView from '~/commonViews/build-general-info-view/BuildGeneralInfoView.vue'
import BuildParamsPageActions from '~/commonViews/build-params-page-actions/BuildParamsPageActions.vue'
import BuildParamsView from '~/commonViews/build-params-view/BuildParamsView.vue'
import { t } from '~/libs/extension'
import { fetch2 } from '~/libs/fetch2'
import { JenkinsBuildUtils } from '~/libs/jenkins/build'
import { Tools } from '~/libs/tools'
import { DataStatus } from '~/models/common'
import { BADGE_ACTION_CLASS, CAUSE_ACTION_CLASS, HTML_BADGE_ACTION_CLASS, INTERRUPTION_ACTION_CLASS, PARAMETERS_ACTION_CLASS, WORKFLOW_ENV_ACTION_CLASS } from '~/models/jenkins/build'
import BuildEnvVarsView from './build-envvars-view/BuildEnvVarsView.vue'

const props = defineProps<{
  buildUrl: string
  darkMode?: boolean
}>()

const strings = {
  badges: t('badges'),
  paramsList: t('paramsList'),
  envVarsList: t('envVarsList'),
  noData: t('noData'),
  noPrevBuild: t('noPrevBuild'),
  fetching: t('fetching'),
  warmTip: t('warmTip'),
  ok: t('ok'),
}

const status = ref(DataStatus.NoData)
const number = ref(0)
const fullDisplayName = ref('')
const url = ref('')
const building = ref(false)
const result = ref<string | null>(null)
const buildTime = ref('')
const builtOn = ref<string | undefined>(undefined)
const causes = ref<BuildCause[]>([])
const badges = ref<DisplayedBadge[]>([])
const parameters = ref<DisplayedBuildParameter[]>([])
const interruptionCauses = ref<InterruptionCause[]>([])
const envVars = ref<DisplayedBuildEnvVar[]>([])

watch(() => props.buildUrl, (newVal) => {
  if (newVal) {
    console.log('BuildInfoView::buildUrl', newVal)
    // 获取构建参数
    getParametersByUrl(newVal)
  }
}, { immediate: true })

function getParametersByUrl(_url: string) {
  status.value = DataStatus.Loading
  const encodeParam = encodeURI('*,actions[*,causes[*],parameters[*],environment[*]]')
  const jsonUrl = `${_url}/api/json?tree=${encodeParam}`
  // console.log("jsonUrl", jsonUrl);
  Tools.getFetchOption(jsonUrl).then((header) => {
    fetch2(jsonUrl, header).then((res) => {
      if (res.ok) {
        return res.json()
      } else {
        return Promise.reject(res)
      }
    }).then((data: JenkinsBuild) => {
      status.value = DataStatus.Loaded
      number.value = data.number
      fullDisplayName.value = data.fullDisplayName
      url.value = data.url // jenkins 设置的 jenkins 网站 url
      building.value = data.building
      result.value = data.result
      buildTime.value = new Date(data.timestamp).toLocaleString()
      builtOn.value = data.builtOn
      const actions = data.actions
      // console.log('actions', actions)
      let causeAction: CauseAction | null = null
      let interruptedBuildAction: InterruptionCause | null = null
      let parametersAction: ParametersAction | null = null
      let envAction: WorkflowEnvAction | null = null
      const badgeActions: BadgeAction[] = []
      const htmlBadgeActions: HtmlBadgeAction[] = []
      actions.forEach((action) => {
        console.log('action', action)
        if (action._class === CAUSE_ACTION_CLASS) {
          causeAction = action as CauseAction
        } else if (action._class === INTERRUPTION_ACTION_CLASS) {
          interruptedBuildAction = action as InterruptionCause
        } else if (action._class === PARAMETERS_ACTION_CLASS) {
          parametersAction = action as ParametersAction
        } else if (action._class === WORKFLOW_ENV_ACTION_CLASS) {
          envAction = action as WorkflowEnvAction
        } else if (action._class === BADGE_ACTION_CLASS) {
          badgeActions.push(action as BadgeAction)
        } else if (action._class === HTML_BADGE_ACTION_CLASS) {
          htmlBadgeActions.push(action as HtmlBadgeAction)
        }
      })
      parameters.value = JenkinsBuildUtils.getBuildParametersFromAction(parametersAction)
      causes.value = JenkinsBuildUtils.getBuildCausesFromAction(causeAction)
      badges.value = JenkinsBuildUtils.getBadgesFromActions(badgeActions, htmlBadgeActions)
      interruptionCauses.value = JenkinsBuildUtils.getInterruptionCausesFromAction(interruptedBuildAction)
      envVars.value = JenkinsBuildUtils.getBuildEnvVarsFromAction(envAction)
    }).catch((e: Error) => {
      console.log('获取参数失败', e)
      status.value = DataStatus.NoData
    })
  })
}

// 显示前一次构建信息
function prevBuild() {
  // url: http://127.0.0.1:8080/jenkins/job/Test1/21/
  number.value -= 1
  let _url = url.value.substring(0, url.value.length - 1)
  _url = _url.substring(0, _url.lastIndexOf('/'))
  if (number.value > 0) {
    _url = `${_url}/${number.value}`
    getParametersByUrl(_url)
  } else {
    status.value = DataStatus.NoData
  }
}

// 显示后一次构建信息
function nextBuild() {
  number.value += 1
  let _url = url.value.substring(0, url.value.length - 1)
  _url = _url.substring(0, _url.lastIndexOf('/'))
  _url = `${_url}/${number.value}`
  getParametersByUrl(_url)
}

// 左/右方向键切换前一次/后一次构建
function handleKeydown(e: KeyboardEvent) {
  // 避免在输入框等可编辑元素中拦截方向键
  const target = e.target as HTMLElement
  if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
    return
  }
  if (e.key === 'ArrowLeft') {
    if (number.value <= 1) {
      return
    }
    e.preventDefault()
    prevBuild()
  } else if (e.key === 'ArrowRight') {
    e.preventDefault()
    nextBuild()
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <div class="params-wrapper">
    <!-- Data Loaded -->
    <div v-show="status === DataStatus.Loaded">
      <!-- General Info -->
      <BuildGeneralInfoView
        :build-url="url"
        :full-display-name="fullDisplayName"
        :built-on="builtOn"
        :building="building"
        :build-result="result"
        :build-time="buildTime"
        :causes="causes"
        :interruption-causes="interruptionCauses"
        :dark-mode="darkMode"
      />
      <n-collapse
        class="collapse-area"
        :default-expanded-names="['badges', 'parameters', 'envVars']"
      >
        <!-- Badges -->
        <n-collapse-item
          v-show="badges.length > 0"
          name="badges"
        >
          <template #header>
            <div
              style="font-weight: bold;"
              title="Rely on the `Badge` plugin"
            >
              {{ strings.badges }}
            </div>
          </template>
          <BuildBadgesView
            class="badges-view"
            :badges="badges"
          />
        </n-collapse-item>
        <!-- 参数列表 -->
        <n-collapse-item
          v-show="parameters.length > 0"
          name="parameters"
        >
          <template #header>
            <div style="font-weight: bold;">
              {{ strings.paramsList }}
            </div>
          </template>
          <BuildParamsView
            class="parameters-table"
            :parameters="parameters"
          />
        </n-collapse-item>
        <!-- 环境变量列表 -->
        <n-collapse-item
          v-show="envVars.length > 0"
          name="envVars"
        >
          <template #header>
            <div
              style="font-weight: bold;"
              title="Rely on the `Pipeline: Groovy` plugin"
            >
              {{ strings.envVarsList }}
            </div>
          </template>
          <BuildEnvVarsView
            class="parameters-table"
            :env-vars="envVars"
          />
        </n-collapse-item>
      </n-collapse>
    </div>
    <!-- No Data -->
    <div v-show="status === DataStatus.NoData">
      <n-empty
        :description="strings.noData"
        style="margin: 26px 0;"
      >
      </n-empty>
    </div>
    <!-- Fetching -->
    <div v-show="status === DataStatus.Loading">
      <n-empty
        :description="strings.fetching"
        style="margin: 26px 0;"
      >
        <template #icon>
          <n-icon>
            <Reload class="jk-is-loading" />
          </n-icon>
        </template>
      </n-empty>
    </div>
    <!-- Prev/Next Button & 快捷按钮 -->
    <BuildParamsPageActions
      :build-url="url"
      :full-display-name="fullDisplayName"
      :build-number="number"
      :data-status="status"
      class="actions-area"
      @prev-build="prevBuild"
      @next-build="nextBuild"
    />
  </div>
</template>

<style lang="scss">
.params-wrapper {
  font-size: 12px;

  .collapse-area {
    .n-collapse-item {
        margin: 10px 0 0;
        border-top: none;
    }

    .n-collapse-item__header {
        padding: 10px 0 0;
        font-size: 13px;
    }
  }

  .actions-area {
    margin-top: 20px;
  }
}
</style>
