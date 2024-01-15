<script lang="ts" setup>
import { h, onMounted, ref, watch } from 'vue'
import type { TableColumns } from 'naive-ui/es/data-table/src/interface'
import { NA, NCheckbox, NEl, NIcon, useNotification } from 'naive-ui'
import { CheckmarkCircleOutline, CheckmarkCircleSharp, CloseCircleSharp, SettingsOutline } from '@vicons/ionicons5'
import SettingsModal from './SettingsModal.vue'
import type { StorageChangeWrapper } from '~/libs/storage'
import { StorageService } from '~/libs/storage'
import { Tools } from '~/libs/tools'
import type { Options } from '~/models/option'
import { t } from '~/libs/extension'
import { removeEnd } from '~/libs/common'
import { DataStatus } from '~/models/common'
import type { JenkinsView } from '~/models/jenkins/view'
import { fetch2 } from '~/libs/fetch2'

class JobInfo {
  url: string = ''
  node: string = ''
  param: string = '[N]'
  disabled: boolean = false
  timerTrigger: string = ''
  concurrentBuild: boolean = false
}

const strings = {
  noData: t('noData'),
  title: t('jobStatisticsTitle'),
  jobStatisticsDataFrom: t('jobStatisticsDataFrom'),
  jobStatisticsDataFetchSuccess: t('jobStatisticsDataFetchSuccess'),
  jobStatisticsDataFetchFailure: t('jobStatisticsDataFetchFailure'),
  jobStatisticsShowSettings: t('jobStatisticsShowSettings'),
  jobStatisticsShowEnabledJobOnly: t('jobStatisticsShowEnabledJobOnly'),
  jobStatisticsShowCronTableJobOnly: t('jobStatisticsShowCronTableJobOnly'),
}

const notification = useNotification()

const headers: TableColumns<JobInfo> = [
  {
    title: 'Job URL',
    align: 'left',
    key: 'url',
    sorter: 'default',
    render(row) {
      return h(
        NA,
        {
          href: row.url,
          target: '_blank',
          class: 'jk-a-link-color jobs-table-url',
        },
        { default: () => row.url },
      )
    },
  },
  {
    title: 'Cron Table',
    align: 'left',
    key: 'timerTrigger',
    width: '110px',
    sorter: 'default',
    render(row) {
      return h(
        NEl,
        {
          class: 'pre-line',
        },
        { default: () => row.timerTrigger },
      )
    },
  },
  {
    title: 'Node',
    align: 'left',
    key: 'node',
    width: '110px',
    sorter: 'default',
    render(row) {
      return h(
        NEl,
        {
          class: 'pre-line',
          title: row.param,
        },
        { default: () => row.node },
      )
    },
  },
  {
    title: 'Disabled?',
    align: 'center',
    key: 'disabled',
    width: '110px',
    sorter: 'default',
    render(row) {
      if (row.disabled) {
        return h(
          NIcon,
          {
            class: 'checked-icon',
            size: 16,
            component: CheckmarkCircleOutline,
          },
        )
      }
    },
  },
  {
    title: 'Concurrent?',
    align: 'center',
    key: 'concurrentBuild',
    width: '120px',
    sorter: 'default',
    render(row) {
      if (row.concurrentBuild) {
        return h(
          NIcon,
          {
            class: 'checked-icon',
            size: 16,
            component: CheckmarkCircleOutline,
          },
        )
      }
    },
  },
]

const jenkinsUrls = ref<string[]>([])
// 请求数据的URL
const urls = ref<string[]>([])
// 请求成功的URL
const successUrls = ref<string[]>([])
// 请求失败的URL
const badUrls = ref<string[]>([])
const status = ref<DataStatus>(DataStatus.NoData)

const nodeParams = ref<string[]>([])
const jobUrlVisited = ref<string[]>([])
const jobs = ref<JobInfo[]>([])
const originJobs = ref<JobInfo[]>([])
const xmlParser = new DOMParser()
const showEnabledJobOnly = ref(false)
const showCronTableJobOnly = ref(false)

const modalVisible = ref(false)

watch(showEnabledJobOnly, () => {
  updateJobsFromOrigin()
})

watch(showCronTableJobOnly, () => {
  updateJobsFromOrigin()
})

onMounted(() => {
  init()
})

