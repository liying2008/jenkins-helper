import { defaultTheme } from '@/theme'

export interface OptionsRoot {
  options: Options
}

export type PopupTab = 'monitor' | 'params' | 'computer'

export type NotificationShowing = 'all' | 'unstable' | 'none'

export interface Options {
  defaultTab: PopupTab
  jenkinsTokens: JenkinsToken[]
  jobStatsJenkinsUrl: string
  nodeParam: string
  omniboxJenkinsUrl: string
  refreshTime: string
  nodeRefreshTime: string
  showNotificationOption: NotificationShowing
  currentTheme: string
  enableDarkMode: boolean
  showDisabledJobs: boolean
  enableParamsStashAndRecover: boolean
}

// Options 默认值
export const defaultOptionsValue: Options = {
  defaultTab: 'monitor',
  jenkinsTokens: [],
  jobStatsJenkinsUrl: '',
  nodeParam: '',
  omniboxJenkinsUrl: '',
  refreshTime: '60',
  nodeRefreshTime: '2',
  showNotificationOption: 'all',
  currentTheme: defaultTheme.name,
  enableDarkMode: false,
  showDisabledJobs: true,
  enableParamsStashAndRecover: true,
}

export class JenkinsToken {
  url: string = ''
  username: string = ''
  token: string = ''

  static empty() {
    return new JenkinsToken()
  }
}
