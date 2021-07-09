/*
 * storage apis
 * https://developer.chrome.com/apps/storage#property-local
 */
import { JobRoot, JobSet } from '@/models/job'
import { JenkinsUrlRoot } from '@/models/jenkins-url'
import { Nodes } from '@/models/node'
import { Options } from '@/models/option'

export interface StorageChangeWrapper {
  [key: string]: StorageChange
}

export interface StorageChange {
  oldValue?: any
  newValue?: any
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

  static async getOptions(): Promise<Options> {
    const result = await browser.storage.local.get('options')
    const options: any = result['options'] || {}
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
      options.currentTheme = 'default'
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
    return browser.storage.local.set({ 'options': JSON.parse(JSON.stringify(options)) })
  }

  static async set<T>(object: T) {
    return browser.storage.local.set(object)
  }

  static async get(keys: string[]) {
    const result = await browser.storage.local.get(keys)
    return result || {}
  }
}
