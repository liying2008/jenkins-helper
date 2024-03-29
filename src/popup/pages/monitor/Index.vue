<script lang="ts" setup>
import { h, onMounted, ref, watch } from 'vue'
import { CloseCircleOutline } from '@vicons/ionicons5'
import type { TableColumns } from 'naive-ui/es/data-table/src/interface'
import { NA, NTag, useMessage } from 'naive-ui/es/components'
import OpArea from './OpArea.vue'
import type { DisplayedJobDetail, DisplayedJobRoot, JobRoot } from '~/models/job'
import { getEmptyDisplayedJobSet } from '~/models/job'
import type { Options } from '~/models/option'
import jenkinsIcon from '~/assets/img/icon128.png'
import type { StorageChangeWrapper } from '~/libs/storage'
import { StorageService } from '~/libs/storage'
import { Tools } from '~/libs/tools'
import { t } from '~/libs/extension'
import { isNullOrEmptyRecord } from '~/libs/common'
import StyleTime from '~/components/style-time/StyleTime.vue'

const strings = {
  noFilterValue: '-',
  search: t('search'),
  newMonitoringTask: t('newMonitoringTask'),
  removeMonitorUrlTip: t('removeMonitorUrlTip'),
  dataIsBeingFetched: t('dataIsBeingFetched'),
  noData: t('noData'),
  cancel: t('cancel'),
  ok: t('ok'),
  jobName: t('jobName'),
  lastBuildTime: t('lastBuildTime'),
  result: t('result'),
  deleteMonitoring: t('deleteMonitoring'),
}

const showDisabledJobs = ref(true)
const filteringResult = ref(strings.noFilterValue)
const filteringJobName = ref('')
const jobsData = ref<JobRoot>({})
const data = ref<DisplayedJobRoot>({})

const message = useMessage()

const headers: TableColumns<DisplayedJobDetail> = [
  {
    title: strings.jobName,
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
    title: strings.lastBuildTime,
    align: 'center',
    key: 'lastBuildTimestamp',
    width: '164px',
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
    title: strings.result,
    align: 'center',
    key: 'status',
    width: '78px',
    sorter: 'default',
    render(row) {
      return h(
        NTag,
        {
          size: 'small',
          round: true,
          bordered: false,
          color: {
            color: `var(--jk-${getResultColor(row.color!)})`,
            textColor: '#FFFFFF',
          },
          class: ['monitor-table-result-chip', row.building ? 'building' : ''],
        },
        { default: () => row.status },
      )
    },
  },
]

watch(filteringResult, () => {
  filterData()
})

watch(filteringJobName, () => {
  filterData()
})

getAllJobStatus()

onMounted(() => {
  StorageService.addStorageListener(jobStatusChange)
})

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
  if (!showDisabledJobs.value && item.color === 'disabled') {
    classNames.push('gone-row')
  } else if (item.color === 'disabled') {
    classNames.push('disabled-row')
  }
  if (item.building) {
    classNames.push('building-row')
  }
  return classNames.join(' ')
}

function jobStatusChange(changes: StorageChangeWrapper) {
  // console.log('00-jobStatusChange', changes)
  if (StorageService.keyForJenkinsJobData in changes) {
    // Job Status 有变动
    // 刷新页面
    getAllJobStatus()
  }
}

function getDeletionConfirmMsg(jenkinsUrl: string) {
  return t('cancelMonitoringTaskGroup', [jenkinsUrl])
}

function getAllJobStatus() {
  StorageService.getOptions().then((options: Options) => {
    showDisabledJobs.value = options.showDisabledJobs
  })
  StorageService.getJobsStatus().then((jobResult: JobRoot) => {
    // console.log('getAllJobStatus::jobResult', jobResult)
    jobsData.value = jobResult
    // 过滤数据
    filterData()
  })
}

function onResultFilterChange(newVal: string) {
  filteringResult.value = newVal
}

function onJobNameFilterChange(newVal: string) {
  filteringJobName.value = newVal.trim()
}

function onShowDisabledJobsChange(newVal: boolean) {
  StorageService.savePartialOptions({ showDisabledJobs: newVal }).then(() => {
    // 保存即可，当前页面的 storage change listener 会监听 showDisabledJobs 的变化，更新数据
    showDisabledJobs.value = newVal
  })
}

/**
 * 过滤数据
 */
