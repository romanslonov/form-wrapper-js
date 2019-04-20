import { mocked } from 'ts-jest/utils'
import { Rule } from '../../../src/core/validation/Rule'
import generateMessageFunction from '../../../src/helpers/generateMessageFunction'
import { Form, RuleValidationError } from '../../../src/index'
import { MessageFunction, PassesFunction } from '../../../src/types/Errors'
import { IField } from '../../../src/types/Field'
import { IRawRule } from '../../../src/types/Validator'

jest.mock('../../../src/helpers/generateMessageFunction', () => ({
  __esModule: true,
  default: jest.fn(() => 'generateMessageFunction fake value'),
}))

describe('Rule.ts', () => {
  const fakeDefaultMessage: MessageFunction = () => 'example'
  const fakeForm: Form = new Form({})
  const fakeField: IField = { key: 'a', label: 'a', value: 'a' }

  beforeEach(() => {
    mocked(generateMessageFunction).mockClear()
  })

  it('should construct correctly', () => {
    const passes: PassesFunction = () => new Promise(resolve => resolve())
    const message: MessageFunction = () => 'Good!'
    const rawValue = () => true

    const rule = new Rule(passes, message, rawValue)

    expect(rule.passes).toBe(passes)
    expect(rule.message).toBe(message)
    expect(rule.$rawValue).toBe(rawValue)
  })

  it('should build Rule class with basic function', () => {
    const rawValue = jest.fn(() => false)

    const rule = Rule.buildFromRawValue(rawValue, fakeDefaultMessage)

    expect(generateMessageFunction).toHaveBeenCalledTimes(0)

    expect(rule.passes).toBe(rawValue)
    expect(rule.message).toBe(fakeDefaultMessage)

    expect(rule.$rawValue).toBe(rawValue)
  })

  it('should build Rule class with RawRule object that passes prop NOT returns promise', () => {
    const passes = jest.fn(() => true)
    const rawValue: IRawRule = {
      passes,
    }

    const rule = Rule.buildFromRawValue(rawValue, fakeDefaultMessage)

    expect(generateMessageFunction).toHaveBeenCalledTimes(0)

    expect(rule.passes).toBe(passes)
    expect(rule.message).toBe(fakeDefaultMessage)

    expect(rule.$rawValue).toBe(rawValue)
  })

  it('should build Rule class and generate a message from the message prop that provided', () => {
    const message = 'this is a message'
    const rawValue: IRawRule = {
      message,
      passes: () => true,
    }

    const rule = Rule.buildFromRawValue(rawValue, fakeDefaultMessage)

    expect(generateMessageFunction).toHaveBeenCalledTimes(1)
    expect(generateMessageFunction).toBeCalledWith(message)
    expect(rule.message).toBe('generateMessageFunction fake value')

    expect(rule.$rawValue).toBe(rawValue)
  })

  it('should validate with the passes function that`s returns true', async () => {
    const passes = jest.fn(() => true)

    const rawValue: IRawRule = {
      passes,
    }

    const rule = Rule.buildFromRawValue(rawValue, fakeDefaultMessage)

    await expect(rule.validate(fakeField, fakeForm)).resolves

    expect(passes).toHaveBeenCalledTimes(1)
    expect(passes).toHaveBeenCalledWith(fakeField, fakeForm)
  })

  it('should validate with the passes function that`s returns false', async () => {
    const passes = jest.fn(() => false)

    const rawValue: IRawRule = {
      passes,
    }

    const rule = Rule.buildFromRawValue(rawValue, fakeDefaultMessage)

    expect.assertions(3)

    try {
      await rule.validate(fakeField, fakeForm)
    } catch (e) {
      expect(e).toBeInstanceOf(RuleValidationError)
    }

    expect(passes).toHaveBeenCalledTimes(1)
    expect(passes).toHaveBeenCalledWith(fakeField, fakeForm)
  })

  it('should validate with passes function that returns Promise', async () => {
    const promise = Promise.resolve()
    const passes = jest.fn(() => promise)

    const rawValue: IRawRule = {
      passes,
    }

    const rule = Rule.buildFromRawValue(rawValue, fakeDefaultMessage)

    await expect(rule.validate(fakeField, fakeForm)).toBe(promise)

    expect(passes).toHaveBeenCalledTimes(1)
    expect(passes).toHaveBeenCalledWith(fakeField, fakeForm)
  })

  it('should validate even if the returns value of passes is not boolean or promise', async () => {
    const passes = jest.fn(() => '')

    // @ts-ignore
    const rule = Rule.buildFromRawValue(passes, fakeDefaultMessage)

    expect.assertions(3)

    try {
      await rule.validate(fakeField, fakeForm)
    } catch (e) {
      expect(e).toBeInstanceOf(RuleValidationError)
    }

    expect(passes).toHaveBeenCalledTimes(1)
    expect(passes).toHaveBeenCalledWith(fakeField, fakeForm)
  })
})
