<script lang="ts" setup>
import { h, onMounted, ref, watch } from 'vue'
import { CloseCircleOutline, CloseCircleSharp } from '@vicons/ionicons5'
import type { TableColumns } from 'naive-ui/es/data-table/src/interface'
import { NA, NButton, useMessage } from 'naive-ui'
import OpArea from './OpArea.vue'
import { ComputerStatus, openNodesManager } from './common'
import computerIcon from '~/assets/img/computer48.png'
import type { StorageChangeWrapper } from '~/libs/storage'
import { StorageService } from '~/libs/storage'
import type { MonitoredNodes, NodeDetail, Nodes } from '~/models/node'
import PopconfirmDeleteBtn from '~/components/popconfirm-delete-btn/PopconfirmDeleteBtn.vue'
import { t } from '~/libs/extension'
import { isNullOrEmptyRecord } from '~/libs/common'

type NodeDetailWithJenkinsUrl = NodeDetail & { jenkinsUrl: string }

const strings = {
  close: t('close'),
  ok: t('ok'),
  cancel: t('cancel'),
  save: t('save'),
  noData: t('noData'),
  cancelMonitoring: t('cancelMonitoring'),
  manageMonitoredNodes: t('manageMonitoredNodes'),
  refresh: t('refresh'),
  openManagerPage: t('openManagerPage'),
  displayName: t('displayName'),
  remainingDiskSpace: t('remainingDiskSpace'),
  alarmThreshold: t('alarmThreshold'),
  actions: t('actions'),
  monitoringCancelled: t('monitoringCancelled'),
}

const showOfflineNodes = ref(true)
const filteringResult = ref(ComputerStatus.All)
const filteringDisplayName = ref('')
const monitoredNodes = ref<Nodes>({})
const filteredNodes = ref<Nodes>()

const search = ''
const message = useMessage()

const headers: TableColumns<NodeDetailWithJenkinsUrl> = [
  {
    title: strings.displayName,
    align: 'left',
    key: 'displayName',
    sorter: 'default',
    render(row) {
      return h(
        NA,
        {
          href: row.nodeUrl,
          target: '_blank',
          class: 'monitor-table-node-url',
        },
        { default: () => row.displayName },
      )
    },
  },
  {
    title: strings.remainingDiskSpace,
    align: 'left',
    key: 'remainingDiskSpace',
    sorter: 'default',
  },
  {
    title: strings.alarmThreshold,
    align: 'left',
    key: 'diskSpaceThreshold',
    sorter: 'default',
    render(row) {
      return h(
        'span',
        {
        },
        { default: () => `${row.diskSpaceThreshold} GB` },
      )
    },
  },
  {
    title: strings.actions,
    align: 'center',
    key: 'actions',
    render(row) {
      return h(
        PopconfirmDeleteBtn,
        {
          text: t('cancelMonitoringNode', [row.displayName]),
          btnClass: 'monitor-table-action-delete',
          btnTitle: strings.cancelMonitoring,
          icon: CloseCircleSharp,
          iconSize: '16px',
          onPositiveClick: () => {
            console.log('delete node monitor', row)
            deleteItem(row.jenkinsUrl, row)
          },
        },

      )
    },
  },
]

watch(filteringDisplayName, () => {
  filter()
})

watch(filteringResult, () => {
  filter()
})

watch(showOfflineNodes, () => {
  filter()
})

onMounted(() => {
  // TODO 事件监听卸载处理
  StorageService.addStorageListener(nodeStatusChange)
})

queryMonitoredNodes()

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
    filter()
  })
}

function getRowClass(item: NodeDetail) {
  const classNames = []
  if (item.offline) {
    classNames.push('disabled-row')
  }
  if (isSafe(item)) {
    classNames.push('safe-row')
  } else {
    classNames.push('unsafe-row')
  }
  return classNames.join(' ')
}

function toArray(jenkinsUrl: string, monitoredNodes: MonitoredNodes) {
  const nodesInfo = Object.values(monitoredNodes) as NodeDetailWithJenkinsUrl[]
  return nodesInfo.map((nodeInfo) => {
    nodeInfo.jenkinsUrl = jenkinsUrl
    return nodeInfo
  })
}

function getDeletionConfirmMsg(jenkinsUrl: string) {
  return t('cancelMonitoringNodeUrl', [jenkinsUrl])
}

