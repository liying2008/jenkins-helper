import type { StashedParams } from './models/param-type'
import type { ContentResp } from '~/models/content-message'
import { CMD_RECOVER_PARAMS, CMD_STASH_PARAMS, ContentMessage } from '~/models/content-message'
import { addBtns } from './params-stash-recover-btn'
import { addRecoverTipOnPage, addStashTipOnPage } from './params-stash-recover-tip'

const PAGE_BUILD = 'build'
const PAGE_PARAMETERS = 'parameters'
const PAGE_REBUILD = 'rebuild'

type PageType = typeof PAGE_BUILD | typeof PAGE_PARAMETERS | typeof PAGE_REBUILD

const GREEN_COLOR = '#23a52359'
const RED_COLOR = '#d5606059'

const UNSUPPORT_INPUT_TYPES = ['password', 'file', 'hidden', 'credentialType', 'text/javascript']

/**
 * 启用 参数暂存&恢复 功能
 */
export function enable() {
  let mainPanel = isBuildPage() as HTMLElement | null
  if (mainPanel != null) {
    addStashAndRecoverButtons(mainPanel, PAGE_BUILD)
    return
  }
  mainPanel = isParametersPage() as HTMLElement | null
  if (mainPanel != null) {
    addStashAndRecoverButtons(mainPanel, PAGE_PARAMETERS)
    return
  }
  mainPanel = isRebuildPage() as HTMLElement | null
  if (mainPanel != null) {
    addStashAndRecoverButtons(mainPanel, PAGE_REBUILD)
  }
}

/**
 * 当前页面是否是 Build 页面
 */
function isBuildPage() {
  const element = document.querySelector('body#jenkins[data-model-type="hudson.model.ParametersDefinitionProperty"]')
  if (!element) {
    return null
  }
  return element.querySelector('div#main-panel')
}

/**
 * 当前页面是否是 参数 页面
 */
function isParametersPage() {
  const element = document.querySelector('body#jenkins[data-model-type="hudson.model.ParametersAction"]')
  if (!element) {
    return null
  }
  return element.querySelector('div#main-panel')
}

/**
 * 当前页面是否是 Rebuild 页面（Rebuilder插件提供）
 */
function isRebuildPage() {
  const element = document.querySelector('body#jenkins[data-model-type="com.sonyericsson.rebuild.RebuildAction"]')
  if (!element) {
    return null
  }
  return element.querySelector('div#main-panel')
}

/**
 * 添加 暂存参数 和 恢复参数 的按钮
 */
function addStashAndRecoverButtons(mainPanel: HTMLElement, pageType: PageType) {
  console.log('[params-stash-recover] pageType is', pageType)
  // add two buttons
  addBtns(mainPanel)
  // bind onClick listeners
  bindEvent(mainPanel, pageType)
}

/**
 * 绑定事件
 */
function bindEvent(mainPanel: HTMLElement, pageType: PageType) {
  // 添加 暂存参数 的监听事件
  const stashBtn = mainPanel.querySelector('#jenkins-helper-stash-parameters')
  stashBtn?.addEventListener('click', () => {
    // 暂存的参数
    let stashedParams: StashedParams | null = null
    // 不能被暂存的参数
    let cannotStashed: string[] | null = null
    if (pageType === PAGE_BUILD) {
      const params = getBuildPageParameters(mainPanel)
      stashedParams = params.stashedParams
      cannotStashed = params.cannotStashed
    } else if (pageType === PAGE_PARAMETERS) {
      const params = getParametersPageParameters(mainPanel)
      stashedParams = params.stashedParams
      cannotStashed = params.cannotStashed
    } else if (pageType === PAGE_REBUILD) {
      const params = getBuildPageParameters(mainPanel)
      stashedParams = params.stashedParams
      cannotStashed = params.cannotStashed
    }
    if (!stashedParams) {
      console.log('获取参数失败')
      alert('Parsing parameters failed!')
      return
    }

    // save parameters to extension local storage
    saveParameters(stashedParams)
  })

  // 添加 恢复参数 的监听事件
  const recoverBtn = mainPanel.querySelector('#jenkins-helper-recover-parameters')
  recoverBtn?.addEventListener('click', () => {
    recoverParameters(mainPanel)
  })
}

/**
 * 从 Build / Rebuild 页面 获取当前填写的参数
 */
