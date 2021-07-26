
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
    tintParamNames(table, tintingColor)
  } else {
    table = isParametersPage() as HTMLElement | null
    if (table != null) {
      currentPage = PAGE_PARAMETERS
      console.log('aaaa')
      tintParamNames(table, tintingColor)
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
 * 给参数名着色
 * @param table 参数表格
 * @param tintingColor 颜色
 */
function tintParamNames(table: HTMLElement, tintingColor: string) {
  const paramNameElems = table.querySelectorAll('div.tr div.setting-name')
  const size = paramNameElems.length
  if (size === 0) {
    return
  }
  console.log('currentPage', currentPage)
  for (let i = 0; i < size; i++) {
    paramNameElems[i].setAttribute('style', `color: ${tintingColor}; font-weight: 900`)
  }
}
