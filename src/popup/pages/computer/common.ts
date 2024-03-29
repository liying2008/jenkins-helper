export function openNodesManager(jenkinsUrl: string) {
  browser.windows.create({
    url: `computers-manager.html?jenkins=${jenkinsUrl}`,
    type: 'popup',
    width: 1000,
    height: 800,
  }).then((window) => {
    // console.log('window', window)
  })
}

export enum ComputerStatus {
  All,
  Normal,
  Abnormal,
}
