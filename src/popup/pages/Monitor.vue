<template>
  <div>
    <!-- 添加URL的表单 -->
    <v-form>
      <v-row>
        <v-col cols="12">
          <v-text-field
            v-model="inputUrlValue"
            append-outer-icon="mdi-plus"
            prepend-icon="mdi-link-variant"
            :label="strings.inputUrlPlaceholder"
            type="text"
            @click:append-outer="addJenkinsUrl"
          ></v-text-field>
        </v-col>
      </v-row>
    </v-form>

    <div>
      <v-card
        v-for="(jenkins, jenkinsUrl, index) in data"
        :key="index"
      >
        <v-card-title>
          <img
            class="img-rounded avatar"
            alt="Jenkins"
            src="img/icon48.png"
          >
          <div>
            <h4>
              <span :title="jenkins.name">{{ jenkins.name }}</span>
              <br>
              <a
                class="small"
                target="_blank"
                :href="jenkinsUrl"
              >
                <span
                  class="no-wrap"
                  :title="decodeURIComponent(jenkinsUrl)"
                >{{ decodeURIComponent(jenkinsUrl) }}</span>
              </a>
            </h4>
          </div>
        </v-card-title>
        <v-data-table
          :headers="headers"
          :items="toArray(jenkins.jobs)"
          :search="search"
        >
          <template
            v-if="true"
            v-slot:body="{ items }"
          >
            <tbody>
              <tr
                v-for="item in items"
                :key="item.name"
              >
                <td>{{ item.name }}</td>
                <td v-html="getStyledTime(item.lastBuildTimestamp)"></td>
                <td>{{ item.status }}</td>
              </tr>
            </tbody>
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
    { text: 'Job Name', align: 'start' },
    { text: 'Last Build Time' },
    { text: 'Result' },
  ]

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

  toArray(jobStatus: JobStatus|undefined) {
    const jobArray: DisplayedJobDetail[] = []
    console.log('jobStatus type', typeof jobStatus)
    if (jobStatus === undefined) {
      return jobArray
    }
    for (const jobUrl of Object.keys(jobStatus)) {
      if (jobStatus.hasOwnProperty(jobUrl)) {
        const jobDetail = jobStatus[jobUrl]
        jobArray.push({
          jobUrl,
          ...jobDetail
        })
      }
    }
    return jobArray
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

  // /**
  //  * 验证表单
  //  */
  // validateForm() {
  //   const isFormInvalid = !this.$refs.formUrl.checkValidity();
  //   const isUrlInvalid = !this.$refs.inputUrl.validity.typeMismatch;
  //
  //   this.btnAddDisabled = isFormInvalid || this.inputUrlValue === '';
  //
  //   this.$refs.formUrl.classList.toggle('has-error', isFormInvalid && this.inputUrlValue);
  //   this.$refs.msgError.classList.toggle('hidden', isUrlInvalid);
  //   this.$refs.msgError.innerText = this.$refs.inputUrl.validationMessage;
  // }

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
