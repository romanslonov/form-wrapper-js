import { FieldKeysCollection } from '../../src/core/FieldKeysCollection'

describe('FieldKeysCollection.ts', () => {
  it('should record field keys', () => {
    const fieldKeysCollection = new FieldKeysCollection()
    fieldKeysCollection.record(['a', 'b'])

    expect(fieldKeysCollection.all()).toEqual(['a', 'b'])
  })

  it('should check if field key is exists', () => {
    const fieldKeysCollection = new FieldKeysCollection()
    fieldKeysCollection.record(['a', 'b'])

    expect(fieldKeysCollection.has('a')).toBe(true)
    expect(fieldKeysCollection.has('b')).toBe(true)
    expect(fieldKeysCollection.has('c')).toBe(false)
  })

  it('should add field to the field keys array', () => {
    const fieldKeysCollection = new FieldKeysCollection()
    fieldKeysCollection.record(['a', 'b'])

    fieldKeysCollection.push('c')
    fieldKeysCollection.push('c')

    expect(fieldKeysCollection.all()).toEqual(['a', 'b', 'c'])
  })

  it('should clear all the field keys array', () => {
    const fieldKeysCollection = new FieldKeysCollection()
    fieldKeysCollection.record(['a', 'b'])

    fieldKeysCollection.clear()

    expect(fieldKeysCollection.all()).toEqual([])
  })

  it('should check if there is any field key', () => {
    const fieldKeysCollection = new FieldKeysCollection()

    expect(fieldKeysCollection.any()).toBe(false)

    fieldKeysCollection.record(['a', 'b'])

    expect(fieldKeysCollection.any()).toBe(true)
  })

  it('should unset field from the field keys array', () => {
    const fieldKeysCollection = new FieldKeysCollection()
    fieldKeysCollection.record(['a', 'b'])

    fieldKeysCollection.unset('a')

    expect(fieldKeysCollection.all()).toEqual(['b'])

    fieldKeysCollection.unset('c')

    expect(fieldKeysCollection.all()).toEqual(['b'])
  })
})
