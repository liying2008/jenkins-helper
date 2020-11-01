<template>
  <v-app id="computer-manager-wrapper">
    <v-container
      fluid
      class="py-0 px-8"
    >
      <v-form
        ref="form"
        v-model="isFormValid"
        @submit.prevent="startQuery"
      >
        <v-row>
          <v-col cols="12">
            <v-text-field
              v-model="inputUrlValue"
              prepend-icon="mdi-link-variant"
              :label="strings.inputJenkinsUrl"
              type="text"
              :rules="[required(), isValidURL()]"
            >
              <template v-slot:append-outer>
                <v-btn
                  class="mx-2"
                  fab
                  small
                  color="primary"
                  style="top: -12px"
                  :disabled="!isFormValid"
                  @click="startQuery"
                >
                  <v-icon>
                    mdi-magnify
                  </v-icon>
                </v-btn>
              </template>
            </v-text-field>
          </v-col>
        </v-row>
      </v-form>

      <div
        v-show="nodes.length>0"
        id="computers-table"
      >
        <v-card class="my-3">
          <v-data-table
            dense
            :headers="headers"
            :items="nodes"
            hide-default-footer
            disable-pagination
          >
            <!-- 名称 -->
            <template v-slot:[`item.displayName`]="{ item }">
              <a
                :href="item.nodeUrl"
                target="_blank"
              >{{ item.displayName }}</a>
            </template>
            <!-- 工作目录 -->
            <template v-slot:[`item.workingDirectory`]="{ item }">
              <div>{{ item.workingDirectory }}</div>
            </template>

            <!-- 剩余磁盘空间 -->
            <template v-slot:[`item.remainingDiskSpace`]="{ item }">
              <div>{{ item.remainingDiskSpace }}</div>
            </template>

            <!-- 响应时间 -->
            <template v-slot:[`item.responseTime`]="{ item }">
              <div>{{ item.responseTime }}</div>
            </template>

            <!-- 监视？ -->
            <template v-slot:[`item.monitoring`]="{ item }">
              <v-simple-checkbox
                v-model="item.monitoring"
                disabled
              ></v-simple-checkbox>
            </template>
          </v-data-table>
        </v-card>
      </div>
    </v-container>
  </v-app>
</template>

<script lang="ts">
import { StorageService } from '@/libs/storage'
import { Tools } from '@/libs/tools'
import { MonitoredNodes, NodeDetail, Nodes } from '@/models/node'
import { Vue, Component } from 'vue-property-decorator'

@Component
export default class App extends Vue {
  strings = {
    fetchNodesDataFailure: browser.i18n.getMessage('fetchNodesDataFailure'),
    inputJenkinsUrl: browser.i18n.getMessage('inputJenkinsUrl'),
    inputDiskSpaceThreshold: browser.i18n.getMessage('inputDiskSpaceThreshold'),
    displayName: browser.i18n.getMessage('displayName'),
    workingDirectory: browser.i18n.getMessage('workingDirectory'),
    remainingDiskSpace: browser.i18n.getMessage('remainingDiskSpace'),
    responseTime: browser.i18n.getMessage('responseTime'),
    isMonitoring: browser.i18n.getMessage('isMonitoring'),
    urlCannotEmpty: browser.i18n.getMessage('urlCannotEmpty'),
    urlInvalid: browser.i18n.getMessage('urlInvalid'),
  }
  isFormValid = true
  inputUrlValue = 'http://192.168.5.200:8080/jenkins/'
  nodes: NodeDetail[] = []
  monitoredNodes: Nodes = {}
  url = ''
  headers = [
    { text: this.strings.displayName, align: 'start', value: 'displayName' },
    { text: this.strings.workingDirectory, align: 'start', value: 'workingDirectory' },
    { text: this.strings.remainingDiskSpace, align: 'start', value: 'remainingDiskSpace' },
    { text: this.strings.responseTime, align: 'start', value: 'responseTime' },
    { text: this.strings.isMonitoring, align: 'start', value: 'monitoring' },
  ]

  get form() {
    return this.$refs.form as Vue & {
      validate: () => boolean
      resetValidation: () => void
    }
  }

  required() {
    return (v: string) => (v && v.length > 0) || this.strings.urlCannotEmpty
  }

  isValidURL() {
    const expression = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/
    const regex = new RegExp(expression)
    return (v: string) => {
      if (!v || v.length === 0) {
        return true
      } else {
        return (regex.test(v)) || this.strings.urlInvalid
      }
    }
  }


  mounted() {
    this.getInitJenkinsUrl()
  }

  getInitJenkinsUrl() {
    const url = document.location.toString()
    console.log('getInitJenkinsUrl', url)
    const param = url.split('?')[1]
    const jenkinsUrl = param.replace('jenkins=', '')
    if (jenkinsUrl) {
      this.inputUrlValue = jenkinsUrl
      this.startQuery()
    }
  }

  startQuery() {
    StorageService.getNodeStatus().then((result) => {
      console.log('monitoredNodes', result)
      this.monitoredNodes = result
      this.queryJenkinsNodes()
    })
  }

