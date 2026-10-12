const stashBtnId = 'jenkins-helper-stash-parameters'
const recoverBtnId = 'jenkins-helper-recover-parameters'

const strings = {
  stashParameters: chrome.i18n.getMessage('content_stashParameters'),
  recoverParameters: chrome.i18n.getMessage('content_recoverParameters'),
}

/**
 * 创建 "Stash Parameters" 和 "Recover Parameters" 两个独立按钮，
 * 并封装在一个容器中返回。
 * 样式使用 jk- 前缀命名空间，避免污染全局样式。
 *
 * @returns {HTMLDivElement} 包含两个按钮的容器元素
 */
function createStashAndRecoverBtns() {
  /*
   <div class="jk-button-container" role="group" aria-label="Stash And Recover">
        <!-- 按钮 1: Stash Parameters (蓝色调) -->
        <button class="jk-text-btn jk-stash" type="button" id="jenkins-helper-stash-parameters">
            <span class="jk-icon">📥</span>
            Stash Parameters
        </button>

        <!-- 按钮 2: Recover Parameters (青绿色调) -->
        <button class="jk-text-btn jk-recover" type="button" id="jenkins-helper-recover-parameters">
            <span class="jk-icon">🔄</span>
            Recover Parameters
        </button>
    </div>
   */
  // ========== 1. 创建外层容器 ==========
  const container = document.createElement('div')
  container.className = 'jk-button-container'
  container.setAttribute('role', 'group')
  container.setAttribute('aria-label', 'Stash And Recover')

  // ========== 2. 创建 "Stash Parameters" 按钮 ==========
  const stashBtn = document.createElement('button')
  stashBtn.className = 'jk-text-btn jk-stash'
  stashBtn.type = 'button'
  stashBtn.id = stashBtnId

  // 图标（使用 span 包裹，便于单独控制样式）
  const stashIcon = document.createElement('span')
  stashIcon.className = 'jk-icon'
  stashIcon.textContent = '📥'

  // 按钮文字（使用 textNode 避免额外标签，也可用 span）
  const stashText = document.createTextNode(strings.stashParameters)

  // 组装按钮内容：图标 + 空格 + 文字
  stashBtn.appendChild(stashIcon)
  stashBtn.appendChild(document.createTextNode(' '))
  stashBtn.appendChild(stashText)

  // ========== 3. 创建 "Recover Parameters" 按钮 ==========
  const recoverBtn = document.createElement('button')
  recoverBtn.className = 'jk-text-btn jk-recover'
  recoverBtn.type = 'button'
  recoverBtn.id = recoverBtnId

  // 图标
  const recoverIcon = document.createElement('span')
  recoverIcon.className = 'jk-icon'
  recoverIcon.textContent = '🔄'

  // 按钮文字
  const recoverText = document.createTextNode(strings.recoverParameters)

  // 组装按钮内容
  recoverBtn.appendChild(recoverIcon)
  recoverBtn.appendChild(document.createTextNode(' '))
  recoverBtn.appendChild(recoverText)

  // ========== 4. 将两个按钮加入容器 ==========
  container.appendChild(stashBtn)
  container.appendChild(recoverBtn)

  // ========== 5. 返回容器 ==========
  return container
}

export function addBtns(mainPanel: HTMLElement) {
  // 添加按钮的样式
  // <link rel="stylesheet" href="chrome-extension://{extensionId}/css/params-stash-recover/style.css" type="text/css">
  const styleEl = document.createElement('link')
  styleEl.setAttribute('rel', 'stylesheet')
  styleEl.setAttribute('href', chrome.runtime.getURL('css/params-stash-recover/style.css'))
  styleEl.setAttribute('type', 'text/css')
  document.head.appendChild(styleEl)
  // 在 main-panel 中添加按钮
  mainPanel.appendChild(createStashAndRecoverBtns())
}