function getRowClass(item: JobInfo) {
  if (item.disabled) {
    return 'disabled-row'
  } else {
    return ''
  }
}

function init() {
  StorageService.addStorageListener(jobStatsChange)
  StorageService.getOptions().then((result: Options) => {
    refreshEssentialVars(result.jobStatsJenkinsUrl, result.nodeParam)
    getJobStats()
  })
}

function jobStatsChange(changes: StorageChangeWrapper) {
  if (StorageService.keyForOptions in changes) {
    // 设置改变
    const newNodeParam = changes[StorageService.keyForOptions].newValue.nodeParam
    const newJobStatsJenkinsUrl = changes[StorageService.keyForOptions].newValue.jobStatsJenkinsUrl
    if (changes[StorageService.keyForOptions].oldValue !== undefined
      && newNodeParam === changes[StorageService.keyForOptions].oldValue.nodeParam
      && newJobStatsJenkinsUrl === changes[StorageService.keyForOptions].oldValue.jobStatsJenkinsUrl) {
      // Job 统计相关设置没有改变
      return
    }
    // 设置改变了，重新请求数据
    refreshEssentialVars(newJobStatsJenkinsUrl, newNodeParam)
    getJobStats()
  }
}

function refreshEssentialVars(jobStatsJenkinsUrl: string, nodeParam: string) {
  if (jobStatsJenkinsUrl.trim() !== '') {
    jenkinsUrls.value = jobStatsJenkinsUrl.split('\n').map((url) => {
      const _url = url.trim()
      if (_url && !_url.startsWith('#')) {
        return _url
      } else {
        return ''
      }
    }).filter((url) => url !== '')
  } else {
    jenkinsUrls.value = []
  }
  if (nodeParam.trim() !== '') {
    nodeParams.value = nodeParam.split(',').map((param) => param.trim()).filter((param) => param !== '')
  } else {
    nodeParams.value = []
  }
}

function updateJobsFromOrigin() {
  jobs.value = []
  jobs.value = originJobs.value.filter((item: JobInfo) => {
    if (showEnabledJobOnly.value && item.disabled) {
      return false
    }
    if (showCronTableJobOnly.value && isCronTableComment(item.timerTrigger)) {
      return false
    }
    return true
  })
}

// 判断一个crontable是否被注释掉了，需要判断是否每行都被注释了
function isCronTableComment(cronTableStr: string) {
  if (!cronTableStr) {
    return true
  }
  let comment = true
  cronTableStr = cronTableStr.trim()
  const cronTables = cronTableStr.split('\n')
  for (let i = 0; i < cronTables.length; i++) {
    if (cronTables[i].trim().indexOf('#') !== 0) {
      comment = false
      break
    }
  }
  return comment
}

function getJobStats() {
  status.value = DataStatus.Loading
  urls.value = []
  successUrls.value = []
  badUrls.value = []
  jobs.value = []
  jobUrlVisited.value = []

  const allProcesses = jenkinsUrls.value.map((url) => removeEnd(url.trim(), '/'))
    .filter((url) => url !== '').map((url) => {
      urls.value.push(url)
      console.log('processing url: ', url)
      return processSingleUrl(url)
    })

  Promise.all(allProcesses).then(() => {
    console.log('getJobStats done!')
    status.value = DataStatus.Loaded
    // 获取获取成功的URL
    successUrls.value = urls.value.filter((url) => !badUrls.value.includes(url))

    if (successUrls.value.length > 0 && badUrls.value.length === 0) {
      // 请求全部成功
      notification.success({
        content: '数据获取成功',
        duration: 5000,
      })
    } else if (successUrls.value.length > 0 && badUrls.value.length > 0) {
      // 请求部分成功
      notification.warning({
        content: '部分数据获取失败',
        duration: 7000,
      })
    } else if (successUrls.value.length === 0 && badUrls.value.length > 0) {
      // 请求全部失败
      notification.error({
        content: '数据获取失败',
        duration: 10000,
      })
    } else {
      // 没有请求
      status.value = DataStatus.NoData
      notification.info({
        title: '无数据',
        content: 'Job 统计未配置',
        duration: 3000,
      })
    }
  })
}

