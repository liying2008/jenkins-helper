export class JenkinsBuild {
  _class: string = ''
  url: string = ''
  number: number = 0
  result: string | null = null
  timestamp: number = 0
  actions: Action[] = []

  static empty() {
    return new JenkinsBuild()
  }
}

export type Action = ParametersAction | CauseAction | BadgeAction | HtmlBadgeAction | WorkflowEnvAction

export const PARAMETERS_ACTION_CLASS = 'hudson.model.ParametersAction'

export class ParametersAction {
  _class: string = ''
  parameters: BuildParameter[] = []
}

export const CAUSE_ACTION_CLASS = 'hudson.model.CauseAction'

export class CauseAction {
  _class: string = ''
  causes: BuildCause[] = []
}

export const BADGE_ACTION_CLASS = 'com.jenkinsci.plugins.badge.action.BadgeAction'

export class BadgeAction {
  _class: string = ''
  background?: string = undefined
  border?: string = undefined
  borderColor?: string = undefined
  color?: string = undefined
  link?: string = undefined
  text?: string = undefined
}

export const HTML_BADGE_ACTION_CLASS = 'com.jenkinsci.plugins.badge.action.HtmlBadgeAction'

export class HtmlBadgeAction {
  _class: string = ''
  html?: string = undefined
}

export class BuildCause {
  _class: string = ''
  shortDescription: string = ''
  userId?: string = undefined
  userName?: string = undefined
  upstreamUrl?: string = undefined
  upstreamProject?: string = undefined
  upstreamBuild?: number = undefined
}

export class BuildParameter {
  _class: string = ''
  name: string = ''
  value?: string = undefined
  jobName?: string = undefined
  number?: number = undefined
}

export const WORKFLOW_ENV_ACTION_CLASS = 'org.jenkinsci.plugins.workflow.cps.EnvActionImpl'

/**
 * workflow-cps-plugin 提供的API
 */
export class WorkflowEnvAction {
  _class: string = ''
  environment: Record<string, string> = {}
}

////////////////////////////////////////////////////////////////////////////////

/**
 * envinject-plugin 提供的API
 *
 * api data from $BUILD_URL/injectedEnvVars/api/json
 */
export class InjectedEnvVars {
  _class: string = 'org.jenkinsci.plugins.envinject.EnvInjectVarList'
  envMap: Record<string, string> = {}
}
