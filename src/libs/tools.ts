import { StorageService } from '@/libs/storage'

// export type JobResultType = 'blue' | 'yellow' | 'red' | 'aborted' | 'notbuilt' | 'disabled'

export class Tools {
  // 是否是 Chrome 浏览器
  static readonly isChrome = navigator.userAgent.indexOf('Chrome') > -1;

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
  };

  static readonly labelClass: { [key: string]: string } = {
    blue: 'label-success',
    yellow: 'label-warning',
    red: 'label-danger',
    aborted: 'label-default',
    notbuilt: 'label-primary',
    disabled: 'label-primary',
  };

  static getDefaultFetchOption(headers: Record<string, string> = {}, method = 'GET'): RequestInit {
    if (!headers) {
      headers = {}
    }
    return {
      method: method,
      credentials: 'include',
      mode: 'cors',
      redirect: 'follow',
      headers: headers
    }
  }

  static async getFetchOption(url: string, headers: Record<string, string> = {}, method = 'GET'): Promise<RequestInit> {
    const options = await StorageService.getOptions()
    const jenkinsTokens = options.jenkinsTokens || []
    // console.log('jenkinsTokens', jenkinsTokens);
    let token = undefined
    for (let i = 0; i < jenkinsTokens.length; i++) {
      const currentToken = jenkinsTokens[i]
      if (url.indexOf(currentToken.url) >= 0) {
        token = currentToken
        break
      }
    }
    if (!headers) {
      headers = {}
    }
    // console.log('Tool.getFetchOption token', token);
    if (token) {
      headers['Authorization'] = 'Basic ' + window.btoa(token.username + ':' + token.token)
      return {
        method: method,
        mode: 'cors',
        redirect: 'follow',
        headers: headers
      }
    } else {
      return Tools.getDefaultFetchOption(headers, method)
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
    const month = Tools.zeroFill(d.getMonth() + 1)
    const day = Tools.zeroFill(d.getDate())
    const hour = Tools.zeroFill(d.getHours())
    const minute = Tools.zeroFill(d.getMinutes())
    const second = Tools.zeroFill(d.getSeconds())
    if (withSep) {
      return year + '-' + month + '-' + day + ' ' + hour + ':' + minute + ':' + second
    } else {
      return '' + year + month + day + hour + minute + second
    }
  }

  /**
   * 前位补零
   */
  static zeroFill(i: number): string | number {
    if (i >= 0 && i <= 9) {
      return '0' + i
    } else {
      return i
    }
  }
}
