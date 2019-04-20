import { Form } from '../../src/core/Form'
import generateDebouncedValidateField from '../../src/helpers/generateDebouncedValidateField'
import * as utils from '../../src/utils'

jest.mock('../../src/utils', () => {
  return {
    debounce: jest.fn(() => 'example'),
    isObject: () => false,
    uniqueId: () => '123',
  }
})

describe('generateDebouncedValidateField.ts', () => {
  it('should generate a debounced version of validate field method', () => {
    // Mock it just to quickly resolve a problem with the Form constructor
    // and the mock of the utils.
    Form.prototype.$addFields = jest.fn()

    const form = new Form({ name: null })

    Function.prototype.bind = jest.fn(function() {
      return this
    })
    form.$options.validation.debouncedValidateFieldTime = 500

    const result = generateDebouncedValidateField(form)

    expect(result).toBe('example')
    expect(utils.debounce).toHaveBeenLastCalledWith(form.$validateField, 500)
  })
})
