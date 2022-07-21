import { describe, expect, it } from 'vitest'
import { addZeroForSingleDigit, isNullOrEmptyArray, isNullOrEmptyString, removeEnd } from '../common'

describe('Test Common', () => {
  it('show add zero for single digit', () => {
    expect(addZeroForSingleDigit(1)).toEqual('01')
    expect(addZeroForSingleDigit(10)).toEqual('10')
  })

  it('should remove ends', () => {
    const s1 = 'asdfghrer/tr///'
    const end1 = '/'
    expect(removeEnd(s1, end1)).toEqual('asdfghrer/tr')

    const s2 = 'asdfghrer/tr///'
    const end2 = '/\\'
    expect(removeEnd(s2, end2)).toEqual('asdfghrer/tr///')

    const s3 = 'asdfghrer/tr///'
    const end3 = ''
    expect(removeEnd(s3, end3)).toEqual('asdfghrer/tr///')
  })

  it('show is null or empty array', () => {
    expect(isNullOrEmptyArray(null)).toEqual(true)
    expect(isNullOrEmptyArray(undefined)).toEqual(true)
    expect(isNullOrEmptyArray([])).toEqual(true)
    expect(isNullOrEmptyArray([1, 2, 3])).toEqual(false)
  })

  it('show is null or empty string', () => {
    expect(isNullOrEmptyString(null)).toEqual(true)
    expect(isNullOrEmptyString(undefined)).toEqual(true)
    expect(isNullOrEmptyString('')).toEqual(true)
    expect(isNullOrEmptyString('asdf')).toEqual(false)
  })
})
