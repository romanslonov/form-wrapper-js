import { Errors } from '../../../src/core/validation/Errors'

describe('Errors.ts', () => {
  const errorsData = {
    email: ['Error1'],
    name: ['Error1', 'Error2'],
  }

  it('should returns all the errors array', () => {
    const errors = new Errors(errorsData)

    expect(errors.all()).toEqual(errorsData)
  })

  it('should record the errors', () => {
    const errors = new Errors()

    errors.record(errorsData)

    expect(errors.all()).toEqual(errorsData)
  })

  it('should get the errors array of specific key or default value', () => {
    const errors = new Errors(errorsData)

    errors.get('name')

    expect(errors.get('name')).toEqual(errorsData.name)
    expect(errors.get('other', null)).toEqual(null)
    expect(errors.get('other', [])).toEqual([])
  })

  it('should delete a key from the errors object', () => {
    const errors = new Errors(errorsData)

    errors.unset('name')

    expect(errors.all()).not.toHaveProperty('name')
  })

  it('should check if there is a key inside the errors array', () => {
    const errors = new Errors(errorsData)

    expect(errors.has('name')).toBeTruthy()
    expect(errors.has('other')).toBeFalsy()
  })

  it('should check if there any error in errors array', () => {
    const errors = new Errors()

    expect(errors.any()).toBeFalsy()

    errors.record(errorsData)

    expect(errors.any()).toBeTruthy()
  })

  it('should clear all the errors array', () => {
    const errors = new Errors(errorsData)

    errors.clear()

    expect(errors.all()).toEqual({})
  })

  it('should returns the first error of the field key or default value', () => {
    const errors = new Errors(errorsData)

    expect(errors.getFirst('name')).toEqual('Error1')
    expect(errors.getFirst('other1')).toEqual(null)
    expect(errors.getFirst('other2', 'not error')).toEqual('not error')
  })

  it('should append error to the errors stack', () => {
    const errors = new Errors(errorsData)

    errors.push({ name: ['another error'], is_developer: ['boolean'] })
    expect(errors.get('name')).toEqual(['another error'])
    expect(errors.get('is_developer')).toEqual(['boolean'])
    expect(errors.get('email')).toEqual(['Error1'])
  })
})
