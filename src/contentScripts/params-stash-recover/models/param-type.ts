// 暂存的参数的属性
export interface ParamProp {
  name?: string
  type?: string
  value: string | boolean
}


export interface StashedParams {
  [pname: string]: ParamProp
}