  /**
   * 查询Jenkins节点数据
   * @param jenkinsUrl
   */
  queryJenkinsNodes(jenkinsUrl?: string|undefined) {
    let url = this.inputUrlValue
    if (jenkinsUrl === undefined) {
      url = url.charAt(url.length - 1) === '/' ? url : url + '/'
      this.url = url
    } else {
      url = jenkinsUrl
    }
    const encodeParam = encodeURI('computer[displayName,offline,monitorData[*]]')
    const jsonUrl = url + 'computer/api/json?tree=' + encodeParam

    Tools.getFetchOption(jsonUrl).then((header) => {
      this.getJenkinsNodeData(url, jsonUrl, header)
    })
  }

  /**
   * 请求Jenkins节点数据
   * @param url
   * @param jsonUrl
   * @param header
   */
  getJenkinsNodeData(url: string, jsonUrl: string, header: any) {
    this.nodes = []
    fetch(jsonUrl, header).then((res) => {
      if (res.ok) {
        return res.json()
      } else {
        return Promise.reject(res)
      }
    }).then((data) => {
      const computers = data.computer
      console.log(computers)
      for (let i = 0; i < computers.length; i++) {
        const displayName = computers[i].displayName
        let nodeUrl = url + 'computer/' + displayName + '/'
        if (displayName === 'master') {
          nodeUrl = url + 'computer/(master)/'
        }
        let workingDirectory = 'N/A'
        let remainingDiskSpace = 'N/A'
        let responseTime = 'N/A'
        const offline = computers[i].offline
        if (!offline) {
          const diskSpaceMonitor = computers[i].monitorData['hudson.node_monitors.DiskSpaceMonitor']
          if (diskSpaceMonitor && diskSpaceMonitor.hasOwnProperty('path')) {
            workingDirectory = diskSpaceMonitor.path
          }
          let size = undefined
          if (diskSpaceMonitor && diskSpaceMonitor.hasOwnProperty('size')) {
            size = diskSpaceMonitor.size
          }
          if (size) {
            remainingDiskSpace = (size / 1024.0 / 1024.0 / 1024.0).toFixed(2) + ' GB'
          }
          const responseTimeMonitor = computers[i].monitorData['hudson.node_monitors.ResponseTimeMonitor']
          if (responseTimeMonitor && responseTimeMonitor.hasOwnProperty('average')) {
            responseTime = responseTimeMonitor.average + 'ms'
          }
        }
        let monitoring = false
        let diskSpaceThreshold = 0
        if (this.monitoredNodes.hasOwnProperty(url)) {
          if (this.monitoredNodes[url].hasOwnProperty('monitoredNodes')) {
            monitoring = this.monitoredNodes[url]['monitoredNodes'].hasOwnProperty(displayName)
            if (monitoring) {
              diskSpaceThreshold = this.monitoredNodes[url]['monitoredNodes'][displayName].diskSpaceThreshold
            }
          }
        }
        this.nodes.push({
          displayName,
          nodeUrl,
          workingDirectory,
          remainingDiskSpace,
          responseTime,
          monitoring,
          diskSpaceThreshold,
          offline
        })
      }
      console.log('nodes', this.nodes)
    }).catch((e) => {
      console.error('获取数据失败', e)
      alert(this.strings.fetchNodesDataFailure)
    })
  }

  /**
   * 添加监控节点或取消监控节点
   * @param index
   * @param displayName
   */
  addOrDelMonitorNode(index: number, displayName: string) {
    // console.log('index', index);
    // const thisInput = (this.$refs.diskSpaceThreshold as any)[index]
    // if (!thisInput.value) {
    //   alert('The disk space threshold is illegal!')
    //   return
    // }
    // const diskSpaceThreshold = parseInt(thisInput.value)
    // console.log(displayName)
    // console.log(diskSpaceThreshold)
    // const node = this.nodes[displayName]
    // if (node.monitoring) {
    //   // 之前已监控，需要取消监控
    //   delete this.monitoredNodes[this.url]['monitoredNodes'][displayName]
    // } else {
    //   // 之前未监控，需要监控
    //   if (!this.monitoredNodes.hasOwnProperty(this.url)) {
    //     this.monitoredNodes[this.url] = {
    //       'status': 'ok',
    //       'monitoredNodes': {},
    //     }
    //   }
    //   this.monitoredNodes[this.url]['monitoredNodes'][displayName] = {
    //     nodeUrl: node.nodeUrl,
    //     workingDirectory: node.workingDirectory,
    //     remainingDiskSpace: node.remainingDiskSpace,
    //     responseTime: node.responseTime,
    //     monitoring: true,
    //     diskSpaceThreshold: diskSpaceThreshold,
    //     offline: node.offline
    //   }

    // }
    // StorageService.saveNodeStatus(this.monitoredNodes).then(() => {
    //   this.queryJenkinsNodes(this.url)
    // })
  }

}
</script>
<style lang="scss">
#computer-manager-wrapper {
}
</style>
