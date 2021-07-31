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
          <v-card-title>
            All Nodes
            <v-spacer></v-spacer>
            <v-text-field
              v-model="search"
              append-icon="mdi-magnify"
              :label="strings.search"
              single-line
              hide-details
            ></v-text-field>
          </v-card-title>
          <v-data-table
            dense
            :headers="headers"
            :items="nodes"
            :search="search"
            :item-class="getRowClass"
            hide-default-footer
            disable-pagination
          >
            <!-- 名称 -->
            <template v-slot:[`item.displayName`]="{ item }">
              <span :title="item.offline ? 'Offline' : ''">
                <a
                  class="a-link-color"
                  :href="item.nodeUrl"
                  target="_blank"
                >{{ item.displayName }}</a>
              </span>
            </template>
            <!-- 工作目录 -->
            <template v-slot:[`item.workingDirectory`]="{ item }">
              <span :title="item.offline ? 'Offline' : ''">
                {{ item.workingDirectory }}
              </span>
            </template>

            <!-- 剩余磁盘空间 -->
            <template v-slot:[`item.remainingDiskSpace`]="{ item }">
              <span :title="item.offline ? 'Offline' : ''">
                {{ item.remainingDiskSpace }}
              </span>
            </template>

            <!-- 响应时间 -->
            <template v-slot:[`item.responseTime`]="{ item }">
              <span :title="item.offline ? 'Offline' : ''">
                {{ item.responseTime }}
              </span>
            </template>

            <!-- 监控？ -->
            <template v-slot:[`item.monitoring`]="props">
              <span :title="props.item.offline ? 'Offline' : ''">
                <v-edit-dialog
                  large
                  :cancel-text="strings.cancel"
                  :save-text="strings.save"
                  :return-value.sync="props.item.monitoring"
                  @save="saveEditedItem(props.item)"
                >
                  <v-simple-checkbox
                    v-model="props.item.monitoring"
                    disabled
                    style="cursor: pointer;"
                    @click="bubblingUp"
                  ></v-simple-checkbox>
                  <template v-slot:input>
                    <v-checkbox
                      v-model="props.item.monitoring"
                      :label="strings.enableMonitoringOrNot"
                      autofocus
                    ></v-checkbox>
                    <v-text-field
                      v-model="props.item.diskSpaceThreshold"
                      :label="strings.diskSpaceThreshold"
                      :disabled="!props.item.monitoring"
                      type="number"
                      suffix="GB"
                    ></v-text-field>
                  </template>
                </v-edit-dialog>
              </span>
            </template>
          </v-data-table>
        </v-card>
      </div>

      <!-- snackbar -->
      <j-snackbar :snackbar-data="snackbar" />
    </v-container>
  </v-app>
</template>

<script lang="ts">
import { StorageService } from '@/libs/storage'
import { Tools } from '@/libs/tools'
import { SnackbarData } from '@/models/message'
import { NodeDetail, Nodes } from '@/models/node'
import { Vue, Component } from 'vue-property-decorator'
import { DataTableHeader } from 'vuetify'

@Component
export default class App extends Vue {
  strings = {
    close: browser.i18n.getMessage('close'),
    search: browser.i18n.getMessage('search'),
    cancel: browser.i18n.getMessage('cancel'),
    save: browser.i18n.getMessage('save'),
    diskSpaceThresholdInvalid: browser.i18n.getMessage('diskSpaceThresholdInvalid'),
    enableMonitoringOrNot: browser.i18n.getMessage('enableMonitoringOrNot'),
    fetchNodesDataFailure: browser.i18n.getMessage('fetchNodesDataFailure'),
    diskSpaceThreshold: browser.i18n.getMessage('diskSpaceThreshold'),
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
  inputUrlValue = ''
  search = ''
  nodes: NodeDetail[] = []
  monitoredNodes: Nodes = {}
  url = ''
  headers: DataTableHeader[] = [
    { text: this.strings.displayName, align: 'start', value: 'displayName' },
    { text: this.strings.workingDirectory, align: 'start', value: 'workingDirectory' },
    { text: this.strings.remainingDiskSpace, align: 'start', value: 'remainingDiskSpace', filterable: false },
    { text: this.strings.responseTime, align: 'start', value: 'responseTime', filterable: false },
    { text: this.strings.isMonitoring, align: 'start', value: 'monitoring', filterable: false },
  ]
  snackbar = SnackbarData.empty()

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

  getRowClass(item: NodeDetail) {
    let rowClass = ''
    if (item.offline) {
      rowClass += 'offline-row '
    }
    if (item.monitoring) {
      rowClass += 'monitored-row '
    }
    return rowClass
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
      // console.log('monitoredNodes', result)
      this.monitoredNodes = result
      this.queryJenkinsNodes()
    })
  }

  /**
   * 查询Jenkins节点数据
   * @param jenkinsUrl
   */
  queryJenkinsNodes(jenkinsUrl?: string | undefined) {
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
  getJenkinsNodeData(url: string, jsonUrl: string, header: RequestInit) {
    this.nodes = []
    fetch(jsonUrl, header).then((res) => {
      if (res.ok) {
        return res.json()
      } else {
        return Promise.reject(res)
      }
    }).then((data) => {
      const computers = data.computer
      // console.log(computers)
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
      // console.log('nodes', this.nodes)
    }).catch((e: Error) => {
      console.log('获取数据失败', e)
      alert(this.strings.fetchNodesDataFailure)
    })
  }

  bubblingUp(ev: MouseEvent) {
    // console.log(ev)
    const elem: HTMLElement = ev.target as HTMLElement
    elem.parentElement!.parentElement!.click()
    return false
  }

  saveEditedItem(item: NodeDetail) {
    // console.log(item)
    const displayName = item.displayName
    if (item.monitoring) {
      if (!item.diskSpaceThreshold || item.diskSpaceThreshold <= 0) {
        this.snackbar = SnackbarData.builder()
          .message(this.strings.diskSpaceThresholdInvalid)
          .color('error')
          .build()
        this.queryJenkinsNodes(this.url)
        return
      }

      // 开启监控
      if (!this.monitoredNodes.hasOwnProperty(this.url)) {
        this.monitoredNodes[this.url] = {
          'status': 'ok',
          'monitoredNodes': {},
        }
      }

      const diskSpaceThreshold = parseFloat(item.diskSpaceThreshold.toString())
      this.monitoredNodes[this.url]['monitoredNodes'][displayName] = {
        displayName: displayName,
        nodeUrl: item.nodeUrl,
        workingDirectory: item.workingDirectory,
        remainingDiskSpace: item.remainingDiskSpace,
        responseTime: item.responseTime,
        monitoring: true,
        diskSpaceThreshold: diskSpaceThreshold,
        offline: item.offline
      }
    } else {
      // 取消监控
      delete this.monitoredNodes[this.url]['monitoredNodes'][displayName]
    }

    // 保存监控配置
    StorageService.saveNodeStatus(this.monitoredNodes).then(() => {
      this.queryJenkinsNodes(this.url)
    })
  }

}
</script>
<style lang="scss">
#computer-manager-wrapper {
  .a-link-color {
    color: var(--v-link-base);
  }

  #computers-table {
    .offline-row {
      background-color: var(--v-offlineline-base);
    }

    .monitored-row {
      background-color: var(--v-monitoredline-base);
    }
  }
}
</style>
