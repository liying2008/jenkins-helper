export interface Enc<T = any> {
  // 是否成功
  ok: boolean
  // 请求 URL
  url: string
  // 返回数据
  body?: T
  // 错误信息
  errMsg?: string
}
