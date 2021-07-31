export interface JenkinsJob {
  _class: string
  color: string
  url: string
  displayName: string
  name: string
  fullName: string
  description: string
  lastBuildNumber?: number
  lastBuildResult?: string
  lastBuildTimestamp?: number
  lastBuildUrl?: string
  lastCompletedBuild: JenkinsCompletedBuild | null
}

export class JenkinsCompletedBuild {
  _class: string = ''
  url: string = ''
  number: number = 0
  result: string = ''
  timestamp: number = 0

  static empty() {
    return new JenkinsCompletedBuild()
  }
}
