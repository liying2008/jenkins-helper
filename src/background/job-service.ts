import type { Alarms } from 'webextension-polyfill'
import { Tools } from '~/libs/tools'
import type { StorageChangeWrapper } from '~/libs/storage'
import { StorageService } from '~/libs/storage'
import type { JobRoot, JobSet, JobStatus } from '~/models/job'
import type { NotificationShowing, Options } from '~/models/option'
import type { JenkinsJob } from '~/models/jenkins/job'
import type { JenkinsView } from '~/models/jenkins/view'
import type { Enc } from '~/models/common'

export class JobService {
  private static jenkinsUrls: string[] = []
  private static showNotificationOption: NotificationShowing
  // 失败Job数量
  private static failureJobCount = 0
  // 不稳定Job数量
  private static unstableJobCount = 0
  // 成功Job数量
  private static successJobCount = 0
  // 是否Jenkins URL无法访问
  private static errorOnFetch = false
  // 是否正在查询Job状态数据
  private static querying = false

  // 通知ID和URL的对照
  private static notificationUrlMap = new Map<string, string>()
  // alarm name
  private static readonly ALARM_NAME = 'job-service-alarm'
  // 请求 /api/json 使用的 tree 参数
  private static readonly TREE_PARAMS = '*,lastCompletedBuild[number,result,timestamp,url],lastBuild[number,result,timestamp,url,actions[*,parameters[*]]],jobs[name,displayName,url,color,lastCompletedBuild[number,result,timestamp,url],lastBuild[number,result,timestamp,url,actions[*,parameters[*]]]]'

  private static getErrorJenkinsObj(url: string, errorMsg: string): JobSet {
    const jenkinsObj: JobSet = {
      name: url,
      status: 'error',
      error: errorMsg,
    }
    // console.log(jenkinsObj)
    return jenkinsObj
  }

  static start() {
    // 添加 storage change 监听
    StorageService.addStorageListener(JobService.storageChange)
    StorageService.getJenkinsUrls().then((result: string[]) => {
      JobService.jenkinsUrls = result
      StorageService.getOptions().then((options: Options) => {
        JobService.showNotificationOption = options.showNotificationOption
        JobService.refreshJobStatus(options.refreshTime)
        // TODO 仅测试使用
        // JobService.refreshJobStatus(5)
      })
    })
    // 点击通知
    browser.notifications.onClicked.addListener((notificationId) => {
      // 打开构建页面
      if (JobService.notificationUrlMap.has(notificationId)) {
        browser.tabs.create({ url: JobService.notificationUrlMap.get(notificationId) })
      }
    })
    // 监听 Alarm
    if (browser.alarms.onAlarm.hasListener(JobService.onAlarm)) {
      browser.alarms.onAlarm.removeListener(JobService.onAlarm)
    }
    browser.alarms.onAlarm.addListener(JobService.onAlarm)
  }

  private static refreshJobStatus(refreshTime: string) {
    browser.alarms.clear(JobService.ALARM_NAME).then(() => {
      console.log('create alarm.')
      // chrome extension 性能限制，periodInMinutes 不能小于 1
      // refer: https://developer.chrome.com/docs/extensions/reference/alarms/
      let periodInMinutes = Number(refreshTime) / 60 /* second to minute */
      // TODO 开发模式支持 < 1
      if (periodInMinutes < 1) {
        periodInMinutes = 1
      }
      browser.alarms.create(JobService.ALARM_NAME, {
        when: Date.now() + 100,
        periodInMinutes,
      })
    }).catch((e) => {
      console.error(`clear alarm ${JobService.ALARM_NAME} error:`, e)
    })
  }

  private static onAlarm(alarm: Alarms.Alarm) {
    // console.log('on alarm:', alarm)
    if (alarm.name === JobService.ALARM_NAME) {
      JobService.queryJobStatus()
    }
  }

