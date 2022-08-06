<script setup lang="ts">
import { h, ref } from 'vue'
import { NA, NTag } from 'naive-ui'
import type { TableColumns } from 'naive-ui/es/data-table/src/interface'

import { Tools } from '~/libs/tools'
import type { DisplayedJobDetail } from '~/models/job'
import StyleTime from '~/components/style-time/StyleTime.vue'


const tableData = ref<DisplayedJobDetail[]>([
  {
    building: false,
    color: 'aborted',
    jobUrl: 'http://127.0.0.1:8080/jenkins/job/JK_ABORTED_JOB/',
    lastBuildTimestamp: 1656826010738,
    lastCompletedBuildNumber: 1,
    name: 'JK_ABORTED_JOB',
    status: 'Aborted',
  },
  {
    building: false,
    color: 'disabled',
    jobUrl: 'http://127.0.0.1:8080/jenkins/job/JK_DISABLED_JOB/',
    lastCompletedBuildNumber: 0,
    name: 'JK_DISABLED_JOB',
    status: 'Disabled',
  },
  {
    building: false,
    color: 'red',
    jobUrl: 'http://127.0.0.1:8080/jenkins/job/JK_FAILURE_JOB/',
    lastBuildTimestamp: 1656820741937,
    lastCompletedBuildNumber: 1,
    name: 'JK_FAILURE_JOB',
    status: 'Failure',
  },
  {
    building: false,
    color: 'notbuilt',
    jobUrl: 'http://127.0.0.1:8080/jenkins/job/JK_NOT_BUILT_JOB/',
    lastCompletedBuildNumber: 0,
    name: 'JK_NOT_BUILT_JOB',
    status: 'Not built',
  },
  {
    building: false,
    color: 'blue',
    jobUrl: 'http://127.0.0.1:8080/jenkins/job/JK_SUCCESS_JOB/',
    lastBuildTimestamp: 1656820632563,
    lastCompletedBuildNumber: 1,
    name: 'JK_SUCCESS_JOB',
    status: 'Success',
  },
  {
    building: false,
    color: 'yellow',
    jobUrl: 'http://127.0.0.1:8080/jenkins/job/JK_UNSTABLE_JOB/',
    lastBuildTimestamp: 1656820682443,
    lastCompletedBuildNumber: 1,
    name: 'JK_UNSTABLE_JOB',
    status: 'Unstable',
  },
  {
    building: true,
    color: 'aborted',
    jobUrl: 'http://127.0.0.1:8080/jenkins/job/JK_ABORTED_JOB/',
    lastBuildTimestamp: 1656826010738,
    lastCompletedBuildNumber: 1,
    name: 'JK_ABORTED_JOB',
    status: 'Aborted',
  },
  {
    building: true,
    color: 'disabled',
    jobUrl: 'http://127.0.0.1:8080/jenkins/job/JK_DISABLED_JOB/',
    lastCompletedBuildNumber: 0,
    name: 'JK_DISABLED_JOB',
    status: 'Disabled',
  },
  {
    building: true,
    color: 'red',
    jobUrl: 'http://127.0.0.1:8080/jenkins/job/JK_FAILURE_JOB/',
    lastBuildTimestamp: 1656820741937,
    lastCompletedBuildNumber: 1,
    name: 'JK_FAILURE_JOB',
    status: 'Failure',
  },
  {
    building: true,
    color: 'notbuilt',
    jobUrl: 'http://127.0.0.1:8080/jenkins/job/JK_NOT_BUILT_JOB/',
    lastCompletedBuildNumber: 0,
    name: 'JK_NOT_BUILT_JOB',
    status: 'Not built',
  },
  {
    building: true,
    color: 'blue',
    jobUrl: 'http://127.0.0.1:8080/jenkins/job/JK_SUCCESS_JOB/',
    lastBuildTimestamp: 1656820632563,
    lastCompletedBuildNumber: 1,
    name: 'JK_SUCCESS_JOB',
    status: 'Success',
  },
  {
    building: true,
    color: 'yellow',
    jobUrl: 'http://127.0.0.1:8080/jenkins/job/JK_UNSTABLE_JOB/',
    lastBuildTimestamp: 1656820682443,
    lastCompletedBuildNumber: 1,
    name: 'JK_UNSTABLE_JOB',
    status: 'Unstable',
  },
])

