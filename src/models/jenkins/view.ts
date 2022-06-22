import type { JenkinsJob } from './job'

export interface JenkinsView {
  _class: string
  name: string
  displayName?: string
  url: string
  description: string | null
  jobs: JenkinsJob[]
}
