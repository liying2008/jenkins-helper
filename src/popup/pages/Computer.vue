<template>
  <div id="computer-wrapper">
    <v-row
      no-gutters
      class="mt-3"
    >
      <v-spacer />
      <!--管理监控节点按钮-->
      <v-btn
        text
        color="primary"
        @click="openNodesManager('')"
      >
        {{ strings.manageMonitoredNodes }}
      </v-btn>
      <!--刷新节点信息按钮-->
      <v-btn
        text
        color="primary"
        title="Refresh nodes information"
        @click="refreshNodesInfo"
      >
        {{ strings.refresh }}
      </v-btn>
    </v-row>

    <div>
      <v-card
        v-for="(jenkinsNodes, jenkinsUrl, index) in monitoredNodes"
        v-show="'monitoredNodes' in jenkinsNodes && Object.keys(jenkinsNodes.monitoredNodes).length>0"
        :key="index"
        class="card my-3"
      >
        <v-card-title>
          <img
            class="img-rounded avatar"
            alt="Computer"
            src="img/computer48.png"
          >
          <div class="ml-5 card-title-node">
            <span
              :title="decodeURIComponent(jenkinsUrl)"
              class="card-title-node-url"
            >
              {{ decodeURIComponent(jenkinsUrl) }}
            </span>
            <br style="height: 10px;">
            <a
              class="card-title-node-sub"
              @click="openNodesManager(jenkinsUrl)"
            >
              <span class="no-wrap">{{ strings.openManagerPage }}</span>
            </a>
          </div>
          <v-spacer></v-spacer>
          <div v-show="jenkinsNodes.status!=='ok'">
            <v-btn
              depressed
              small
              :href="jenkinsUrl"
              target="_blank"
              color="error"
              class="card-title-err-btn"
            >
              <span>ERROR</span>
            </v-btn>
          </div>
          <div class="ml-2">
            <v-btn
              icon
              title="Remove monitoring for this task"
              x-small
              color="grey"
              class="card-title-remove-btn"
              @click="removeMonitor(jenkinsUrl)"
            >
              <v-icon>mdi-close-circle-outline</v-icon>
            </v-btn>
          </div>
        </v-card-title>
        <v-data-table
          v-show="jenkinsNodes.status=='ok'"
          :headers="headers"
          :items="toArray(jenkinsNodes.monitoredNodes)"
          :item-class="getRowClass"
          :search="search"
          dense
          hide-default-footer
          disable-pagination
        >
          <!-- displayName -->
          <template v-slot:[`item.displayName`]="{ item }">
            <a
              :href="item.nodeUrl"
              target="_blank"
              :class="['monitor-table-node-url', isSafe(item)?'success--text text--darken-2':'error--text text--darken-2']"
            >{{ item.displayName }}</a>
          </template>

          <!-- remainingDiskSpace -->
          <template v-slot:[`item.remainingDiskSpace`]="{ item }">
            <span
              :class="[isSafe(item)?'success--text text--darken-2':'error--text text--darken-2']"
              v-html="item.remainingDiskSpace"
            ></span>
          </template>

          <!-- diskSpaceThreshold -->
          <template v-slot:[`item.diskSpaceThreshold`]="{ item }">
            <span
              :class="[isSafe(item)?'success--text text--darken-2':'error--text text--darken-2']"
              v-html="item.diskSpaceThreshold + ' GB'"
            ></span>
          </template>
          <!-- actions -->
          <template v-slot:[`item.actions`]="props">
            <v-icon
              small
              title="Cancel Monitoring"
              @click="deleteItem(jenkinsUrl, props.item)"
            >
              mdi-delete
            </v-icon>
          </template>
        </v-data-table>
      </v-card>
    </div>
    <v-row class="my-3"></v-row>
    <!-- snackbar -->
    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
    >
      {{ snackbar.message }}

      <template v-slot:action="{ attrs }">
        <v-btn
          text
          v-bind="attrs"
          @click="snackbar.show = false"
        >
          {{ strings.close }}
        </v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<script lang="ts">
import { NodeService } from '@/background/node-service'
import { StorageChangeWrapper, StorageService } from '@/libs/storage'
import { Tools } from '@/libs/tools'
import { MessageColor } from '@/models/message'
import { MonitoredNodes, NodeDetail, Nodes } from '@/models/node'
import { Vue, Component, Watch } from 'vue-property-decorator'
import { DataTableHeader } from 'vuetify'


