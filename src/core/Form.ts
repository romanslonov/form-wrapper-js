import { Errors } from './Errors'
import { Validator } from './Validator'
import { FieldKeysCollection } from './FieldKeysCollection'
import { InterceptorManager } from './InterceptorManager'
import { RulesManager } from './RulesManager'
import { isObject, warn } from '../utils'
import generateDebouncedValidateField from '../helpers/generateDebouncedValidateField'
import generateDefaultLabel from '../helpers/generateDefaultLabel'
import generateOptions from '../helpers/generateOptions'
import defaultOptions from '../default-options'
import basicInterceptors from '../interceptors/index'
import { Field } from '../types/Field'
import { FormDefaults } from '../types/Form'
import { Options } from '../types/Options'
import { SubmitCallback } from '../types/Form'
import {
  InterceptorHandler,
  InterceptorManagersObject,
} from '../types/Interceptors'
import { FieldValidationError } from '../errors/FieldValidationError'

export class Form {
  /**
   * holds all the defaults for the forms
   */
  public static defaults: FormDefaults = {
    options: defaultOptions,
    interceptors: {
      beforeSubmission: new InterceptorManager(),
      submissionComplete: new InterceptorManager(),
    },
  }
  /**
   * determine if the form is on submitting mode
   */
  public $submitting: boolean = false

  /**
   * Errors class - handling all the errors of the fields
   */
  public $errors: Errors

  /**
   * Validator class - handling all the validations stuff
   */
  public $validator: Validator

  /**
   * Touched - holds all the fields that was touched
   */
  public $touched: FieldKeysCollection

  /**
   * RulesManager - hold all the fields rules.
   */
  public $rules: RulesManager

  /**
   * Holds all the labels of the fields
   */
  public $labels: Object

  /**
   * hold the input that is on focus right now
   */
  public $onFocus: string | null = null

  /**
   * The initiate values that was provide to the form
   */
  public $initialValues: Object

  /**
   * all the extra values that provide in the construction of this class
   * will be hold here.
   */
  public $extra: Object

  /**
   * Options of the Form
   */
  public $options: Options = Form.defaults.options

  /**
   * holds the interceptor managers
   */
  public $interceptors: InterceptorManagersObject

  /**
   * holds the debounced version of `validateField` method the debounce time is
   * pre defined in the `$options` prop
   */
  public $debouncedValidateField: Function

  /**
   * constructor of the class
   *
   * @param data
   * @param options
   */
  constructor(data: Object, options: Options = {}) {
    this.$assignOptions(options)
      ._init(data)
      .$resetValues()
  }

  /**
   * setting up default options for the Form class in more
   * convenient way then "Form.defaults.options.validation.something = something"
   *
   * @param options
   */
  public static assignDefaultOptions(options: Options = {}): void {
    Form.defaults.options = generateOptions(Form.defaults.options, options)
  }

  /**
   * assign options to Options object
   *
   * @param options
   */
  public $assignOptions(options: Options) {
    this.$options = generateOptions(this.$options, options)
    this.$debouncedValidateField = generateDebouncedValidateField(this)

    return this
  }

  /**
   * checks if field exits or not in the form class
   *
   * @param fieldKey
   */
  public $hasField(fieldKey: string): boolean {
    return this.hasOwnProperty(fieldKey)
  }

  /**
   * Set all the fields value same as $initialValues fields value
   */
  public $resetValues(): Form {
    for (let fieldName in this.$initialValues) {
      if (this.$initialValues.hasOwnProperty(fieldName)) {
        this[fieldName] = this.$initialValues[fieldName]
      }
    }

    return this
  }

  /**
   * reset the form state (values, errors and touched)
   */
  public $reset(): Form {
    this.$resetValues()
    this.$errors.clear()
    this.$touched.clear()

    return this
  }

  /**
   * get all the values of the form
   */
  public $values(): Object {
    let dataObj = {}

    Object.keys(this.$initialValues).forEach(fieldKey => {
      if (this.$hasField(fieldKey)) {
        dataObj[fieldKey] = this[fieldKey]
      }
    })

    return dataObj
  }

  /**
   * Returns FormData object with the form values,
   * this one is for the use of file upload and other.
   */
  public $valuesAsFormData(): FormData {
    const values = this.$values()
    const formData = new FormData()

    for (let key in values) {
      let value = values[key]

      if ([undefined, false, null].indexOf(value) > -1) {
        continue
      }

      formData.append(key, value)
    }

    return formData
  }

  /**
   * returns the form values as a json string.
   */
  public $valuesAsJson(): string {
    return JSON.stringify(this.$values())
  }

  /**
   * fill the Form values with new values.
   * without remove another fields values.
   *
   * @param newData
   */
  public $fill(newData: Object): Form {
    for (let fieldName in newData) {
      if (newData.hasOwnProperty(fieldName) && this.$hasField(fieldName)) {
        this[fieldName] = newData[fieldName]
      }
    }

    return this
  }

  /**
   * validate specific key or the whole form.
   *
   * @param fieldKey
   */
  public $validate(fieldKey: string | null = null): Promise<any> {
    return fieldKey ? this.$validateField(fieldKey) : this.$validateAll()
  }

  /**
   * validate specific field
   *
   * @param fieldKey
   */
  public async $validateField(fieldKey: string): Promise<any> {
    if (!this.$hasField(fieldKey)) {
      warn(`\`${fieldKey}\` is not a valid field`)

      return Promise.resolve()
    }

    this.$errors.unset(fieldKey)

    try {
      await this.$validator.validateField(
        this.$rules.get(fieldKey),
        this._buildFieldObject(fieldKey),
        this
      )
    } catch (error) {
      if (!(error instanceof FieldValidationError)) {
        return Promise.reject(error)
      }

      this.$errors.push({ [fieldKey]: error.messages })
    }

    return Promise.resolve()
  }

