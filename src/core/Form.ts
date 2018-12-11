import { Errors } from './Errors'
import { Validator } from './Validator'
import { Touched } from './Touched'
import { Field, Options, SubmitCallback } from '../types'
import { isObject } from '../utils'
import generateDefaultLabel from '../helpers/generateDefaultLabel'
import generateOptions from '../helpers/generateOptions'
import defaultsOptions from '../defaults'

export class Form {
  /**
   * Defaults options for the Form instance
   */
  public static defaults: Options = defaultsOptions

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
   * Touched class - holds all the fields that was touched
   */
  public $touched: Touched

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
  public $options: Options = Form.defaults

  /**
   * constructor of the class
   *
   * @param data
   * @param options
   */
  constructor(data: Object, options: Options = {}) {
    this.assignOptions(options)
      .init(data)
      .resetValues()
  }

  /**
   * Hook for successful submission
   * use Form.successfulSubmissionHook = () => {};
   * for extending the successful submission handling
   *
   * @param response
   * @param form
   */
  public static successfulSubmissionHook(
    response: any,
    form: Form
  ): Promise<any> {
    return Promise.resolve(response)
  }

  /**
   * Hook for un successful submission
   * use Form.unSuccessfulSubmissionHook = () => {};
   * for extending the un successful submission handling
   *
   * @param error
   * @param form
   */
  public static unSuccessfulSubmissionHook(
    error: any,
    form: Form
  ): Promise<any> {
    return Promise.reject(error)
  }

  /**
   * Set all the fields value same as $initialValues fields value
   */
  public resetValues(): Form {
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
  public reset(): Form {
    this.resetValues()
    this.$errors.clear()
    this.$touched.clear()

    return this
  }

  /**
   * get all the values of the form
   */
  public values(): Object {
    let dataObj = {}

    Object.keys(this.$initialValues).forEach(fieldKey => {
      if (this.hasField(fieldKey)) {
        dataObj[fieldKey] = this[fieldKey]
      }
    })

    return dataObj
  }

  /**
   * fill the Form values with new values.
   * without remove another fields values.
   *
   * @param newData
   */
  public fill(newData: Object): Form {
    for (let fieldName in newData) {
      if (
        newData.hasOwnProperty(fieldName) &&
        this.$initialValues.hasOwnProperty(fieldName)
      ) {
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
  public validate(fieldKey: string | null = null): boolean {
    return fieldKey ? this.validateField(fieldKey) : this.validateAll()
  }

  /**
   * validate specific field
   *
   * @param fieldKey
   */
  public validateField(fieldKey: string): boolean {
    if (!this.hasField(fieldKey)) {
      return true
    }

    this.$errors.unset(fieldKey)

    const errors = this.$validator.validateField(
      this.buildFieldObject(fieldKey),
      this
    )

    if (errors.length > 0) {
      this.$errors.push({ [fieldKey]: errors })
    }

    return errors.length === 0
  }

  /**
   * validate all the fields of the form
   */
  public validateAll(): boolean {
    let isValid = true

    Object.keys(this.values()).forEach(fieldKey => {
      if (!this.validateField(fieldKey)) {
        isValid = false
      }
    })

    return isValid
  }

  /**
   * its run isFieldDirty if "fieldKey" is passed
   * if not its check all the fields and if one is dirty the whole form
   * is dirty
   *
   * @param fieldKey
   */
  public isDirty(fieldKey: string | null = null): boolean {
    if (fieldKey) {
      return this.isFieldDirty(fieldKey)
    }

    let dirty = false

    for (let originalFieldKey in this.$initialValues) {
      if (this.isFieldDirty(originalFieldKey)) {
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
  public isFieldDirty(fieldKey: string): boolean {
    if (!this.hasField(fieldKey)) {
      return false
    }

    return this[fieldKey] !== this.$initialValues[fieldKey]
  }

  /**
   * assign options to Options object
   *
   * @param options
   */
  public assignOptions(options: Options) {
    this.$options = generateOptions(this.$options, options)

    return this
  }

  /**
   * submit the form, this method received a callback that
   * will submit the form and must return a Promise.
   *
   * @param callback
   */
  public submit(callback: SubmitCallback): Promise<any> {
    if (this.$options.validation.onSubmission && !this.validate()) {
      return Promise.reject({ message: 'Form is not valid' })
    }

    this.$submitting = true

    return callback(this)
      .then(this.successfulSubmission.bind(this))
      .catch(this.unSuccessfulSubmission.bind(this))
  }

  /**
   * checks if field exits or not in the form class
   *
   * @param fieldKey
   */
  public hasField(fieldKey: string): boolean {
    return this.hasOwnProperty(fieldKey)
  }

  /**
   * handle change/input on field
   *
   * @param fieldKey
   */
  public fieldChanged(fieldKey: string): Form {
    if (!this.hasField(fieldKey)) {
      return this
    }

    this.$options.validation.unsetFieldErrorsOnFieldChange &&
      this.$errors.unset(fieldKey)
    this.$options.validation.onFieldChanged && this.validateField(fieldKey)

    return this
  }

  /**
   * handle focus on field
   *
   * @param fieldKey
   */
  public fieldFocused(fieldKey: string): Form {
    if (!this.hasField(fieldKey)) {
      return this
    }

    this.$touched.push(fieldKey)
    this.$onFocus = fieldKey
  }

  /**
   * handle blur on field
   *
   * @param fieldKey
   */
  public fieldBlurred(fieldKey: string): Form {
    if (!this.hasField(fieldKey)) {
      return this
    }

    if (this.$onFocus === fieldKey) {
      this.$onFocus = null
    }

    this.$options.validation.onFieldBlurred && this.validateField(fieldKey)

    return this
  }

  /**
   * Init the form
   * fill all the values that should be filled (Validator, OriginalData etc..(
   *
   * @param data
   */
  private init(data: Object): Form {
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
    this.$validator = new Validator(rules, this.$options.validation)
    this.$errors = new Errors()
    this.$touched = new Touched()

    return this
  }

  /**
   * build Field object
   *
   * @param fieldKey
   */
  private buildFieldObject(fieldKey: string): Field {
    return {
      key: fieldKey,
      value: this[fieldKey],
      label: this.$labels[fieldKey],
    }
  }

  /**
   * Successful submission method
   *
   * @param response
   */
  private successfulSubmission(response: any): Promise<any> {
    this.$submitting = false

    this.$options.successfulSubmission.clearErrors && this.$errors.clear()
    this.$options.successfulSubmission.clearTouched && this.$touched.clear()
    this.$options.successfulSubmission.resetValues && this.resetValues()

    return Form.successfulSubmissionHook(response, this)
  }

  /**
   * UnSuccessful submission method
   *
   * @param error
   */
  private unSuccessfulSubmission(error: any): Promise<any> {
    this.$submitting = false

    return Form.unSuccessfulSubmissionHook(error, this)
  }
}