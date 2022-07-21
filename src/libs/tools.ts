/* eslint-disable no-undef */
import { addZeroForSingleDigit } from './common'
import { StorageService } from '~/libs/storage'
import type { Enc } from '~/models/common'

// export type JobResultType = 'blue' | 'yellow' | 'red' | 'aborted' | 'notbuilt' | 'disabled'

export class Tools {
  // 是否是 Chrome 浏览器
  static readonly isChrome = navigator.userAgent.includes('Chrome')

  /**
   * job 状态
   * @type {{red: string, blue: string, aborted: string, yellow: string, notbuilt: string, disabled: string}}
   */
  static readonly jobStatus: { [key: string]: string } = {
    blue: 'Success',
    yellow: 'Unstable',
    red: 'Failure',
    aborted: 'Aborted',
    notbuilt: 'Not built',
    disabled: 'Disabled',
  }

  static readonly labelClass: { [key: string]: string } = {
    blue: 'label-success',
    yellow: 'label-warning',
    red: 'label-danger',
    aborted: 'label-default',
    notbuilt: 'label-primary',
    disabled: 'label-primary',
  }

  static getDefaultFetchOption(headers: Record<string, string> = {}, method = 'GET'): RequestInit {
    if (!headers) {
      headers = {}
    }
    return {
      method,
      credentials: 'include',
      mode: 'cors',
      redirect: 'follow',
      headers,
    }
  }

  static async getFetchOption(url: string, headers: Record<string, string> = {}, method = 'GET'): Promise<RequestInit> {
    const options = await StorageService.getOptions()
    const jenkinsTokens = options.jenkinsTokens
    // console.log('jenkinsTokens', jenkinsTokens);
    let token
    for (let i = 0; i < jenkinsTokens.length; i++) {
      const currentToken = jenkinsTokens[i]
      if (!currentToken.url || !currentToken.username || !currentToken.token) {
        // url 或 username 或 token 为空，则跳过匹配
        continue
      }
      if (url.includes(currentToken.url)) {
        token = currentToken
        break
      }
    }
    if (!headers) {
      headers = {}
    }
    // console.log('Tool.getFetchOption token', token);
    if (token) {
      headers.Authorization = `Basic ${window.btoa(`${token.username}:${token.token}`)}`
      return {
        method,
        mode: 'cors',
        redirect: 'follow',
        headers,
      }
    } else {
      return Tools.getDefaultFetchOption(headers, method)
    }
  }

  /**
   * 根据传入的 URL 和 参数请求 Jenkins 数据
   * @param baseUrl 请求的 Jenkins Base URL
   * @param path 请求的 Jenkins URL path
   * @param params JSON tree 参数
   * @returns 请求结果 Enc 对象
   */
  static async fetchJenkinsDataByUrl(baseUrl: string, path: string, params: string): Promise<Enc> {
    const encodedParams = encodeURI(params)
    const jsonUrl = `${baseUrl + path}?tree=${encodedParams}`
    // console.log('fetchDataByUrl:jsonUrl', jsonUrl)
    const header = await Tools.getFetchOption(jsonUrl)
    try {
      const res = await fetch(jsonUrl, header)
      if (res.ok) {
        return {
          ok: true,
          url: baseUrl,
          body: await res.json(),
        }
      } else if (res.status === 401) {
        return {
          ok: false,
          url: baseUrl,
          errMsg: 'Unauthorized',
        }
      } else if (res.status === 403) {
        return {
          ok: false,
          url: baseUrl,
          errMsg: 'Forbidden',
        }
      } else {
        return {
          ok: false,
          url: baseUrl,
          errMsg: await res.text(),
        }
      }
    } catch (e) {
      // console.log('fetchDataByUrl:e', e)
      if ((e as Error).name === 'SyntaxError') {
        return {
          ok: false,
          url: baseUrl,
          errMsg: 'NOT JSON',
        }
      } else {
        return {
          ok: false,
          url: baseUrl,
          errMsg: (e as Error).message,
        }
      }
    }
  }

  /**
   * 根据毫秒时间戳获取可读时间字符串
   * @param timestamp 毫秒时间戳
   * @param withSep 是否含有日期时间分隔符
   * @returns {string}
   */
  static getReadableTime(timestamp: number, withSep = true) {
    if (timestamp === undefined || timestamp === null || timestamp === 0) {
      return ''
    }
    const d = new Date(timestamp)
    const year = d.getFullYear()
    const month = addZeroForSingleDigit(d.getMonth() + 1)
    const day = addZeroForSingleDigit(d.getDate())
    const hour = addZeroForSingleDigit(d.getHours())
    const minute = addZeroForSingleDigit(d.getMinutes())
    const second = addZeroForSingleDigit(d.getSeconds())
    if (withSep) {
      return `${year}-${month}-${day} ${hour}:${minute}:${second}`
    } else {
      return `${year}${month}${day}${hour}${minute}${second}`
    }
  }
}
