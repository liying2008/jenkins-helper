<template>
  <div id="monitor-wrapper">
    <!-- 添加URL的表单 -->
    <v-form
      ref="form"
      v-model="isFormValid"
    >
      <v-row>
        <v-col cols="12">
          <v-text-field
            v-model="inputUrlValue"
            :append-outer-icon="isFormValid ? 'mdi-plus' : ''"
            prepend-icon="mdi-link-variant"
            :label="strings.inputUrlPlaceholder"
            type="text"
            :rules="[required(), isValidURL()]"
            @click:append-outer="addJenkinsUrl"
          ></v-text-field>
        </v-col>
      </v-row>
    </v-form>

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
            src="img/icon48.png"
          >
          <div class="ml-5 card-title-job">
            <span
              :title="jenkins.name"
              class="card-title-job-name"
            >
              {{ jenkins.name }}
            </span>
            <br style="height: 10px;">
            <a
              class="card-title-job-url"
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
          <div v-show="jenkins.status!=='ok'">
            <v-btn
              depressed
              small
              :href="jenkinsUrl"
              :title="jenkins.error"
              target="_blank"
              color="error"
              class="card-title-err-btn"
            >
              <span v-if="jenkins.status=='cctray'">CCtray Error</span>
              <span v-else>ERROR</span>
            </v-btn>
          </div>
          <div class="ml-2">
            <v-btn
              icon
              title="Remove monitoring for this task"
              x-small
              color="grey"
              @click="removeJenkins(jenkinsUrl)"
            >
              <v-icon>mdi-close-circle-outline</v-icon>
            </v-btn>
          </div>
        </v-card-title>
        <v-data-table
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
          <template v-slot:item.name="{ item }">
            <a
              :href="item.jobUrl"
              target="_blank"
              :class="['monitor-table-job-name', {'building':item.building}]"
            >{{ item.name }}</a>
          </template>

          <!-- lastBuildTime -->
          <template v-slot:item.lastBuildTime="{ item }">
            <span
              :class="[ {'building':item.building}]"
              v-html="getStyledTime(item.lastBuildTimestamp)"
            ></span>
          </template>

          <!-- status -->
          <template v-slot:item.status="{ item }">
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

    <!--底部设置-->
    <div v-show="Object.keys(data).length>0">
      <v-container fluid>
        <v-row>
          <!--是否显示禁用的Job-->
          <v-checkbox
            v-model="showDisabledJobs"
            :label="strings.showDisabledJobs"
            class="pt-0 mt-1 bottom-show-disabled"
          ></v-checkbox>

          <!--过滤Job-->
          <v-select
            v-model="filteringResult"
            :items="filteringResults"
            :label="strings.filterLabel"
            dense
            class="mt-1 ml-10 bottom-filter"
          ></v-select>
        </v-row>
      </v-container>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Watch } from 'vue-property-decorator'
import { StorageService } from '@/libs/storage.ts'
import { Tools } from '@/libs/tools.ts'
import { JobDetail, DisplayedJobDetail, JobSet, JobRoot, JobStatus } from '../../models/job'
import { SelectionOption } from '../../models/vuetify'
import { Options } from '../../models/option'

@Component({
  name: 'Monitor'
})
export default class Monitor extends Vue {
  strings = {
    noFilterValue: '-',
    url: browser.i18n.getMessage('url'),
    inputUrlPlaceholder: browser.i18n.getMessage('inputUrlPlaceholder'),
    monitor: browser.i18n.getMessage('monitor'),
    params: browser.i18n.getMessage('params'),
    computer: browser.i18n.getMessage('computer'),
    tools: browser.i18n.getMessage('tools'),
    showDisabledJobs: browser.i18n.getMessage('showDisabledJobs'),
    filterLabel: browser.i18n.getMessage('filterLabel'),
    urlCannotEmpty: browser.i18n.getMessage('urlCannotEmpty'),
    urlInvalid: browser.i18n.getMessage('urlInvalid'),
  }
  isFormValid = false
  inputUrlValue = ''
  showDisabledJobs = true
  jenkinsData: { jenkinsUrls: string[]; jobStatus: JobRoot } = {
    jenkinsUrls: [],
    jobStatus: {}
  }
  data: any = {}
  filteringResult = ''
  filteringResults: SelectionOption[] = []

  search = ''
  headers = [
    { text: 'Job Name', align: 'start', value: 'name' },
    { text: 'Last Build Time', align: 'center', value: 'lastBuildTime', width: '24%' },
    { text: 'Result', align: 'center', value: 'status', width: '12%' },
  ]

  get form() {
    return this.$refs.form as Vue & {
      validate: () => boolean
      resetValidation: () => void
    }
  }

  @Watch('showDisabledJobs')
  showDisabledJobsChanged(newVal: boolean) {
    StorageService.getOptions().then((options: Options) => {
      // console.log('showDisabledJobsChanged', options)
      options.showDisabledJobs = newVal
      StorageService.saveOptions(options)
    })
  }

  @Watch('filteringResult')
  filteringResultChanged() {
    this.filterData()
  }

  mounted() {
    this.initPage()
    this.getAllJobStatus()
    StorageService.addStorageListener(this.jobStatusChange)
  }

  required() {
    return (v: string) => (v && v.length > 0) || this.strings.urlCannotEmpty
  }