function filterData() {
  const status = jobsData.value
  // console.log('filterData::status', status)
  data.value = {}
  Object.keys(status).forEach((setUrl: string) => {
    data.value[setUrl] = getEmptyDisplayedJobSet()
    data.value[setUrl].name = status[setUrl].name
    data.value[setUrl].status = status[setUrl].status
    data.value[setUrl].error = status[setUrl].error

    if (!status[setUrl].jobs) {
      return
    }
    data.value[setUrl].jobs = []
    const jobs = status[setUrl].jobs!
    Object.keys(jobs).forEach((jobUrl: string) => {
      const jobDetail = jobs[jobUrl]
      // 过滤结果
      if (filteringResult.value === strings.noFilterValue || jobDetail.color === filteringResult.value) {
        // 过滤Job名称
        if (filteringJobName.value === '' || jobDetail.name.includes(filteringJobName.value)) {
          data.value[setUrl].jobs.push({
            jobUrl,
            ...jobDetail,
          })
        }
      }
    })
  })
  // console.log('filterData', data.value)
}

function removeJenkins(jenkinsUrl: string) {
  StorageService.removeJenkinsUrl(jenkinsUrl).then(() => {
    console.log('removeJenkins::removed', jenkinsUrl)
    // 显示 删除成功
    message.success(strings.removeMonitorUrlTip)
  })
}
</script>

<template>
  <div class="monitor-wrapper">
    <!-- 顶部操作区域 -->
    <OpArea
      :show-disabled-jobs="showDisabledJobs"
      :disabled="isNullOrEmptyRecord(jobsData)"
      @result-filter-change="onResultFilterChange"
      @job-name-filter-change="onJobNameFilterChange"
      @show-disabled-jobs-change="onShowDisabledJobsChange"
    />
    <!-- 数据表格区域 -->
    <div class="data-area">
      <n-card
        v-for="(jenkins, jenkinsUrl, index) in data"
        :key="index"
        class="card"
      >
        <div class="card-title">
          <img
            class="img-rounded"
            alt="Jenkins"
            :src="jenkinsIcon"
          >
          <div class="ml-12px card-title-job flex-1">
            <span
              :title="decodeURIComponent(jenkins.name)"
              class="card-title-job-name"
            >
              {{ decodeURIComponent(jenkins.name) }}
            </span>
            <br style="height: 8px;">
            <a
              class="card-title-job-url jk-a-link-color"
              target="_blank"
              :href="jenkinsUrl"
            >
              <span
                class="no-wrap"
                :title="decodeURIComponent(jenkinsUrl)"
              >{{ decodeURIComponent(jenkinsUrl) }}</span>
            </a>
          </div>
          <div class="flex place-items-center">
            <div v-if="jenkins.status === 'error'">
              <n-tag
                type="error"
                round
                :title="jenkins.error"
                class="card-title-right-tag"
              >
                <span>ERROR</span>
              </n-tag>
            </div>
            <div v-else-if="jenkins.status === 'new'">
              <n-tag
                type="info"
                round
                :title="strings.newMonitoringTask"
                class="card-title-right-tag"
              >
                <span>NEW</span>
              </n-tag>
            </div>
            <div class="ml-8px">
              <PopconfirmDeleteBtn
                :text="getDeletionConfirmMsg(decodeURIComponent(jenkinsUrl))"
                btn-class="card-title-remove-btn"
                :btn-title="strings.deleteMonitoring"
                :icon="CloseCircleOutline"
                @positive-click="removeJenkins(jenkinsUrl)"
              />
            </div>
          </div>
        </div>
        <n-data-table
          v-show="jenkins.status !== 'error' && jenkins.hasOwnProperty('jobs')"
          class="data-table"
          size="small"
          :columns="headers"
          :data="jenkins.jobs"
          :row-class-name="getRowClass"
          :bordered="false"
        >
          <template #empty>
            <div class="data-table-no-data">
              <span v-if="jenkins.status === 'new'">{{ strings.dataIsBeingFetched }}</span>
              <span v-else>{{ strings.noData }}</span>
            </div>
          </template>
        </n-data-table>
      </n-card>
    </div>
  </div>
</template>

<style lang="scss">
.monitor-wrapper {
  min-height: 200px;

  .data-area {
    margin-top: 10px;

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

        .card-title-job {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;

          .card-title-job-name {
            font-size: 18px;
            font-weight: 500;
          }

          .card-title-job-url {
            font-size: 14px;
            text-decoration: none;
          }
        }

        .card-title-right-tag {
          height: 26px;
          font-size: 12px;
        }

        .card-title-remove-btn {
          font-size: 16px;
          vertical-align: text-top;
          opacity: 0.5;
        }
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

    .n-data-table.n-data-table--bottom-bordered .n-data-table-td.n-data-table-td--last-row {
      border-bottom: 0 solid var(--n-merged-border-color);
    }
  }
}
</style>