function getBuildPageParameters(mainPanel: HTMLElement) {
  // 暂存的参数
  const stashedParams: StashedParams = {}
  // 不能被暂存的参数
  const cannotStashed: string[] = []
  const parameters = mainPanel.querySelectorAll('div.tr div.setting-main div[name="parameter"]')
  const size = parameters.length
  for (let i = 0; i < size; i++) {
    const parameter = parameters[i]
    const children = parameter.children
    if (children.length < 1) {
      // 无 children
      continue
    } else if (children.length < 2) {
      const c0 = children[0] as HTMLInputElement
      if (c0.name !== 'name') {
        continue
      }
      // <input name="name" type="hidden" value="PARAM1">
      console.log('no value input:', `${c0.value} can not be stashed!`)
      // 标记为红色
      parameter.parentElement?.parentElement?.setAttribute('style', `background: ${RED_COLOR}`)
      cannotStashed.push(c0.value)
      continue
    } else {
      const c0 = children[0] as HTMLInputElement
      const c1 = children[1] as HTMLInputElement
      if (c0.name !== 'name') {
        continue
      }
      const pname = c0.value
      const type = c1.type
      const name = c1.name

      if (UNSUPPORT_INPUT_TYPES.includes(type)) {
        // 无法暂存的参数类型
        console.log(`unsupported element type ${type}:`, `${pname} can not be stashed!`)
        // 标记为红色
        parameter.parentElement?.parentElement?.setAttribute('style', `background: ${RED_COLOR}`)
        cannotStashed.push(pname)
        continue
      }

      let value: string | boolean = ''

      const tagName = c1.tagName
      if (tagName === 'SPAN') {
        const c1Children = c1.children
        if (c1Children.length < 1) {
          // 无法暂存的参数类型
          console.log(`no subchildren:`, `${pname} can not be stashed!`)
          // 标记为红色
          parameter.parentElement?.parentElement?.setAttribute('style', `background: ${RED_COLOR}`)
          cannotStashed.push(pname)
          continue
        }
        const c10 = c1Children[0] as HTMLInputElement
        if (c10.type === 'checkbox') {
          // checkbox 特殊处理
          value = c10.checked
          console.log('param', `PNAME=${pname}, tagName=${c10.tagName}, type=${c10.type}, value=${value}`)
        } else {
          // 无法暂存的参数类型
          console.log(`unsupported subchildren element type ${c10.type}:`, `${pname} can not be stashed!`)
          // 标记为红色
          parameter.parentElement?.parentElement?.setAttribute('style', `background: ${RED_COLOR}`)
          cannotStashed.push(pname)
          continue
        }
      } else if (tagName === 'DIV') {
        // 无法暂存的参数类型
        console.log(`unsupported tag ${tagName}:`, `${pname} can not be stashed!`)
        // 标记为红色
        parameter.parentElement?.parentElement?.setAttribute('style', `background: ${RED_COLOR}`)
        cannotStashed.push(pname)
        continue
      } else {
        if (type === 'checkbox') {
        // checkbox 特殊处理
          value = c1.checked
          console.log('param', `PNAME=${pname}, tagName=${tagName}, type=${type}, value=${value}`)
        } else {
          value = c1.value
          console.log('param', `PNAME=${pname}, tagName=${tagName}, type=${type}, value=${value}`)
        }
      }

      stashedParams[pname] = {
        type,
        name,
        value,
      }
      // 标记为绿色
      parameter.parentElement?.parentElement?.setAttribute('style', `background: ${GREEN_COLOR}`)
    } // end if
  } // end for

  // 显示说明文本
  addStashTipOnPage(mainPanel)
  return {
    stashedParams,
    cannotStashed,
  }
}

/**
 * 从 参数页面 获取当前填写的参数
 */
function getParametersPageParameters(mainPanel: HTMLElement) {
  // 暂存的参数
  const stashedParams: StashedParams = {}
  // 不能被暂存的参数
  const cannotStashed: string[] = []
  const settingMains = mainPanel.querySelectorAll('div.setting-main')
  const size = settingMains.length

  for (let i = 0; i < size; i++) {
    const settingMain = settingMains[i]
    let formLabel = settingMain.parentElement?.querySelector('div.jenkins-form-label')
    if (!formLabel) {
      formLabel = settingMain.parentElement?.querySelector('div.setting-name')
    }

    if (!formLabel) {
      continue
    }
    const pname = formLabel.textContent!
    // console.log('pname', pname)
    const children = settingMain.children
    // console.log('children', children)
    if (children.length === 0) {
      console.log('no children:', `${pname} can not be stashed!`)
      // 标记为红色
      settingMain.parentElement?.setAttribute('style', `background: ${RED_COLOR}`)
      cannotStashed.push(pname)
      continue
    } else {
      const param = children[0] as HTMLInputElement
      const type = param.type
      const name = param.name
      let value: string | boolean = ''
      if (param.tagName === 'INPUT' || param.tagName === 'TEXTAREA') {
        if (param.type === 'password') {
          console.log('param type is password:', `${pname} can not be stashed!`)
          // 标记为红色
          settingMain.parentElement?.setAttribute('style', `background: ${RED_COLOR}`)
          cannotStashed.push(pname)
          continue
        }
        value = param.value
        if (param.type === 'checkbox') {
          value = param.checked
        }
      } else if (param.tagName === 'DIV') {
        if (param.classList.contains('jenkins-quote')) {
          const copyButton = param.querySelector('button.copy-button')
          if (!copyButton) {
            console.log('param no copy button:', `${pname} can not be stashed!`)
            // 标记为红色
            settingMain.parentElement?.setAttribute('style', `background: ${RED_COLOR}`)
            cannotStashed.push(pname)
            continue
          }
          value = copyButton.getAttribute('text') || ''
        } else {
          console.log('unsupported div element:', `${pname} can not be stashed!`)
          // 标记为红色
          settingMain.parentElement?.setAttribute('style', `background: ${RED_COLOR}`)
          cannotStashed.push(pname)
          continue
        }
      } else {
        console.log('unsupported tagName:', `${pname} can not be stashed!`)
        // 标记为红色
        settingMain.parentElement?.setAttribute('style', `background: ${RED_COLOR}`)
        cannotStashed.push(pname)
        continue
      }

      console.log('param:', `PNAME=${pname}, tagName=${param.tagName}, type=${type}, name=${name}, value=${value}`)

      // 标记为绿色
      settingMain.parentElement?.setAttribute('style', `background: ${GREEN_COLOR}`)
      stashedParams[pname] = {
        type,
        name,
        value,
      }
    }
  } // end for

  // 显示说明文本
  addStashTipOnPage(mainPanel)
  return {
    stashedParams,
    cannotStashed,
  }
}

