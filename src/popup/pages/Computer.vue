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
          <div class="ml-5 card-title-job">
            <span
              :title="decodeURIComponent(jenkinsUrl)"
              class="card-title-job-name"
            >
              {{ decodeURIComponent(jenkinsUrl) }}
            </span>
            <br style="height: 10px;">
            <!-- <a
              class="card-title-job-url"
              target="_blank"
              :href="jenkinsUrl"
            >
              <span
                class="no-wrap"
                :title="decodeURIComponent(jenkinsUrl)"
              >{{ decodeURIComponent(jenkinsUrl) }}</span>
            </a> -->
          </div>
          <v-spacer></v-spacer>
          <div v-show="jenkinsNodes.status!=='ok'">
            <v-btn
              depressed
              small
              :href="jenkinsUrl"
              :title="jenkins.error"
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
              @click="removeMonitor(jenkinsUrl)"
            >
              <v-icon>mdi-close-circle-outline</v-icon>
            </v-btn>
          </div>
        </v-card-title>
        <v-data-table
          v-show="jenkinsNodes.hasOwnProperty('monitoredNodes')"
          :headers="headers"
          :items="jenkinsNodes.monitoredNodes"
          :item-class="getRowClass"
          :search="search"
          dense
          hide-default-footer
          disable-pagination
        >
          <!-- name -->
          <template v-slot:[`item.name`]="{ item }">
            <a
              :href="item.jobUrl"
              target="_blank"
              :class="['monitor-table-job-name', {'building':item.building}]"
            >{{ item.name }}</a>
          </template>

          <!-- lastBuildTime -->
          <template v-slot:[`item.lastBuildTime`]="{ item }">
            <span
              :class="[ {'building':item.building}]"
              v-html="getStyledTime(item.lastBuildTimestamp)"
            ></span>
          </template>

          <!-- status -->
          <template v-slot:[`item.status`]="{ item }">
            <v-chip
              small
              text-color="white"
              label
              pill
              :color="getResultColor(item.color)"
              :class="['monitor-table-result-chip', {'building':item.building} ]"
            >
              <span class="monitor-table-result-chip-text">{{ item.status }}</span>
            </v-chip>
          </template>
        </v-data-table>
      </v-card>
    </div>
  </div>
</template>

<script lang="ts">
import { NodeService } from '@/background/node-service'
import { StorageChangeWrapper, StorageService } from '@/libs/storage'
import { Tools } from '@/libs/tools'
import { MessageColor } from '@/models/message'
import { NodeDetail, Nodes } from '@/models/node'
import { Vue, Component, Watch } from 'vue-property-decorator'


@Component({
  name: 'Computer'
})
export default class Computer extends Vue {
  strings = {
    manageMonitoredNodes: browser.i18n.getMessage('manageMonitoredNodes'),
    refresh: browser.i18n.getMessage('refresh'),
    openManagerPage: browser.i18n.getMessage('openManagerPage'),
    displayName: browser.i18n.getMessage('displayName'),
    remainingDiskSpace: browser.i18n.getMessage('remainingDiskSpace'),
    diskSpaceThreshold: browser.i18n.getMessage('diskSpaceThreshold'),
  }
  refreshIconNormal = true
  monitoredNodes: Nodes = {}

  mounted() {
    this.queryMonitoredNodes()
    StorageService.addStorageListener(this.nodeStatusChange)
  }

  nodeStatusChange(changes: StorageChangeWrapper) {
    // console.log(changes)
    if (StorageService.keyForNodes in changes) {
      // nodes 数据改变
      this.queryMonitoredNodes()
    }
  }

  queryMonitoredNodes() {
    StorageService.getNodeStatus().then((result: Nodes) => {
      console.log('monitoredNodes', result)
      this.monitoredNodes = result
    })
  }

  removeMonitor(jenkinsUrl: string) {
    StorageService.getNodeStatus().then((result: Nodes) => {
      if (result.hasOwnProperty(jenkinsUrl)) {
        delete result[jenkinsUrl]
        StorageService.saveNodeStatus(result).then(() => {
          console.log(jenkinsUrl + ' 已删除')
        })
      }
    })
  }

  // 磁盘空间是否未达阈值
  isSafe(node: NodeDetail) {
    if (node.offline) {
      return false
    }
    const remainingDiskSpace = parseInt(node.remainingDiskSpace.replace('GB', '').trim())
    const threshold = node.diskSpaceThreshold
    return remainingDiskSpace > threshold
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
}
</style>
