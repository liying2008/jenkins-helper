<script lang="ts" setup>
import { h, onMounted, ref, watch } from 'vue'
import { Add, CloseCircleOutline, SearchOutline } from '@vicons/ionicons5'
import type { SelectMixedOption } from 'naive-ui/es/select/src/interface'
import type { TableColumns } from 'naive-ui/es/data-table/src/interface'
import { NA, NTag, NText } from 'naive-ui/es/components'
import type { DisplayedJobDetail, JobRoot } from '../../../models/job'
import type { Options } from '../../../models/option'
import CreationModal from './CreationModal.vue'
import jenkinsIcon from '~/assets/img/icon128.png'
import type { StorageChangeWrapper } from '~/libs/storage'
import { StorageService } from '~/libs/storage'
import { Tools } from '~/libs/tools'
import { SnackbarData } from '~/models/message'

const strings = {
  noFilterValue: '-',
  createMonitoringTaskTitle: browser.i18n.getMessage('createMonitoringTaskTitle'),
  search: browser.i18n.getMessage('search'),
  url: browser.i18n.getMessage('url'),
  inputUrlPlaceholder: browser.i18n.getMessage('inputUrlPlaceholder'),
  showDisabledJobs: browser.i18n.getMessage('showDisabledJobs'),
  filterLabel: browser.i18n.getMessage('filterLabel'),
  urlCannotEmpty: browser.i18n.getMessage('urlCannotEmpty'),
  urlInvalid: browser.i18n.getMessage('urlInvalid'),
  addMonitorUrlTip: browser.i18n.getMessage('addMonitorUrlTip'),
  removeMonitorUrlTip: browser.i18n.getMessage('removeMonitorUrlTip'),
}
const creationModalVisible = ref(false)
const showDisabledJobs = ref(true)
const jobsData = ref<JobRoot>({})
const data = ref<Record<string, any>>({})
const filteringResult = ref('')
const filteringResults: SelectMixedOption[] = []
const form = ref<any>()

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
          innerHTML: getStyledTime(row.lastBuildTimestamp),
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
            color: `var(--${getResultColor(row.color)})`,
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
const snackbar = ref(SnackbarData.empty())

watch(showDisabledJobs, (newVal: boolean) => {
  StorageService.getOptions().then((options: Options) => {
    // console.log('showDisabledJobsChanged', options)
    options.showDisabledJobs = newVal
    StorageService.saveOptions(options)
  })
})

watch(filteringResult, () => {
  filterData()
})


onMounted(() => {
  console.log('form', form.value)
  initPage()
  getAllJobStatus()
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

function creationModalVisibleUpdate(value: boolean) {
  creationModalVisible.value = value
}

/**
   * 初始化页面
   */
function initPage() {
  // 默认不过滤
  filteringResult.value = strings.noFilterValue
  filteringResults.push({
    value: strings.noFilterValue,
    label: strings.noFilterValue,
  })
  Object.keys(Tools.jobStatus).forEach((value) => {
    filteringResults.push({
      value,
      label: Tools.jobStatus[value],
    })
  })
}

function jobStatusChange(changes: StorageChangeWrapper) {
  // console.log('00-jobStatusChange', changes)
  if (StorageService.keyForJenkinsJobData in changes) {
    // Job Status 有变动
    // 刷新页面
    getAllJobStatus()
  }
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
      if (filteringResult.value === strings.noFilterValue || jobDetail.color === filteringResult.value) {
        data.value[setUrl].jobs.push({
          jobUrl,
          ...jobDetail,
        })
      }
    })
  })
  // console.log('filterData', this.data)
}

function removeJenkins(jenkinsUrl: string) {
  const ok = confirm(browser.i18n.getMessage('cancelMonitoringTaskGroup', [jenkinsUrl]))
  if (!ok) {
    // 点击取消
    return
  }

  StorageService.removeJenkinsUrl(jenkinsUrl).then(() => {
    console.log('removeJenkins::removed', jenkinsUrl)
    // 显示 删除成功
    snackbar.value = SnackbarData.builder()
      .message(strings.removeMonitorUrlTip)
      .color('success')
      .build()
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
  // TODO isDark
  if (false) {
    dateColor = '#bbbbbb'
    timeColor = '#888888'
  }
  return `<span style="color: ${dateColor}">${arr[0]}</span> <span style="color: ${timeColor}">${arr[1]}</span>`
}
</script>

<template>
  <div class="monitor-wrapper">
    <div class="top-op">
      <!-- 按Job名称过滤Job -->
      <n-input
        :placeholder="strings.search"
        class="search-input"
        size="small"
      >
        <template #prefix>
          <n-icon :component="SearchOutline" />
        </template>
      </n-input>
      <!-- 按构建结果过滤Job -->
      <n-select
        v-model:value="filteringResult"
        size="small"
        class="filter-select"
        :placeholder="strings.filterLabel"
        :options="filteringResults"
      />
      <!-- 是否显示禁用的Job -->
      <n-checkbox
        v-model:checked="showDisabledJobs"
        size="small"
        class="show-disabled-checkbox items-center flex-1"
      >
        {{ strings.showDisabledJobs }}
      </n-checkbox>
      <!-- 创建新的监控任务 -->
      <div>
        <n-button
          circle
          size="small"
          type="primary"
          class="create-task-button"
          :title="strings.createMonitoringTaskTitle"
          @click="creationModalVisible = true"
        >
          <template #icon>
            <n-icon><add /></n-icon>
          </template>
        </n-button>
      </div>
    </div>

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
          <div class="ml-5 card-title-job flex-1">
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
            <div class="ml-2">
              <n-button
                text
                class="card-title-remove-btn"
                title="Remove monitoring for this task"
                @click="removeJenkins(jenkinsUrl)"
              >
                <n-icon>
                  <close-circle-outline />
                </n-icon>
              </n-button>
            </div>
          </div>
        </div>
        <n-data-table
          v-show="jenkins.hasOwnProperty('jobs')"
          class="mt-4"
          size="small"
          :columns="headers"
          :data="jenkins.jobs"
          :row-class-name="getRowClass"
          :search="search"
          :bordered="false"
        />
      </n-card>
    </div>
    <!-- 创建监控任务的对话框 -->
    <CreationModal
      :show="creationModalVisible"
      @visible-update="creationModalVisibleUpdate"
    />
  </div>
</template>


<style lang="scss">
.monitor-wrapper {
  min-height: 500px;
  .top-op {
    display: flex;
    .search-input {
      width: 50%;
    }
    .filter-select {
      margin-left: 10px;
      width: 20%;
    }
    .show-disabled-checkbox {
      margin-left: 10px;
    }
    .create-task-button {
      margin-left: 10px;

    }
  }
  .data-area {
    margin-top: 10px;
    .card {
      margin-bottom: 8px;
      .n-card__content {
        padding: 0px;
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
          opacity: 0.5;
          vertical-align: text-top;
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
        width: 100%;
        text-align: center;
        justify-content: center;
      }
      .gone-row {
        display: none;
      }

      .building-row > td {
        background-color: var(--buildingline);
      }

      .disabled-row > td {
        background-color: var(--disabledline);
      }

      .building {
        animation-name: building;
        animation-duration: 1.4s;
        animation-timing-function: ease-out;
        animation-direction: alternate;
        animation-iteration-count: infinite;
        animation-fill-mode: none;
        animation-play-state: running;
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
      border-bottom: 0px solid var(--n-merged-border-color);
    }
  }
}
</style>
