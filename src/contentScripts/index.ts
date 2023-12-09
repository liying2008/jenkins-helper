import { inject as injectBuildParamsFunctions } from './build-params-injector'
import { inject as injectBuildSubpageFunctions } from './build-subpage-injector'

(() => {
  // console.info('[Jenkins Helper] Hello world from content script')

  // 注入构建页面参数功能
  injectBuildParamsFunctions()

  // 注入构建子页面功能
  injectBuildSubpageFunctions()
})()
