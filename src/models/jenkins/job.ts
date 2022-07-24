import type { JenkinsBuild } from './build'

export class JenkinsJob {
  _class: string = ''
  color: string = ''
  url: string = ''
  displayName: string = ''
  name: string = ''
  fullName: string = ''
  description?: string = undefined
  lastCompletedBuild: JenkinsBuild | null = null
  lastBuild: JenkinsBuild | null = null
}