  /**
   * validate all the fields of the form
   */
  public $validateAll(): Promise<any> {
    const promises = Object.keys(this.$initialValues).map(fieldKey => {
      return this.$validateField(fieldKey)
    })

    return Promise.all(promises)
  }

  /**
   * returns if validator is validating the field or the whole form
   *
   * @param fieldKey
   */
  public $isValidating(fieldKey: string | null = null) {
    if (fieldKey && !this.$hasField(fieldKey)) {
      warn(`\`${fieldKey}\` is not a valid field`)
    }

    return fieldKey
      ? this.$validator.$validating.has(fieldKey)
      : this.$validator.$validating.any()
  }

  /**
   * its run isFieldDirty if "fieldKey" is passed
   * if not its check all the fields and if one is dirty the whole form
   * is dirty
   *
   * @param fieldKey
   */
  public $isDirty(fieldKey: string | null = null): boolean {
    if (fieldKey) {
      return this.$isFieldDirty(fieldKey)
    }

    let dirty = false

    for (let originalFieldKey in this.$initialValues) {
      if (this.$isFieldDirty(originalFieldKey)) {
        dirty = true
        break
      }
    }

    return dirty
  }

  /**
   * determine if field is dirty
   *
   * @param fieldKey
   */
  public $isFieldDirty(fieldKey: string): boolean {
    if (!this.$hasField(fieldKey)) {
      warn(`\`${fieldKey}\` is not a valid field`)

      return false
    }

    return this[fieldKey] !== this.$initialValues[fieldKey]
  }

  /**
   * handle change/input on field
   *
   * @param fieldKey
   */
  public $fieldChanged(fieldKey: string): Form {
    if (!this.$hasField(fieldKey)) {
      warn(`\`${fieldKey}\` is not a valid field`)

      return this
    }

    this.$options.validation.unsetFieldErrorsOnFieldChange &&
      this.$errors.unset(fieldKey)
    this.$options.validation.onFieldChanged &&
      this.$debouncedValidateField(fieldKey)

    return this
  }

  /**
   * handle focus on field
   *
   * @param fieldKey
   */
  public $fieldFocused(fieldKey: string): Form {
    if (!this.$hasField(fieldKey)) {
      warn(`\`${fieldKey}\` is not a valid field`)

      return this
    }

    this.$touched.push(fieldKey)
    this.$onFocus = fieldKey

    return this
  }

  /**
   * handle blur on field
   *
   * @param fieldKey
   */
  public $fieldBlurred(fieldKey: string): Form {
    if (!this.$hasField(fieldKey)) {
      warn(`\`${fieldKey}\` is not a valid field`)

      return this
    }

    if (this.$onFocus === fieldKey) {
      this.$onFocus = null
    }

    this.$options.validation.onFieldBlurred && this.$validateField(fieldKey)

    return this
  }

  /**
   * submit the form, this method received a callback that
   * will submit the form and must return a Promise.
   *
   * @param callback
   */
  public $submit(callback: SubmitCallback): Promise<any> {
    let chain: any[] = [
      () => callback(this),
      null,
      response => Promise.resolve({ response, form: this }),
      error => Promise.reject({ error, form: this }),
    ]

    this.$interceptors.beforeSubmission
      .merge(basicInterceptors.beforeSubmission)
      .forEach((handler: InterceptorHandler) =>
        chain.unshift(handler.fulfilled, handler.rejected)
      )

    this.$interceptors.submissionComplete
      .merge(basicInterceptors.submissionComplete)
      .forEach((handler: InterceptorHandler) =>
        chain.push(handler.fulfilled, handler.rejected)
      )

    let promise: Promise<any> = Promise.resolve(this)

    while (chain.length) {
      promise = promise.then(chain.shift(), chain.shift())
    }

    return promise
  }

  /**
   * Init the form
   * fill all the values that should be filled (Validator, OriginalData etc..)
   *
   * @param data
   * @private
   */
  private _init(data: Object): Form {
    let rules = {}
    let originalData = {}
    let labels = {}
    let extra = {}

    Object.keys(data).forEach(key => {
      let isKeyObject = isObject(data[key])

      originalData[key] = isKeyObject ? data[key].value : data[key]
      labels[key] =
        isKeyObject && data[key].hasOwnProperty('label')
          ? data[key].label
          : generateDefaultLabel(key)
      extra[key] =
        isKeyObject && data[key].hasOwnProperty('extra') ? data[key].extra : {}
      rules = {
        ...rules,
        ...(isKeyObject &&
          data[key].hasOwnProperty('rules') && { [key]: data[key].rules }),
      }
    })

    this.$initialValues = originalData
    this.$labels = labels
    this.$extra = extra
    this.$rules = new RulesManager(
      rules,
      this.$options.validation.defaultMessage
    )
    this.$validator = new Validator(this.$options.validation)
    this.$errors = new Errors()
    this.$touched = new FieldKeysCollection()
    this.$interceptors = {
      beforeSubmission: new InterceptorManager(
        Form.defaults.interceptors.beforeSubmission.all()
      ),
      submissionComplete: new InterceptorManager(
        Form.defaults.interceptors.submissionComplete.all()
      ),
    }

    return this
  }

  /**
   * build Field object
   *
   * @param fieldKey
   * @private
   */
  private _buildFieldObject(fieldKey: string): Field {
    return {
      key: fieldKey,
      value: this[fieldKey],
      label: this.$labels[fieldKey],
    }
  }
}
