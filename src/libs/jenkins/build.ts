import type { BuildCause, BuildParameter, CauseAction, InjectedEnvVars, InterruptionAction, InterruptionCause, ParametersAction, WorkflowEnvAction } from '~/models/jenkins/build'
import { t } from '~/libs/extension'

export type DisplayedBuildParameter = BuildParameter & { hint: string }

export class DisplayedBuildEnvVar {
  name: string = ''
  value: string = ''
}

const strings = {
  passwordParameter: t('passwordParameter'),
  fileParameter: t('fileParameter'),
  credentialsParameter: t('credentialsParameter'),
}

export class JenkinsBuildUtils {
  static getBuildUrlIfExist(currentUrl: string): string | null {
    const urlRegExp = /^https*:\/\/.+\/job\/[^/]+\/\d+/
    const urlRegExpPipeline = /^(https*:\/\/.+\/)blue\/organizations\/jenkins\/.+\/detail\/([^/]+\/\d+)\//
    const urlRegExpPipelineLog = /^(https*:\/\/.+\/)blue\/rest\/organizations\/jenkins\/pipelines\/([^/]+)\/runs\/(\d+)\//

    let m = currentUrl.match(urlRegExp)
    let buildUrl = ''
    if (m == null) {
      // 普通Jenkins URL 没有匹配到
      m = currentUrl.match(urlRegExpPipeline)
      if (m == null) {
        // Jenkins Pipeline URL 没有匹配到
        m = currentUrl.match(urlRegExpPipelineLog)
        if (m == null) {
          // Jenkins Pipeline Log URL 没有匹配到
          return null
        } else {
          buildUrl = `${m[1]}job/${m[2]}/${m[3]}`
        }
      } else {
        buildUrl = `${m[1]}job/${m[2]}`
      }
    } else {
      buildUrl = m[0]
    }
    console.log('buildUrl', buildUrl)
    return buildUrl
  }

  static getBuildParametersFromActions(action: ParametersAction | null): DisplayedBuildParameter[] {
    // console.log('action', action)
    if (!action) {
      return []
    }
    const parameters: DisplayedBuildParameter[] = []
    const _parameters = action.parameters
    _parameters.forEach((parameter) => {
      const _class = parameter._class
      const param = {
        _class: parameter._class,
        hint: '',
        name: parameter.name,
        value: parameter.value,
      }
      // 额外处理几个特殊类型的参数
      if (_class === 'hudson.model.PasswordParameterValue' && param.value === undefined) {
        // 密码参数
        param.hint = `<${strings.passwordParameter}>`
      } else if (_class === 'com.cloudbees.plugins.credentials.CredentialsParameterValue' && param.value === undefined) {
        // 凭据参数
        param.hint = `<${strings.credentialsParameter}>`
      } else if (_class === 'hudson.model.FileParameterValue' && param.value === undefined) {
        // 文件参数
        param.hint = `<${strings.fileParameter}>`
      } else if (_class === 'hudson.model.RunParameterValue') {
        // 运行时参数
        param.value = `${parameter.jobName} #${parameter.number}`
      }
      parameters.push(param)
    })
    return parameters
  }

  static getBuildCausesFromActions(action: CauseAction | null): BuildCause[] {
    // console.log('action', action)
    if (!action) {
      return []
    }
    return action.causes
  }

  static getInterruptionCausesFromActions(action: InterruptionAction | null): InterruptionCause[] {
    // console.log('action', action)
    if (!action) {
      return []
    }
    return action.causes
  }

  static getBuildEnvVarsFromActions(action: WorkflowEnvAction | null): DisplayedBuildEnvVar[] {
    // console.log('action', action)
    if (!action) {
      return []
    }
    const envVars: DisplayedBuildEnvVar[] = []
    const _environment = action.environment
    for (const name in _environment) {
      envVars.push({
        name,
        value: _environment[name],
      })
    }
    return envVars
  }

  static getBuildEnvVarsFromInjectedEnvVars(injectedEnvVars: InjectedEnvVars): DisplayedBuildEnvVar[] {
    // console.log('injectedEnvVars', injectedEnvVars)
    const envVars: DisplayedBuildEnvVar[] = []
    const _environment = injectedEnvVars.envMap
    for (const name in _environment) {
      envVars.push({
        name,
        value: _environment[name],
      })
    }
    return envVars
  }
}
