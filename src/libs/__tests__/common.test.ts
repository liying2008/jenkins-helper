import { describe, expect, it } from 'vitest'
import { addZeroForSingleDigit, isNullOrEmptyArray, isNullOrEmptyRecord, removeEnd } from '../common'

describe('test common', () => {
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

  it('show is null or empty record', () => {
    expect(isNullOrEmptyRecord(null)).toEqual(true)
    expect(isNullOrEmptyRecord(undefined)).toEqual(true)
    expect(isNullOrEmptyRecord({})).toEqual(true)
    expect(isNullOrEmptyRecord({ a: 1 })).toEqual(false)
  })
})
