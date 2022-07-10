<script lang="ts" setup>
import { h, onMounted, ref, watch } from 'vue'
import { CloseCircleOutline } from '@vicons/ionicons5'
import type { TableColumns } from 'naive-ui/es/data-table/src/interface'
import { NA, NTag, NText, useMessage } from 'naive-ui/es/components'
import type { DisplayedJobDetail, JobRoot } from '../../../models/job'
import type { Options } from '../../../models/option'
import OpArea from './OpArea.vue'
import jenkinsIcon from '~/assets/img/icon128.png'
import type { StorageChangeWrapper } from '~/libs/storage'
import { StorageService } from '~/libs/storage'
import { Tools } from '~/libs/tools'
import { useThemeStore } from '~/store'
import { t } from '~/libs/extension'

const strings = {
  noFilterValue: '-',
  search: t('search'),
  removeMonitorUrlTip: t('removeMonitorUrlTip'),
  noData: t('noData'),
  cancel: t('cancel'),
  ok: t('ok'),
}
const showDisabledJobs = ref(true)
const filteringResult = ref(strings.noFilterValue)
const filteringJobName = ref('')
const jobsData = ref<JobRoot>({})
const data = ref<Record<string, any>>({})

const message = useMessage()
const themeStore = useThemeStore()

const search = ''
const headers: TableColumns = [
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
          class: ['monitor-table-job-name', 'a-link-color', row.building ? 'building' : ''],
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
      return h(
        NText,
        {
          class: ['monitor-table-build-time', row.building ? 'building' : ''],
          innerHTML: getStyledTime(row.lastBuildTimestamp as number),
        },
      )
    },
  },
  {
    title: 'Result',
    align: 'center',
    key: 'status',
    width: '12%',
    sorter: 'default',
    render(row) {
      return h(
        NTag,
        {
          size: 'small',
          round: true,
          bordered: false,
          color: {
            // TODO
            color: `var(--jk-${getResultColor(row.color as string)})`,
            textColor: '#FFFFFF',
          },
          class: ['monitor-table-result-chip', row.building ? 'building' : ''],
        },
        // TODO
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

onMounted(() => {
  getAllJobStatus()
  StorageService.addStorageListener(jobStatusChange)
})

function getResultColor(jobColor: string) {
  switch (jobColor) {
    case 'blue': return 'successColorPressed'
    case 'red': return 'errorColorPressed'
    case 'notbuilt': return 'notbuilt'
    case 'yellow': return 'warningColorPressed'
    case 'aborted': return 'aborted'
    case 'disabled': return 'disabled'
    default: return 'orange darken-2'
  }
}

function getRowClass(item: DisplayedJobDetail) {
  if (!showDisabledJobs.value && item.color === 'disabled') {
    return 'gone-row'
  } else if (item.color === 'disabled') {
    return 'disabled-row'
  } else if (item.building) {
    return 'building-row'
  } else {
    return ''
  }
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
    if (options.showDisabledJobs === undefined) {
      showDisabledJobs.value = true
    } else {
      showDisabledJobs.value = options.showDisabledJobs
    }
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
  showDisabledJobs.value = newVal
}

/**
 * 过滤数据
 */
function filterData() {
  const status = jobsData.value
  // console.log('filterData::status', status)
  data.value = {}
  Object.keys(status).forEach((setUrl: string) => {
    data.value[setUrl] = {}
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
  // console.log('filterData', this.data)
}

function removeJenkins(jenkinsUrl: string) {
  StorageService.removeJenkinsUrl(jenkinsUrl).then(() => {
    console.log('removeJenkins::removed', jenkinsUrl)
    // 显示 删除成功
    message.success(strings.removeMonitorUrlTip)
  })
}

/**
 * 获取有样式的时间字符串
 * @returns {string}
 */
function getStyledTime(timestamp: number) {
  const s = Tools.getReadableTime(timestamp, true)
  if (s === '') {
    return ''
  }
  const arr = s.split(' ')
  let dateColor = '#444444'
  let timeColor = '#888888'
  if (themeStore.darkMode) {
    dateColor = '#bbbbbb'
    timeColor = '#888888'
  }
  return `<span style="color: ${dateColor}">${arr[0]}</span> <span style="color: ${timeColor}">${arr[1]}</span>`
}
</script>

<template>
  <div class="monitor-wrapper">
    <!-- 顶部操作区域 -->
    <OpArea
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
              color="title"
              class="card-title-job-name"
            >
              {{ decodeURIComponent(jenkins.name) }}
            </span>
            <br style="height: 8px;">
            <a
              class="card-title-job-url a-link-color"
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
            <div v-show="jenkins.status !== 'ok'">
              <n-button
                type="error"
                secondary
                strong
                round
                :title="jenkins.error"
                :href="jenkinsUrl"
                tag="a"
                target="_blank"
                class="card-title-err-btn"
              >
                <span v-if="jenkins.status === 'cctray'">CCtray Error</span>
                <span v-else>ERROR</span>
              </n-button>
            </div>
            <div class="ml-8px">
              <PopconfirmDeleteBtn
                :text="getDeletionConfirmMsg(decodeURIComponent(jenkinsUrl))"
                btn-class="card-title-remove-btn"
                btn-title="Remove monitoring for this task"
                :icon="CloseCircleOutline"
                @positive-click="removeJenkins(jenkinsUrl)"
              />
            </div>
          </div>
        </div>
        <n-data-table
          v-show="jenkins.hasOwnProperty('jobs')"
          class="data-table"
          size="small"
          :columns="headers"
          :data="jenkins.jobs"
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
.monitor-wrapper {
  min-height: 500px;

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

      .building-row > td {
        background-color: var(--jk-buildingline);
      }

      .disabled-row > td {
        background-color: var(--jk-disabledline);
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
