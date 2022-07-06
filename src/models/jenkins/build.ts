export interface BuildCause {
  shortDescription: string
  url: string
}

export interface BuildParameter {
  hidden: boolean
  name: string
  value: unknown
}
