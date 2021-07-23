/*
 * storage apis
 * https://developer.chrome.com/apps/storage#property-local
 */
import { JobRoot, JobSet } from '@/models/job'
import { JenkinsUrlRoot } from '@/models/jenkins-url'
import { Nodes } from '@/models/node'
import { defaultOptionsValue, Options } from '@/models/option'

export interface StorageChangeWrapper<T = any> {
  [key: string]: StorageChange<T>
}

export interface StorageChange<T> {
  oldValue?: T
  newValue?: T
}

export class StorageService {
  static readonly keyForJenkinsUrl = 'jenkins-url'
  static readonly keyForJenkinsJobData = 'jenkins-job-data'
  static readonly keyForOptions = 'options'
  static readonly keyForNodes = 'nodes'

  static async addJenkinsUrl(jenkinsUrl: string) {
    const result = await StorageService.getJenkinsUrls()
    result.push(jenkinsUrl)
    return StorageService.saveJenkinsUrls(result)
  }

  static async saveJenkinsUrls(jenkinsUrls: string[]) {
    const jenkinsUrlRoot: JenkinsUrlRoot = { 'jenkins-url': JSON.parse(JSON.stringify(jenkinsUrls)) }
    return browser.storage.local.set(jenkinsUrlRoot)
  }

  static async getJenkinsUrls() {
    const result = await browser.storage.local.get(StorageService.keyForJenkinsUrl)
    return result[StorageService.keyForJenkinsUrl] as string[] || []
  }

  // 删除一个Jenkins Url
  static async removeJenkinsUrl(jenkinsUrl: string) {
    const result = await StorageService.getJenkinsUrls()
    const index = result.indexOf(jenkinsUrl)
    if (index > -1) {
      result.splice(index, 1)
      await StorageService.saveJenkinsUrls(result)
    }
  }

  static async saveJobsStatus(data: JobRoot) {
    const finalData = { 'jenkins-job-data': data }
    return browser.storage.local.set(finalData)
  }

  static async getJobsStatus(): Promise<JobRoot> {
    const result = await browser.storage.local.get(StorageService.keyForJenkinsJobData)
    return result[StorageService.keyForJenkinsJobData] as JobRoot || {}
  }

  static async saveNodeStatus(nodesStatus: Nodes) {
    return browser.storage.local.set({ 'nodes': JSON.parse(JSON.stringify(nodesStatus)) })
  }

  static async getNodeStatus(): Promise<Nodes> {
    const result = await browser.storage.local.get('nodes')
    return result['nodes'] || {}
  }

  static addStorageListener(listener: any) {
    if (!browser.storage.onChanged.hasListener(listener)) {
      // console.log('addStorageListener::listener', listener)
      browser.storage.onChanged.addListener(listener)
    }
  }

  static removeStorageListener(listener: any) {
    if (browser.storage.onChanged.hasListener(listener)) {
      // console.log('removeStorageListener::listener', listener)
      browser.storage.onChanged.removeListener(listener)
    }
  }

  private static async getAndCacheOptionsFromStorage(): Promise<any> {
    const result = await browser.storage.local.get(StorageService.keyForOptions)
    const options = result['options'] || {}
    localStorage.setItem(StorageService.keyForOptions, JSON.stringify(options))
    return options
  }

  static async getOptions(): Promise<Options> {
    let options: Options | any
    // 先从 localStorage 获取
    const optionsStr = localStorage.getItem(StorageService.keyForOptions)
    // localStorage 获取不到
    if (optionsStr == null) {
      // 从 storage 获取，并保存到 localStorage
      options = await StorageService.getAndCacheOptionsFromStorage()
    } else {
      try {
        options = JSON.parse(optionsStr)
      } catch (e) {
        console.error('getOptions', e)
        // 从 storage 获取，并保存到 localStorage
        options = await StorageService.getAndCacheOptionsFromStorage()
      }
    }

    // 逐个检查各配置属性，不存在则给予默认值
    if (options.defaultTab == undefined) {
      options.defaultTab = defaultOptionsValue.defaultTab
    }
    if (options.jenkinsTokens == undefined) {
      options.jenkinsTokens = defaultOptionsValue.jenkinsTokens
    }
    for (let i = 0; i < options.jenkinsTokens.length; i++) {
      // 兼容老版本的配置文件
      if (options.jenkinsTokens[i].username === undefined) {
        options.jenkinsTokens[i].username = ''
      }
      if (options.jenkinsTokens[i].token === undefined) {
        options.jenkinsTokens[i].token = ''
      }
    }
    if (options.refreshTime == undefined) {
      options.refreshTime = defaultOptionsValue.refreshTime
    }
    if (options.nodeRefreshTime == undefined) {
      options.nodeRefreshTime = defaultOptionsValue.nodeRefreshTime
    }
    if (options.showNotificationOption == undefined) {
      options.showNotificationOption = defaultOptionsValue.showNotificationOption
    }
    if (options.omniboxJenkinsUrl == undefined) {
      options.omniboxJenkinsUrl = defaultOptionsValue.omniboxJenkinsUrl
    }
    if (options.nodeParam == undefined) {
      options.nodeParam = defaultOptionsValue.nodeParam
    }
    if (options.jobStatsJenkinsUrl == undefined) {
      options.jobStatsJenkinsUrl = defaultOptionsValue.jobStatsJenkinsUrl
    }
    if (options.currentTheme == undefined) {
      options.currentTheme = defaultOptionsValue.currentTheme
    }
    if (options.enableDarkMode == undefined) {
      options.enableDarkMode = defaultOptionsValue.enableDarkMode
    }
    if (options.showDisabledJobs == undefined) {
      options.showDisabledJobs = defaultOptionsValue.showDisabledJobs
    }
    if (options.enableParamsStashAndRecover == undefined) {
      options.enableParamsStashAndRecover = defaultOptionsValue.enableParamsStashAndRecover
    }

    return options as Options
  }

  static async saveOptions(options: Options) {
    let value: any | undefined = undefined
    let reason: any | undefined = undefined

    const oldOptionsStr = localStorage.getItem(StorageService.keyForOptions) || '{}'
    try {
      // 存储到 storage
      const optionsStr = JSON.stringify(options)
      // 先更新 localStorage ，以免 browser.storage 更新后，触发 browser.storage 更新监听，
      // 但是从 localStorage 中获取不到更新内容。
      localStorage.setItem(StorageService.keyForOptions, optionsStr)
      // 更新存储到 browser.storage
      value = await browser.storage.local.set({
        'options': JSON.parse(optionsStr)
      })
      // 存储到 localStorage，作为缓存
    } catch (e) {
      console.error(e)
      // browser.storage 存储失败，还原 localStorage 内容
      localStorage.setItem(StorageService.keyForOptions, oldOptionsStr)
      reason = e
    }
    return new Promise((resolve, reject) => {
      if (reason != undefined) {
        reject(reason)
      } else {
        resolve(value)
      }
    })
  }

  static async set<T>(object: T) {
    // 删除 localStorage 缓存，以免缓存不同步
    localStorage.removeItem(StorageService.keyForOptions)
    return browser.storage.local.set(object)
  }

  static async get(keys: string[]) {
    const result = await browser.storage.local.get(keys)
    return result || {}
  }
}
