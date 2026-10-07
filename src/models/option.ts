import { defaultTheme } from '~/theme/theme_default'

export interface OptionsRoot {
  options: Options
}

export type PopupTab = 'monitor' | 'params' | 'computer'

export type NotificationShowing = 'all' | 'unstable' | 'none'

export class Options {
  defaultTab: PopupTab = 'monitor'
  jenkinsTokens: JenkinsToken[] = []
  jobStatsJenkinsUrl: string = ''
  nodeParam: string = ''
  omniboxJenkinsUrl: string = ''
  refreshTime: string = '60'
  nodeRefreshTime: string = '2'
  showNotificationOption: NotificationShowing = 'all'
  currentTheme: string = defaultTheme.name
  enableDarkMode: boolean = false
  showDisabledJobs: boolean = true
  enableParamsStashAndRecover: boolean = true
  enableParamNamesColor: boolean = true
  paramNamesColor: string = '#4a90e2'

  static default(): Options {
    return new Options()
  }

  /**
   * 标准化配置项
   * @param options 部分配置项
   * @param ref 参考配置项
   * @returns 标准化后的配置项
   */
  static normalize(options: Partial<Options>, ref?: Options): Options {
    let refOptions: Options
    if (ref) {
      refOptions = ref
    } else {
      refOptions = Options.default()
    }

    options.defaultTab ??= refOptions.defaultTab
    // console.trace('normalize', options.jenkinsTokens, typeof options.jenkinsTokens)
    options.jenkinsTokens ??= refOptions.jenkinsTokens
    for (let i = 0; i < options.jenkinsTokens.length; i++) {
      // 兼容老版本的配置文件
      if (options.jenkinsTokens[i].username === undefined) {
        options.jenkinsTokens[i].username = ''
      }
      if (options.jenkinsTokens[i].token === undefined) {
        options.jenkinsTokens[i].token = ''
      }
    }
    options.refreshTime ??= refOptions.refreshTime
    options.nodeRefreshTime ??= refOptions.nodeRefreshTime
    options.showNotificationOption ??= refOptions.showNotificationOption
    options.omniboxJenkinsUrl ??= refOptions.omniboxJenkinsUrl
    options.nodeParam ??= refOptions.nodeParam
    options.jobStatsJenkinsUrl ??= refOptions.jobStatsJenkinsUrl
    options.currentTheme ??= refOptions.currentTheme
    options.enableDarkMode ??= refOptions.enableDarkMode
    options.showDisabledJobs ??= refOptions.showDisabledJobs
    options.enableParamsStashAndRecover ??= refOptions.enableParamsStashAndRecover
    options.enableParamNamesColor ??= refOptions.enableParamNamesColor
    options.paramNamesColor ??= refOptions.paramNamesColor
    return options as Options
  }

  /**
   * 更新配置项
   * @param newOptions 新的配置项
   * @param oldOptions 原始配置项
   * @returns 更新后的配置项
   */
  static update(newOptions: Partial<Options>, oldOptions: Options): Options {
    return Options.normalize(newOptions, oldOptions)
  }
}

export class JenkinsToken {
  url: string = ''
  username: string = ''
  token: string = ''

  static empty() {
    return new JenkinsToken()
  }
}
