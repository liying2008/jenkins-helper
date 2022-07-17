<script lang="ts" setup>
import { h, onMounted, ref, watch } from 'vue'
import type { TableColumns } from 'naive-ui/es/data-table/src/interface'
import { NA, NCheckbox, NEl, NIcon } from 'naive-ui'
import { CheckmarkCircleOutline } from '@vicons/ionicons5'
import type { StorageChangeWrapper } from '~/libs/storage'
import { StorageService } from '~/libs/storage'
import { Tools } from '~/libs/tools'
import type { Options } from '~/models/option'
import { t } from '~/libs/extension'

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
  jobStatisticsDataFrom_: t('jobStatisticsDataFrom_'),
  jobStatisticsShowSettings: t('jobStatisticsShowSettings'),
  jobStatisticsShowEnabledJobOnly: t('jobStatisticsShowEnabledJobOnly'),
  jobStatisticsShowCronTableJobOnly: t('jobStatisticsShowCronTableJobOnly'),
}

const search = ref('')
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
          class: 'a-link-color jobs-table-url',
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
// 请求失败的URL
const badUrls = ref<string[]>([])
const nodeParams = ref<string[]>([])
const jobUrlVisited = ref<string[]>([])
const jobs = ref<JobInfo[]>([])
const originJobs = ref<JobInfo[]>([])
const xmlParser = new DOMParser()
const showEnabledJobOnly = ref(false)
const showCronTableJobOnly = ref(false)


watch(showEnabledJobOnly, () => {
  updateJobsFromOrigin()
})

watch(showCronTableJobOnly, () => {
  updateJobsFromOrigin()
})

onMounted(() => {
  console.log('lifecycle: ', 'App mounted!')
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
    if (result.jobStatsJenkinsUrl.trim() !== '') {
      jenkinsUrls.value = result.jobStatsJenkinsUrl.trim().split('\n')
    }
    if (result.nodeParam.trim() !== '') {
      nodeParams.value = result.nodeParam.trim().split(',')
    }
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
    if (newJobStatsJenkinsUrl.trim() !== '') {
      jenkinsUrls.value = newJobStatsJenkinsUrl.trim().split('\n')
    } else {
      jenkinsUrls.value = []
    }
    if (newNodeParam.trim() !== '') {
      nodeParams.value = newNodeParam.trim().split(',')
    } else {
      nodeParams.value = []
    }

    getJobStats()
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
  urls.value = []
  badUrls.value = []
  jobs.value = []
  jobUrlVisited.value = []
  const urlLen = jenkinsUrls.value.length

  for (let i = 0; i < urlLen; i++) {
    let url = jenkinsUrls.value[i].trim()
    if (url === '') {
      continue
    }
    url = url.charAt(url.length - 1) === '/' ? url.substring(0, url.length - 1) : url
    urls.value.push(url);

    (function (url: string) {
      const encodeParam = encodeURI('url,jobs[url]')
      const jsonUrl = `${url}/api/json?tree=${encodeParam}`
      Tools.getFetchOption(jsonUrl).then((header) => {
        fetch(jsonUrl, header).then((res) => {
          if (res.ok) {
            return res.json()
          } else {
            return Promise.reject(res)
          }
        }).then((data) => {
          if (data.hasOwnProperty('jobs')) {
            const jobLen = data.jobs.length
            for (let jobIndex = 0; jobIndex < jobLen; jobIndex++) {
              getJobStatsByUrl(data.jobs[jobIndex].url)
            }
          } else {
            // Job Url
            getJobStatsByUrl(data.url)
          }
        }).catch((e: Error) => {
          console.log('获取Job URL失败', url, e)
          badUrls.value.push(url)
        })
      })
    })(url)
  }
}

function getJobStatsByUrl(url: string) {
  if (jobUrlVisited.value.includes(url)) {
    return
  } else {
    jobUrlVisited.value.push(url)
  }

  Tools.getFetchOption(`${url}config.xml`).then((header) => {
    fetch(`${url}config.xml`, header).then((res) => {
      return res.ok ? res.text() : Promise.reject(res)
    }).then((text) => {
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
    }).catch((e: Error) => {
      console.log('读取config.xml失败', e)
    })
  })
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

/**
 * 获取数据来源的描述
 */
function getStatisticsDataFromDesc() {
  const _urls = urls.value.map((item: string) => decodeURIComponent(item))
  if (_urls.length === 0) {
    _urls.push('NA')
  }
  return `${strings.jobStatisticsDataFrom_}\n\n${_urls.join('\n')}`
}
</script>

<template>
  <div class="job-stats-wrapper">
    <div
      class="job-stats-title"
      :title="getStatisticsDataFromDesc()"
    >
      {{ strings.title }}
    </div>
    <n-data-table
      class="jobs-table"
      :columns="headers"
      :data="jobs"
      size="small"
      :search="search"
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
          <n-checkbox v-model:checked="showEnabledJobOnly">
            {{ strings.jobStatisticsShowEnabledJobOnly }}
          </n-checkbox>
        </div>
        <div class="mt-4px">
          <n-checkbox v-model:checked="showCronTableJobOnly">
            {{ strings.jobStatisticsShowCronTableJobOnly }}
          </n-checkbox>
        </div>
      </n-card>
    </div>
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
