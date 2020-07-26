<template>
  <div>
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
          :items="desserts"
          :search="search"
        ></v-data-table>
      </v-card>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Watch } from 'vue-property-decorator'
import { StorageService } from '@/libs/storage.ts'
import { Tools } from '@/libs/tools.ts'

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
  jenkinsData: { jenkinsUrls: string[]; jobStatus: any } = {
    jenkinsUrls: [],
    jobStatus: {}
  }
  data = {}
  filteringResult = ''
  filteringResults = []

  search = ''
  headers = [
    {
      text: 'Dessert (100g serving)',
      align: 'start',
      sortable: false,
      value: 'name',
    },
    { text: 'Calories', value: 'calories' },
    { text: 'Fat (g)', value: 'fat' },
    { text: 'Carbs (g)', value: 'carbs' },
    { text: 'Protein (g)', value: 'protein' },
    { text: 'Iron (%)', value: 'iron' },
  ]
  desserts = [
    {
      name: 'Frozen Yogurt',
      calories: 159,
      fat: 6.0,
      carbs: 24,
      protein: 4.0,
      iron: '1%',
    },
    {
      name: 'Ice cream sandwich',
      calories: 237,
      fat: 9.0,
      carbs: 37,
      protein: 4.3,
      iron: '1%',
    },
    {
      name: 'Eclair',
      calories: 262,
      fat: 16.0,
      carbs: 23,
      protein: 6.0,
      iron: '7%',
    },
    {
      name: 'Cupcake',
      calories: 305,
      fat: 3.7,
      carbs: 67,
      protein: 4.3,
      iron: '8%',
    },
    {
      name: 'Gingerbread',
      calories: 356,
      fat: 16.0,
      carbs: 49,
      protein: 3.9,
      iron: '16%',
    },
    {
      name: 'Jelly bean',
      calories: 375,
      fat: 0.0,
      carbs: 94,
      protein: 0.0,
      iron: '0%',
    },
    {
      name: 'Lollipop',
      calories: 392,
      fat: 0.2,
      carbs: 98,
      protein: 0,
      iron: '2%',
    },
    {
      name: 'Honeycomb',
      calories: 408,
      fat: 3.2,
      carbs: 87,
      protein: 6.5,
      iron: '45%',
    },
    {
      name: 'Donut',
      calories: 452,
      fat: 25.0,
      carbs: 51,
      protein: 4.9,
      iron: '22%',
    },
    {
      name: 'KitKat',
      calories: 518,
      fat: 26.0,
      carbs: 65,
      protein: 7,
      iron: '6%',
    },
  ]

  @Watch('showDisabledJobs')
  showDisabledJobsChanged(newVal: boolean) {
    StorageService.getOptions(function (options: any) {
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

  /**
   * 初始化页面
   */
  initPage() {
    const _self: any = this
    // 默认不过滤
    _self.filteringResult = _self.strings.noFilterValue
    _self.filteringResults.push({
      value: _self.strings.noFilterValue,
      text: _self.strings.noFilterValue
    })
    Object.keys(Tools.jobStatus).forEach(function (value) {
      _self.filteringResults.push({
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
    const _self: any = this
    StorageService.getOptions(function (options: any) {
      if (options.showDisabledJobs === undefined) {
        _self.showDisabledJobs = true
      } else {
        _self.showDisabledJobs = options.showDisabledJobs
      }
    })
    StorageService.getJenkinsUrls(function (result: any) {
      _self.jenkinsData.jenkinsUrls = result
      console.log('result', result)
      StorageService.getJobStatus(result, function (jobResult: any) {
        console.log('jobResult', jobResult)
        _self.jenkinsData.jobStatus = jobResult
        // 过滤数据
        _self.filterData()
      })
    })
  }

  /**
   * 过滤数据
   */
  filterData() {
    const _self: any = this
    // 通过序列化的方式实现对象深拷贝
    const status = JSON.parse(JSON.stringify(this.jenkinsData.jobStatus))
    _self.data = {}
    Object.keys(status).forEach(function (v1) {
      _self.data[v1] = status[v1]
      if (status[v1].jobs === undefined || status[v1].jobs === null) {
        return
      }
      Object.keys(status[v1].jobs).forEach(function (v2) {
        if (_self.filteringResult !== _self.strings.noFilterValue && status[v1].jobs[v2].color !== _self.filteringResult) {
          delete _self.data[v1].jobs[v2]
        }
      })
    })
  }

  /**
   * 添加新 Jenkins URL
   */
  addJenkinsUrl() {
    const _self: any = this
    let url = this.inputUrlValue
    url = url.charAt(url.length - 1) === '/' ? url : url + '/'
    if (this.jenkinsData.jenkinsUrls.indexOf(url) === -1) {
      const newUrls = this.jenkinsData.jenkinsUrls.concat(url)
      console.log('newUrls', newUrls)
      StorageService.saveJenkinsUrls(newUrls, function () {
        _self.jenkinsData.jenkinsUrls = newUrls
        _self.inputUrlValue = ''
        _self.btnAddDisabled = true
      })
    } else {
      _self.inputUrlValue = ''
      _self.btnAddDisabled = true
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
    const _self: any = this
    StorageService.removeJenkinsUrls(jenkinsUrl, function () {
      _self.getAllJobStatus()
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
    }).then(function (window) {
      console.log('window', window)
    })
  }
}

</script>
