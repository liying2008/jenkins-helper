import { Options } from './option'
import { Nodes } from './node'

export interface SettingsFileData {
  name: string
  version: string
  data: SettingsContent
}

export interface SettingsContent {
  'jenkins-url': Array<string>
  nodes?: Nodes
  options: Options
}
