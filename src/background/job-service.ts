import type { Alarms } from 'webextension-polyfill'
import { Tools } from '~/libs/tools'
import type { StorageChangeWrapper } from '~/libs/storage'
import { StorageService } from '~/libs/storage'
import type { JobRoot, JobSet, JobStatus } from '~/models/job'
import type { NotificationShowing, Options } from '~/models/option'
import type { JenkinsJob } from '~/models/jenkins/job'
import type { JenkinsView } from '~/models/jenkins/view'

export class JobService {
  private static instance?: JobService
  private showNotificationOption?: NotificationShowing
  // 失败Job数量
  private failureJobCount = 0
  // 不稳定Job数量
  private unstableJobCount = 0
  // 成功Job数量
  private successJobCount = 0
  // 是否Jenkins URL无法访问
  private errorOnFetch = false
  // 是否正在查询Job状态数据
  private querying = false

  // 通知ID和URL的对照
  private static notificationUrlMap = new Map<string, string>()
  // alarm name
  private static readonly ALARM_NAME = 'job-service-alarm'
  // 请求 /api/json 使用的 tree 参数
  private static readonly TREE_PARAMS = '*,lastCompletedBuild[number,result,timestamp,url],lastBuild[number,result,timestamp,url,actions[*,parameters[*]]],jobs[name,displayName,url,color,lastCompletedBuild[number,result,timestamp,url],lastBuild[number,result,timestamp,url,actions[*,parameters[*]]]]'

  private static getInstance() {
    if (!JobService.instance) {
      JobService.instance = new JobService()
    }
    return JobService.instance
  }

  static launch() {
    JobService.getInstance().start()
  }

  private start() {
    // console.log('--this', this)
    // 添加 storage change 监听
    StorageService.addStorageListener(this.storageChange)
    // 点击通知
    browser.notifications.onClicked.addListener((notificationId) => {
      // 打开构建页面
      if (JobService.notificationUrlMap.has(notificationId)) {
        browser.tabs.create({ url: JobService.notificationUrlMap.get(notificationId) }).then((tab) => {
          console.log('open tab', tab)
        }).catch((err) => {
          console.error('open tab error', err)
        })
      }
    })
    // 监听 Alarm
    if (!browser.alarms.onAlarm.hasListener(this.onAlarm)) {
      browser.alarms.onAlarm.addListener(this.onAlarm)
    }

    StorageService.getOptions().then((options: Options) => {
      this.showNotificationOption = options.showNotificationOption
      this.refreshJobStatus(options.refreshTime)
    })
  }

  private async refreshJobStatus(refreshTime: string) {
    console.log('refreshJobStatus::refresh time', refreshTime)
    try {
      const alarm = await browser.alarms.get(JobService.ALARM_NAME)
      if (!alarm) {
        console.log('job-service::create alarm.')
        this.createAlarm(refreshTime)
      } else {
        const isEqual = Tools.isAlarmEqual(alarm, {
          name: JobService.ALARM_NAME,
          periodInMinutes: this.getPeriodInMinutes(refreshTime),
        } as Alarms.Alarm)
        if (!isEqual) {
          console.log('job-service::clear alarm.')
          try {
            await browser.alarms.clear(JobService.ALARM_NAME)
            this.createAlarm(refreshTime)
          } catch (e) {
            console.error(`clear alarm ${JobService.ALARM_NAME} error:`, e)
          }
        } else {
          // 已有 alarm，不需要重复创建
          // no op
        }
      }
    } catch (e) {
      console.error(`get alarm ${JobService.ALARM_NAME} error:`, e)
      this.createAlarm(refreshTime)
    }
  }

