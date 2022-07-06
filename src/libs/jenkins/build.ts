import type { BuildCause, BuildParameter } from '~/models/jenkins/build'


const strings = {
  passwordParameter: browser.i18n.getMessage('passwordParameter'),
  fileParameter: browser.i18n.getMessage('fileParameter'),
  credentialsParameter: browser.i18n.getMessage('credentialsParameter'),
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

  static getBuildParametersFromActions(actions: any[]): BuildParameter[] {
    // console.log('actions', actions)
    const parameters: BuildParameter[] = []
    for (let i = 0; i < actions.length; i++) {
      if (actions[i].hasOwnProperty('parameters')) {
        const _parameters = actions[i].parameters
        for (let pIndex = 0; pIndex < _parameters.length; pIndex++) {
          const _class = _parameters[pIndex]._class
          const param = {
            hidden: false,
            name: _parameters[pIndex].name,
            value: _parameters[pIndex].value,
          }
          // 额外处理几个特殊类型的参数
          if (_class === 'hudson.model.PasswordParameterValue' && param.value === undefined) {
            // 密码参数
            param.hidden = true
            param.value = `<${strings.passwordParameter}>`
          } else if (_class === 'com.cloudbees.plugins.credentials.CredentialsParameterValue' && param.value === undefined) {
            // 凭据参数
            param.hidden = true
            param.value = `<${strings.credentialsParameter}>`
          } else if (_class === 'hudson.model.FileParameterValue' && param.value === undefined) {
            // 文件参数
            param.hidden = true
            param.value = `<${strings.fileParameter}>`
          } else if (_class === 'hudson.model.RunParameterValue') {
            // 运行时参数
            param.value = `${_parameters[pIndex].jobName} #${_parameters[pIndex].number}`
          }
          parameters.push(param)
        }
      }
    }
    return parameters
  }

  static getBuildCausesFromActions(actions: any[], url: string, fullDisplayName: string): BuildCause[] {
    // console.log('actions', actions)
    const causes: BuildCause[] = []
    for (let i = 0; i < actions.length; i++) {
      if (actions[i].hasOwnProperty('causes')) {
        const _causes = actions[i].causes
        for (let cIndex = 0; cIndex < _causes.length; cIndex++) {
          const shortDescription = _causes[cIndex].shortDescription
          let upstreamUrl = ''
          if (_causes[cIndex].upstreamUrl && _causes[cIndex].upstreamBuild) {
            const rootUrl = JenkinsBuild.getJenkinsRootUrl(url, fullDisplayName)
            if (rootUrl) {
              upstreamUrl = `${rootUrl}/${_causes[cIndex].upstreamUrl}${_causes[cIndex].upstreamBuild}/`
            }
          }
          causes.push({
            shortDescription,
            url: upstreamUrl,
          })
        }
      }
    }
    return causes
  }
}
