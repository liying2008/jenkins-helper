/*
 * storage apis
 * https://developer.chrome.com/apps/storage#property-local
 */
import { JobRoot, JobSet } from '@/models/job'
import { JenkinsUrlRoot } from '@/models/jenkins-url'
import { Nodes } from '@/models/node'
import { Options } from '@/models/option'
import { defaultTheme } from '@/theme'

export interface StorageChangeWrapper<T = any> {
  [key: string]: StorageChange<T>
}

export interface StorageChange<T> {
  oldValue?: T
  newValue?: T
}

export class StorageService {
  static readonly keyForJenkinsUrl = 'jenkins-url'
  static readonly keyForOptions = 'options'
  static readonly keyForNodes = 'nodes'

  static async saveJenkinsUrls(jenkinsUrls: string[]) {
    const jenkinsUrlRoot: JenkinsUrlRoot = { 'jenkins-url': JSON.parse(JSON.stringify(jenkinsUrls)) }
    return browser.storage.local.set(jenkinsUrlRoot)
  }

  static async getJenkinsUrls() {
    const result = await browser.storage.local.get('jenkins-url')
    return result['jenkins-url'] as string[] || []
  }

  // 删除一个Jenkins Url
  static async removeJenkinsUrls(jenkinsUrl: string) {
    const result = await StorageService.getJenkinsUrls()
    if (result !== undefined) {
      const index = result.indexOf(jenkinsUrl)
      if (index > -1) {
        result.splice(index, 1)
        await StorageService.saveJenkinsUrls(result)
        await StorageService.removeJobStatus(jenkinsUrl)
      }
    }
  }

  static async saveJobStatus(jenkinsUrl: string, info: JobSet) {
    const jenkinsObj: JobRoot = {}
    jenkinsObj[jenkinsUrl] = info
    return browser.storage.local.set(jenkinsObj)
  }

  static async removeJobStatus(jenkinsUrl: string) {
    return browser.storage.local.remove(jenkinsUrl)
  }

  static async getJobStatus(jenkinsUrl: string | string[]): Promise<JobRoot> {
    const result = await browser.storage.local.get(jenkinsUrl)
    return result as JobRoot || {}
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
      options.defaultTab = 'monitor'
    }
    if (options.jenkinsTokens == undefined) {
      options.jenkinsTokens = []
    }
    if (options.refreshTime == undefined) {
      options.refreshTime = '60'
    }
    if (options.nodeRefreshTime == undefined) {
      options.nodeRefreshTime = '2'
    }
    if (options.showNotificationOption == undefined) {
      options.showNotificationOption = 'all'
    }
    if (options.omniboxJenkinsUrl == undefined) {
      options.omniboxJenkinsUrl = ''
    }
    if (options.nodeParam == undefined) {
      options.nodeParam = ''
    }
    if (options.jobStatsJenkinsUrl == undefined) {
      options.jobStatsJenkinsUrl = ''
    }
    if (options.currentTheme == undefined) {
      options.currentTheme = defaultTheme.name
    }
    if (options.enableDarkMode == undefined) {
      options.enableDarkMode = false
    }
    if (options.showDisabledJobs == undefined) {
      options.showDisabledJobs = true
    }
    if (options.enableParamsStashAndRecover == undefined) {
      options.enableParamsStashAndRecover = true
    }

    return options as Options
  }

  static async saveOptions(options: Options) {
    let value: any | undefined = undefined
    let reason: any | undefined = undefined
    try {
      // 存储到 storage
      const optionsStr = JSON.stringify(options)
      value = await browser.storage.local.set({
        'options': JSON.parse(optionsStr)
      })
      // 存储到 localStorage，作为缓存
      localStorage.setItem(StorageService.keyForOptions, optionsStr)
    } catch (e) {
      console.error(e)
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
