export class QueryParam {
  // 参数 Key
  key: string = ''
  // 参数 Value
  value: string = ''
  // 参数是否启用
  enable: boolean = false
  // 是否是初始状态，参数首次创建为初始状态，开始输入之后取消初始状态
  initialState: boolean = true
}

export class AuthorizationEntity {
  // Jenkins username
  username: string | null = null
  // Jenkins password or api token
  password: string | null = null
  // 是否使用 crumb 标记
  useCrumb: boolean = true
}

export class Header {
  // Header Key
  key: string = ''
  // Header Value
  value: string = ''
  // Header 是否启用
  enable: boolean = false
  // 是否是初始状态，Header 首次创建为初始状态，开始输入之后取消初始状态
  initialState: boolean = true
}
