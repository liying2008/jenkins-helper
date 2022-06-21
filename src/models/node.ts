export interface NodesRoot {
  nodes: Nodes
}

export interface Nodes {
  [jenkinsUrl: string]: NodeStatus
}

export type NodeStatusType = 'ok' | 'error'

export interface NodeStatus {
  status: NodeStatusType
  error?: string
  monitoredNodes: MonitoredNodes
}

export interface MonitoredNodes {
  [nodeName: string]: NodeDetail
}

export interface NodeDetail {
  displayName: string
  nodeUrl: string
  workingDirectory: string
  remainingDiskSpace: string
  responseTime: string
  monitoring: boolean
  diskSpaceThreshold: number
  offline: boolean
}
