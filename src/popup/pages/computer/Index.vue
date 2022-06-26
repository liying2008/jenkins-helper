<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import computerIcon from '~/assets/img/computer48.png'
import { NodeService } from '~/background/node-service'
import type { StorageChangeWrapper } from '~/libs/storage'
import { StorageService } from '~/libs/storage'
import { SnackbarData } from '~/models/message'
import type { MonitoredNodes, NodeDetail, Nodes } from '~/models/node'


const strings = {
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

const monitoredNodes = ref<Nodes>({})

const search = ''
const headers = [
  { text: strings.displayName, align: 'start', value: 'displayName' },
  { text: strings.remainingDiskSpace, align: 'start', value: 'remainingDiskSpace' },
  { text: strings.alarmThreshold, align: 'start', value: 'diskSpaceThreshold' },
  { text: strings.actions, value: 'actions', sortable: false },
]

const snackbar = ref(SnackbarData.empty())

onMounted(() => {
  queryMonitoredNodes()
  StorageService.addStorageListener(nodeStatusChange)
})


function nodeStatusChange(changes: StorageChangeWrapper) {
  // console.log('00-nodeStatusChange', changes)
  if (StorageService.keyForNodes in changes) {
    // nodes 数据改变
    // console.log('01-nodeStatusChange', changes)
    queryMonitoredNodes()
  }
}

function queryMonitoredNodes() {
  StorageService.getNodeStatus().then((result: Nodes) => {
    // console.log('monitoredNodes', result)
    monitoredNodes.value = result
  })
}

function getRowClass(item: NodeDetail) {
  if (item.offline) {
    return 'disabled-row'
  } else {
    return ''
  }
}

function toArray(monitoredNodes: MonitoredNodes) {
  return Object.values(monitoredNodes)
}

function removeMonitor(jenkinsUrl: string) {
  const ok = confirm(browser.i18n.getMessage('cancelMonitoringNodeUrl', [jenkinsUrl]))
  if (!ok) {
    // 点击取消
    return
  }

  StorageService.getNodeStatus().then((result: Nodes) => {
    if (result.hasOwnProperty(jenkinsUrl)) {
      delete result[jenkinsUrl]
      StorageService.saveNodeStatus(result).then(() => {
        console.log(`${jenkinsUrl} 已删除`)

        snackbar.value = SnackbarData.builder()
          .message(`${strings.monitoringCancelled}${jenkinsUrl}`)
          .color('success')
          .build()
      })
    }
  })
}

// 磁盘空间是否未达阈值
function isSafe(node: NodeDetail) {
  if (node.offline) {
    return false
  }
  const remainingDiskSpace = parseFloat(node.remainingDiskSpace.replace('GB', '').trim())
  const threshold = node.diskSpaceThreshold
  return remainingDiskSpace > threshold
}

// 删除监控条目
function deleteItem(jenkinsUrl: string, node: NodeDetail) {
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
      delete result[jenkinsUrl].monitoredNodes[nodeName]
      StorageService.saveNodeStatus(result).then(() => {
        console.log(`${nodeName} 已删除`)

        snackbar.value = SnackbarData.builder()
          .message(`${strings.monitoringCancelled}${nodeName}`)
          .color('success')
          .build()
      })
    }
  })
}

// 刷新节点信息
function refreshNodesInfo() {
  NodeService.queryNodeStatus()
}

function openNodesManager(jenkinsUrl: string) {
  browser.windows.create({
    url: `computers_manager.html?jenkins=${jenkinsUrl}`,
    type: 'popup',
    width: 1000,
    height: 800,
  }).then((window) => {
    // console.log('window', window)
  })
}
</script>

<template>
  <div id="computer-wrapper">
  </div>
</template>


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
      background-color: var(--v-disabledline-base);
    }
  }
}
</style>
