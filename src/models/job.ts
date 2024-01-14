// [setUrl: string]: JobSet
export type JobRoot = Record<string, JobSet>

// ok: 表示 Job 信息获取成功
// error: 表示 Job 信息获取失败
// new: 表示新添加的监控URL，尚未来得及获取Job信息
export type JobSetStatusType = 'ok' | 'error' | 'new'

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

  static empty() {
    return new JobSet('', 'ok')
  }
}

// [jobUrl: string]: JobDetail
export type JobStatus = Record<string, JobDetail>

export class JobDetail {
  building: boolean = false
  color: string = ''
  lastCompletedBuildNumber?: number = undefined
  lastBuildTimestamp?: number = undefined
  // Job 名称
  name: string = ''
  // 当前构建状态
  status: string = ''
  // 构建参数
  params?: Record<string, string> = undefined
  // 构建徽标
  badge?: BuildBadge[] = undefined
}

export class BuildBadge {
  background: string | null = null
  border: string | null = null
  borderColor: string | null = null
  color: string | null = null
  link: string | null = null
  text: string | null = null
  html: string | null = null
}

export type DisplayedJobDetail = JobDetail & { jobUrl: string }

export type DisplayedJobSet = Omit<JobSet, 'jobs'> & { jobs: DisplayedJobDetail[] }

export function getEmptyDisplayedJobSet(): DisplayedJobSet {
  return {
    name: '',
    status: 'ok',
    error: undefined,
    jobs: [],
  }
}

export type DisplayedJobRoot = Record<string, DisplayedJobSet>
