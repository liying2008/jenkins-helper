import type { Nodes } from './node'
import type { Options } from './option'

export interface SettingsFileData {
  name: string
  version: string
  data: SettingsContent
}

export interface SettingsContent {
  'jenkins-url': Array<string>
  'nodes'?: Nodes
  'options': Options
}
