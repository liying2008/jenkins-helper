<script setup lang="ts">
import { h, ref } from 'vue'
import { NA, NSwitch } from 'naive-ui'
import type { TableColumns } from 'naive-ui/es/data-table/src/interface'
import type { NodeDetail } from '~/models/node'
import { t } from '~/libs/extension'

const strings = {
  displayName: t('displayName'),
  workingDirectory: t('workingDirectory'),
  remainingDiskSpace: t('remainingDiskSpace'),
  responseTime: t('responseTime'),
  isMonitoring: t('isMonitoring'),
  monitored: t('monitored'),
  notMonitored: t('notMonitored'),

}

const tableData = ref<NodeDetail[]>([
  {
    diskSpaceThreshold: 23,
    displayName: '192.168.56.1',
    monitoring: false,
    nodeUrl: 'http://127.0.0.1:8080/jenkins/computer/192.168.56.1/',
    offline: true,
    remainingDiskSpace: 'N/A',
    responseTime: 'N/A',
    workingDirectory: 'N/A',
  },
  {
    diskSpaceThreshold: 23,
    displayName: '192.168.56.2',
    monitoring: true,
    nodeUrl: 'http://127.0.0.1:8080/jenkins/computer/192.168.56.2/',
    offline: false,
    remainingDiskSpace: 'N/A',
    responseTime: 'N/A',
    workingDirectory: 'N/A',
  },
  {
    diskSpaceThreshold: 23,
    displayName: 'master',
    monitoring: false,
    nodeUrl: 'http://127.0.0.1:8080/jenkins/computer/(master)/',
    offline: false,
    remainingDiskSpace: 'N/A',
    responseTime: 'N/A',
    workingDirectory: 'N/A',
  },
])

const headers: TableColumns<NodeDetail> = [
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
          title: row.offline ? 'Offline' : '',
          class: 'jk-a-link-color',
        },
        { default: () => row.displayName },
      )
    },
  },
  {
    title: strings.workingDirectory,
    align: 'left',
    key: 'workingDirectory',
    sorter: 'default',
  },
  {
    title: strings.remainingDiskSpace,
    align: 'left',
    key: 'remainingDiskSpace',
    sorter: 'default',
  },
  {
    title: strings.responseTime,
    align: 'left',
    key: 'responseTime',
    sorter: 'default',
  },
  {
    title: strings.isMonitoring,
    align: 'left',
    key: 'monitoring',
    sorter: 'default',
    render(row) {
      return h(
        NSwitch,
        {
          value: row.monitoring,
          size: 'small',

        },
        { checked: () => strings.monitored, unchecked: () => strings.notMonitored },
      )
    },
  },
]

function getRowClass(item: NodeDetail) {
  const classNames = []
  if (item.offline) {
    classNames.push('offline-row')
  }
  if (item.monitoring) {
    classNames.push('monitored-row')
  }
  return classNames.join(' ')
}
</script>

<template>
  <n-data-table
    size="small"
    class="options-theme-preview-wrapper-node-monitor-table"
    :columns="headers"
    :data="tableData"
    :row-class-name="getRowClass"
  />
</template>

<style lang="scss">
.options-theme-preview-wrapper-node-monitor-table {
  .offline-row > td {
    background-color: var(--jk-offlineline);
  }

  .monitored-row > td {
    background-color: var(--jk-monitoredline);
  }
}
</style>
