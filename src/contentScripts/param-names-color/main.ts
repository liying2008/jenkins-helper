const PAGE_BUILD = 'build'
const PAGE_PARAMETERS = 'parameters'

/**
 * 当前所在页面
 */
let currentPage = PAGE_BUILD

/**
 * 启用 参数名称着色 功能
 *
 * @returns true: 使能成功，false: 使能失败
 */
export function enable(tintingColor: string) {
  let table = isBuildPage() as HTMLElement | null
  if (table != null) {
    currentPage = PAGE_BUILD
    tintParamNames(table, tintingColor, false)
  } else {
    table = isParametersPage() as HTMLElement | null
    if (table != null) {
      currentPage = PAGE_PARAMETERS
      tintParamNames(table, tintingColor, true)
    }
  }
  return table !== null
}

/**
 * 当前页面是否是 Build 页面 或 Rebuild 页面
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
  let element = document.querySelector('body#jenkins[data-model-type="hudson.model.ParametersAction"]')
  if (!element) {
    element = document.querySelector('')
  }
  if (!element) {
    return null
  }

  return element.querySelector('div#main-panel')
}

/**
 * 给参数名着色
 * @param table 参数表格
 * @param tintingColor 颜色
 */
function tintParamNames(table: HTMLElement, tintingColor: string, isParametersPage: boolean) {
  let paramNameElems = table.querySelectorAll('div.tr div.jenkins-form-label')
  if (paramNameElems.length === 0) {
    paramNameElems = table.querySelectorAll('div.tr div.setting-name')
  }

  let boolParamNameElems: NodeListOf<Element>
  if (isParametersPage) {
    boolParamNameElems = table.querySelectorAll('div div > span.jenkins-checkbox label')
    if (boolParamNameElems.length === 0) {
      boolParamNameElems = table.querySelectorAll('div.tr div > label.setting-checkbox')
    }
  } else {
    boolParamNameElems = table.querySelectorAll('div.tr div[name="parameter"] > span.jenkins-checkbox label')
    if (boolParamNameElems.length === 0) {
      boolParamNameElems = table.querySelectorAll('div.tr div[name="parameter"] > label')
    }
  }

  const paramNameElemsArray = Array.from(paramNameElems)
  paramNameElemsArray.push(...Array.from(boolParamNameElems))

  const size = paramNameElemsArray.length
  if (size === 0) {
    return
  }
  console.log('currentPage', currentPage)
  paramNameElemsArray.forEach((paramNameElem) => {
    paramNameElem.setAttribute('style', `color: ${tintingColor}; font-weight: 900`)
  })
}
