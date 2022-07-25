export function getMainPanelOffset() {
  const mainPanel = document.querySelector('#main-panel')
  if (!mainPanel) {
    return {
      top: 100,
      left: 400,
    }
  }
  return {
    top: (mainPanel as HTMLDivElement).offsetTop,
    left: (mainPanel as HTMLDivElement).offsetLeft,
  }
}
