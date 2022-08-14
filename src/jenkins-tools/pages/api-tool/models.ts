export class QueryParam {
  // 参数名
  name: string = ''
  // 参数值
  value: string = ''
  // 参数是否启用
  enabled: boolean = false
  // 是否是初始状态，参数首次创建为初始状态，开始输入之后取消初始状态
  initialState: boolean = true
}

export class AuthorizationEntity {
  // Jenkins username
  username: string | null = null
  // Jenkins password or api token
  password: string | null = null
  // Jenkins 是否启用了 CSRF 保护
  crumbFlag: boolean = true
}

export class Header {
  // Header Name
  name: string = ''
  // Header Value
  value: string = ''
  // Header 是否启用
  enabled: boolean = false
  // 是否是初始状态，Header 首次创建为初始状态，开始输入之后取消初始状态
  initialState: boolean = true
}
