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

    if (options.defaultTab === undefined || options.defaultTab === null) {
      options.defaultTab = refOptions.defaultTab
    }
    if (options.jenkinsTokens === undefined || options.jenkinsTokens === null) {
      options.jenkinsTokens = refOptions.jenkinsTokens
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
    if (options.refreshTime === undefined || options.refreshTime === null) {
      options.refreshTime = refOptions.refreshTime
    }
    if (options.nodeRefreshTime === undefined || options.nodeRefreshTime === null) {
      options.nodeRefreshTime = refOptions.nodeRefreshTime
    }
    if (options.showNotificationOption === undefined || options.showNotificationOption === null) {
      options.showNotificationOption = refOptions.showNotificationOption
    }
    if (options.omniboxJenkinsUrl === undefined || options.omniboxJenkinsUrl === null) {
      options.omniboxJenkinsUrl = refOptions.omniboxJenkinsUrl
    }
    if (options.nodeParam === undefined || options.nodeParam === null) {
      options.nodeParam = refOptions.nodeParam
    }
    if (options.jobStatsJenkinsUrl === undefined || options.jobStatsJenkinsUrl === null) {
      options.jobStatsJenkinsUrl = refOptions.jobStatsJenkinsUrl
    }
    if (options.currentTheme === undefined || options.currentTheme === null) {
      options.currentTheme = refOptions.currentTheme
    }
    if (options.enableDarkMode === undefined || options.enableDarkMode === null) {
      options.enableDarkMode = refOptions.enableDarkMode
    }
    if (options.showDisabledJobs === undefined || options.showDisabledJobs === null) {
      options.showDisabledJobs = refOptions.showDisabledJobs
    }
    if (options.enableParamsStashAndRecover === undefined || options.enableParamsStashAndRecover === null) {
      options.enableParamsStashAndRecover = refOptions.enableParamsStashAndRecover
    }
    if (options.enableParamNamesColor === undefined || options.enableParamNamesColor === null) {
      options.enableParamNamesColor = refOptions.enableParamNamesColor
    }
    if (options.paramNamesColor === undefined || options.paramNamesColor === null) {
      options.paramNamesColor = refOptions.paramNamesColor
    }
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
