<template>
  <div id="params-wrapper">
    <v-card
      v-show="status === 2"
      id="info-block"
      class="mx-auto my-3"
    >
      <v-card-text>
        <!--Display name & 构建状态-->
        <v-row align="center">
          <v-col
            cols="6"
            class="info-col"
          >
            <v-icon
              small
              title="Full DisplayName"
            >
              mdi-tag
            </v-icon>
            <a
              :href="url"
              target="_blank"
              style="margin-left: 8px"
            >{{ fullDisplayName }}</a>
          </v-col>
          <v-col
            cols="6"
            class="info-col"
          >
            {{ strings.buildStatus_ }}
            <!--构建中-->
            <v-chip
              v-if="building"
              small
              text-color="white"
              label
              pill
              color="light-blue"
              class="dense-chip building"
            >
              <span>{{ strings.building }}</span>
            </v-chip>
            <!--构建已完成-->
            <v-chip
              v-else
              small
              text-color="white"
              label
              pill
              :color="getResultColor(result)"
              class="dense-chip"
            >
              <span>{{ result }}</span>
            </v-chip>
          </v-col>
        </v-row>
        <!--构建时间 & 执行节点-->
        <v-row align="center">
          <v-col
            cols="6"
            class="info-col"
          >
            <v-icon
              small
              title="Build Timestamp"
            >
              mdi-clock-time-three
            </v-icon>
            <span style="margin-left: 8px">{{ buildTime }}</span>
          </v-col>
          <v-col
            v-show="builtOn"
            cols="6"
            class="info-col"
          >
            {{ strings.runLabel_ }}<span ref="builtOnSpan">{{ builtOn }}</span>
            <v-btn
              icon
              color="primary"
              x-small
              class="info-icon-btn ml-2"
              title="Copy"
              @click="copyBuiltOn"
            >
              <v-icon>mdi-content-copy</v-icon>
            </v-btn>
          </v-col>
        </v-row>
        <!--Build Causes-->
        <v-row
          v-for="cause in causes"
          :key="cause.url"
          align="center"
        >
          <v-col
            cols="12"
            class="info-col"
          >
            <v-icon
              small
              title="Build Cause"
            >
              mdi-flash
            </v-icon>
            <span style="margin-left: 8px">{{ cause.shortDescription }}</span>
            <v-btn
              v-if="cause.url"
              icon
              color="primary"
              x-small
              class="info-icon-btn ml-2"
              title="Go"
              :href="cause.url"
              target="_blank"
            >
              <v-icon>mdi-arrow-right-circle</v-icon>
            </v-btn>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- 参数列表 -->
    <div
      v-show="status === 2 && parameters.length > 0"
      id="params-table"
    >
      <div>{{ strings.paramsList }}</div>
      <v-card class="my-3">
        <v-data-table
          dense
          :headers="headers"
          :items="parameters"
          :items-per-page="5"
          hide-default-footer
          disable-pagination
        >
          <template v-slot:[`item.value`]="{ item }">
            <div :class="[{'hidden-param':item.hidden}]">
              {{ item.value }}
            </div>
          </template>
        </v-data-table>
      </v-card>
    </div>

    <!--Prev/Next/Rebuild Button-->
    <v-row
      v-show="status === 2"
      no-gutters
      class="my-3"
    >
      <v-btn-toggle dense>
        <v-btn
          title="Previous Build"
          :retain-focus-on-click="false"
          @click="prevBuild"
        >
          <v-icon>mdi-chevron-left</v-icon>
        </v-btn>
        <v-btn
          title="Next Build"
          :retain-focus-on-click="false"
          @click="nextBuild"
        >
          <v-icon>mdi-chevron-right</v-icon>
        </v-btn>
      </v-btn-toggle>
      <v-spacer />
      <v-btn
        class="mx-2"
        icon
        title="Download Console Log"
        :disabled="disableDownload"
        @click="downloadConsoleLog"
      >
        <v-icon>
          mdi-cloud-download
        </v-icon>
      </v-btn>
      <v-btn
        class="mx-2"
        icon
        title="Configure"
        @click="goToConfigure"
      >
        <v-icon>
          mdi-cog
        </v-icon>
      </v-btn>
      <v-btn
        class="mx-2"
        icon
        title="Rebuild"
        @click="rebuild"
      >
        <v-icon>
          mdi-replay
        </v-icon>
      </v-btn>
    </v-row>

    <!-- No Data -->
    <div
      v-show="status === 0"
      class="text-h4 text-center pa-16"
    >
      {{ strings.noData }}
    </div>
    <!-- Fetching -->
    <div
      v-show="status === 1"
      class="text-h4 text-center pa-16"
    >
      {{ strings.fetching }}
    </div>

    <!-- snackbar -->
    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      timeout="1000"
    >
      {{ snackbar.message }}

      <template v-slot:action="{ attrs }">
        <v-btn
          text
          v-bind="attrs"
          @click="snackbar.show = false"
        >
          {{ strings.close }}
        </v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<script lang="ts">
