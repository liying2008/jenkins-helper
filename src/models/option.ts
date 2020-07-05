export interface OptionsRoot {
  options: Options;
}

export interface Options {
  defaultTab: string;
  jenkinsTokens: JenkinsToken[];
  jobStatsJenkinsUrl: string;
  nodeParam: string;
  omniboxJenkinsUrl: string;
  refreshTime: string | number;
  nodeRefreshTime: string | number;
  showNotificationOption: string;
  showDisabledJobs: boolean;
  enableParamsStashAndRecover: boolean;
}

export interface JenkinsToken {
  token: string;
  url: string;
  username: string;
}
