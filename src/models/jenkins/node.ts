export interface JenkinsNode {
  _class: string
  computer: JenkinsComputer[]
}

export interface JenkinsComputer {
  _class: string
  displayName: string
  monitorData: JenkinsMonitorData
  offline: boolean
}

export interface JenkinsMonitorData {
  _class: string
  'hudson.node_monitors.ArchitectureMonitor': string
  'hudson.node_monitors.ClockMonitor': ClockMonitor
  'hudson.node_monitors.DiskSpaceMonitor': DiskSpaceMonitor
  'hudson.node_monitors.ResponseTimeMonitor': ResponseTimeMonitor
  'hudson.node_monitors.SwapSpaceMonitor': SwapSpaceMonitor
  'hudson.node_monitors.TemporarySpaceMonitor': TemporarySpaceMonitor
  offline: false
}

export interface ClockMonitor {
  _class: string
  diff: number
}

export interface DiskSpaceMonitor {
  _class: string
  path: string
  size: number
  timestamp: number
}

export interface ResponseTimeMonitor {
  _class: string
  average: number
  timestamp: number
}

export interface SwapSpaceMonitor {
  _class: string
  availablePhysicalMemory: number
  availableSwapSpace: number
  totalPhysicalMemory: number
  totalSwapSpace: number
}

export interface TemporarySpaceMonitor {
  _class: string
  path: string
  size: number
  timestamp: number
}
