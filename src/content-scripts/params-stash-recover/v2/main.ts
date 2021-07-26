import { CMD_RECOVER_PARAMS, CMD_STASH_PARAMS, ContentMessage, ContentResp } from '@/models/content-message'
import { StashedParams } from '../models/param-type'
import { addBtnForParamsPage, addBtnsForBuildPage } from './params-stash-recover-btn'
import { addRecoverTipOnPage, addStashTipOnPage } from './params-stash-recover-tip'

const PAGE_BUILD = 'build'
const PAGE_PARAMETERS = 'parameters'

const GREEN_COLOR = '#c5f5c5'
const RED_COLOR = '#ffb6b6'

/**
 * 当前所在页面
 */
let currentPage = PAGE_BUILD

/**
 * 启用 参数暂存&恢复 功能
 *
 * @returns true: 使能成功，false: 使能失败
 */
export function enable() {
  let table = isBuildPage() as HTMLElement | null
  if (table != null) {
    currentPage = PAGE_BUILD
    addStashAndRecoverButtons(table)
  } else {
    table = isParametersPage() as HTMLElement | null
    if (table != null) {
      currentPage = PAGE_PARAMETERS
      addStashAndRecoverButtons(table)
    }
  }
  return table !== null
}

/**
 * 当前页面是否是 Build 页面 或 Rebuild 页面
 */
function isBuildPage() {
  // XPATH: //body[@id='jenkins']//div[@id='main-panel']/form/div[@class='parameters']
  const selector = 'body#jenkins div#main-panel form div.parameters'
  const element = document.querySelector(selector)
  // console.log('isBuildPage', element)
  return element
}

/**
 * 当前页面是否是 参数 页面
 */
function isParametersPage() {
  // XPATH: //body[@id='jenkins']//div[@id='main-panel']//div[@class='row']/div[contains(@class,"pane-content")]
  const selector = 'body#jenkins div#main-panel div.row div.pane-content'
  const element = document.querySelector(selector)
  // console.log('isParametersPage', element)
  if (element == null) return null

  const div = element.querySelector('div.tr')
  if (div) {
    // 新版本Jenkins页面
    return element
  }
  // 老版本Jenkins页面，无需处理，直接返回 null
  return null
}

/**
 * 添加 暂存参数 和 恢复参数 的按钮
 */
function addStashAndRecoverButtons(table: HTMLElement) {
  if (currentPage === PAGE_BUILD) {
    // 构建页面 或 Rebuild 页面
    const tBodies = table.querySelectorAll('div.tr')
    const size = tBodies.length
    if (size === 0) {
      return
    }
    console.log('currentPage', currentPage)
    const lastTBody = tBodies[size - 1]
    const btnTd = lastTBody.querySelector('div') as HTMLElement | null
    if (!btnTd) {
      return
    }
    // add two buttons
    addBtnsForBuildPage(btnTd)
    // bind onClick listeners
    bindEvent(table)
  } else if (currentPage === PAGE_PARAMETERS) {
    // 参数页面
    // add stash buttons
    addBtnForParamsPage(table)
    // bind onClick listeners
    bindEvent(table)
  }
}

/**
 * 绑定事件
 */
