/*
 * storage apis
 * https://developer.chrome.com/apps/storage#property-local
 */
import type { JobRoot, JobSet } from '~/models/job'
import type { JenkinsUrlRoot } from '~/models/jenkins-url'
import type { Nodes } from '~/models/node'
import { Options } from '~/models/option'

export interface StorageChange<T> {
  oldValue?: T
  newValue?: T
}

// [key: string]: StorageChange<T>
export type StorageChangeWrapper<T = any> = Record<string, StorageChange<T>>

export type StorageChangeListener<T = any> = (changes: StorageChangeWrapper<T>, areaName: string) => void

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

  private static createNewJenkinsObj(url: string): JobSet {
    return {
      name: url,
      status: 'new',
      error: undefined,
    }
  }

  static async saveJobStatusReferToJenkinsUrls(data: JobRoot) {
    try {
      const jenkinsUrls = await StorageService.getJenkinsUrls()
      const oldUrls: string[] = []
      for (const oldUrl in data) {
        oldUrls.push(oldUrl)
      }

      oldUrls.forEach((oldUrl) => {
        if (!jenkinsUrls.includes(oldUrl)) {
          console.log('delete::oldUrl', oldUrl)
          delete data[oldUrl]
        }
      })

      jenkinsUrls.forEach((newUrl) => {
        if (!oldUrls.includes(newUrl)) {
          console.log('add::newUrl', newUrl)
          data[newUrl] = this.createNewJenkinsObj(newUrl)
        }
      })
      // 保存
      return await StorageService.saveJobsStatus(data)
    } catch (e) {
      console.error('saveJobStatusReferToJenkinsUrls error:', e)
      return Promise.reject(e)
    }
  }

  static async getJobsStatus(): Promise<JobRoot> {
    const result = await browser.storage.local.get(StorageService.keyForJenkinsJobData)
    return result[StorageService.keyForJenkinsJobData] as JobRoot || {}
  }

  static async tidyJobStatusReferToJenkinsUrls() {
    try {
      const oldJobRoot = await StorageService.getJobsStatus()
      return await StorageService.saveJobStatusReferToJenkinsUrls(oldJobRoot)
    } catch (e) {
      console.error('tidyJobStatusReferToJenkinsUrls error:', e)
      return Promise.reject(e)
    }
  }

  static async saveNodeStatus(nodesStatus: Nodes) {
    return browser.storage.local.set({ nodes: JSON.parse(JSON.stringify(nodesStatus)) })
  }

  static async getNodeStatus(): Promise<Nodes> {
    const result = await browser.storage.local.get('nodes')
    return result.nodes || {}
  }

  static addStorageListener(listener: StorageChangeListener) {
    if (!browser.storage.onChanged.hasListener(listener)) {
      // console.log('addStorageListener::listener', listener)
      browser.storage.onChanged.addListener(listener)
    }
  }

  static removeStorageListener(listener: StorageChangeListener) {
    if (browser.storage.onChanged.hasListener(listener)) {
      // console.log('removeStorageListener::listener', listener)
      browser.storage.onChanged.removeListener(listener)
    }
  }

  static async getOptions(): Promise<Options> {
    const result = await browser.storage.local.get(StorageService.keyForOptions)
    const partialOptions = result.options || {}
    return Options.normalize(partialOptions)
  }

  static async saveOptions(options: Options) {
    let reason: Error | undefined

    try {
      // 更新存储到 browser.storage
      await browser.storage.local.set({
        options,
      })
    } catch (e) {
      console.log(e)
      reason = e as Error
    }
    return new Promise<void>((resolve, reject) => {
      if (reason !== undefined) {
        reject(reason)
      } else {
        resolve()
      }
    })
  }

  static async savePartialOptions(partialOptions: Partial<Options>) {
    const oldOptions = await StorageService.getOptions()
    const newOptions = Options.update(partialOptions, oldOptions)
    // console.log('savePartialOptions', newOptions)
    return StorageService.saveOptions(newOptions)
  }

  static async set<T>(object: Record<string, T>) {
    return browser.storage.local.set(object)
  }

  static async get(keys: string[]) {
    const result = await browser.storage.local.get(keys)
    return result || {}
  }
}
