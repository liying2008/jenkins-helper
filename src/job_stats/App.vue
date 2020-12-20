<template>
  <v-app id="job-stats-wrapper">
    <v-container
      fluid
      class="px-8"
    >
      <div
        class="text-h5 text-center my-6"
        :title="getStatisticsDataFromDesc()"
      >
        {{ strings.title }}
      </div>
      <v-divider></v-divider>
      <v-data-table
        id="jobs-table"
        dense
        :headers="headers"
        :items="jobs"
        :search="search"
        :item-class="getRowClass"
        sort-by="node"
        hide-default-footer
        disable-pagination
      >
        <!-- Job URL -->
        <template v-slot:[`item.url`]="{ item }">
          <a
            :href="item.url"
            target="_blank"
            class="jobs-table-url"
          >{{ item.url }}</a>
        </template>

        <!-- Cron Table -->
        <template v-slot:[`item.timerTrigger`]="{ item }">
          <div class="pre-line">
            {{ item.timerTrigger }}
          </div>
        </template>

        <!-- Node -->
        <template v-slot:[`item.node`]="{ item }">
          <div
            class="pre-line"
            :title="item.param"
          >
            {{ item.node }}
          </div>
        </template>
      </v-data-table>
      <v-divider></v-divider>

      <!-- 显示设置 -->
      <v-list
        v-show="originJobs.length > 0"
        id="display-settings"
        outlined
        subheader
        class="my-6"
      >
        <v-subheader>{{ strings.jobStatisticsShowSettings_ }}</v-subheader>
        <v-list-item-group
          v-model="settings"
          active-class="primary--text"
          multiple
        >
          <!-- 不显示禁用的Job -->
          <v-list-item dense>
            <template v-slot:default="{ active }">
              <v-list-item-action class="reduce-action-width">
                <v-checkbox
                  dense
                  :input-value="active"
                ></v-checkbox>
              </v-list-item-action>
              <v-list-item-content>
                <div>{{ strings.jobStatisticsShowEnabledJobOnly }}</div>
              </v-list-item-content>
            </template>
          </v-list-item>

          <!-- 不显示无定时器的Job -->
          <v-list-item dense>
            <template v-slot:default="{ active }">
              <v-list-item-action class="reduce-action-width">
                <v-checkbox
                  dense
                  :input-value="active"
                ></v-checkbox>
              </v-list-item-action>
              <v-list-item-content>
                <div>
                  {{ strings.jobStatisticsShowCronTableJobOnly }}
                </div>
              </v-list-item-content>
            </template>
          </v-list-item>
        </v-list-item-group>
      </v-list>
    </v-container>
  </v-app>
</template>

<script lang="ts">
import { StorageChangeWrapper, StorageService } from '@/libs/storage'
import { Tools } from '@/libs/tools'
import { Options } from '@/models/option'
import { Vue, Component, Watch } from 'vue-property-decorator'
import { DataTableHeader } from 'vuetify'

class JobInfo {
  url: string = ''
  node: string = ''
  param: string = '[N]'
  disabled: string = ''
  timerTrigger: string = ''
  concurrentBuild: string = ''
}

@Component
export default class App extends Vue {
  strings = {
    title: browser.i18n.getMessage('jobStatisticsTitle'),
    jobStatisticsDataFrom_: browser.i18n.getMessage('jobStatisticsDataFrom_'),
    jobStatisticsShowSettings_: browser.i18n.getMessage('jobStatisticsShowSettings_'),
    jobStatisticsShowEnabledJobOnly: browser.i18n.getMessage('jobStatisticsShowEnabledJobOnly'),
    jobStatisticsShowCronTableJobOnly: browser.i18n.getMessage('jobStatisticsShowCronTableJobOnly'),
  }
  search = ''
  settings: number[] = []
  headers: DataTableHeader[] = [
    { text: 'Job URL', align: 'start', value: 'url' },
    { text: 'Cron Table', align: 'start', value: 'timerTrigger', filterable: false },
    { text: 'Node', align: 'start', value: 'node' },
    { text: 'Disabled?', align: 'start', value: 'disabled', filterable: false },
    { text: 'Concurrent?', align: 'start', value: 'concurrentBuild', filterable: false },
  ]

  jenkinsUrls: string[] = []
  // 请求数据的URL
  urls: string[] = []
  // 请求失败的URL
  badUrls: string[] = []
  nodeParams: string[] = []
  jobUrlVisited: string[] = []
  jobs: JobInfo[] = []
  originJobs: JobInfo[] = []
  xmlParser: DOMParser = new DOMParser()
  showEnabledJobOnly = false
  showCronTableJobOnly = false

  @Watch('settings')
  watchSettings(newValue: number[]) {
    console.log(newValue)
    if (newValue.indexOf(0) > -1) {
      this.showEnabledJobOnly = true
    } else {
      this.showEnabledJobOnly = false
    }
    if (newValue.indexOf(1) > -1) {
      this.showCronTableJobOnly = true
    } else {
      this.showCronTableJobOnly = false
    }
    this.updateJobsFromOrigin()
  }

  mounted() {
    console.log('lifecycle: ', 'App mounted!')
    this.init()
  }

  getRowClass(item: JobInfo) {
    if (item.disabled === 'true') {
      return 'disabled-row'
    } else {
      return ''
    }
  }