  isValidURL() {
    const expression = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/
    const regex = new RegExp(expression)
    return (v: string) => {
      if (!v || v.length === 0) {
        return true
      } else {
        return (regex.test(v)) || this.strings.urlInvalid
      }
    }
  }

  getResultColor(jobColor: string) {
    switch (jobColor) {
      case 'blue': return 'success'
      case 'red': return 'error'
      case 'notbuilt': return 'grey'
      case 'yellow': return 'warning'
      case 'aborted': return 'brown'
      case 'disabled': return 'blue-grey'
      default: return 'blue'
    }
  }

  getRowClass(item: DisplayedJobDetail) {
    if (!this.showDisabledJobs && item.color === 'disabled') {
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
  initPage() {
    // 默认不过滤
    this.filteringResult = this.strings.noFilterValue
    this.filteringResults.push({
      value: this.strings.noFilterValue,
      text: this.strings.noFilterValue
    })
    Object.keys(Tools.jobStatus).forEach((value) => {
      this.filteringResults.push({
        value: value,
        text: Tools.jobStatus[value]
      })
    })
  }

  jobStatusChange(changes: any) {
    console.log('jobStatusChange1', changes)
    delete changes[StorageService.keyForJenkinsUrl]
    delete changes[StorageService.keyForOptions]
    delete changes[StorageService.keyForNodes]
    console.log('jobStatusChange2', changes)
    if (Object.getOwnPropertyNames(changes).length > 0) {
      // Job Status 有变动
      // 刷新页面
      this.getAllJobStatus()
    }
  }

  getAllJobStatus() {
    StorageService.getOptions().then((options: Options) => {
      if (options.showDisabledJobs === undefined) {
        this.showDisabledJobs = true
      } else {
        this.showDisabledJobs = options.showDisabledJobs
      }
    })
    StorageService.getJenkinsUrls().then((result: string[]) => {
      this.jenkinsData.jenkinsUrls = result
      // console.log('result', result)
      StorageService.getJobStatus(result).then((jobResult: JobRoot) => {
        // console.log('jobResult', jobResult)
        this.jenkinsData.jobStatus = jobResult
        // 过滤数据
        this.filterData()
      })
    })
  }

  /**
   * 过滤数据
   */
  filterData() {
    const status: JobRoot = this.jenkinsData.jobStatus
    this.data = {}
    Object.keys(status).forEach((setUrl: string) => {
      this.data[setUrl] = {}
      this.data[setUrl].name = status[setUrl].name
      this.data[setUrl].status = status[setUrl].status
      this.data[setUrl].error = status[setUrl].error

      if (status[setUrl].jobs === undefined || status[setUrl].jobs === null) {
        return
      }
      this.data[setUrl].jobs = []
      const jobs = status[setUrl].jobs!
      Object.keys(jobs).forEach((jobUrl: string) => {
        const jobDetail = jobs[jobUrl]
        if (this.filteringResult === this.strings.noFilterValue || jobDetail.color === this.filteringResult) {
          this.data[setUrl].jobs.push({
            jobUrl,
            ...jobDetail
          })
        }
      })
    })
    // console.log('filterData', this.data)
  }

  /**
   * 添加新 Jenkins URL
   */
  addJenkinsUrl() {
    // 先验证输入
    if (!this.inputUrlValue || !this.isFormValid) {
      return
    }
    let url = this.inputUrlValue
    url = url.charAt(url.length - 1) === '/' ? url : url + '/'
    console.log('url', url)
    if (this.jenkinsData.jenkinsUrls.indexOf(url) === -1) {
      const newUrls = this.jenkinsData.jenkinsUrls.concat(url)
      console.log('newUrls', newUrls)
      StorageService.saveJenkinsUrls(newUrls).then(() => {
        this.jenkinsData.jenkinsUrls = newUrls
        this.inputUrlValue = ''
        this.form.resetValidation()
      })
    } else {
      this.inputUrlValue = ''
      this.form.resetValidation()
    }
  }

  removeJenkins(jenkinsUrl: string) {
    StorageService.removeJenkinsUrls(jenkinsUrl).then(() => {
      this.getAllJobStatus()
    })
  }

  /**
   * 获取有样式的时间字符串
   * @returns {string}
   */
  getStyledTime(timestamp: number) {
    const s = Tools.getReadableTime(timestamp, true)
    if (s === '') return ''
    const arr = s.split(' ')
    return '<span style="color: #444">' + arr[0] + '</span> <span style="color: #888">' + arr[1] + '</span>'
  }

  openOptions() {
    if (browser.runtime.openOptionsPage) {
      browser.runtime.openOptionsPage() // Chrome 42+, Firefox 48
    } else {
      browser.tabs.create({ 'url': browser.runtime.getURL('options.html') })
    }
  }

  openJobList() {
    browser.windows.create({
      url: 'job_stats.html',
      type: 'popup',
      width: 1200,
      height: 800,
    }).then((window) => {
      console.log('window', window)
    })
  }
}

</script>

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
        color: #333;
      }

      .card-title-job-url {
        font-size: 14px;
        text-decoration: none;
      }
    }

    .card-title-err-btn {
      width: 70px;
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
      background-color: powderblue;
    }

    .disabled-row {
      background-color: lightgray;
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
        opacity: 0.2;
      }
    }
  }

  .bottom-filter {
    max-width: 130px;
  }
}
</style>
