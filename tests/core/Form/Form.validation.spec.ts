import { mocked } from 'ts-jest/utils'
import { Form } from '../../../src/core/Form'
import { FieldValidationError } from '../../../src/errors/FieldValidationError'
import * as utils from '../../../src/utils'

jest.mock('../../../src/core/validation/Errors')
jest.mock('../../../src/core/FieldKeysCollection')

describe('Form.validation.ts', () => {
  it('should validate specific field', async () => {
    const form = new Form({
      name: {
        label: 'The Name',
        rules: [() => true],
        value: 'a',
      },
    })

    form.$validator.validateField = jest.fn(() =>
      Promise.reject(new FieldValidationError(['error']))
    )

    await form.$validateField('name')

    expect(form.$errors.unset).toHaveBeenCalledTimes(1)
    expect(form.$errors.unset).toBeCalledWith('name')
    expect(form.$errors.push).toHaveBeenCalledTimes(1)
    expect(form.$errors.push).toBeCalledWith({
      name: ['error'],
    })
    expect(form.$validator.validateField).toBeCalledWith(
      form.$rules.get('name'),
      { label: 'The Name', value: 'a', key: 'name' },
      form
    )

    mocked(form.$errors.push).mockClear()
    mocked(form.$errors.unset).mockClear()

    form.$validator.validateField = jest.fn(() => Promise.resolve())

    await form.$validateField('name')
    expect(form.$errors.push).toHaveBeenCalledTimes(0)
    expect(form.$errors.unset).toHaveBeenCalledTimes(1)
    expect(form.$errors.unset).toBeCalledWith('name')
  })

  it('should warn if trying to validate field and the field is not exists', async () => {
    const warnSpy = jest.spyOn(utils, 'warn')

    const form = new Form({ name: null })

    await form.$validateField('first_name')

    expect(warnSpy).toHaveBeenCalledTimes(1)
    warnSpy.mockClear()
  })

  it('should validate all the fields of the form', async () => {
    const form = new Form({
      last_name: {
        rules: [() => false],
        value: null,
      },
      name: {
        rules: [() => true],
        value: null,
      },
    })

    form.$validateField = jest
      .fn()
      .mockReturnValueOnce(Promise.resolve())
      .mockReturnValueOnce(Promise.resolve())

    await form.$validateAll()

    expect(form.$validateField).toHaveBeenNthCalledWith(1, 'last_name')
    expect(form.$validateField).toHaveBeenNthCalledWith(2, 'name')
  })

  it('should call to validate specific field or all the fields', async () => {
    const form = new Form({ first_name: null })

    form.$validateAll = jest.fn()
    form.$validateField = jest.fn()

    await form.$validate()

    expect(form.$validateAll).toHaveBeenCalledTimes(1)
    expect(form.$validateField).toHaveBeenCalledTimes(0)

    mocked(form.$validateAll).mockClear()
    mocked(form.$validateField).mockClear()

    await form.$validate('first_name')

    expect(form.$validateAll).toHaveBeenCalledTimes(0)
    expect(form.$validateField).toHaveBeenCalledTimes(1)
  })

  it('should bubble up errors that are not FieldValidationError on validateField method', async () => {
    const form = new Form({ name: null })

    form.$validator.validateField = jest.fn(() => {
      throw new Error('error')
    })

    expect.assertions(2)

    try {
      await form.$validateField('name')
    } catch (e) {
      expect(e).toBeInstanceOf(Error)
      expect(e.message).toBe('error')
    }
  })

  it('should checks if validating the field', () => {
    const form = new Form({ name: null })

    form.$validator.$validating.has = jest.fn(() => true)

    expect(form.$isValidating('name')).toBe(true)
    expect(form.$validator.$validating.has).toHaveBeenCalledWith('name')

    form.$validator.$validating.has = jest.fn(() => false)

    expect(form.$isValidating('name')).toBe(false)
    expect(form.$validator.$validating.has).toHaveBeenCalledWith('name')
  })

  it('should check if the whole form is on validation mode', () => {
    const form = new Form({ name: null })

    form.$validator.$validating.any = jest.fn(() => true)

    expect(form.$isValidating()).toBe(true)
    expect(form.$validator.$validating.any).toHaveBeenCalledTimes(1)

    form.$validator.$validating.any = jest.fn(() => false)

    expect(form.$isValidating()).toBe(false)
    expect(form.$validator.$validating.any).toHaveBeenCalledTimes(1)
  })

  it('should warn if the field is not exists in the initial fields', () => {
    const warnSpy = jest.spyOn(utils, 'warn')

    const form = new Form({ name: null })

    form.$isValidating('loYodea')

    expect(warnSpy).toHaveBeenCalledTimes(1)
    warnSpy.mockClear()
  })
})
