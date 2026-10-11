const stashTipId = 'jenkins-helper-stash-tip'
const recoverTipId = 'jenkins-helper-recover-tip'

const strings = {
  stashTipOnJenkinsPage: chrome.i18n.getMessage('content_stashTipOnJenkinsPage'),
  recoverTipOnJenkinsPage: chrome.i18n.getMessage('content_recoverTipOnJenkinsPage'),
}

export function addStashTipOnPage(mainPanel: HTMLElement | null) {
  if (!mainPanel) {
    return
  }

  const existRecoverElem = mainPanel.querySelector(`#${recoverTipId}`)
  // recover-tip 已存在，则移除
  if (existRecoverElem) {
    mainPanel.removeChild(existRecoverElem)
  }

  const existStashElem = mainPanel.querySelector(`#${stashTipId}`)
  // stash-tip 已存在，则不重复添加
  if (existStashElem) {
    return
  }

  const tipP = document.createElement('p')
  tipP.id = stashTipId
  tipP.textContent = strings.stashTipOnJenkinsPage
  tipP.setAttribute('style', 'font-size: smaller; color: #0b6aa2')

  mainPanel.appendChild(tipP)
}

export function addRecoverTipOnPage(mainPanel: HTMLElement | null) {
  if (!mainPanel) {
    return
  }

  const existStashElem = mainPanel.querySelector(`#${stashTipId}`)
  // stash-tip 已存在，则移除
  if (existStashElem) {
    mainPanel.removeChild(existStashElem)
  }

  const existRecoverElem = mainPanel.querySelector(`#${recoverTipId}`)
  // recover-tip 已存在，则不重复添加
  if (existRecoverElem) {
    return
  }

  const tipP = document.createElement('p')
  tipP.id = recoverTipId
  tipP.textContent = strings.recoverTipOnJenkinsPage
  tipP.setAttribute('style', 'font-size: smaller; color: #0b6aa2')

  mainPanel.appendChild(tipP)
}
