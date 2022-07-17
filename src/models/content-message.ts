
export const CMD_GET_CONTENT_FEATURES = 'get_content_features'
export const CMD_GET_CURRENT_TAB = 'get_current_tab'
export const CMD_STASH_PARAMS = 'stash_params'
export const CMD_RECOVER_PARAMS = 'recover_params'

export interface ContentFeatures {
  enableParamsStashAndRecover: boolean
  enableParamNamesColor: boolean
  paramNamesColor: string
}

export class ContentMessage<T = any> {
  cmd: string
  data: T | null

  constructor(cmd: string, data: T | null = null) {
    this.cmd = cmd
    this.data = data
  }
}

export type ContentRespStatus = 'ok' | 'error'

export class ContentResp<T = any> {
  status: ContentRespStatus
  message: string
  data: T | null

  constructor(status: ContentRespStatus, message: string, data: T | null) {
    this.status = status
    this.message = message
    this.data = data
  }

  static fromObj(obj: Partial<ContentResp>) {
    const { status = 'ok', message = '', data = null } = obj
    return new this(status, message, data)
  }
}
