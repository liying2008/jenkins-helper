
export const CMD_IS_ENABLE_STASH_AND_RECOVER = 'is_enable_stash_and_recover'
export const CMD_STASH_PARAMS = 'stash_params'
export const CMD_RECOVER_PARAMS = 'recover_params'

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
