export interface JobRoot {
  [setUrl: string]: JobSet;
}

export interface JobSet {
  jobs?: JobStatus;
  name: string;
  status: string;
  error?: string;
}

export interface JobStatus {
  [jobUrl: string]: JobDetail
}

export interface JobDetail {
  building: boolean;
  color: string;
  labelClass: string;
  lastBuildNumber: number;
  lastBuildTimestamp: number;
  name: string;
  status: string;
}
