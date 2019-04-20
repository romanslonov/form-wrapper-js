import { FieldValidationError } from '../../errors/FieldValidationError'
import { RuleValidationError } from '../../errors/RuleValidationError'
import { IField } from '../../types/Field'
import { IValidationOptions } from '../../types/Options'
import { FieldKeysCollection } from '../FieldKeysCollection'
import { Form } from '../Form'
import { Rule } from './Rule'

/**
 * Validator Class
 */
export class Validator {
  /**
   * Holds the current field that the validator is validating
   */
  public $validating: FieldKeysCollection

  /**
   * Validations options
   */
  private _options: IValidationOptions

  /**
   * Validator constructor.
   *
   * @param options
   */
  constructor(options: IValidationOptions) {
    this._options = { ...options }
    this.$validating = new FieldKeysCollection()
  }

  /**
   * validate specific field.
   *
   * @param rules
   * @param field
   * @param form
   */
  public async validateField(
    rules: Rule[],
    field: IField,
    form: Form
  ): Promise<any> {
    const { key } = field

    const messages: string[] = []
    let fieldRulesChain: Rule[] = Array.from(rules)

    this.$validating.push(key)

    while (fieldRulesChain.length) {
      const fieldRule = fieldRulesChain.shift()

      try {
        await fieldRule.validate(field, form)
      } catch (error) {
        if (!(error instanceof RuleValidationError)) {
          this.$validating.unset(key)

          return Promise.reject(error)
        }

        messages.push(fieldRule.message(field, form))

        if (this._options.stopAfterFirstRuleFailed) {
          fieldRulesChain = []
        }
      }
    }

    this.$validating.unset(key)

    return messages.length
      ? Promise.reject(new FieldValidationError(messages))
      : Promise.resolve(field)
  }
}
