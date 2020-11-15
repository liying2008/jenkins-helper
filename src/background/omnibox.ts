import { StorageService } from '@/libs/storage'
import { Options } from '@/models/option'
import { Tools } from '@/libs/tools'

export class Omnibox {
  private static allJobs: any[] = [];
  private static defaultSuggestionUrl = '';

  static start() {
    Omnibox.getAllJobs()

    // 当用户输入时触发
    browser.omnibox.onInputChanged.addListener((text, suggest) => {
      // console.log('text', text);
      if (!text) return
      const suggestContent = Omnibox.filterJobs(text)
      // console.log('suggestContent', suggestContent);
      return suggest(suggestContent)
    })

    // 当用户接收关键字建议时触发
    browser.omnibox.onInputEntered.addListener((text) => {
      // console.log('inputEntered', text);
      if (!text) return
      if (text.indexOf('http') !== 0) {
        text = Omnibox.defaultSuggestionUrl + 'job/' + text + '/'
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
      for (let i = 0; i < jenkinsUrls.length; i++) {
        let url = jenkinsUrls[i].trim()
        if (url === '') {
          continue
        }
        url = url.charAt(url.length - 1) === '/' ? url : url + '/'
        if (!Omnibox.defaultSuggestionUrl) {
          Omnibox.defaultSuggestionUrl = url
          browser.omnibox.setDefaultSuggestion({
            description: url + 'job/%s/'
          })
        }

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
      }
    })
  }

  // 过滤符合输入的 Job
  private static filterJobs(text: string) {
    const suggests = []
    const len = Omnibox.allJobs.length
    for (let i = 0; i < len; i++) {
      if (Omnibox.allJobs[i].name.toLowerCase().indexOf(text.toLowerCase()) >= 0) {
        suggests.push({
          content: decodeURIComponent(Omnibox.allJobs[i].url),
          description: decodeURIComponent(Omnibox.allJobs[i].url)
        })
      }
    }
    return suggests
  }
}
