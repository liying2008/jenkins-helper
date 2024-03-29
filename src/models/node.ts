export interface NodesRoot {
  nodes: Nodes
}

// [jenkinsUrl: string]: NodeStatus
export type Nodes = Record<string, NodeStatus>

export type NodeStatusType = 'ok' | 'error'

export interface NodeStatus {
  status: NodeStatusType
  error?: string
  monitoredNodes: MonitoredNodes
}

// [nodeName: string]: NodeDetail
export type MonitoredNodes = Record<string, NodeDetail>

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
