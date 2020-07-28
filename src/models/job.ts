export interface JobRoot {
  [setUrl: string]: JobSet
}

export class JobSet {
  jobs?: JobStatus;
  name: string;
  status: string;
  error?: string;

  constructor(name: string, status: string, error = '') {
    this.name = name
    this.status = status
    this.error = error
  }
}

export interface JobStatus {
  [jobUrl: string]: JobDetail
}

export interface JobDetail {
  building: boolean
  color: string
  labelClass: string
  lastBuildNumber: number
  lastBuildTimestamp: number
  name: string
  status: string
}
