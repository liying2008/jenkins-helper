const PAGE_BUILD = 'build'
const PAGE_PARAMETERS = 'parameters'
const PAGE_REBUILD = 'rebuild'

type PageType = typeof PAGE_BUILD | typeof PAGE_PARAMETERS | typeof PAGE_REBUILD

/**
 * 启用 参数名称着色 功能
 */
export function enable(tintingColor: string) {
  let table = isBuildPage() as HTMLElement | null
  if (table != null) {
    tintParamNames(table, tintingColor, PAGE_BUILD)
    return
  }
  table = isParametersPage() as HTMLElement | null
  if (table != null) {
    tintParamNames(table, tintingColor, PAGE_PARAMETERS)
    return
  }
  table = isRebuildPage() as HTMLElement | null
  if (table != null) {
    tintParamNames(table, tintingColor, PAGE_REBUILD)
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
 * 给参数名着色
 * @param table 参数表格
 * @param tintingColor 颜色
 */
function tintParamNames(table: HTMLElement, tintingColor: string, pageType: PageType) {
  console.log('[param-names-color] pageType is', pageType)
  let paramNameElems = table.querySelectorAll('div.tr div.jenkins-form-label')
  if (paramNameElems.length === 0) {
    paramNameElems = table.querySelectorAll('div.tr div.setting-name')
  }

  let boolParamNameElems: NodeListOf<Element> | null = null
  if (pageType === PAGE_BUILD || pageType === PAGE_REBUILD) {
    boolParamNameElems = table.querySelectorAll('div.tr div[name="parameter"] > span.jenkins-checkbox label')
    if (boolParamNameElems.length === 0) {
      boolParamNameElems = table.querySelectorAll('div.tr div[name="parameter"] > label')
    }
  } else if (pageType === PAGE_PARAMETERS) {
    boolParamNameElems = table.querySelectorAll('div div > span.jenkins-checkbox label')
    if (boolParamNameElems.length === 0) {
      boolParamNameElems = table.querySelectorAll('div.tr div > label.setting-checkbox')
    }
  }

  const paramNameElemsArray = Array.from(paramNameElems)
  if (boolParamNameElems) {
    paramNameElemsArray.push(...Array.from(boolParamNameElems))
  }

  const size = paramNameElemsArray.length
  if (size === 0) {
    return
  }
  paramNameElemsArray.forEach((paramNameElem) => {
    paramNameElem.setAttribute('style', `color: ${tintingColor}; font-weight: 700`)
  })
}
