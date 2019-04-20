import { IOptions } from './types/Options'

/**
 * Default options that provide to Form instance
 */
const defaultOptions: IOptions = {
  successfulSubmission: {
    clearErrors: true,
    clearTouched: true,
    resetValues: true,
  },
  validation: {
    debouncedValidateFieldTime: 0,
    defaultMessage: ({ label }) => `${label} is invalid.`,
    onFieldBlurred: false,
    onFieldChanged: false,
    onSubmission: true,
    stopAfterFirstRuleFailed: true,
    unsetFieldErrorsOnFieldChange: false,
  },
}

export default defaultOptions