const headers: TableColumns<DisplayedJobDetail> = [
  {
    title: 'Job Name',
    align: 'left',
    key: 'name',
    sorter: 'default',
    render(row) {
      return h(
        NA,
        {
          href: row.jobUrl,
          target: '_blank',
          style: {
            color: `var(--jk-${getResultColor(row.color)})`,
          },
          class: ['monitor-table-job-name', row.building ? 'building' : ''],
        },
        { default: () => row.name },
      )
    },
  },
  {
    title: 'Last Build Time',
    align: 'center',
    key: 'lastBuildTimestamp',
    width: '25%',
    sorter: 'default',
    render(row) {
      const s = Tools.getReadableTime(row.lastBuildTimestamp, true)
      return h(
        StyleTime,
        {
          datetime: s,
          class: ['monitor-table-build-time', row.building ? 'building' : ''],
        },
      )
    },
  },
  {
    title: 'Result',
    align: 'center',
    key: 'status',
    width: '64px',
    sorter: 'default',
    render(row) {
      return h(
        NTag,
        {
          size: 'small',
          round: true,
          bordered: false,
          color: {
            color: `var(--jk-${getResultColor(row.color as string)})`,
            textColor: '#FFFFFF',
          },
          class: ['monitor-table-result-chip', row.building ? 'building' : ''],
        },
        { default: () => row.status },
      )
    },
  },
]

function getResultColor(jobColor: string) {
  switch (jobColor) {
    case 'blue': return 'success'
    case 'red': return 'error'
    case 'notbuilt': return 'notbuilt'
    case 'yellow': return 'warning'
    case 'aborted': return 'aborted'
    case 'disabled': return 'disabled'
    default: return ''
  }
}

function getRowClass(item: DisplayedJobDetail) {
  const classNames = []
  if (item.color === 'disabled') {
    classNames.push('disabled-row')
  }
  if (item.building) {
    classNames.push('building-row')
  }
  return classNames.join(' ')
}
</script>

<template>
  <n-data-table
    class="options-theme-preview-wrapper-job-monitor-table"
    size="small"
    :columns="headers"
    :data="tableData"
    :row-class-name="getRowClass"
    :bordered="false"
  >
    <template #empty>
      <div class="data-table-no-data">
        无数据
      </div>
    </template>
  </n-data-table>
</template>

<style lang="scss">
.options-theme-preview-wrapper-job-monitor-table {
  .n-data-table-empty {
    padding: 0;
  }

  .data-table-no-data {
    padding: 8px 0;
    color: #88888888;
    text-align: center;
  }

  .monitor-table-job-name {
    text-decoration-line: none;
    word-break: break-all;
    word-wrap: break-word;
  }

  .monitor-table-build-time {
    font-size: 13px;
  }

  .monitor-table-result-chip {
    justify-content: center;
    width: 100%;
    text-align: center;
  }

  .gone-row {
    display: none;
  }

  .disabled-row > td {
    background-color: var(--jk-disabledline);
  }

  .building-row > td {
    background-color: var(--jk-buildingline);
  }

  .building {
    animation-name: building;
    animation-duration: 1.4s;
    animation-play-state: running;
    animation-timing-function: ease-out;
    animation-iteration-count: infinite;
    animation-direction: alternate;
    animation-fill-mode: none;
  }

  @keyframes building {
    0% {
      opacity: 1;
    }

    100% {
      opacity: 0.3;
    }
  }
}
</style>