function bindEvent(table: HTMLElement) {
  // 添加 暂存参数 的监听事件
  const stashBtn = table.querySelector('#jenkins-helper-stash-parameters')
  stashBtn?.addEventListener('click', () => {
    // 暂存的参数
    let stashedParams: StashedParams | null = null
    // 不能被暂存的参数
    let cannotStashed: string[] | null = null
    if (currentPage === PAGE_BUILD) {
      const params = getBuildPageParameters(table)
      stashedParams = params.stashedParams
      cannotStashed = params.cannotStashed
    } else if (currentPage === PAGE_PARAMETERS) {
      const params = getParametersPageParameters(table)
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
  const recoverBtn = table.querySelector('#jenkins-helper-recover-parameters')
  recoverBtn?.addEventListener('click', () => {
    recoverParameters(table)
  })
}

/**
 * 从 Build页面 或 Rebuild页面 获取当前填写的参数
 */
function getBuildPageParameters(table: HTMLElement) {
  // 暂存的参数
  const stashedParams: StashedParams = {}
  // 不能被暂存的参数
  const cannotStashed: string[] = []
  const parameters = table.querySelectorAll('div.tr div.setting-main div[name="parameter"]')
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
      console.log('getBuildPageParameters', c0.value + ' can not be stashed!')
      // 标记为红色
      parameter.parentElement?.parentElement?.setAttribute('style', `background: ${RED_COLOR}`)
      cannotStashed.push(c0.value)
    } else {
      const c0 = children[0] as HTMLInputElement
      const c1 = children[1] as HTMLInputElement
      if (c0.name !== 'name') {
        continue
      }
      const pname = c0.value
      const type = c1.type
      const name = c1.name
      let value: string | boolean = c1.value
      console.log('param', 'PNAME=' + pname + ', tagName=' + c1.tagName + ', type=' + type + ', name=' + name + ', value=' + value)
      console.log('param', 'PNAME=' + pname + ', checked=' + c1.checked)

      if (type === 'password' || type === 'file' || type === 'hidden' || name === 'credentialType') {
        // 无法暂存的参数类型
        console.log('getBuildPageParameters', pname + ' can not be stashed!')
        // 标记为红色
        parameter.parentElement?.parentElement?.setAttribute('style', `background: ${RED_COLOR}`)
        cannotStashed.push(pname)
        continue
      } else if (type === 'checkbox') {
        // checkbox 特殊处理
        value = c1.checked
      }

      stashedParams[pname] = {
        'type': type,
        'name': name,
        'value': value,
      }
      // 标记为绿色
      parameter.parentElement?.parentElement?.setAttribute('style', `background: ${GREEN_COLOR}`)
    } // end if
  } // end for

  // 显示说明文本
  addStashTipOnPage(table.parentElement)
  return {
    stashedParams, cannotStashed
  }
}

/**
 * 从 参数页面 获取当前填写的参数
 */
function getParametersPageParameters(table: HTMLElement) {
  // 暂存的参数
  const stashedParams: StashedParams = {}
  // 不能被暂存的参数
  const cannotStashed: string[] = []
  const settingMains = table.querySelectorAll('div.tr div.setting-main')
  const size = settingMains.length

  for (let i = 0; i < size; i++) {
    const settingMain = settingMains[i]
    const settingName = settingMain.previousElementSibling

    if (!settingName || !settingName.classList.contains('setting-name')) {
      continue
    }
    const pname = settingName.textContent!
    console.log('pname', pname)
    const children = settingMain.children
    // console.log('children', children)
    if (children.length === 0) {
      console.log('getParametersPageParameters0', pname + ' can not be stashed!')
      // 标记为红色
      settingMain.parentElement?.setAttribute('style', `background: ${RED_COLOR}`)
      cannotStashed.push(pname)
      continue
    } else {
      const param = children[0] as HTMLInputElement
      const type = param.type
      const name = param.name
      if (param.tagName !== 'INPUT' && param.tagName !== 'TEXTAREA') {
        console.log('getParametersPageParameters1', pname + ' can not be stashed!')
        // 标记为红色
        settingMain.parentElement?.setAttribute('style', `background: ${RED_COLOR}`)
        cannotStashed.push(pname)
        continue
      } else if (param.type === 'password') {
        console.log('getParametersPageParameters2', pname + ' can not be stashed!')
        // 标记为红色
        settingMain.parentElement?.setAttribute('style', `background: ${RED_COLOR}`)
        cannotStashed.push(pname)
        continue
      }
      let value: string | boolean = param.value
      if (param.type === 'checkbox') {
        value = param.checked
      }
      console.log('param', 'PNAME=' + pname + ', tagName=' + param.tagName + ', type=' + type + ', name=' + name + ', value=' + value)

      // 标记为绿色
      settingMain.parentElement?.setAttribute('style', `background: ${GREEN_COLOR}`)
      stashedParams[pname] = {
        'type': type,
        'name': name,
        'value': value,
      }
    }
  } // end for

  // 显示说明文本
  addStashTipOnPage(table.parentElement)
  return {
    stashedParams, cannotStashed
  }
}

/**
 * 暂存参数
 * @param stashedParams 可以被暂存的参数
 */
function saveParameters(stashedParams: StashedParams) {
  const message = new ContentMessage(CMD_STASH_PARAMS, stashedParams)
  browser.runtime.sendMessage(message).then((resp: ContentResp) => {
    console.log('saveParameters::resp', resp)
    if (resp.status === 'ok') {
      console.log('saved.')
    } else {
      console.error('error in saving.')
      alert('Stash parameters failed!')
    }
  })
}

/**
 * 从上次暂存中恢复参数
 */
function recoverParameters(table: HTMLElement) {
  const message = new ContentMessage(CMD_RECOVER_PARAMS)
  browser.runtime.sendMessage(message).then((resp: ContentResp) => {
    console.log('recoverParameters::resp', resp)
    if (resp.status !== 'ok') {
      console.log('recoverParameters: 读取参数失败！')
      alert(browser.i18n.getMessage('content_parametersReadFailed'))
      return
    }
    const params = resp.data
    if (params === undefined || params === null || Object.keys(params).length < 1) {
      // 无暂存数据
      alert(browser.i18n.getMessage('content_noStashedParams'))
      return
    }
    const cannotRecovered: StashedParams = {}

    const parameters = table.querySelectorAll('div.tr div.setting-main div[name="parameter"]')
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
        console.log('recoverParameters', c0.value + ' failed to recovered!')
        // 标记为红色
        parameter.parentElement?.parentElement?.setAttribute('style', `background: ${RED_COLOR}`)
        cannotRecovered[c0.value] = { value: params[c0.value] }
      } else {
        const c0 = children[0] as HTMLInputElement
        const c1 = children[1] as HTMLInputElement
        if (c0.name !== 'name') {
          continue
        } else if (!params.hasOwnProperty(c0.value)) {
          console.log('没有暂存该参数: ' + c0.value)
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
          console.log('recoverParameters', pname + ' failed to recovered!')
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
            cannotRecovered[pname] = { value: value }
            continue
          }
        }
        // 标记为绿色
        parameter.parentElement?.parentElement?.setAttribute('style', `background: ${GREEN_COLOR}`)
      } // end if
    } // end for

    // 显示说明文本
    addRecoverTipOnPage(table.parentElement)
    console.log('cannotRecovered', cannotRecovered)
    if (Object.keys(cannotRecovered).length > 0) {
      // 有无法恢复的参数
      console.log(browser.i18n.getMessage('content_failedToRecover'))
    } else {
      // 已恢复所有参数
      console.log(browser.i18n.getMessage('content_recoverSuccess'))
    }
  })
}
