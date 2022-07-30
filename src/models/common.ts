export interface Enc<T = any> {
  /** 是否成功 */
  ok: boolean
  /** 请求 URL */
  url: string
  /** 返回数据 */
  body?: T
  /** 错误信息 */
  errMsg?: string
}

/**
 * 数据加载状态
 */
export enum DataStatus {
  /** 无数据/初始值 */
  NoData,
  /** 加载中 */
  Loading,
  /** 加载完成（且有数据） */
  Loaded,
  /** 加载失败 */
  Failed,
}
