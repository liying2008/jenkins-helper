/**
 * 给只有一位数的前位补零
 */
export function addZeroForSingleDigit(i: number): string {
  if (i >= 0 && i <= 9) {
    return `0${i}`
  } else {
    return i.toString()
  }
}

/**
 * 去除字符串末尾的指定字符串
 * @param s 字符串
 * @param end 字符串结尾
 * @returns 去除结尾的字符串
 */
export function removeEnd(s: string, end: string): string {
  if (!end) {
    return s
  }
  let result = s
  while (result.endsWith(end)) {
    result = result.substring(0, result.length - end.length)
  }
  return result
}

/**
 * 判断数组是否为空/undefined/null
 * @param arr 数组
 * @returns 数组是否为空/null/undefined
 */
export function isNullOrEmptyArray(arr: any[] | null | undefined): boolean {
  return arr === null || arr === undefined || arr.length === 0
}

/**
 * 判断字符串是否为空/undefined/null
 * @param s 字符串
 * @returns 字符串是否为空/null/undefined
 */
export function isNullOrEmptyString(s: string | null | undefined): boolean {
  return s === null || s === undefined || s.length === 0
}