  private getPeriodInMinutes(refreshTime: string) {
    // Chrome extension 性能限制，periodInMinutes 不能小于 0.5
    // Chrome 120：从 Chrome 120 开始，最小闹钟间隔时间已从 1 分钟缩短到 30 秒。若要让闹钟在 30 秒后触发，请设置 periodInMinutes: 0.5。
    // refer: https://developer.chrome.com/docs/extensions/reference/alarms/
    let periodInMinutes = Number(refreshTime) / 60 /* second to minute */
    // TODO 开发模式支持 < 1
    // TODO 仅测试使用
    // periodInMinutes = 0.5
    if (periodInMinutes < 1) {
      periodInMinutes = 1
    }
    return periodInMinutes
  }

  private createAlarm(refreshTime: string) {
    console.log('job-service::create alarm.')
    browser.alarms.create(JobService.ALARM_NAME, {
      periodInMinutes: this.getPeriodInMinutes(refreshTime),
    })
  }

  private onAlarm = (alarm: Alarms.Alarm) => {
    // 使用箭头函数解决 this 指向问题
    if (alarm.name === JobService.ALARM_NAME) {
      console.log('job-service::onAlarm:', alarm)
      // console.log('this', this)
      this.queryJobStatus()
    }
  }

  private storageChange = async (changes: StorageChangeWrapper) => {
    // 使用箭头函数解决 this 指向问题
    if (StorageService.keyForOptions in changes) {
      // 设置有改变
      // console.log('changes', changes)
      const oldOptions = changes[StorageService.keyForOptions].oldValue as Options
      const newOptions = changes[StorageService.keyForOptions].newValue as Options
      this.showNotificationOption = newOptions.showNotificationOption
      const newRefreshTime = newOptions.refreshTime
      // refreshTime 变更
      if (oldOptions === undefined || newRefreshTime !== oldOptions.refreshTime) {
        this.refreshJobStatus(newRefreshTime)
      }
    }
    if (StorageService.keyForJenkinsUrl in changes) {
      // Jenkins Url 改变
      // console.log('changes', changes)
      // const jenkinsUrls = changes[StorageService.keyForJenkinsUrl].newValue
      await StorageService.tidyJobStatusReferToJenkinsUrls()
      this.queryJobStatus()
    }
  }

  private createErrorJenkinsObj(url: string, errorMsg: string): JobSet {
    return {
      name: url,
      status: 'error',
      error: errorMsg,
    }
  }

  private resetBadgeJobCount() {
    this.failureJobCount = 0
    this.unstableJobCount = 0
    this.successJobCount = 0
  }

  private countBadgeJobCount(color: string) {
    if (color === 'blue') {
      this.successJobCount++
    } else if (color === 'red') {
      this.failureJobCount++
    } else if (color === 'yellow') {
      this.unstableJobCount++
    }
  }

  private async queryJobStatus() {
    if (this.querying) {
      console.log('上次的查询未结束，跳过此次查询')
      return
    }
    this.querying = true
    // 重置 成功失败计数器
    this.resetBadgeJobCount()
    this.errorOnFetch = false

    let jenkinsUrls: string[] | undefined
    try {
      jenkinsUrls = await StorageService.getJenkinsUrls()
    } catch (e) {
      console.error('queryJobStatus:getJenkinsUrls error:', e)
      this.querying = false
      return
    }

    if (jenkinsUrls.length === 0) {
      try {
        await StorageService.saveJobsStatus({})
        console.log('save empty job status ok')
        this.changeBadge()
      } catch (e) {
        console.error('queryJobStatus:saveJobsStatus error:', e)
      }
      this.querying = false
      return
    }

    const allFetchDataPromises = jenkinsUrls.map((url: string) => {
      return Tools.fetchJenkinsDataByUrl(url, 'api/json', JobService.TREE_PARAMS)
    })

    try {
      const values = await Promise.all(allFetchDataPromises)
      // console.log('queryJobStatus:values', values)
      const result = await StorageService.getJobsStatus()
      // console.log('JobService::queryJobStatus::result', result)

      for (const value of values) {
        if (value.ok) {
          const data = value.body
          const url = value.url
          // console.log('queryJobStatus::data', data, Object.getOwnPropertyNames(data).length)
          if (Object.getOwnPropertyNames(data).length === 0) {
            console.log('queryJobStatus: 获取Job状态失败，返回数据为空')
            this.errorOnFetch = true
            result[url] = this.createErrorJenkinsObj(url, 'No permissions or no data')
          } else {
            if (data.hasOwnProperty('jobs')) {
              // Jenkins or view data
              result[url] = await this.parseJenkinsOrViewData(url, data, result)
            } else {
              // Single job data
              result[url] = await this.parseSingleJobData(url, data, result)
            }
          }
        } else {
          const url = value.url
          const error = value.errMsg
          console.log('queryJobStatus: 获取Job状态失败', error)
          this.errorOnFetch = true
          result[url] = this.createErrorJenkinsObj(url, error || 'Unreachable')
        }
      }
      // 存储job状态
      try {
        await StorageService.saveJobStatusReferToJenkinsUrls(result)
        console.log('saveJobsStatus ok')
        this.changeBadge()
      } catch (e) {
        // 原则上不应该走到这里
        console.log('queryJobStatus:saveJobsStatus:e', e)
      }
    } catch (e) {
      // 原则上不应该走到这里
      console.log('getJobsStatus:e', e)
    }
    this.querying = false
  }

