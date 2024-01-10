import type { StorageChangeWrapper } from '~/libs/storage'
import { StorageService } from '~/libs/storage'
import type { Options } from '~/models/option'
import { Tools } from '~/libs/tools'
import type { Enc } from '~/models/common'
import { t } from '~/libs/extension'

interface Job {
  /**
   * Job地址。
   * 如：http://192.168.5.200:8080/jenkins/job/BigLog/
   */
  url: string
  /**
   * Job名称。
   * 如：BigLog
   */
  name: string
}

export class Omnibox {
  private static instance?: Omnibox
  // 请求 /api/json 使用的 tree 参数
  private static readonly TREE_PARAMS = 'jobs[name,url]'
  private allJobs: Job[] = []

  private static getInstance() {
    if (!Omnibox.instance) {
      Omnibox.instance = new Omnibox()
    }
    return Omnibox.instance
  }

  static launch() {
    Omnibox.getInstance().start()
  }

  private start() {
    console.log('Omnibox::start')
    this.getAllJobs()
    // 添加 storage change 监听
    StorageService.addStorageListener(this.storageChange)

    // 设置默认建议
    browser.omnibox.setDefaultSuggestion({
      description: `%s - ${t('baiduSearch')}`,
    })
    // 当用户输入时触发
    browser.omnibox.onInputChanged.addListener((text, suggest) => {
      // console.log('text', text)
      if (!text) {
        return
      }
      const suggestContent = this.filterJobs(text)
      // console.log('suggestContent', suggestContent)
      return suggest(suggestContent)
    })

    // 当用户接收关键字建议时触发
    browser.omnibox.onInputEntered.addListener((text) => {
      // console.log('inputEntered', text)
      if (!text) {
        return
      }
      if (text.indexOf('http') !== 0) {
        text = `https://www.baidu.com/s?wd=${text}`
      }
      this.navigate(text)
    })
  }

  private storageChange = (changes: StorageChangeWrapper) => {
    // 使用箭头函数解决 this 指向问题
    // console.log('this', this)
    if (StorageService.keyForOptions in changes) {
      // 设置有改变
      // console.log('omnibox::changes', changes)
      const oldOptions = changes[StorageService.keyForOptions].oldValue
      const newOptions = changes[StorageService.keyForOptions].newValue
      const newOmniboxJenkinsUrl = newOptions.omniboxJenkinsUrl
      // omniboxJenkinsUrl 变更
      if (oldOptions === undefined || newOmniboxJenkinsUrl !== oldOptions.omniboxJenkinsUrl) {
        this.getAllJobs()
      }
    }
  }

  private navigate(url: string) {
    browser.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
      return browser.tabs.update(tabs[0].id!, { url })
    })
  }

  private getAllJobs() {
    // console.log('Omnibox::getAllJobs')
    this.allJobs = []
    StorageService.getOptions().then((result: Options) => {
      const jenkinsUrls = result.omniboxJenkinsUrl.split('\n')
      // console.log('Omnibox::jenkinsUrls', jenkinsUrls)

      const allFetchDataPromises: Promise<Enc>[] = []

      jenkinsUrls.forEach((jkUrl: string) => {
        let url = jkUrl.trim()
        if (url === '') {
          return true // continue
        }
        url = url.charAt(url.length - 1) === '/' ? url : `${url}/`
        allFetchDataPromises.push(Tools.fetchJenkinsDataByUrl(url, 'api/json', Omnibox.TREE_PARAMS))
      })

      Promise.all(allFetchDataPromises).then((values: Enc[]) => {
        // console.log('this', this)
        // console.log('Omnibox:values', values)
        values.forEach((value: Enc) => {
          if (value.ok) {
            const data = value.body
            if (data.hasOwnProperty('jobs')) {
              this.allJobs = this.allJobs.concat(data.jobs)
              // console.log('Omnibox::all fetched', this.allJobs)
            }
          } else {
            const error = value.errMsg
            console.log('Omnibox::获取Job失败', error)
          }
        })
      }).catch((e: Error) => {
        // 原则上不应该走到这里
        console.log('Omnibox::queryJobStatus:e', e)
      })
    })
  }

  // 过滤符合输入的 Job
  private filterJobs(text: string) {
    return this.allJobs
      .filter((job: Job) => job.name.toLowerCase().includes(text.toLowerCase()))
      .map((job: Job) => {
        return {
          content: decodeURIComponent(job.url),
          description: decodeURIComponent(job.url),
        }
      })
  }
}