async function processSingleUrl(url: string) {
  const encodeParam = encodeURI('url,jobs[url]')
  const jsonUrl = `${url}/api/json?tree=${encodeParam}`
  try {
    const header = await Tools.getFetchOption(jsonUrl)
    const res = await fetch2(jsonUrl, header)
    if (res.ok) {
      const data = await res.json()
      if (data.hasOwnProperty('jobs')) {
        // View Url
        const allProcesses = (data.jobs as JenkinsView[]).map((job) => getJobStatsByUrl(job.url))
        const result = await Promise.all(allProcesses)
        console.log('result', result)
        if (result.find((item) => item === false) === undefined) {
          // 所有Job配置都读取成功
          // no op
        } else {
          // 至少有一个Job配置读取失败
          badUrls.value.push(url)
        }
      } else {
        // Job Url
        const success = await getJobStatsByUrl(data.url)
        if (!success) {
          badUrls.value.push(url)
        }
      }
    } else {
      console.log('获取Job URL失败', url, res)
      badUrls.value.push(url)
    }
  } catch (e) {
    console.error('getJobStats error', e)
    badUrls.value.push(url)
  }
}

async function getJobStatsByUrl(url: string) {
  if (jobUrlVisited.value.includes(url)) {
    return true
  } else {
    jobUrlVisited.value.push(url)
  }

  const header = await Tools.getFetchOption(`${url}config.xml`)
  try {
    const res = await fetch2(`${url}config.xml`, header)
    if (res.ok) {
      let text = await res.text()
      // 为了兼容Firefox，需要截取掉XML头部：<?xml version='1.1' encoding='UTF-8'?>
      // 参考：https://github.com/liying2008/jenkins-helper/issues/6
      const index = text.indexOf('<', 1)
      if (index > 1) {
        text = text.substring(index)
      }
      // console.log('text', text);
      const documentNode = xmlParser.parseFromString(text, 'text/xml')
      const projectNodes = documentNode.getElementsByTagName('project')

      let job: JobInfo | undefined
      if (projectNodes.length > 0) {
      // 自由风格项目
        job = parseFreeStyleJobFromXml(projectNodes[0])
      } else {
        const flowNodes = documentNode.getElementsByTagName('flow-definition')
        if (flowNodes.length > 0) {
        // 流水线项目
          job = parsePipelineJobFromXml(flowNodes[0])
        } else {
        // 其他项目
        // todo
        }
      }
      // console.log('job', job)
      if (job) {
        job.url = decodeURIComponent(url)
        jobs.value.push(job)
        originJobs.value.push(job)
      }
      return true
    } else {
      throw new Error(res.statusText)
    }
  } catch (e) {
    console.log('读取 config.xml 失败', e)
    return false
  }
}

/**
 * 解析自由风格 Job 的XML
 * @param projectNode
 * @returns {{timerTrigger: *, node: *, concurrentBuild: *, param: *, disabled: *}}
 */
function parseFreeStyleJobFromXml(projectNode: Element): JobInfo {
  // console.log('parseFreeStyleJobFromXml::projectNode', projectNode)
  let node = ''
  let param = '[N]'
  let disabled = ''
  let timerTrigger = ''
  let concurrentBuild = ''

  const assignedNodes = projectNode.getElementsByTagName('assignedNode')
  if (assignedNodes.length > 0) {
    node = assignedNodes[0].textContent || ''
  } else {
    // 没有 assignedNode，查找参数
    if (nodeParams.value.length > 0) {
      [node, param] = getParamsNode(projectNode)
    }
  }
  // disabled
  const disabledNodes = projectNode.getElementsByTagName('disabled')
  if (disabledNodes.length > 0) {
    disabled = disabledNodes[0].textContent || ''
  }
  // timerTrigger
  const timerTriggerNodes = projectNode.getElementsByTagName('hudson.triggers.TimerTrigger')
  if (timerTriggerNodes.length > 0) {
    timerTrigger = timerTriggerNodes[0].getElementsByTagName('spec')[0].textContent || ''
  }
  // concurrentBuild
  const concurrentBuildNodes = projectNode.getElementsByTagName('concurrentBuild')
  if (concurrentBuildNodes.length > 0) {
    concurrentBuild = concurrentBuildNodes[0].textContent || ''
  }
  return {
    url: '',
    node,
    param,
    disabled: disabled === 'true',
    timerTrigger,
    concurrentBuild: concurrentBuild === 'true',
  }
}