  private async parseJenkinsOrViewData(url: string, data: JenkinsView, oldData: JobRoot): Promise<JobSet> {
    // console.log('parseJenkinsOrViewData::oldData', oldData)
    const jobs = data.jobs
    // console.log('jobs 1', jobs);

    const jenkinsObj: JobSet = {
      name: data.displayName || data.name || 'All Jobs',
      status: 'ok',
      jobs: {},
    }

    for (const job of jobs) {
      let jobColor = job.color
      if (!jobColor) {
        // TODO 什么情况下 color 为空？
        continue
      }
      let building = false
      if (jobColor.endsWith('_anime')) {
        // 正在构建中
        building = true
        jobColor = jobColor.replace(/_anime$/, '')
      }
      this.countBadgeJobCount(jobColor)
      const buildStatus = Tools.jobStatus[jobColor]

      let oldStatus: JobStatus = {}
      if (oldData[url] && oldData[url].jobs) {
        oldStatus = oldData[url].jobs!
      }

      const lastCompletedBuildNumber = job.lastCompletedBuild?.number || 0
      const oldLastCompletedBuildNumber = oldStatus[job.url]?.lastCompletedBuildNumber || 0
      if (oldStatus[job.url] && oldLastCompletedBuildNumber > 0 && lastCompletedBuildNumber > oldLastCompletedBuildNumber) {
        // 新的一次构建
        const lastCompletedBuildResult = job.lastCompletedBuild!.result!
        const lastCompletedBuildUrl = job.lastCompletedBuild!.url
        // console.log('--01--showNotification', lastCompletedBuildUrl)
        await this.showNotification(lastCompletedBuildResult, job.displayName, lastCompletedBuildUrl)
      }

      jenkinsObj.jobs![job.url] = {
        name: job.displayName,
        color: jobColor,
        status: buildStatus,
        building,
        lastCompletedBuildNumber,
        lastBuildTimestamp: job.lastBuild?.timestamp,
        // TODO: params and badges
      }
    }
    // console.log('parseJenkinsOrViewData::jenkinsObj', jenkinsObj)
    return jenkinsObj
  }