  init() {
    StorageService.addStorageListener(this.jobStatsChange)
    StorageService.getOptions().then((result: Options) => {
      if (result.jobStatsJenkinsUrl.trim() !== '') {
        this.jenkinsUrls = result.jobStatsJenkinsUrl.trim().split('\n')
      }
      if (result.nodeParam.trim() !== '') {
        this.nodeParams = result.nodeParam.trim().split(',')
      }
      this.getJobStats()
    })
  }

  jobStatsChange(changes: StorageChangeWrapper) {
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
        this.jenkinsUrls = newJobStatsJenkinsUrl.trim().split('\n')
      } else {
        this.jenkinsUrls = []
      }
      if (newNodeParam.trim() !== '') {
        this.nodeParams = newNodeParam.trim().split(',')
      } else {
        this.nodeParams = []
      }

      this.getJobStats()
    }
  }

  updateJobsFromOrigin() {
    this.jobs = []
    this.jobs = this.originJobs.filter((item: JobInfo) => {
      if (this.showEnabledJobOnly && item.disabled === 'true') return false
      if (this.showCronTableJobOnly && this.isCronTableComment(item.timerTrigger)) return false
      return true
    })
  }

  // 判断一个crontable是否被注释掉了，需要判断是否每行都被注释了
  isCronTableComment(cronTableStr: string) {
    if (!cronTableStr) return true
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

  getJobStats() {
    this.urls = []
    this.badUrls = []
    this.jobs = []
    this.jobUrlVisited = []
    const urlLen = this.jenkinsUrls.length

    for (let i = 0; i < urlLen; i++) {
      let url = this.jenkinsUrls[i].trim()
      if (url === '') {
        continue
      }
      url = url.charAt(url.length - 1) === '/' ? url.substring(0, url.length - 1) : url
      this.urls.push(url);

      (function (url: string, context: App) {
        const encodeParam = encodeURI('url,jobs[url]')
        const jsonUrl = url + '/api/json?tree=' + encodeParam
        Tools.getFetchOption(jsonUrl).then((header: RequestInit) => {
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
                context.getJobStatsByUrl(data.jobs[jobIndex].url)
              }
            } else {
              // Job Url
              context.getJobStatsByUrl(data.url)
            }
          }).catch((e: Error) => {
            console.error('获取Job URL失败', url, e)
            context.badUrls.push(url)
          })
        })
      })(url, this)
    }
  }

  getJobStatsByUrl(url: string) {
    if (this.jobUrlVisited.indexOf(url) >= 0) {
      return
    } else {
      this.jobUrlVisited.push(url)
    }

    Tools.getFetchOption(url + 'config.xml').then((header: RequestInit) => {
      fetch(url + 'config.xml', header).then((res) => {
        return res.ok ? res.text() : Promise.reject(res)
      }).then((text) => {
        // 为了兼容Firefox，需要截取掉XML头部：<?xml version='1.1' encoding='UTF-8'?>
        // 参考：https://github.com/liying2008/jenkins-helper/issues/6
        const index = text.indexOf('<', 1)
        if (index > 1) {
          text = text.substring(index)
        }
        // console.log('text', text);
        const documentNode = this.xmlParser.parseFromString(text, 'text/xml')
        const projectNodes = documentNode.getElementsByTagName('project')

        let job: JobInfo | undefined = undefined
        if (projectNodes.length > 0) {
          // 自由风格项目
          job = this.parseFreeStyleJobFromXml(projectNodes[0])
        } else {
          const flowNodes = documentNode.getElementsByTagName('flow-definition')
          if (flowNodes.length > 0) {
            // 流水线项目
            job = this.parsePipelineJobFromXml(flowNodes[0])
          } else {
            // 其他项目
            // todo
          }
        }
        // console.log('job', job)

        if (job) {
          job.url = decodeURIComponent(url)
          this.jobs.push(job)
          this.originJobs.push(job)
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
  parseFreeStyleJobFromXml(projectNode: Element): JobInfo {
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
      if (this.nodeParams.length > 0) {
        [node, param] = this.getParamsNode(projectNode)
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
      disabled,
      timerTrigger,
      concurrentBuild,
    }
  }

  /**
   * 解析 Pipeline Job 的XML
   * @param flowNode
   * @returns {{timerTrigger: *, node: *, concurrentBuild: *, param: *, disabled: *}}
   */
  parsePipelineJobFromXml(flowNode: Element): JobInfo {
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
      if (this.nodeParams.length > 0) {
        [node, param] = this.getParamsNode(flowNode)
      }
    }

    return {
      url: '',
      node,
      param,
      disabled,
      timerTrigger,
      concurrentBuild,
    }
  }

  getParamsNode(rootNode: Element) {
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
      for (let nodeParamsIndex = 0; nodeParamsIndex < this.nodeParams.length; nodeParamsIndex++) {
        param = this.nodeParams[nodeParamsIndex]
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
  getStatisticsDataFromDesc() {
    const urls = this.urls.map((item: string) => decodeURIComponent(item))
    if (urls.length === 0) {
      urls.push('NA')
    }
    return this.strings.jobStatisticsDataFrom_ + '\n\n' + urls.join('\n')
  }

}
</script>
<style lang="scss">
#job-stats-wrapper {
  #jobs-table {
    table tbody tr td {
      font-size: 0.78rem;
    }
    .jobs-table-url {
      text-decoration-line: none;
      word-break: break-all;
      word-wrap: break-word;
    }
    .pre-line {
      white-space: pre-line;
    }
    .disabled-row {
      background-color: lightgray;
    }
  }
  #display-settings {
    .reduce-action-width {
      margin-right: 16px;
    }
  }
}
</style>