  private static storageChange(changes: StorageChangeWrapper) {
    if (StorageService.keyForOptions in changes) {
      // 设置有改变
      // console.log('changes', changes)
      const oldOptions = changes[StorageService.keyForOptions].oldValue as Options
      const newOptions = changes[StorageService.keyForOptions].newValue as Options
      JobService.showNotificationOption = newOptions.showNotificationOption
      const newRefreshTime = newOptions.refreshTime
      // refreshTime 变更
      if (oldOptions === undefined || newRefreshTime !== oldOptions.refreshTime) {
        JobService.refreshJobStatus(newRefreshTime)
      }
    }
    if (StorageService.keyForJenkinsUrl in changes) {
      // Jenkins Url 改变
      // console.log('changes', changes)
      JobService.jenkinsUrls = changes[StorageService.keyForJenkinsUrl].newValue
      // console.log('JobService.jenkinsUrls', JobService.jenkinsUrls)
      JobService.queryJobStatus()
    }
  }

  private static resetBadgeJobCount() {
    JobService.failureJobCount = 0
    JobService.unstableJobCount = 0
    JobService.successJobCount = 0
    JobService.errorOnFetch = false
  }

  private static countBadgeJobCount(color?: string) {
    if (color === 'blue') {
      JobService.successJobCount++
    } else if (color === 'red') {
      JobService.failureJobCount++
    } else if (color === 'yellow') {
      JobService.unstableJobCount++
    } else if (color === undefined) {
      JobService.errorOnFetch = true
    }
  }

  static queryJobStatus() {
    console.log('jenkinsUrls', JobService.jenkinsUrls)
    if (JobService.querying) {
      console.log('上次的查询未结束，跳过此次查询')
      return
    }
    JobService.querying = true
    // 重置 成功失败计数器
    JobService.resetBadgeJobCount()

    if (JobService.jenkinsUrls.length === 0) {
      // 存储job状态
      StorageService.saveJobsStatus({}).then(() => {
        console.log('saveJobsStatus ok')
        JobService.changeBadge()
        JobService.querying = false
      }).catch((e: Error) => {
        // 原则上不应该走到这里
        console.log('queryJobStatus:saveJobsStatus:e', e)
        JobService.querying = false
      })
      return
    }

    const allFetchDataPromises: Promise<Enc>[] = []

    JobService.jenkinsUrls.forEach((url: string) => {
      allFetchDataPromises.push(Tools.fetchJenkinsDataByUrl(url, 'api/json', JobService.TREE_PARAMS))
    })

    StorageService.getJobsStatus().then((result: JobRoot) => {
      // console.log('JobService::queryJobStatus::result', result)
      Promise.all(allFetchDataPromises).then((values: Enc[]) => {
        // console.log('queryJobStatus:values', values)
        const newJobsStatus: JobRoot = {}

        values.forEach((value: Enc) => {
          if (value.ok) {
            const data = value.body
            const url = value.url
            // console.log('queryJobStatus#data', data, Object.getOwnPropertyNames(data).length)
            if (Object.getOwnPropertyNames(data).length === 0) {
              console.log('queryJobStatus: 获取Job状态失败，返回数据为空')
              const jenkinsObj = JobService.getErrorJenkinsObj(url, 'No permissions or no data')
              JobService.countBadgeJobCount()
              newJobsStatus[url] = jenkinsObj
            } else {
              if (data.hasOwnProperty('jobs')) {
                // Jenkins or view data
                const jenkinsObj = JobService.parseJenkinsOrViewData(url, data, result)
                newJobsStatus[url] = jenkinsObj
              } else {
                // Single job data
                const jenkinsObj = JobService.parseSingleJobData(url, data, result)
                newJobsStatus[url] = jenkinsObj
              }
            }
          } else {
            const url = value.url
            const error = value.errMsg
            console.log('queryJobStatus: 获取Job状态失败', error)
            const jenkinsObj = JobService.getErrorJenkinsObj(url, error || 'Unreachable')
            JobService.countBadgeJobCount()
            newJobsStatus[url] = jenkinsObj
          }
        })
        // 存储job状态
        StorageService.saveJobsStatus(newJobsStatus).then(() => {
          console.log('saveJobsStatus ok')
          JobService.changeBadge()
          JobService.querying = false
        }).catch((e: Error) => {
          // 原则上不应该走到这里
          console.log('queryJobStatus:saveJobsStatus:e', e)
          JobService.querying = false
        })
      }).catch((e: Error) => {
        // 原则上不应该走到这里
        console.log('queryJobStatus:e', e)
        JobService.querying = false
      })
    })
  }

