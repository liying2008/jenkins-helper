
const stashTipId = 'jenkins-helper-stash-tip'
const recoverTipId = 'jenkins-helper-recover-tip'

const strings = {
  stashTipOnJenkinsPage: browser.i18n.getMessage('content_stashTipOnJenkinsPage'),
  recoverTipOnJenkinsPage: browser.i18n.getMessage('content_recoverTipOnJenkinsPage'),
}

export function addStashTipOnPage(container: HTMLElement | null) {
  if (!container) {
    return
  }

  const existRecoverElem = container.querySelector(`#${recoverTipId}`)
  // recover-tip 已存在，则移除
  if (existRecoverElem) {
    container.removeChild(existRecoverElem)
  }

  const existStashElem = container.querySelector(`#${stashTipId}`)
  // stash-tip 已存在，则不重复添加
  if (existStashElem) {
    return
  }

  const textP = document.createElement('p')
  textP.textContent = strings.stashTipOnJenkinsPage
  textP.setAttribute('style', 'font-size: smaller; color: #0b6aa2')

  const tipDiv = document.createElement('div')
  tipDiv.id = stashTipId
  tipDiv.setAttribute('style', 'float: right')
  tipDiv.appendChild(textP)

  container.appendChild(tipDiv)
}

export function addRecoverTipOnPage(container: HTMLElement | null) {
  if (!container) {
    return
  }

  const existStashElem = container.querySelector(`#${stashTipId}`)
  // stash-tip 已存在，则移除
  if (existStashElem) {
    container.removeChild(existStashElem)
  }

  const existRecoverElem = container.querySelector(`#${recoverTipId}`)
  // recover-tip 已存在，则不重复添加
  if (existRecoverElem) {
    return
  }

  const textP = document.createElement('p')
  textP.textContent = strings.recoverTipOnJenkinsPage
  textP.setAttribute('style', 'font-size: smaller; color: #0b6aa2')

  const tipDiv = document.createElement('div')
  tipDiv.id = recoverTipId
  tipDiv.setAttribute('style', 'float: right')
  tipDiv.appendChild(textP)

  container.appendChild(tipDiv)
}
