export interface NodesRoot {
  nodes: Nodes;
}

export interface Nodes {
  [jenkinsUrl: string]: NodeStatus
}

export interface NodeStatus {
  status: string;
  monitoredNodes: MonitoredNodes;
}

export interface MonitoredNodes {
  [nodeName: string]: NodeDetail
}

export interface NodeDetail {
  nodeUrl: string;
  workingDirectory: string;
  remainingDiskSpace: string;
  responseTime: string;
  monitoring: boolean;
  diskSpaceThreshold: number;
  offline: boolean;
}
