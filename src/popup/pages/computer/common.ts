export function openNodesManager(jenkinsUrl: string) {
  browser.windows.create({
    url: `computers_manager.html?jenkins=${jenkinsUrl}`,
    type: 'popup',
    width: 1000,
    height: 800,
  }).then((window) => {
    // console.log('window', window)
  })
}
