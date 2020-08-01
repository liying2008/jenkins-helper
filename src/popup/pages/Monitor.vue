<template>
  <div>
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
          <div class="ml-5">
            <span
              :title="jenkins.name"
              class="card-title"
            >
              {{ jenkins.name }}
            </span>
            <br style="height: 10px;">
            <a
              class="card-title-url"
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
          :items="toArray(jenkins.jobs)"
          :search="search"
          dense
          hide-default-footer
          disable-pagination
        >
          <template v-slot:item.name="{ item }">
            <a
              :href="item.jobUrl"
              target="_blank"
              class="monitor-table-job-name"
            >{{ item.name }}</a>
          </template>
          <template v-slot:item.lastBuildTime="{ item }">
            <span v-html="item.lastBuildTime "></span>
          </template>
          <template v-slot:item.status="{ item }">
            <v-chip
              small
              text-color="white"
              label
              pill
              :color="getResultColor(item.color)"
              class="monitor-table-result-chip"
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
import { Vue, Component, Watch } from 'vue-property-decorator'
import { StorageService } from '@/libs/storage.ts'
import { Tools } from '@/libs/tools.ts'
import { JobDetail, DisplayedJobDetail, JobSet, JobRoot, JobStatus } from '../../models/job'

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
  }
  isFormValid = false
  inputUrlValue = ''
  btnAddDisabled = true
  showDisabledJobs = true
  jenkinsData: { jenkinsUrls: string[]; jobStatus: JobRoot } = {
    jenkinsUrls: [],
    jobStatus: {}
  }
  data: any = {}
  filteringResult = ''
  filteringResults: any[] = []

  search = ''
  headers = [
    { text: 'Job Name', align: 'start', value: 'name' },
    { text: 'Last Build Time', align: 'center', value: 'lastBuildTime' },
    { text: 'Result', align: 'center', value: 'status' },
  ]

  get form() {
    return this.$refs.form as Vue & {
      validate: () => boolean
      resetValidation: () => void
    }
  }

  @Watch('showDisabledJobs')
  showDisabledJobsChanged(newVal: boolean) {
    StorageService.getOptions().then((options: any) => {
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
    return (v: string) => (v && v.length > 0) || 'URL cannot be empty.'
  }

  isValidURL() {
    const expression = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/
    const regex = new RegExp(expression)
    return (v: string) => {
      if (!v || v.length === 0) {
        return true
      } else {
        return (regex.test(v)) || 'URL is invalid.'
      }
    }
  }

  toArray(jobStatus: JobStatus|undefined) {
    const jobArray: DisplayedJobDetail[] = []
    // console.log('jobStatus type', typeof jobStatus)
    if (jobStatus === undefined) {
      return jobArray
    }
    for (const jobUrl of Object.keys(jobStatus)) {
      if (jobStatus.hasOwnProperty(jobUrl)) {
        const jobDetail = jobStatus[jobUrl]
        jobArray.push({
          jobUrl,
          lastBuildTime: this.getStyledTime(jobDetail.lastBuildTimestamp),
          ...jobDetail
        })
      }
    }
    return jobArray
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
    delete changes[StorageService.keyForJenkinsUrl]
    delete changes[StorageService.keyForOptions]
    delete changes[StorageService.keyForNodes]
    if (Object.getOwnPropertyNames(changes).length > 0) {
      // Job Status 有变动
      // 刷新页面
      this.getAllJobStatus()
    }
  }

  getAllJobStatus() {
    StorageService.getOptions().then((options: any) => {
      if (options.showDisabledJobs === undefined) {
        this.showDisabledJobs = true
      } else {
        this.showDisabledJobs = options.showDisabledJobs
      }
    })
    StorageService.getJenkinsUrls().then((result: string[]) => {
      this.jenkinsData.jenkinsUrls = result
      console.log('result', result)
      StorageService.getJobStatus(result).then((jobResult: JobRoot) => {
        console.log('jobResult', jobResult)
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
    // 通过序列化的方式实现对象深拷贝
    const status = JSON.parse(JSON.stringify(this.jenkinsData.jobStatus))
    this.data = {}
    Object.keys(status).forEach((v1) => {
      this.data[v1] = status[v1]
      if (status[v1].jobs === undefined || status[v1].jobs === null) {
        return
      }
      Object.keys(status[v1].jobs).forEach((v2) => {
        if (this.filteringResult !== this.strings.noFilterValue && status[v1].jobs[v2].color !== this.filteringResult) {
          delete this.data[v1].jobs[v2]
        }
      })
    })
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
        this.btnAddDisabled = true
      })
    } else {
      this.inputUrlValue = ''
      this.btnAddDisabled = true
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

<style lang="scss" scoped>
.card {
  .card-title {
    font-size: 18px;
    font-weight: 500;
    color: #333;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .card-title-url {
    font-size: 14px;
    text-decoration: none;
  }

  .monitor-table-job-name {
    text-decoration-line: none;
  }

  .monitor-table-result-chip {
    .monitor-table-result-chip-text {
      width: 46px;
      text-align: center;
      justify-content: center;
    }
  }
}
</style>