import { Tools } from '@/libs/tools'
import { MessageColor } from '@/models/message'
import { Vue, Component, Watch } from 'vue-property-decorator'

@Component({
  name: 'Params'
})
export default class Params extends Vue {
  strings = {
    close: browser.i18n.getMessage('close'),
    buildStatus_: browser.i18n.getMessage('buildStatus_'),
    runLabel_: browser.i18n.getMessage('runLabel_'),
    copied: browser.i18n.getMessage('copied'),
    paramsList: browser.i18n.getMessage('paramsList'),
    noData: browser.i18n.getMessage('noData'),
    fetching: browser.i18n.getMessage('fetching'),
    passwordParameter: browser.i18n.getMessage('passwordParameter'),
    fileParameter: browser.i18n.getMessage('fileParameter'),
    credentialsParameter: browser.i18n.getMessage('credentialsParameter'),
    building: 'BUILDING',
  }
  headers = [
    { text: 'Name', align: 'start', value: 'name' },
    { text: 'Value', align: 'start', value: 'value' },
  ]
  snackbar = {
    show: false,
    message: '',
    color: MessageColor.Success,
  }
  // status 的状态说明：
  // 0：无数据
  // 1：正在请求数据
  // 2：请求完成（有数据）
  // -1：请求失败
  status = 0
  // 之前的状态（上一次的状态）
  preStatus = 0
  number = 0
  fullDisplayName = ''
  url = ''
  building = false
  result = ''
  buildTime = ''
  builtOn = ''
  causes: any[] = []
  parameters: any[] = []
  // 是否禁用下载按钮
  disableDownload = false

  mounted() {
    this.getParameters()
  }

  getResultColor(label: string) {
    switch (label) {
      case 'SUCCESS': return 'success'
      case 'FAILURE': return 'error'
      case 'UNSTABLE': return 'warning'
      case 'ABORTED': return 'brown'
      default: return 'blue'
    }
  }

  getParameters() {
    this.getCurrentTab((tab: any) => {
      // console.log(tab);
      const title = tab.title
      const url = tab.url
      const urlRegExp = /^https*:\/\/.+\/job\/[^/]+\/\d+/
      const urlRegExpPipeline = /^(https*:\/\/.+\/)blue\/organizations\/jenkins\/.+\/detail\/([^/]+\/\d+)\//
      const urlRegExpPipelineLog = /^(https*:\/\/.+\/)blue\/rest\/organizations\/jenkins\/pipelines\/([^/]+)\/runs\/(\d+)\//
      let m = url.match(urlRegExp)
      let buildUrl = ''
      if (m == null) {
        // 普通Jenkins URL 没有匹配到
        m = url.match(urlRegExpPipeline)
        if (m == null) {
          // Jenkins Pipeline URL 没有匹配到
          m = url.match(urlRegExpPipelineLog)
          if (m == null) {
            // Jenkins Pipeline Log URL 没有匹配到
            return
          } else {
            buildUrl = m[1] + 'job/' + m[2] + '/' + m[3]
          }
        } else {
          buildUrl = m[1] + 'job/' + m[2]
        }
      } else {
        buildUrl = m[0]
      }
      console.log('buildUrl', buildUrl)
      this.getParametersByUrl(buildUrl)
    })
  }