  private async parseSingleJobData(url: string, data: JenkinsJob, oldData: JobRoot): Promise<JobSet> {
    // console.log('parseSingleJobData::oldData', oldData)
    const jenkinsObj: JobSet = {
      name: data.displayName || data.name || data.fullName,
      status: 'ok',
      jobs: {},
    }
    let jobColor = data.color
    if (!jobColor) {
      // TODO 什么情况下 color 为空？
      return jenkinsObj
    }
    let building = false
    if (jobColor.endsWith('_anime')) {
      // 正在构建中
      building = true
      jobColor = jobColor.replace(/_anime$/, '')
    }
    this.countBadgeJobCount(jobColor)
    const buildStatus = Tools.jobStatus[jobColor]

    let oldStatus: JobStatus = {}
    if (oldData[url] && oldData[url].jobs) {
      oldStatus = oldData[url].jobs!
    }
    const lastCompletedBuildNumber = data.lastCompletedBuild?.number || 0
    const oldLastCompletedBuildNumber = oldStatus[data.url]?.lastCompletedBuildNumber || 0
    if (oldStatus[data.url] && oldLastCompletedBuildNumber > 0 && lastCompletedBuildNumber > oldLastCompletedBuildNumber) {
      // 新的一次构建
      const lastCompletedBuildResult = data.lastCompletedBuild!.result!
      const lastCompletedBuildUrl = data.lastCompletedBuild!.url
      await this.showNotification(lastCompletedBuildResult, jenkinsObj.name, lastCompletedBuildUrl)
    }
    jenkinsObj.jobs![data.url] = {
      name: data.displayName,
      color: jobColor,
      status: buildStatus,
      building,
      lastCompletedBuildNumber,
      lastBuildTimestamp: data.lastBuild?.timestamp,
      // TODO: params and badges
    }
    // console.log('parseSingleJobData::jenkinsObj', jenkinsObj)
    return jenkinsObj
  }

  private changeBadge() {
    const _failureJobCount = this.failureJobCount
    const _unstableJobCount = this.unstableJobCount
    const _successJobCount = this.successJobCount

    if (this.errorOnFetch) {
      browser.action.setBadgeText({ text: 'ERR' })
      browser.action.setBadgeBackgroundColor({ color: '#df2b38' })
    } else {
      if (_failureJobCount === 0 && _unstableJobCount === 0 && _successJobCount === 0) {
        browser.action.setBadgeText({ text: '' })
      } else {
        const count = _failureJobCount || _unstableJobCount || _successJobCount || 0
        const color = _failureJobCount ? '#c9302c' : _unstableJobCount ? '#f0ad4e' : '#5cb85c'
        if (count > 9999) {
          browser.action.setBadgeText({ text: 'MUCH' })
        } else {
          browser.action.setBadgeText({ text: count.toString() })
        }
        browser.action.setBadgeBackgroundColor({ color })
      }
    }
  }

  // 显示通知
  private async showNotification(result: string, jobName: string, url: string) {
    if (!this.showNotificationOption) {
      try {
        const options = await StorageService.getOptions()
        this.showNotificationOption = options.showNotificationOption
      } catch (e) {
        // 原则上不应该走到这里
        console.error('getOptions error', e)
        this.showNotificationOption = 'all'
      }
    }

    if (this.showNotificationOption === 'all') {
      await this.show(result, jobName, url)
    } else if (this.showNotificationOption === 'unstable') {
      if (result !== 'SUCCESS') {
        await this.show(result, jobName, url)
      }
    } else if (this.showNotificationOption === 'none') {
      // 不显示通知
      // no op
    }
  }

  private async show(result: string, jobName: string, url: string) {
    let statusIcon = 'logo-gray.png'
    if (result === 'SUCCESS') {
      statusIcon = 'logo-green.png'
    } else if (result === 'FAILURE') {
      statusIcon = 'logo-red.png'
    } else if (result === 'UNSTABLE') {
      statusIcon = 'logo-yellow.png'
    }

    try {
      const notificationId = await browser.notifications.create({
        type: 'basic',
        iconUrl: `img/${statusIcon}`,
        title: `${jobName} - ${result}`,
        message: decodeURIComponent(url),
        priority: 2, // Priority ranges from -2 to 2. -2 is lowest priority. 2 is highest. Zero is default
      })
      if (notificationId) {
        JobService.notificationUrlMap.set(notificationId, url)
      }
    } catch (e) {
      console.error('show notifications error', e)
    }
  }
}
