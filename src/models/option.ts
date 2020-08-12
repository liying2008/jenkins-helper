export interface OptionsRoot {
  options: Options
}

export interface Options {
  defaultTab: string
  jenkinsTokens: JenkinsToken[]
  jobStatsJenkinsUrl: string
  nodeParam: string
  omniboxJenkinsUrl: string
  refreshTime: string
  nodeRefreshTime: string
  showNotificationOption: string
  showDisabledJobs: boolean
  enableParamsStashAndRecover: boolean
}

export interface JenkinsToken {
  url: string
  username?: string
  token?: string
}
