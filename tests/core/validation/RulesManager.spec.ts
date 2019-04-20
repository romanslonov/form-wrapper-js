import { Rule } from '../../../src/core/validation/Rule'
import { RulesManager } from '../../../src/core/validation/RulesManager'
import defaultOptions from '../../../src/default-options'
import generateMessageFunction from '../../../src/helpers/generateMessageFunction'
import { IValidationOptions } from '../../../src/types/Options'

jest.mock('../../../src/helpers/generateMessageFunction', () => {
  return {
    __esModule: true,
    default: jest.fn(() => () => {}),
  }
})

describe('RulesManager.ts', () => {
  let defaultValidationOptions: IValidationOptions
  const rules = {
    first_name: [() => true],
    is_developer: [
      {
        message: ({ label, value }) =>
          `${label} is invalid. the ${value} is incorrect`,
        passes: ({ value }) => value,
      },
      {
        passes: () => Promise.resolve(),
        returnsPromise: true,
      },
      {
        passes: () => Promise.reject(),
        returnsPromise: true,
      },
    ],
    last_name: [
      {
        message: 'Invalid',
        passes: () => false,
      },
      () => true,
    ],
  }

  beforeEach(() => {
    defaultValidationOptions = { ...defaultOptions.validation }
  })

  it('should construct correctly', () => {
    const buildFieldRule = jest.spyOn(RulesManager.prototype, 'buildFieldRules')

    const rulesManager = new RulesManager(
      rules,
      defaultValidationOptions.defaultMessage
    )

    expect(rulesManager.get('first_name')).toHaveLength(1)
    expect(rulesManager.get('last_name')).toHaveLength(2)
    expect(rulesManager.get('is_developer')).toHaveLength(3)

    expect(generateMessageFunction).toHaveBeenNthCalledWith(
      1,
      defaultValidationOptions.defaultMessage
    )

    expect(buildFieldRule).toHaveBeenCalledTimes(3)

    let callNumber: number = 1
    Object.keys(rulesManager.all()).forEach(fieldKey => {
      expect(buildFieldRule).toHaveBeenNthCalledWith(
        callNumber,
        fieldKey,
        rules[fieldKey]
      )
      callNumber++
    })
  })

  it('should determine if has rule', () => {
    const rulesManager = new RulesManager(
      rules,
      defaultValidationOptions.defaultMessage
    )

    expect(rulesManager.has('first_name')).toBe(true)
    expect(rulesManager.has('last_name')).toBe(true)
    expect(rulesManager.has('is_developer')).toBe(true)
    expect(rulesManager.has('other')).toBe(false)
  })

  it('should get the rules of the field key that requested', () => {
    const rulesManager = new RulesManager(
      rules,
      defaultValidationOptions.defaultMessage
    )

    expect(rulesManager.get('first_name')).toBeInstanceOf(Array)
    expect(rulesManager.get('first_name')).toHaveLength(1)
    expect(rulesManager.get('last_name')).toBeInstanceOf(Array)
    expect(rulesManager.get('last_name')).toHaveLength(2)
    expect(rulesManager.get('other')).toBeInstanceOf(Array)
    expect(rulesManager.get('other')).toHaveLength(0)
  })

  it('should returns all the fields rules', () => {
    const rulesManager = new RulesManager(
      rules,
      defaultValidationOptions.defaultMessage
    )

    const fieldsRules = rulesManager.all()

    expect(Object.keys(fieldsRules)).toEqual([
      'first_name',
      'is_developer',
      'last_name',
    ])

    Object.keys(fieldsRules).forEach(fieldKey => {
      expect(fieldsRules[fieldKey]).toBeArray()
    })
  })

  it('should build field rules correctly', () => {
    const rulesManager = new RulesManager(
      rules,
      defaultValidationOptions.defaultMessage
    )

    const buildFromRawValueSpy = jest.spyOn(Rule, 'buildFromRawValue')

    const newRules = [
      () => true,
      {
        message: 'a',
        passes: () => false,
      },
    ]

    rulesManager.buildFieldRules('name', newRules)

    expect(buildFromRawValueSpy).toHaveBeenCalledTimes(2)
    expect(rulesManager.get('name')).toHaveLength(2)

    let callNumber: number = 1

    rulesManager.get('name').forEach((rule, index) => {
      expect(rule).toBeInstanceOf(Rule)
      expect(buildFromRawValueSpy).toHaveBeenNthCalledWith(
        callNumber,
        newRules[index],
        expect.toBeFunction()
      )

      callNumber++
    })
  })

  it('should unset a field rules', () => {
    const rulesManager = new RulesManager(
      rules,
      defaultValidationOptions.defaultMessage
    )

    rulesManager.unset('first_name')

    expect(rulesManager.has('first_name')).toBe(false)
  })
})
