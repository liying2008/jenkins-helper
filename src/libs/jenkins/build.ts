import { t } from '~/libs/extension'
import type { Action, BuildCause, BuildParameter, CauseAction, InjectedEnvVars, ParametersAction, WorkflowEnvAction } from '~/models/jenkins/build'
import { CAUSE_ACTION_CLASS, PARAMETERS_ACTION_CLASS, WORKFLOW_ENV_ACTION_CLASS } from '~/models/jenkins/build'


export type DisplayedBuildParameter = BuildParameter & { hint: string }

export type DisplayedBuildCause = BuildCause & { fullUpstreamUrl: string }

export class DisplayedBuildEnvVar {
  name: string = ''
  value: string = ''
}

const strings = {
  passwordParameter: t('passwordParameter'),
  fileParameter: t('fileParameter'),
  credentialsParameter: t('credentialsParameter'),
}

export class JenkinsBuild {
  static getJenkinsRootUrl(url: string, fullDisplayName: string): string {
    if (url[url.length - 1] === '/') {
      url = url.substring(0, url.length - 1)
    }
    fullDisplayName = encodeURIComponent(fullDisplayName)
    // %20%C2%BB%20: »
    // %20%23: #
    let path = fullDisplayName.replace('%20%C2%BB%20', '/job/').replace('%20%23', '/')
    path = `/job/${path}`
    const index = url.lastIndexOf(path)
    if (index > 0) {
      const rootUrl = url.substring(0, index)
      console.log('rootUrl', rootUrl)
      return rootUrl
    } else {
      console.log('error: url:', url, 'fullDisplayName', fullDisplayName, 'path:', path)
      return ''
    }
  }

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

  static getBuildParametersFromActions(actions: Action[]): DisplayedBuildParameter[] {
    // console.log('actions', actions)
    const parameters: DisplayedBuildParameter[] = []
    actions.forEach((action) => {
      if (action._class === PARAMETERS_ACTION_CLASS) {
        const _parameters = (action as ParametersAction).parameters
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
      }
    })

    return parameters
  }

  static getBuildCausesFromActions(actions: Action[], url: string, fullDisplayName: string): DisplayedBuildCause[] {
    // console.log('actions', actions)
    const causes: DisplayedBuildCause[] = []
    actions.forEach((action) => {
      if (action._class === CAUSE_ACTION_CLASS) {
        const _causes = (action as CauseAction).causes
        _causes.forEach((cause) => {
          const shortDescription = cause.shortDescription
          let fullUpstreamUrl = ''
          if (cause.upstreamUrl && cause.upstreamBuild) {
            const rootUrl = JenkinsBuild.getJenkinsRootUrl(url, fullDisplayName)
            if (rootUrl) {
              fullUpstreamUrl = `${rootUrl}/${cause.upstreamUrl}${cause.upstreamBuild}/`
            }
          }
          causes.push({
            _class: cause._class,
            shortDescription,
            fullUpstreamUrl,
          })
        })
      }
    })
    return causes
  }

  static getBuildEnvVarsFromActions(actions: Action[]): DisplayedBuildEnvVar[] {
    // console.log('actions', actions)
    const envVars: DisplayedBuildEnvVar[] = []
    actions.forEach((action) => {
      if (action._class === WORKFLOW_ENV_ACTION_CLASS) {
        const _environment = (action as WorkflowEnvAction).environment
        for (const name in _environment) {
          envVars.push({
            name,
            value: _environment[name],
          })
        }
      }
    })
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
