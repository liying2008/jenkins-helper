import { Tools } from '@/libs/tools'
import { StorageChangeWrapper, StorageService } from '@/libs/storage'
import { JobRoot, JobSet, JobStatus } from '@/models/job'
import { NotificationShowing, Options } from '@/models/option'
import { Omnibox } from '@/background/omnibox'
import { JenkinsCompletedBuild, JenkinsJob } from '@/models/jenkins/job'
import { JenkinsView } from '@/models/jenkins/view'
import { Enc } from '@/models/common'

export class JobService {
  private static jenkinsUrls: string[] = [];
  private static lastInterval: number | undefined = undefined;
  private static showNotificationOption: NotificationShowing;
  // 失败Job数量
  private static failureJobCount = 0;
  // 不稳定Job数量
  private static unstableJobCount = 0;
  // 成功Job数量
  private static successJobCount = 0;
  // 是否Jenkins URL无法访问
  private static errorOnFetch = false;
  // 是否正在查询Job状态数据
  private static querying = false;

  private static status = Tools.jobStatus;
  private static labelClass = Tools.labelClass;

  // 通知ID和URL的对照
  private static notificationUrlMap: { [key: string]: string } = {};
  // 请求 /api/json 使用的 tree 参数
  private static treeParams = '*,lastCompletedBuild[number,result,timestamp,url],jobs[name,displayName,url,color,lastCompletedBuild[number,result,timestamp,url]]'

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
    JobService.status = Tools.jobStatus
    JobService.labelClass = Tools.labelClass

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
      if (notificationId in JobService.notificationUrlMap) {
        browser.tabs.create({ 'url': JobService.notificationUrlMap[notificationId] })
      }
    })
  }

  private static refreshJobStatus(refreshTime: string) {
    if (JobService.lastInterval !== undefined) {
      window.clearInterval(JobService.lastInterval)
    }
    JobService.lastInterval = window.setInterval(() => { JobService.queryJobStatus() }, Number(refreshTime) * 1000)
  }

  private static storageChange(changes: StorageChangeWrapper) {
    if (StorageService.keyForOptions in changes) {
      // 设置改变
      console.log('changes', changes)
      const oldOptions = changes[StorageService.keyForOptions].oldValue
      const newOptions = changes[StorageService.keyForOptions].newValue
      JobService.showNotificationOption = newOptions.showNotificationOption
      const newRefreshTime = newOptions.refreshTime
      // refreshTime 变更
      if (oldOptions === undefined || newRefreshTime !== oldOptions.refreshTime) {
        JobService.refreshJobStatus(newRefreshTime)
      }
      const newOmniboxJenkinsUrl = newOptions.omniboxJenkinsUrl
      // omniboxJenkinsUrl 变更
      if (oldOptions === undefined || newOmniboxJenkinsUrl !== oldOptions.omniboxJenkinsUrl) {
        Omnibox.getAllJobs()
      }
    }
    if (StorageService.keyForJenkinsUrl in changes) {
      // Jenkins Url 改变
      console.log('changes', changes)
      JobService.jenkinsUrls = changes[StorageService.keyForJenkinsUrl].newValue
      // console.log('jenkinsUrls', jenkinsUrls);
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
    if (color === 'blue') JobService.successJobCount++
    else if (color === 'red') JobService.failureJobCount++
    else if (color === 'yellow') JobService.unstableJobCount++
    else if (color === undefined) JobService.errorOnFetch = true
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
      JobService.changeBadge()
      JobService.querying = false
      return
    }

    const allFetchDataPromises: Promise<Enc>[] = []

    JobService.jenkinsUrls.forEach((url: string) => {
      allFetchDataPromises.push(Tools.fetchJenkinsDataByUrl(url, 'api/json', JobService.treeParams))
    })

    StorageService.getJobsStatus().then((result: JobRoot) => {
      // console.log('00-queryJobStatus::result', result)
      Promise.all(allFetchDataPromises).then((values: Enc[]) => {
        console.log('queryJobStatus:values', values)
        const newJobsStatus: JobRoot = {}

        values.forEach((value: Enc) => {
          if (value.ok) {
            const data = value.body
            const url = value.url
            // console.log('queryJobStatus#data', data, Object.getOwnPropertyNames(data).length)
            if (Object.getOwnPropertyNames(data).length === 0) {
              console.error('queryJobStatus: 获取Job状态失败，返回数据为空')
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
            console.error('queryJobStatus: 获取Job状态失败', error)
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
    for (let i = 0; i < jobs.length; i++) {
      jobs[i].lastBuildNumber = 0
      jobs[i].lastBuildTimestamp = 0
      jobs[i].lastBuildUrl = ''
      jobs[i].lastBuildResult = ''
      if (jobs[i].lastCompletedBuild) {
        jobs[i].lastBuildNumber = jobs[i].lastCompletedBuild!.number
        jobs[i].lastBuildTimestamp = jobs[i].lastCompletedBuild!.timestamp
        jobs[i].lastBuildUrl = jobs[i].lastCompletedBuild!.url
        jobs[i].lastBuildResult = jobs[i].lastCompletedBuild!.result
      }
    }
    const jenkinsObj: JobSet = {
      name: data.displayName || data.name || 'All Jobs',
      status: 'ok',
      jobs: {},
    }
    for (let jobIndex = 0; jobIndex < jobs.length; jobIndex++) {
      const job = jobs[jobIndex]
      let jobColor = job.color
      if (jobColor === undefined) continue
      let building = false
      if (jobColor.endsWith('_anime')) {
        // 正在构建中
        building = true
        jobColor = jobColor.replace(/_anime$/, '')
      }
      JobService.countBadgeJobCount(jobColor)
      const buildStatus = JobService.status[jobColor]

      let oldStatus: JobStatus = {}
      if (oldData[url] && oldData[url].jobs) {
        oldStatus = oldData[url].jobs!
      }
      if (oldStatus[job.url] && job.lastBuildNumber! > oldStatus[job.url].lastBuildNumber) {
        // 新的一次构建
        JobService.showNotification(job.lastBuildResult!, job.displayName, job.lastBuildUrl!)
      }

      jenkinsObj.jobs![job.url] = {
        name: job.displayName,
        color: jobColor,
        status: buildStatus,
        building: building,
        labelClass: JobService.labelClass[jobColor],
        lastBuildNumber: job.lastBuildNumber!,
        lastBuildTimestamp: job.lastBuildTimestamp!,
      }
    } // end for
    // console.log(jenkinsObj)
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
    let building = false
    if (jobColor.endsWith('_anime')) {
      // 正在构建中
      building = true
      jobColor = jobColor.replace(/_anime$/, '')
    }
    JobService.countBadgeJobCount(jobColor)
    const buildStatus = JobService.status[jobColor]
    const lastBuild = data.lastCompletedBuild || JenkinsCompletedBuild.empty()
    const lastBuildNumber = lastBuild.number
    const lastBuildTimestamp = lastBuild.timestamp
    const lastBuildUrl = lastBuild.url
    const lastBuildResult = lastBuild.result

    let oldStatus: JobStatus = {}
    if (oldData[url] && oldData[url].jobs) {
      oldStatus = oldData[url].jobs!
    }
    if (oldStatus[data.url] && lastBuildNumber > oldStatus[data.url].lastBuildNumber) {
      // 新的一次构建
      JobService.showNotification(lastBuildResult, jenkinsObj.name, lastBuildUrl)
    }
    jenkinsObj.jobs![data.url] = {
      name: data.displayName,
      color: jobColor,
      status: buildStatus,
      building: building,
      labelClass: JobService.labelClass[jobColor],
      lastBuildNumber: lastBuildNumber,
      lastBuildTimestamp: lastBuildTimestamp,
    }
    // console.log(jenkinsObj);
    return jenkinsObj
  }

  private static changeBadge() {
    const _failureJobCount = JobService.failureJobCount
    const _unstableJobCount = JobService.unstableJobCount
    const _successJobCount = JobService.successJobCount

    if (JobService.errorOnFetch) {
      browser.browserAction.setBadgeText({ text: 'ERR' })
      browser.browserAction.setBadgeBackgroundColor({ color: '#df2b38' })
    } else {
      if (_failureJobCount === 0 && _unstableJobCount === 0 && _successJobCount === 0) {
        browser.browserAction.setBadgeText({ text: '' })
      } else {
        const count = _failureJobCount || _unstableJobCount || _successJobCount || 0
        const color = _failureJobCount ? '#c9302c' : _unstableJobCount ? '#f0ad4e' : '#5cb85c'
        if (count > 9999) {
          browser.browserAction.setBadgeText({ text: 'MUCH' })
        } else {
          browser.browserAction.setBadgeText({ text: count.toString() })
        }
        browser.browserAction.setBadgeBackgroundColor({ color: color })
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
    let statusIcon = 'gray'
    if (result === 'SUCCESS') statusIcon = 'green'
    else if (result === 'FAILURE') statusIcon = 'red'
    else if (result === 'UNSTABLE') statusIcon = 'yellow'

    browser.notifications.create({
      type: 'basic',
      iconUrl: 'img/logo-' + statusIcon + '.svg',
      title: 'Build ' + result + ' ! - ' + jobName,
      message: decodeURIComponent(url),
      priority: 0, // Priority ranges from -2 to 2. -2 is lowest priority. 2 is highest. Zero is default
    }).then((notificationId) => {
      if (notificationId) {
        JobService.notificationUrlMap[notificationId] = url
      }
    })
  }

}