/**
 * 解析 Pipeline Job 的XML
 * @param flowNode
 * @returns {{timerTrigger: *, node: *, concurrentBuild: *, param: *, disabled: *}}
 */
function parsePipelineJobFromXml(flowNode: Element): JobInfo {
  let node = ''
  let param = ''
  let disabled = ''
  let timerTrigger = ''
  let concurrentBuild = ''

  // disabled
  const disabledNodes = flowNode.getElementsByTagName('disabled')
  if (disabledNodes.length > 0) {
    disabled = disabledNodes[0].textContent || ''
  }
  // timerTrigger
  const timerTriggerNodes = flowNode.getElementsByTagName('hudson.triggers.TimerTrigger')
  if (timerTriggerNodes.length > 0) {
    timerTrigger = timerTriggerNodes[0].getElementsByTagName('spec')[0].textContent || ''
  }
  // concurrentBuild
  const concurrentBuildNodes = flowNode.getElementsByTagName('org.jenkinsci.plugins.workflow.job.properties.DisableConcurrentBuildsJobProperty')
  if (concurrentBuildNodes.length > 0) {
    concurrentBuild = 'false'
  } else {
    concurrentBuild = 'true'
  }
  // node
  const assignedNodes = flowNode.getElementsByTagName('assignedNode')
  if (assignedNodes.length > 0) {
    node = assignedNodes[0].textContent || ''
  } else {
    // 没有 assignedNode，查找参数
    if (nodeParams.value.length > 0) {
      [node, param] = getParamsNode(flowNode)
    }
  }

  return {
    url: '',
    node,
    param,
    disabled: disabled === 'true',
    timerTrigger,
    concurrentBuild: concurrentBuild === 'true',
  }
}

function getParamsNode(rootNode: Element) {
  // console.log('getParamsNode::rootNode', rootNode)
  let node = ''
  let param = ''
  const parameterDefinitionsNodes = rootNode.getElementsByTagName('parameterDefinitions')
  if (parameterDefinitionsNodes.length > 0) {
    const parameterDefinitionChildren = parameterDefinitionsNodes[0].childNodes
    // console.log('parameterDefinitionChildren', parameterDefinitionChildren)
    const params = new Map<string, string>()
    for (let paramIndex = 0; paramIndex < parameterDefinitionChildren.length; paramIndex++) {
      const paramNode = parameterDefinitionChildren[paramIndex]
      if (paramNode.nodeType === Node.TEXT_NODE) {
        continue
      }
      const nameNodes = (paramNode as Element).getElementsByTagName('name')
      if (nameNodes.length === 0) {
        continue
      }
      const name = (paramNode as Element).getElementsByTagName('name')[0].textContent || ''
      let value = ''
      const defaultValueNodes = (paramNode as Element).getElementsByTagName('defaultValue')
      const choiceNodes = (paramNode as Element).getElementsByTagName('choices')
      const defaultSlavesNodes = (paramNode as Element).getElementsByTagName('defaultSlaves')
      if (defaultValueNodes.length > 0) {
        value = defaultValueNodes[0].textContent || ''
      } else if (choiceNodes.length > 0) {
        const choiceChildren = choiceNodes[0].getElementsByTagName('a')[0].childNodes
        for (let choiceNodeIndex = 0; choiceNodeIndex < choiceChildren.length; choiceNodeIndex++) {
          if (choiceChildren[choiceNodeIndex].nodeType === Node.TEXT_NODE) {
            continue
          }
          value = choiceChildren[choiceNodeIndex].textContent || ''
          break
        }
      } else if (defaultSlavesNodes.length > 0) {
        const defaultSlaveStringNodes = defaultSlavesNodes[0].getElementsByTagName('string')
        if (defaultSlaveStringNodes.length > 0) {
          value = defaultSlaveStringNodes[0].textContent || ''
        }
      }
      params.set(name, value)
    }
    for (let nodeParamsIndex = 0; nodeParamsIndex < nodeParams.value.length; nodeParamsIndex++) {
      param = nodeParams.value[nodeParamsIndex]
      if (params.has(param)) {
        node = params.get(param)!
        break
      }
    }
  }
  return [node, param]
}
</script>