function removeMonitor(jenkinsUrl: string) {
  StorageService.getNodeStatus().then((result: Nodes) => {
    if (result.hasOwnProperty(jenkinsUrl)) {
      delete result[jenkinsUrl]
      StorageService.saveNodeStatus(result).then(() => {
        console.log(`${jenkinsUrl} 已删除`)
        message.success(t('monitoringCancelled', [jenkinsUrl]))
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
  StorageService.getNodeStatus().then((result: Nodes) => {
    if (result.hasOwnProperty(jenkinsUrl)) {
      // 删除 node
      delete result[jenkinsUrl].monitoredNodes[nodeName]
      StorageService.saveNodeStatus(result).then(() => {
        console.log(`${nodeName} 已删除`)
        message.success(t('monitoringCancelled', [nodeName]))
      })
    }
  })
}

function filter() {
  filteredNodes.value = {}
  for (const jenkinsUrl in monitoredNodes.value) {
    filteredNodes.value[jenkinsUrl] = {
      status: monitoredNodes.value[jenkinsUrl].status,
      error: monitoredNodes.value[jenkinsUrl].error,
      monitoredNodes: {},
    }
    const nodes = monitoredNodes.value[jenkinsUrl].monitoredNodes
    for (const nodeName in nodes) {
      const node = nodes[nodeName]
      if (filteringDisplayName.value && !node.displayName.includes(filteringDisplayName.value)) {
        continue
      }
      if (node.offline && !showOfflineNodes.value) {
        continue
      }
      if (filteringResult.value !== ComputerStatus.All) {
        const safe = isSafe(node)
        if (safe && filteringResult.value === ComputerStatus.Abnormal) {
          continue
        }
        if (!safe && filteringResult.value === ComputerStatus.Normal) {
          continue
        }
      }
      filteredNodes.value[jenkinsUrl].monitoredNodes[nodeName] = node
    }
  }
}

function onResultFilterChange(newVal: number) {
  filteringResult.value = newVal
}

function onDisplayNameFilterChange(newVal: string) {
  filteringDisplayName.value = newVal.trim()
}

function onShowOfflineNodesChange(newVal: boolean) {
  showOfflineNodes.value = newVal
}
</script>

<template>
  <div class="computer-wrapper">
    <!-- 顶部操作区域 -->
    <OpArea
      :disabled="isNullOrEmptyRecord(monitoredNodes)"
      @result-filter-change="onResultFilterChange"
      @display-name-filter-change="onDisplayNameFilterChange"
      @show-offline-nodes-change="onShowOfflineNodesChange"
    />

    <div class="data-area">
      <n-card
        v-for="(jenkinsNodes, jenkinsUrl, index) in filteredNodes"
        v-show="'monitoredNodes' in jenkinsNodes"
        :key="index"
        class="card"
      >
        <div class="card-title">
          <img
            class="img-rounded"
            alt="Computer"
            :src="computerIcon"
          >
          <div class="ml-12px card-title-node flex-1">
            <span
              :title="decodeURIComponent(jenkinsUrl)"
              color="title"
              class="card-title-node-url"
            >
              {{ decodeURIComponent(jenkinsUrl) }}
            </span>
            <br style="height: 8px;">
            <a
              class="card-title-node-sub a-link-color"
              @click="openNodesManager(jenkinsUrl)"
            >
              <span class="no-wrap">{{ strings.openManagerPage }}</span>
            </a>
          </div>
          <div class="flex place-items-center">
            <div v-show="jenkinsNodes.status !== 'ok'">
              <n-button
                type="error"
                secondary
                strong
                round
                :href="jenkinsUrl"
                :title="jenkinsNodes.error || ''"
                target="_blank"
                class="card-title-err-btn"
                tag="a"
              >
                <span>ERROR</span>
              </n-button>
            </div>
            <div class="ml-8px">
              <PopconfirmDeleteBtn
                :text="getDeletionConfirmMsg(decodeURIComponent(jenkinsUrl))"
                btn-class="card-title-remove-btn"
                btn-title="Remove monitoring for this task"
                :icon="CloseCircleOutline"
                @positive-click="removeMonitor(jenkinsUrl)"
              />
            </div>
          </div>
        </div>
        <n-data-table
          v-show="jenkinsNodes.status === 'ok'"
          class="data-table"
          size="small"
          :columns="headers"
          :data="toArray(jenkinsUrl, jenkinsNodes.monitoredNodes)"
          :row-class-name="getRowClass"
          :search="search"
          :bordered="false"
        >
          <template #empty>
            <div class="data-table-no-data">
              {{ strings.noData }}
            </div>
          </template>
        </n-data-table>
      </n-card>
    </div>
  </div>
</template>

<style lang="scss">
.computer-wrapper {
  // min-height: 200px;

  .data-area {
    margin-top: 10px;

    .card {
      margin-bottom: 8px;

      .n-card__content {
        padding: 0;
      }

      .card-title {
        display: flex;
        padding: 12px;

        .img-rounded {
          width: 48px;
          height: 48px;
        }

        .card-title-node {
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
            cursor: pointer;
          }
        }

        .card-title-err-btn {
          width: 60px;
          height: 26px;
          font-size: 12px;

          .n-button__content {
            // 按钮文字居中
            justify-content: center;
          }
        }

        .card-title-remove-btn {
          font-size: 16px;
          vertical-align: text-top;
          opacity: 0.5;
        }
      }

      .monitor-table-node-url {
        text-decoration-line: none;
        word-break: break-all;
        word-wrap: break-word;
      }

      .monitor-table-action-delete {
        font-size: 14px;
        vertical-align: middle;
        opacity: 0.5;
      }

      .disabled-row > td {
        background-color: var(--jk-disabledline);
      }

      .safe-row > td {
        color: var(--jk-success);

        a {
          color: var(--jk-success);
        }
      }

      .unsafe-row > td {
        color: var(--jk-error);

        a {
          color: var(--jk-error);
        }
      }
    }

    .data-table {
      .n-data-table-empty {
        padding: 0;
      }

      .data-table-no-data {
        padding: 8px 0;
        color: #88888888;
        text-align: center;
      }
    }

    .n-data-table.n-data-table--bottom-bordered .n-data-table-td.n-data-table-td--last-row {
      border-bottom: 0 solid var(--n-merged-border-color);
    }
  }
}
</style>
