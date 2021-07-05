export enum MessageColor {
  Success = 'success',
  Info = 'info',
  Warning = 'warning',
  Error = 'error',
  Primary = 'primary',
  Accent = 'accent',
}

export class SnackbarData {
  show: boolean = false
  message: string = ''
  color: MessageColor = MessageColor.Success

  static empty() {
    return new SnackbarData()
  }
}