  private static parseJenkinsOrViewData(url: string, data: JenkinsView, oldData: JobRoot): JobSet {
    // console.log('parseJenkinsOrViewData::oldData', oldData)
    const jobs = data.jobs
    // console.log('jobs 1', jobs);

    const jenkinsObj: JobSet = {
      name: data.displayName || data.name || 'All Jobs',
      status: 'ok',
      jobs: {},
    }

    jobs.forEach((job) => {
      let jobColor = job.color
      if (!jobColor) {
        return
      }
      let building = false
      if (jobColor.endsWith('_anime')) {
        // 正在构建中
        building = true
        jobColor = jobColor.replace(/_anime$/, '')
      }
      JobService.countBadgeJobCount(jobColor)
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
        JobService.showNotification(lastCompletedBuildResult, job.displayName, lastCompletedBuildUrl)
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
    })
    // console.log('parseJenkinsOrViewData::jenkinsObj', jenkinsObj)
    return jenkinsObj
  }

  private static parseSingleJobData(url: string, data: JenkinsJob, oldData: JobRoot): JobSet {
    // console.log('parseSingleJobData::oldData', oldData)
    const jenkinsObj: JobSet = {
      name: data.displayName || data.name || data.fullName,
      status: 'ok',
      jobs: {},
    }
    let jobColor = data.color
    if (!jobColor) {
      return jenkinsObj
    }
    let building = false
    if (jobColor.endsWith('_anime')) {
      // 正在构建中
      building = true
      jobColor = jobColor.replace(/_anime$/, '')
    }
    JobService.countBadgeJobCount(jobColor)
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
      JobService.showNotification(lastCompletedBuildResult, jenkinsObj.name, lastCompletedBuildUrl)
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

  private static changeBadge() {
    const _failureJobCount = JobService.failureJobCount
    const _unstableJobCount = JobService.unstableJobCount
    const _successJobCount = JobService.successJobCount

    if (JobService.errorOnFetch) {
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
  private static showNotification(result: string, jobName: string, url: string) {
    if (JobService.showNotificationOption === 'all') {
      JobService.show(result, jobName, url)
    } else if (JobService.showNotificationOption === 'unstable') {
      if (result !== 'SUCCESS') {
        JobService.show(result, jobName, url)
      }
    } else if (JobService.showNotificationOption === 'none') {
      // 不显示通知
      // no op
    }
  }

  private static show(result: string, jobName: string, url: string) {
    let statusIcon = 'logo-gray.png'
    if (result === 'SUCCESS') {
      statusIcon = 'logo-green.png'
    } else if (result === 'FAILURE') {
      statusIcon = 'logo-red.png'
    } else if (result === 'UNSTABLE') {
      statusIcon = 'logo-yellow.png'
    }

    // const statusIconUrl = browser.runtime.getURL(`img/${statusIcon}`)
    // console.log('statusIconUrl', statusIconUrl)

    browser.notifications.create({
      type: 'basic',
      iconUrl: `img/${statusIcon}`,
      title: `${jobName} - ${result}`,
      message: decodeURIComponent(url),
      priority: 0, // Priority ranges from -2 to 2. -2 is lowest priority. 2 is highest. Zero is default
    }).then((notificationId) => {
      if (notificationId) {
        JobService.notificationUrlMap.set(notificationId, url)
      }
    })
  }
}
