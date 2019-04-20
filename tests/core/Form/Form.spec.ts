import { FieldKeysCollection } from '../../../src/core/FieldKeysCollection'
import { Form } from '../../../src/core/Form'
import { FormCollection } from '../../../src/core/FormCollection'
import { InterceptorManager } from '../../../src/core/InterceptorManager'
import { Errors } from '../../../src/core/validation/Errors'
import { RulesManager } from '../../../src/core/validation/RulesManager'
import { Validator } from '../../../src/core/validation/Validator'
import defaultOptionsSource from '../../../src/default-options'
import generateDebouncedValidateField from '../../../src/helpers/generateDebouncedValidateField'
import generateOptions from '../../../src/helpers/generateOptions'
import * as utils from '../../../src/utils'

jest.mock('../../../src/core/validation/Errors')
jest.mock('../../../src/core/validation/Validator')
jest.mock('../../../src/core/validation/RulesManager')
jest.mock('../../../src/core/FormCollection')
jest.mock('../../../src/core/FieldKeysCollection')
jest.mock('../../../src/helpers/generateDebouncedValidateField', () => {
  return {
    __esModule: true,
    default: jest.fn(() => 'fakeResponse'),
  }
})

describe('Form.ts', () => {
  interface IFormData {
    first_name: string | null
    last_name: string | null
    is_developer: boolean
  }

  const data: IFormData = {
    first_name: null,
    is_developer: false,
    last_name: null,
  }

  const defaultOptions = Object.assign({}, defaultOptionsSource)

  beforeEach(() => {
    Validator.prototype.validateField = jest.fn(() => Promise.resolve())
  })

  it('should init correctly', () => {
    const rulesArray = [() => true]
    const isDeveloperRulesArray = [() => false]

    const assignOptionsSpy = jest.spyOn(Form.prototype, '$assignOptions')
    const uniqueIdSpy = jest.spyOn(utils, 'uniqueId')

    const form = new Form({
      first_name: {
        label: 'Name',
        rules: rulesArray,
        value: 'Nevo',
      },
      is_developer: {
        extra: {
          options: [1, 0],
        },
        rules: isDeveloperRulesArray,
        value: false,
      },
      last_name: 'Golan',
    }) as Form & IFormData

    expect(form.first_name).toBe('Nevo')
    expect(form.last_name).toBe('Golan')
    expect(form.is_developer).toBe(false)
    expect(form.$labels).toEqual({
      first_name: 'Name',
      is_developer: 'Is developer',
      last_name: 'Last name',
    })
    expect(form.$extra).toEqual({
      first_name: {},
      is_developer: {
        options: [1, 0],
      },
      last_name: {},
    })

    expect(uniqueIdSpy).toHaveBeenCalledTimes(1)
    expect(form.$id).toBe(uniqueIdSpy.mock.results[0].value)

    expect(RulesManager).toHaveBeenCalledWith(
      {},
      defaultOptions.validation.defaultMessage
    )

    expect(Validator).toHaveBeenCalledWith(defaultOptions.validation)
    expect(Errors).toHaveBeenCalled()
    expect(FieldKeysCollection).toHaveBeenCalled()
    expect(form.$interceptors.beforeSubmission).toBeInstanceOf(
      InterceptorManager
    )
    expect(form.$interceptors.submissionComplete).toBeInstanceOf(
      InterceptorManager
    )
    expect(assignOptionsSpy).toHaveBeenCalled()
  })

  it('should access the form props', () => {
    const form = new Form({
      first_name: 'Nevo',
      last_name: 'Golan',
    }) as Form & IFormData

    expect(form.first_name).toBe('Nevo')
    expect(form.last_name).toBe('Golan')
  })

  it('should assign options to the form', () => {
    const form = new Form(data) as Form & IFormData

    expect(form.$options).toEqual(defaultOptions)
    expect(form.$options.successfulSubmission.clearErrors).toBe(true)

    const newOptions = {
      successfulSubmission: { clearErrors: false },
    }

    form.$assignOptions(newOptions)

    expect(form.$options).toEqual(generateOptions(defaultOptions, newOptions))
    expect(generateDebouncedValidateField).toHaveBeenLastCalledWith(form)
    expect(form.$debouncedValidateField).toBe('fakeResponse')
  })

  it('should returns the values on call', () => {
    const form = new Form(data) as Form & { [key: string]: any }

    form.first_name = 'Nevo'
    form.last_name = 'Golan'

    form.not_real_prop = 'Somthing'

    expect(form.$values()).toEqual({
      ...data,
      first_name: 'Nevo',
      last_name: 'Golan',
    })
  })

  it('should call values on FormCollection if the field is FormCollection', () => {
    FormCollection.prototype.values = jest.fn(() => [{}])

    const form = new Form({
      emails: new FormCollection({
        email: null,
        type: null,
      }),
      name: null,
    }) as Form & { [key: string]: any }

    const values = form.$values()

    expect(form.emails.values).toHaveBeenCalledTimes(1)
    expect(values).toEqual({
      emails: [{}],
      name: null,
    })
  })

  it('should return form values as FormData object', () => {
    const form = new Form(data) as Form & { [key: string]: any }

    form.first_name = 'Nevo'
    form.last_name = null
    form.is_developer = false

    form.not_real_prop = 'Somthing'

    const formData = form.$valuesAsFormData()

    expect(formData).toBeInstanceOf(FormData)
    expect(formData.get('first_name')).toBe('Nevo')
    expect(formData.has('last_name')).toBe(false)
    expect(formData.has('is_developer')).toBe(false)
    expect(formData.has('not_real_prop')).toBe(false)
  })

  it('should return form values as JSON', () => {
    const form = new Form(data) as Form & { [key: string]: any }

    form.first_name = 'Nevo'
    form.last_name = null
    form.is_developer = false

    form.not_real_prop = 'Somthing'

    const valueAsJson = form.$valuesAsJson()

    expect(valueAsJson).toBe(JSON.stringify(form.$values()))
  })

  it('should resetValues the values of the form', () => {
    const form = new Form(data) as Form & IFormData

    form.first_name = 'Nevo'
    form.last_name = 'Golan'

    form.$resetValues()

    expect(form.$values()).toEqual(data)
  })

  it('should fill the form with new values', () => {
    const form = new Form(data) as Form & IFormData

    const newData = {
      first_name: 'Nevo',
      last_name: 'Golan',
      not_real_prop: 'Somthing',
    }

    form.$fill(newData)

    expect(form.$values()).toEqual(
      Object.assign({}, data, {
        first_name: 'Nevo',
        last_name: 'Golan',
      })
    )
  })

  it('should be able to fill the form with FormCollection property', () => {
    const emailsValues = [
      {
        email: 'nevos@gmail.com',
        type: 1,
      },
    ]

    const mockValues = {
      emails: emailsValues,
      name: 'Nevo',
    }

    const form = new Form({
      emails: new FormCollection({
        email: null,
        type: null,
      }),
      name: null,
    }) as Form & { [key: string]: any }

    form.$fill(mockValues)

    expect(form.emails.fill).toHaveBeenCalledWith(emailsValues)
    expect(form.name).toBe('Nevo')
  })

  it('should change the defaultOptions options of the Form', () => {
    Form.defaults.options.validation.defaultMessage = ({ label, value }) =>
      `${label}: ${value}`
    Form.defaults.options.successfulSubmission.clearErrors = false
    Form.defaults.options.successfulSubmission.resetValues = false

    const form = new Form(data)

    expect(
      // @ts-ignore
      form.$options.validation.defaultMessage(
        { label: 'a', value: 'b', key: 'c' },
        form
      )
    ).toEqual('a: b')
    expect(form.$options.successfulSubmission.clearErrors).toBe(false)
    expect(form.$options.successfulSubmission.resetValues).toBe(false)
  })

  it('should assign defaultOptions to the form', () => {
    Form.assignDefaultOptions({
      successfulSubmission: {
        clearErrors: false,
        resetValues: false,
      },
      validation: {
        defaultMessage: ({ label, value }) => `${label}: ${value}`,
      },
    })

    const form = new Form(data)

    expect(
      // @ts-ignore
      form.$options.validation.defaultMessage(
        { label: 'a', value: 'b', key: 'c' },
        form
      )
    ).toEqual('a: b')
    expect(form.$options.successfulSubmission.clearErrors).toBe(false)
    expect(form.$options.successfulSubmission.resetValues).toBe(false)
  })

  it('should determine if field is dirty', () => {
    const form = new Form(data) as Form & IFormData

    form.first_name = 'something else'

    expect(form.$isFieldDirty('first_name')).toBe(true)
    expect(form.$isFieldDirty('last_name')).toBe(false)
  })

  it('should warn if field key that passed to isDirtyField is not exists', () => {
    const warnMock = jest.spyOn(utils, 'warn')

    const form = new Form({ name: null })

    form.$isFieldDirty('some_key')

    expect(warnMock).toHaveBeenCalledTimes(1)
  })

  it('should run isFieldDirty (argument passes to "isDirty")', () => {
    const form = new Form(data) as Form & IFormData

    form.$isFieldDirty = jest.fn(() => false)

    const res = form.$isDirty('first_name')
    expect(form.$isFieldDirty).toHaveBeenCalledWith('first_name')
    expect(res).toBe(false)
  })

  it('should determine if the whole form is dirty or not', () => {
    const form = new Form(data) as Form & IFormData

    expect(form.$isDirty()).toBe(false)

    form.last_name = 'somthing else'

    expect(form.$isDirty()).toBe(true)
  })

  it('should reset all the form state', () => {
    const form = new Form(data)

    form.$resetValues = jest.fn()

    form.$reset()

    expect(form.$resetValues).toHaveBeenCalledTimes(1)
    expect(form.$errors.clear).toHaveBeenCalledTimes(1)
    expect(form.$touched.clear).toHaveBeenCalledTimes(1)
  })
})
