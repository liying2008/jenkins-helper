
export type MessageColor = 'success' | 'info' | 'warning' | 'error' | 'primary' | 'accent'

export class SnackbarData {
  show: boolean = false
  message: string = ''
  color: MessageColor = 'success'
  bottom: boolean = false
  centered: boolean = false
  left: boolean = false
  right: boolean = false
  top: boolean = false

  static empty() {
    return new SnackbarData()
  }

  static builder() {
    return new SnackbarBuilder()
  }
}

export class SnackbarBuilder {
  private _message: string = ''
  private _color: MessageColor = 'success'
  private _bottom: boolean = false
  private _centered: boolean = false
  private _left: boolean = false
  private _right: boolean = false
  private _top: boolean = false

  message(message: string) {
    this._message = message
    return this
  }

  color(color: MessageColor) {
    this._color = color
    return this
  }

  bottom() {
    this._bottom = true
    return this
  }

  centered() {
    this._centered = true
    return this
  }

  left() {
    this._left = true
    return this
  }

  right() {
    this._right = true
    return this
  }

  top() {
    this._top = true
    return this
  }

  build() {
    const snackbarData = SnackbarData.empty()
    snackbarData.message = this._message
    snackbarData.color = this._color
    snackbarData.bottom = this._bottom
    snackbarData.centered = this._centered
    snackbarData.left = this._left
    snackbarData.right = this._right
    snackbarData.top = this._top
    snackbarData.show = true
    return snackbarData
  }
}
