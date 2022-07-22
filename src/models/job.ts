// [setUrl: string]: JobSet
export type JobRoot = Record<string, JobSet>

export type JobSetStatusType = 'ok' | 'error'

export class JobSet {
  jobs?: JobStatus = undefined
  name: string = ''
  status: JobSetStatusType = 'ok'
  error?: string = undefined

  constructor(name: string, status: JobSetStatusType, error = '') {
    this.name = name
    this.status = status
    this.error = error
  }
}

// [jobUrl: string]: JobDetail
export type JobStatus = Record<string, JobDetail>

export interface JobDetail {
  building: boolean
  color: string
  labelClass: string
  lastBuildNumber: number
  lastBuildTimestamp: number
  name: string
  status: string
}

export interface DisplayedJobDetail {
  jobUrl: string
  building: boolean
  color: string
  labelClass: string
  lastBuildNumber: number
  lastBuildTimestamp: number
  name: string
  status: string
}
