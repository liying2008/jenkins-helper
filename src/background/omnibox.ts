import { StorageService } from '@/libs/storage'
import { Options } from '@/models/option'
import { Tools } from '@/libs/tools'

interface Job {
  /**
   * Job的类型。
   * 如：org.jenkinsci.plugins.workflow.job.WorkflowJob
   */
  _class: string
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
  private static allJobs: Job[] = [];

  static start() {
    Omnibox.getAllJobs()

    // 设置默认建议
    browser.omnibox.setDefaultSuggestion({
      description: '%s - ' + browser.i18n.getMessage('baiduSearch'),
    })
    // 当用户输入时触发
    browser.omnibox.onInputChanged.addListener((text, suggest) => {
      // console.log('text', text)
      if (!text) return
      const suggestContent = Omnibox.filterJobs(text)
      // console.log('suggestContent', suggestContent)
      return suggest(suggestContent)
    })

    // 当用户接收关键字建议时触发
    browser.omnibox.onInputEntered.addListener((text) => {
      // console.log('inputEntered', text)
      if (!text) return
      if (text.indexOf('http') !== 0) {
        text = 'https://www.baidu.com/s?wd=' + text
      }
      Omnibox.navigate(text)
    })
  }

  private static navigate(url: string) {
    browser.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
      return browser.tabs.update(tabs[0].id!, { url: url })
    })
  }

  static getAllJobs() {
    Omnibox.allJobs = []
    StorageService.getOptions().then((result: Options) => {
      const jenkinsUrls = result.omniboxJenkinsUrl.split('\n')
      jenkinsUrls.forEach((jkUrl: string) => {
        let url = jkUrl.trim()
        if (url === '') {
          return true // continue
        }
        url = url.charAt(url.length - 1) === '/' ? url : url + '/';

        (function (url) {
          const encodeParam = encodeURI('jobs[name,url]')
          const jsonUrl = url + 'api/json?tree=' + encodeParam

          Tools.getFetchOption(jsonUrl).then((header: RequestInit) => {
            fetch(jsonUrl, header).then((res) => {
              if (res.ok) {
                return res.json()
              } else {
                return Promise.reject(res)
              }
            }).then((data) => {
              if (data.hasOwnProperty('jobs')) {
                Omnibox.allJobs = Omnibox.allJobs.concat(data.jobs)
                console.log('all fetched', Omnibox.allJobs)
              }
            }).catch((e: Error) => {
              console.error('获取Job失败', e)
            })
          })
        })(url)
      })
    })
  }

  // 过滤符合输入的 Job
  private static filterJobs(text: string) {
    return Omnibox.allJobs
      .filter((job: Job) => job.name.toLowerCase().indexOf(text.toLowerCase()) >= 0)
      .map((job: Job) => {
        return {
          content: decodeURIComponent(job.url),
          description: decodeURIComponent(job.url)
        }
      })
  }
}