<template>
  <div class="job-stats-wrapper">
    <div class="job-stats-title">
      {{ strings.title }}
    </div>
    <div class="data-source">
      <n-descriptions
        bordered
        size="small"
      >
        <n-descriptions-item>
          <template #label>
            <div style="display: flex;">
              <span style="flex: 1;">{{ strings.jobStatisticsDataFrom }}</span>
              <span>
                <n-button
                  text
                  style=" font-size: 16px;vertical-align: middle;"
                  @click="modalVisible = true"
                >
                  <NIcon>
                    <SettingsOutline />
                  </NIcon>
                </n-button>
              </span>
            </div>
          </template>
          <!-- 数据加载中 -->
          <div
            v-show="status === DataStatus.Loading"
            class="source-loading"
          >
            <n-spin size="small" />
          </div>
          <!-- 未配置Job统计数据 -->
          <div
            v-show="status === DataStatus.NoData"
            class="no-source"
          >
            {{ strings.noData }}
          </div>
          <!-- 数据加载完毕 -->
          <div v-show="status === DataStatus.Loaded">
            <div
              v-for="(url, index) in successUrls"
              :key="index"
              class="success-urls-div"
            >
              <NIcon
                size="16"
                color="var(--jk-success)"
                class="source-status-icon source-success-icon"
                :title="`${url}: ${strings.jobStatisticsDataFetchSuccess}`"
              >
                <CheckmarkCircleSharp />
              </NIcon>
              {{ decodeURIComponent(url) }}
            </div>

            <div
              v-for="(url, index) in badUrls"
              :key="index"
              class="bad-urls-div"
            >
              <NIcon
                size="16"
                color="var(--jk-error)"
                class="source-status-icon source-error-icon"
                :title="`${url}: ${strings.jobStatisticsDataFetchFailure}`"
              >
                <CloseCircleSharp />
              </NIcon>
              {{ decodeURIComponent(url) }}
            </div>
          </div>
        </n-descriptions-item>
      </n-descriptions>
    </div>
    <n-data-table
      class="jobs-table"
      :columns="headers"
      :data="jobs"
      size="small"
      :row-class-name="getRowClass"
    >
      <template #empty>
        <div class="data-table-no-data">
          {{ strings.noData }}
        </div>
      </template>
    </n-data-table>
    <!-- 显示设置 -->
    <div
      v-show="originJobs.length > 0"
      class="display-settings"
    >
      <n-card
        :title="strings.jobStatisticsShowSettings"
        size="small"
      >
        <div>
          <NCheckbox v-model:checked="showEnabledJobOnly">
            {{ strings.jobStatisticsShowEnabledJobOnly }}
          </NCheckbox>
        </div>
        <div class="mt-4px">
          <NCheckbox v-model:checked="showCronTableJobOnly">
            {{ strings.jobStatisticsShowCronTableJobOnly }}
          </NCheckbox>
        </div>
      </n-card>
    </div>
    <!-- 设置对话框 -->
    <SettingsModal
      :show="modalVisible"
      @close="modalVisible = false"
    />
  </div>
</template>

<style lang="scss">
.job-stats-wrapper {
  padding: 24px;

  .job-stats-title {
    margin-top: 6px;
    font-size: 20px;
    font-weight: 600;
    text-align: center;
  }

  .data-source {
    margin-top: 24px;

    .no-source {
      padding: 8px 0;
      color: #88888888;
      text-align: center;
    }

    .source-loading {
      padding-top: 6px;
      text-align: center;
    }

    .success-urls-div {
      color: var(--jk-success);
    }

    .bad-urls-div {
      color: var(--jk-error);
    }

    .source-status-icon {
      margin-right: 8px;
      vertical-align: sub;
      cursor: help;
    }
  }

  .jobs-table {
    margin-top: 24px;

    .jobs-table-url {
      text-decoration-line: none;
      word-break: break-all;
      word-wrap: break-word;
    }

    .pre-line {
      white-space: pre-line;
    }

    .disabled-row > td {
      background-color: var(--jk-disabledline);
    }

    .checked-icon {
      vertical-align: middle;
    }

    .n-data-table-empty {
      padding: 0;
    }

    .data-table-no-data {
      padding: 8px 0;
      color: #88888888;
      text-align: center;
    }
  }

  .display-settings {
    margin-top: 24px;
  }
}
</style>
