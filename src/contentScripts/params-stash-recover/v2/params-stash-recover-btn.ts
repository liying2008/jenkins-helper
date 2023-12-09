const stashBtnId = 'jenkins-helper-stash-parameters'
const recoverBtnId = 'jenkins-helper-recover-parameters'

const strings = {
  stashParameters: browser.i18n.getMessage('content_stashParameters'),
  recoverParameters: browser.i18n.getMessage('content_recoverParameters'),
}

function createStashBtnForBuildPage() {
  /*
  <span class="yui-button yui-submit-button submit-button primary" name="Stash">
    <span class="first-child">
      <button id="jenkins-helper-stash-parameters" type="button" tabindex="10">Stash Parameters</button>
    </span>
  </span>
  */
  const btn = document.createElement('button')
  btn.id = stashBtnId
  btn.type = 'button'
  btn.tabIndex = 10
  btn.textContent = strings.stashParameters

  const spanInner = document.createElement('span')
  spanInner.setAttribute('class', 'first-child')
  spanInner.appendChild(btn)

  const spanOuter = document.createElement('span')
  spanOuter.setAttribute('class', 'yui-button yui-submit-button submit-button primary')
  spanOuter.setAttribute('name', 'Stash')
  spanOuter.appendChild(spanInner)

  return spanOuter
}

function createRecoverBtnForBuildPage() {
  /*
  <span class="yui-button yui-submit-button submit-button primary" name="Recover">
    <span class="first-child">
      <button id="jenkins-helper-recover-parameters" type="button" tabindex="11">Recover Parameters</button>
    </span>
  </span>
  */
  const btn = document.createElement('button')
  btn.id = recoverBtnId
  btn.type = 'button'
  btn.tabIndex = 11
  btn.textContent = strings.recoverParameters

  const spanInner = document.createElement('span')
  spanInner.setAttribute('class', 'first-child')
  spanInner.appendChild(btn)

  const spanOuter = document.createElement('span')
  spanOuter.setAttribute('class', 'yui-button yui-submit-button submit-button primary')
  spanOuter.setAttribute('name', 'Recover')
  spanOuter.appendChild(spanInner)

  return spanOuter
}

export function addBtnsForBuildPage(container: HTMLElement) {
  const btnsContainer = document.createElement('span')
  btnsContainer.setAttribute('style', 'float: right')
  btnsContainer.appendChild(createStashBtnForBuildPage())
  btnsContainer.appendChild(createRecoverBtnForBuildPage())
  container.appendChild(btnsContainer)
}

/////////////////////////////////////////////////////////////////////////////

function createStashDivForParamsPage() {
  /*
  <div class="tr form-group">
    <div>
      <span style="float: right">
        <span class="yui-button yui-submit-button submit-button primary" name="Stash">
          <span class="first-child">
            <button id="jenkins-helper-stash-parameters" type="button" tabindex="10">Stash Parameters</button>
          </span>
        </span>
      </span>
    </div>
  </div>
  */
  const btn = document.createElement('button')
  btn.id = stashBtnId
  btn.type = 'button'
  btn.tabIndex = 10
  btn.textContent = strings.stashParameters

  const spanL1 = document.createElement('span')
  spanL1.setAttribute('class', 'first-child')
  spanL1.appendChild(btn)

  const spanL2 = document.createElement('span')
  spanL2.setAttribute('class', 'yui-button yui-submit-button submit-button primary')
  spanL2.setAttribute('name', 'Stash')
  spanL2.appendChild(spanL1)

  const spanL3 = document.createElement('span')
  spanL3.setAttribute('style', 'float: right')
  spanL3.appendChild(spanL2)

  const divL1 = document.createElement('div')
  divL1.appendChild(spanL3)

  const divL2 = document.createElement('div')
  divL2.setAttribute('class', 'tr form-group')
  divL2.appendChild(divL1)

  return divL2
}

export function addBtnForParamsPage(container: HTMLElement) {
  container.appendChild(createStashDivForParamsPage())
}
