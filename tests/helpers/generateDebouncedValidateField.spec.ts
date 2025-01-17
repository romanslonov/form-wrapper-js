import generateDebouncedValidateField from '../../src/helpers/generateDebouncedValidateField'
import * as utils from '../../src/utils'
import { Form } from '../../src/core/Form'

jest.mock('../../src/utils', () => {
  return {
    debounce: jest.fn(() => 'example'),
    isObject: () => false,
  }
})

describe('generateDebouncedValidateField.ts', () => {
  it('should generate a debounced version of validate field method', () => {
    let form = new Form({ name: null })

    Function.prototype.bind = jest.fn(function() {
      return this
    })
    form.$options.validation.debouncedValidateFieldTime = 500

    let result = generateDebouncedValidateField(form)

    expect(result).toBe('example')
    expect(utils.debounce).toHaveBeenLastCalledWith(form.$validateField, 500)
  })
})