@Component({
  name: 'Computer'
})
export default class Computer extends Vue {
  strings = {
    close: browser.i18n.getMessage('close'),
    cancel: browser.i18n.getMessage('cancel'),
    save: browser.i18n.getMessage('save'),
    manageMonitoredNodes: browser.i18n.getMessage('manageMonitoredNodes'),
    refresh: browser.i18n.getMessage('refresh'),
    openManagerPage: browser.i18n.getMessage('openManagerPage'),
    displayName: browser.i18n.getMessage('displayName'),
    remainingDiskSpace: browser.i18n.getMessage('remainingDiskSpace'),
    alarmThreshold: browser.i18n.getMessage('alarmThreshold'),
    actions: browser.i18n.getMessage('actions'),
    monitoringCancelled: browser.i18n.getMessage('monitoringCancelled'),
  }
  refreshIconNormal = true
  monitoredNodes: Nodes = {}

  search = ''
  headers: DataTableHeader[] = [
    { text: this.strings.displayName, align: 'start', value: 'displayName' },
    { text: this.strings.remainingDiskSpace, align: 'start', value: 'remainingDiskSpace' },
    { text: this.strings.alarmThreshold, align: 'start', value: 'diskSpaceThreshold' },
    { text: this.strings.actions, value: 'actions', sortable: false },
  ]
  snackbar = {
    show: false,
    message: '',
    color: MessageColor.Success,
  }

  mounted() {
    this.queryMonitoredNodes()
    StorageService.addStorageListener(this.nodeStatusChange)
  }

  nodeStatusChange(changes: StorageChangeWrapper) {
    console.log('00-nodeStatusChange', changes)
    if (StorageService.keyForNodes in changes) {
      // nodes 数据改变
      // console.log('01-nodeStatusChange', changes)
      this.queryMonitoredNodes()
    }
  }

  queryMonitoredNodes() {
    StorageService.getNodeStatus().then((result: Nodes) => {
      console.log('monitoredNodes', result)
      this.monitoredNodes = result
    })
  }

  getRowClass(item: NodeDetail) {
    if (item.offline) {
      return 'disabled-row'
    } else {
      return ''
    }
  }

  toArray(monitoredNodes: MonitoredNodes) {
    return Object.values(monitoredNodes)
  }

  removeMonitor(jenkinsUrl: string) {
    const ok = confirm(browser.i18n.getMessage('cancelMonitoringNodeUrl', [jenkinsUrl]))
    if (!ok) {
      // 点击取消
      return
    }

    StorageService.getNodeStatus().then((result: Nodes) => {
      if (result.hasOwnProperty(jenkinsUrl)) {
        delete result[jenkinsUrl]
        StorageService.saveNodeStatus(result).then(() => {
          console.log(jenkinsUrl + ' 已删除')
          this.snackbar = {
            show: true,
            message: `${this.strings.monitoringCancelled}${jenkinsUrl}`,
            color: MessageColor.Success,
          }
        })
      }
    })
  }

  // 磁盘空间是否未达阈值
  isSafe(node: NodeDetail) {
    if (node.offline) {
      return false
    }
    const remainingDiskSpace = parseFloat(node.remainingDiskSpace.replace('GB', '').trim())
    const threshold = node.diskSpaceThreshold
    return remainingDiskSpace > threshold
  }

  // 删除监控条目
  deleteItem(jenkinsUrl: string, node: NodeDetail) {
    // console.log(jenkinsUrl, node)
    const nodeName = node.displayName
    const ok = confirm(browser.i18n.getMessage('cancelMonitoringNode', [nodeName]))
    if (!ok) {
      // 点击取消
      return
    }
    StorageService.getNodeStatus().then((result: Nodes) => {
      if (result.hasOwnProperty(jenkinsUrl)) {
        // 删除 node
        delete result[jenkinsUrl]['monitoredNodes'][nodeName]
        StorageService.saveNodeStatus(result).then(() => {
          console.log(nodeName + ' 已删除')
          this.snackbar = {
            show: true,
            message: `${this.strings.monitoringCancelled}${nodeName}`,
            color: MessageColor.Success,
          }
        })
      }
    })
  }

  // 刷新节点信息
  refreshNodesInfo() {
    NodeService.queryNodeStatus()
  }

  openNodesManager(jenkinsUrl: string) {
    browser.windows.create({
      url: 'computers_manager.html?jenkins=' + jenkinsUrl,
      type: 'popup',
      width: 1000,
      height: 800,
    }).then((window) => {
      console.log('window', window)
    })
  }

}
</script>

<style lang="scss">
#computer-wrapper {
  .card {
    .card-title-node {
      width: 460px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;

      .card-title-node-url {
        font-size: 18px;
        font-weight: 500;
        color: #333;
      }

      .card-title-node-sub {
        font-size: 14px;
        text-decoration: none;
      }
    }

    .card-title-err-btn {
      width: 4rem;
      height: 1.6rem;
    }

    .card-title-remove-btn {
      align-items: baseline;
    }

    .monitor-table-node-url {
      text-decoration-line: none;
      word-break: break-all;
      word-wrap: break-word;
    }

    .disabled-row {
      background-color: lightgray;
    }
  }
}
</style>