/**
 * 暂存参数
 * @param stashedParams 可以被暂存的参数
 */
function saveParameters(stashedParams: StashedParams) {
  const message = new ContentMessage(CMD_STASH_PARAMS, stashedParams)

  chrome.runtime.sendMessage(message).then((resp: ContentResp) => {
    // console.log('saveParameters::resp', resp)
    if (resp.status === 'ok') {
      console.log('saved.')
    } else {
      console.log('error in saving.')
      alert('Stash parameters failed!')
    }
  })
}

/**
 * 从上次暂存中恢复参数
 */
function recoverParameters(mainPanel: HTMLElement) {
  const message = new ContentMessage(CMD_RECOVER_PARAMS)

  chrome.runtime.sendMessage(message).then((resp: ContentResp) => {
    // console.log('recoverParameters::resp', resp)
    if (resp.status !== 'ok') {
      console.log('recoverParameters: 读取参数失败！')
      alert(chrome.i18n.getMessage('content_parametersReadFailed'))
      return
    }
    const params = resp.data
    if (!params || Object.keys(params).length < 1) {
      // 无暂存数据
      alert(chrome.i18n.getMessage('content_noStashedParams'))
      return
    }
    const cannotRecovered: StashedParams = {}

    const parameters = mainPanel.querySelectorAll('div.tr div.setting-main div[name="parameter"]')
    const size = parameters.length

    for (let i = 0; i < size; i++) {
      const parameter = parameters[i]
      const children = parameter.children
      if (children.length < 1) {
        continue
      } else if (children.length < 2) {
        const c0 = children[0] as HTMLInputElement
        if (c0.name !== 'name') {
          continue
        }
        // <input name="name" type="hidden" value="PARAM1">
        console.log('recoverParameters', `${c0.value} failed to recovered!`)
        // 标记为红色
        parameter.parentElement?.parentElement?.setAttribute('style', `background: ${RED_COLOR}`)
        cannotRecovered[c0.value] = { value: params[c0.value] }
      } else {
        const c0 = children[0] as HTMLInputElement
        const c1 = children[1] as HTMLInputElement
        if (c0.name !== 'name') {
          continue
        } else if (!params.hasOwnProperty(c0.value)) {
          console.log(`没有暂存该参数: ${c0.value}`)
          // 标记为红色
          parameter.parentElement?.parentElement?.setAttribute('style', `background: ${RED_COLOR}`)
          cannotRecovered[c0.value] = { value: '' }
          continue
        }

        const pname = c0.value
        const type = c1.type
        const name = c1.name
        const value = params[pname].value
        // console.log('stashed value', value)

        if (type === 'file' || type === 'hidden' || name === 'credentialType') {
          // 无法恢复的参数类型
          console.log('recoverParameters', `${pname} failed to recovered!`)
          // 标记为红色
          parameter.parentElement?.parentElement?.setAttribute('style', `background: ${RED_COLOR}`)
          cannotRecovered[pname] = { value: '' }
          continue
        } else if (type === 'checkbox') {
          // checkbox 特殊处理
          c1.checked = value
        } else {
          console.log('before - value: ', value, ', c1.value: ', c1.value)
          c1.value = value
          console.log('after - value: ', value, ', c1.value: ', c1.value)
          if (c1.value !== value) {
            // 标记为红色
            parameter.parentElement?.parentElement?.setAttribute('style', `background: ${RED_COLOR}`)
            cannotRecovered[pname] = { value }
            continue
          }
        }
        // 标记为绿色
        parameter.parentElement?.parentElement?.setAttribute('style', `background: ${GREEN_COLOR}`)
      } // end if
    } // end for

    // 显示说明文本
    addRecoverTipOnPage(mainPanel)
    console.log('cannotRecovered', cannotRecovered)
    if (Object.keys(cannotRecovered).length > 0) {
      // 有无法恢复的参数
      console.log(chrome.i18n.getMessage('content_failedToRecover'))
    } else {
      // 已恢复所有参数
      console.log(chrome.i18n.getMessage('content_recoverSuccess'))
    }
  })
}