  getParametersByUrl(url: string) {
    this.status = 1
    const jsonUrl = url + '/api/json'
    // console.log("jsonUrl", jsonUrl);
    Tools.getFetchOption(jsonUrl).then((header: any) => {
      fetch(jsonUrl, header).then((res) => {
        if (res.ok) {
          return res.json()
        } else {
          return Promise.reject(res)
        }
      }).then((data) => {
        this.status = 2
        this.preStatus = 2
        this.number = data.number
        this.fullDisplayName = data.fullDisplayName
        this.url = data.url
        this.building = data.building
        this.result = data.result
        this.buildTime = new Date(data.timestamp).toLocaleString()
        this.builtOn = data.builtOn
        this.causes = []
        this.parameters = []
        const actions = data.actions
        for (let i = 0; i < actions.length; i++) {
          if (actions[i].hasOwnProperty('parameters')) {
            const parameters = actions[i].parameters
            for (let pIndex = 0; pIndex < parameters.length; pIndex++) {
              const _class = parameters[pIndex]._class
              const param = {
                hidden: false,
                name: parameters[pIndex].name,
                value: parameters[pIndex].value,
              }
              // 额外处理几个特殊类型的参数
              if (_class === 'hudson.model.PasswordParameterValue' && param.value === undefined) {
                // 密码参数
                param.hidden = true
                param.value = '<' + this.strings.passwordParameter + '>'
              } else if (_class === 'com.cloudbees.plugins.credentials.CredentialsParameterValue' && param.value === undefined) {
                // 凭据参数
                param.hidden = true
                param.value = '<' + this.strings.credentialsParameter + '>'
              } else if (_class === 'hudson.model.FileParameterValue' && param.value === undefined) {
                // 文件参数
                param.hidden = true
                param.value = '<' + this.strings.fileParameter + '>'
              } else if (_class === 'hudson.model.RunParameterValue') {
                // 运行时参数
                param.value = parameters[pIndex].jobName + ' #' + parameters[pIndex].number
              }
              this.parameters.push(param)
            }
          } else if (actions[i].hasOwnProperty('causes')) {
            const causes = actions[i].causes
            for (let cIndex = 0; cIndex < causes.length; cIndex++) {
              const shortDescription = causes[cIndex].shortDescription
              let upstreamUrl = ''
              if (causes[cIndex].upstreamUrl && causes[cIndex].upstreamBuild) {
                const rootUrl = this.getJenkinsRootUrl(data.url, data.fullDisplayName)
                if (rootUrl) {
                  upstreamUrl = rootUrl + '/' + causes[cIndex].upstreamUrl + causes[cIndex].upstreamBuild + '/'
                }
              }
              this.causes.push({
                shortDescription: shortDescription,
                url: upstreamUrl
              })
            }
          }
        }
      }).catch((e) => {
        console.error('获取参数失败', e)
        this.status = this.preStatus
        alert(this.strings.noData)
      })
    })
  }

  getCurrentTab(callback: any) {
    browser.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
      if (callback) callback(tabs.length ? tabs[0] : null)
    })
  }

  // 复制运行节点
  copyBuiltOn() {
    const text = (this.$refs.builtOnSpan as any).innerText
    const tempInput = document.createElement('input')
    tempInput.value = text
    document.body.appendChild(tempInput)
    tempInput.select() // 选择对象
    document.execCommand('Copy') // 执行浏览器复制命令
    tempInput.style.display = 'none'
    this.snackbar = {
      show: true,
      message: this.strings.copied,
      color: MessageColor.Success,
    }
  }

  // 下载日志
  downloadConsoleLog() {
    this.disableDownload = true
    browser.downloads.download({
      url: this.url + 'logText/progressiveText?start=0',
      filename: this.fullDisplayName + ' Console Log.log',
      saveAs: true
    }).then((downloadId) => {
      this.disableDownload = false
      console.log('downloadId', downloadId)
    })
  }

  // 去“配置”页
  goToConfigure() {
    const url = this.url.substring(0, this.url.length - 1)
    const configureUrl = url.substring(0, url.lastIndexOf('/')) + '/configure'
    browser.tabs.create({ 'url': configureUrl })
  }

  rebuild() {
    browser.tabs.create({ 'url': this.url + 'rebuild' })
  }

  // 显示前一次构建信息
  prevBuild() {
    // url: http://127.0.0.1:8080/jenkins/job/Test1/21/
    let url = this.url.substring(0, this.url.length - 1)
    url = url.substring(0, url.lastIndexOf('/'))
    if (this.number > 1) {
      url = url + '/' + (this.number - 1)
      this.getParametersByUrl(url)
    } else {
      alert(browser.i18n.getMessage('noPrevBuild'))
    }
  }

  // 显示后一次构建信息
  nextBuild() {
    let url = this.url.substring(0, this.url.length - 1)
    url = url.substring(0, url.lastIndexOf('/'))
    url = url + '/' + (this.number + 1)
    this.getParametersByUrl(url)
  }

  getJenkinsRootUrl(url: string, fullDisplayName: string) {
    if (url[url.length - 1] === '/') {
      url = url.substring(0, url.length - 1)
    }
    fullDisplayName = encodeURIComponent(fullDisplayName)
    // %20%C2%BB%20: »
    // %20%23: #
    let path = fullDisplayName.replace('%20%C2%BB%20', '/job/').replace('%20%23', '/')
    path = '/job/' + path
    const index = url.lastIndexOf(path)
    if (index > 0) {
      const rootUrl = url.substring(0, index)
      console.log('rootUrl', rootUrl)
      return rootUrl
    } else {
      console.log('error: url:', url, 'fullDisplayName', fullDisplayName, 'path:', path)
      return ''
    }
  }

}
</script>

<style lang="scss">
#params-wrapper {
  .v-btn:not(.v-btn--text):not(.v-btn--outlined).v-btn--active:before {
    opacity: 0;
  }

  #info-block {
    .info-col {
      padding: 6px 12px;
      line-height: 1rem;
      color: #333333;

      .dense-chip {
        height: inherit;
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

      .info-icon-btn {
        align-items: baseline;
      }
    }
  }
  #params-table {
    .hidden-param {
      font-size: 0.8em;
      color: #8c8c8c;
      font-style: italic;
    }
  }
}
</style>
