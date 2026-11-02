declare const __DEV__: boolean

declare module '*.svg?raw' {
  const content: string
  export default content
}

declare module '*.vue' {
  const component: any
  export default component
}
