<script lang="ts" setup>
import { onMounted, ref, watch } from 'vue'
import { useTheme } from 'vuetify/lib/framework.mjs'
import { VForm } from 'vuetify/lib/components/index'
import { mdiCloseCircleOutline, mdiLinkVariant, mdiPlus } from '@mdi/js'
import type { DisplayedJobDetail, JobRoot } from '../../models/job'
import type { SelectionOption } from '../../models/vuetify'
import type { Options } from '../../models/option'
import jenkinsIcon from '~/assets/img/icon48.png'
import type { StorageChangeWrapper } from '~/libs/storage'
import { StorageService } from '~/libs/storage'
import { Tools } from '~/libs/tools'
import { SnackbarData } from '~/models/message'


const theme = useTheme()

const strings = {
  noFilterValue: '-',
  createMonitoringTaskTitle: browser.i18n.getMessage('createMonitoringTaskTitle'),
  url: browser.i18n.getMessage('url'),
  inputUrlPlaceholder: browser.i18n.getMessage('inputUrlPlaceholder'),
  showDisabledJobs: browser.i18n.getMessage('showDisabledJobs'),
  filterLabel: browser.i18n.getMessage('filterLabel'),
  urlCannotEmpty: browser.i18n.getMessage('urlCannotEmpty'),
  urlInvalid: browser.i18n.getMessage('urlInvalid'),
  addMonitorUrlTip: browser.i18n.getMessage('addMonitorUrlTip'),
  removeMonitorUrlTip: browser.i18n.getMessage('removeMonitorUrlTip'),
}
const isFormValid = false
const inputUrlValue = ref('')
const showDisabledJobs = ref(true)
const jobsData = ref<JobRoot>({})
const data = ref<Record<string, any>>({})
const filteringResult = ref('')
const filteringResults: SelectionOption[] = []
const form = ref<VForm>()

const search = ''
const headers = [
  { text: 'Job Name', align: 'start', value: 'name' },
  { text: 'Last Build Time', align: 'center', value: 'lastBuildTimestamp', width: '24%' },
  { text: 'Result', align: 'center', value: 'status', width: '12%' },
]
const snackbar = ref(SnackbarData.empty())

// const form = computed(() => {
//   return this.$refs.form as Vue & {
//     validate: () => boolean
//     resetValidation: () => void
//   }
// })

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

function required() {
  return (v: string) => (v && v.length > 0) || strings.urlCannotEmpty
}

function isValidURL() {
  const expression = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/
  const regex = new RegExp(expression)
  return (v: string) => {
    if (!v || v.length === 0) {
      return true
    } else {
      return (regex.test(v)) || strings.urlInvalid
    }
  }
}

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

/**
   * 初始化页面
   */
