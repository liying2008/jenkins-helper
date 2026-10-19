<script setup lang="ts">
import type { DisplayedBuildParameter } from '~/libs/jenkins/build'
import type { BadgeAction, BuildCause, CauseAction, HtmlBadgeAction, InterruptionCause, JenkinsBuild, ParametersAction, WorkflowEnvAction } from '~/models/jenkins/build'
import { Reload } from '@vicons/ionicons5'
import { useDialog } from 'naive-ui'
import { computed, ref, watch } from 'vue'
import BuildInfoView from '~/commonViews/build-info-view/BuildInfoView.vue'
import BuildParamsPageActions from '~/commonViews/build-params-page-actions/BuildParamsPageActions.vue'
import BuildParamsView from '~/commonViews/build-params-view/BuildParamsView.vue'
import { getRoot } from '~/contentScripts/libs/app-dom'
import { t } from '~/libs/extension'
import { fetch2 } from '~/libs/fetch2'
import { JenkinsBuildUtils } from '~/libs/jenkins/build'
import { Tools } from '~/libs/tools'
import { DataStatus } from '~/models/common'
import { BADGE_ACTION_CLASS, CAUSE_ACTION_CLASS, HTML_BADGE_ACTION_CLASS, INTERRUPTION_ACTION_CLASS, PARAMETERS_ACTION_CLASS, WORKFLOW_ENV_ACTION_CLASS } from '~/models/jenkins/build'

const props = defineProps<{
  visible: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const strings = {
  paramsList: t('paramsList'),
  noData: t('noData'),
  noPrevBuild: t('noPrevBuild'),
  fetching: t('fetching'),
  warmTip: t('warmTip'),
  ok: t('ok'),
}

const dialog = useDialog()

const buildUrl = getRoot()?.getAttribute('build-url') || ''

const status = ref<DataStatus>(DataStatus.NoData)
// 之前的状态（上一次的状态）
const preStatus = ref<DataStatus>(DataStatus.NoData)
const number = ref(0)
const fullDisplayName = ref('')
const url = ref('')
const building = ref(false)
const result = ref<string | null>(null)
const buildTime = ref('')
const builtOn = ref<string | undefined>(undefined)
const causes = ref<BuildCause[]>([])
const parameters = ref<DisplayedBuildParameter[]>([])
const interruptionCauses = ref<InterruptionCause[]>([])

const editableVisible = computed({
  get() {
    return props.visible
  },
  set(value: boolean) {
    if (!value) {
      emit('close')
    }
  },
})

watch(editableVisible, (newVal: boolean) => {
  if (newVal) {
    // 获取构建参数
    // TODO 考虑是否缓存
    getParameters()
  }
})

function getParameters() {
  console.log('BuildInfoModal::buildUrl', buildUrl)
  if (!buildUrl) {
    // 不是 Jenkins 构建页面或子页面，不做任何处理
    return
  }
  getParametersByUrl(buildUrl)
}

function getParametersByUrl(_url: string) {
  status.value = DataStatus.Loading
  const encodeParam = encodeURI('*,actions[*,causes[*],parameters[*],environment[*],envMap[*]]')
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
      preStatus.value = DataStatus.Loaded
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
      let badgeActions: BadgeAction[] = []
      let htmlBadgeActions: HtmlBadgeAction[] = []
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
      parameters.value = JenkinsBuildUtils.getBuildParametersFromActions(parametersAction)
      causes.value = JenkinsBuildUtils.getBuildCausesFromActions(causeAction)
      interruptionCauses.value = JenkinsBuildUtils.getInterruptionCausesFromActions(interruptedBuildAction)
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
  <n-modal v-model:show="editableVisible">
    <n-card
      class="modal-card"
      title="构建参数"
      :bordered="false"
      size="medium"
      role="dialog"
      closable
      preset="card"
      aria-modal="true"
      @close="editableVisible = false"
    >
      <div class="params-wrapper">
        <BuildInfoView
          v-show="status === DataStatus.Loaded"
          :build-url="url"
          :full-display-name="fullDisplayName"
          :built-on="builtOn"
          :building="building"
          :build-result="result"
          :build-time="buildTime"
          :causes="causes"
          :interruption-causes="interruptionCauses"
          :dark-mode="false"
        />

        <!-- 参数列表 -->
        <div
          v-show="status === DataStatus.Loaded && parameters.length > 0"
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
          v-show="status === DataStatus.Loaded"
          :build-url="url"
          :full-display-name="fullDisplayName"
          @prev-build="prevBuild"
          @next-build="nextBuild"
        />

        <!-- No Data -->
        <div v-show="status === DataStatus.NoData">
          <n-empty :description="strings.noData ">
          </n-empty>
        </div>
        <!-- Fetching -->
        <div v-show="status === DataStatus.Loading">
          <n-empty :description="strings.fetching">
            <template #icon>
              <n-icon>
                <Reload class="jk-is-loading" />
              </n-icon>
            </template>
          </n-empty>
        </div>
      </div>
    </n-card>
  </n-modal>
</template>

<style scoped lang="scss">
.modal-card {
  max-width: min(800px, 60%);

  .params-wrapper {
    font-size: 12px;

    .params-area {
      margin-top: 10px;

      .parameters-table {
        margin-top: 6px;
      }
    }
  }
}
</style>