function initPage() {
  // 默认不过滤
  filteringResult.value = strings.noFilterValue
  filteringResults.push({
    value: strings.noFilterValue,
    text: strings.noFilterValue,
  })
  Object.keys(Tools.jobStatus).forEach((value) => {
    filteringResults.push({
      value,
      text: Tools.jobStatus[value],
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

/**
   * 添加新 Jenkins URL
   */
function addJenkinsUrl() {
  // 先验证输入
  if (!inputUrlValue.value || !isFormValid) {
    return
  }
  let url = inputUrlValue.value
  url = url.charAt(url.length - 1) === '/' ? url : `${url}/`
  // console.log('url', url)
  StorageService.addJenkinsUrl(url).then(() => {
    inputUrlValue.value = ''
    form.value.resetValidation()
    // 显示 创建成功
    snackbar.value = SnackbarData.builder()
      .message(strings.addMonitorUrlTip)
      .color('success')
      .build()
  })
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
  if (theme.current.value.dark) {
    dateColor = '#bbbbbb'
    timeColor = '#888888'
  }
  return `<span style="color: ${dateColor}">${arr[0]}</span> <span style="color: ${timeColor}">${arr[1]}</span>`
}
</script>

<template>
  <div id="monitor-wrapper">
    <!-- 创建监控任务面板 -->
    <v-expansion-panels class="my-3">
      <v-expansion-panel>
        <v-expansion-panel-title>
          {{ strings.createMonitoringTaskTitle }}
        </v-expansion-panel-title>
        <v-expansion-panel-text>
          <!-- 添加URL的表单 -->
          <v-form
            ref="form"
            v-model="isFormValid"
            @submit.prevent="addJenkinsUrl"
          >
            <v-row>
              <v-col cols="12">
                <v-text-field
                  v-model="inputUrlValue"
                  :append-icon="isFormValid ? mdiPlus : ''"
                  :prepend-icon="mdiLinkVariant"
                  :label="strings.inputUrlPlaceholder"
                  type="text"
                  :rules="[required(), isValidURL()]"
                  @click:append="addJenkinsUrl"
                ></v-text-field>
              </v-col>
            </v-row>
          </v-form>
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>

    <div>
      <v-card
        v-for="(jenkins, jenkinsUrl, index) in data"
        :key="index"
        class="card my-3"
      >
        <v-card-title>
          <img
            class="img-rounded avatar"
            alt="Jenkins"
            :src="jenkinsIcon"
          >
          <div class="ml-5 card-title-job">
            <span
              :title="decodeURIComponent(jenkins.name)"
              color="title"
              class="card-title-job-name"
            >
              {{ decodeURIComponent(jenkins.name) }}
            </span>
            <br style="height: 10px;">
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
          <v-spacer></v-spacer>
          <div v-show="jenkins.status !== 'ok'">
            <v-btn
              depressed
              small
              :href="jenkinsUrl"
              :title="jenkins.error"
              target="_blank"
              color="error"
              class="card-title-err-btn"
            >
              <span v-if="jenkins.status === 'cctray'">CCtray Error</span>
              <span v-else>ERROR</span>
            </v-btn>
          </div>
          <div class="ml-2">
            <v-btn
              icon
              title="Remove monitoring for this task"
              x-small
              color="grey"
              class="card-title-remove-btn"
              @click="removeJenkins(jenkinsUrl)"
            >
              <v-icon>{{ mdiCloseCircleOutline }}</v-icon>
            </v-btn>
          </div>
        </v-card-title>
        <v-table
          v-show="jenkins.hasOwnProperty('jobs')"
          :headers="headers"
          :items="jenkins.jobs"
          :item-class="getRowClass"
          :search="search"
          dense
          hide-default-footer
          disable-pagination
        >
          <!-- name -->
          <template #[`item.name`]="{ item }">
            <a
              :href="item.jobUrl"
              target="_blank"
              class="monitor-table-job-name a-link-color"
              :class="[{ building: item.building }]"
            >{{ item.name }}</a>
          </template>

          <!-- lastBuildTimestamp -->
          <template #[`item.lastBuildTimestamp`]="{ item }">
            <span
              :class="[{ building: item.building }]"
              v-html="getStyledTime(item.lastBuildTimestamp)"
            ></span>
          </template>

          <!-- status -->
          <template #[`item.status`]="{ item }">
            <v-chip
              small
              label
              text-color="white"
              pill
              :color="getResultColor(item.color)"
              class="monitor-table-result-chip"
              :class="[{ building: item.building }]"
            >
              <span class="monitor-table-result-chip-text">{{ item.status }}</span>
            </v-chip>
          </template>
        </v-table>
      </v-card>
    </div>

    <!-- 底部设置 -->
    <div v-show="Object.keys(data).length > 0">
      <v-container fluid>
        <v-row class="pt-3 bottom-toolbar-row">
          <!-- 是否显示禁用的Job -->
          <v-checkbox
            v-model="showDisabledJobs"
            dense
            :label="strings.showDisabledJobs"
            class="bottom-show-disabled"
          ></v-checkbox>

          <!-- 过滤Job -->
          <v-select
            v-model="filteringResult"
            :items="filteringResults"
            :label="strings.filterLabel"
            dense
            outlined
            class="ml-12 bottom-filter"
          ></v-select>
        </v-row>
      </v-container>
    </div>

    <!-- snackbar -->
    <j-snackbar :snackbar-data="snackbar" />
  </div>
</template>


<style lang="scss">
#monitor-wrapper {
  .card {
    .card-title-job {
      width: 460px;
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
      width: 4rem;
      height: 1.6rem;
    }

    .card-title-remove-btn {
      align-items: baseline;
    }

    .monitor-table-job-name {
      text-decoration-line: none;
      word-break: break-all;
      word-wrap: break-word;
    }

    .monitor-table-result-chip {
      .monitor-table-result-chip-text {
        width: 46px;
        text-align: center;
        justify-content: center;
      }
    }

    .v-data-table > .v-data-table__wrapper > table > thead > tr > th {
      padding: 0 10px;
    }
    .v-data-table > .v-data-table__wrapper > table > tbody > tr > td {
      padding: 0 10px;
    }

    .gone-row {
      display: none;
    }

    .building-row {
      background-color: var(--v-buildingline-base);
    }

    .disabled-row {
      background-color: var(--v-disabledline-base);
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

  .bottom-toolbar-row {
    .bottom-filter {
      max-width: 130px;
    }
  }
}
</style>
