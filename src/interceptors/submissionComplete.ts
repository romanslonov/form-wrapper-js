import {
  IInterceptorHandler,
  IInvalidResponse,
  ISuccessfulResponse,
} from '../types/Interceptors'

/**
 * set the $submitting property as false event if the submission
 * was successful or not
 */
export const setSubmittingAsFalse: IInterceptorHandler = {
  fulfilled: (response: ISuccessfulResponse) => {
    response.form.$submitting = false

    return Promise.resolve(response)
  },
  rejected: (error: IInvalidResponse) => {
    error.form.$submitting = false

    return Promise.reject(error)
  },
}

/**
 * clear the form (errors, touched and values) base on the options
 * that was set at the form.
 */
export const clearForm: IInterceptorHandler = {
  fulfilled: (response: ISuccessfulResponse) => {
    const { form } = response

    form.$options.successfulSubmission.clearErrors && form.$errors.clear()
    form.$options.successfulSubmission.clearTouched && form.$touched.clear()
    form.$options.successfulSubmission.resetValues && form.$resetValues()

    return Promise.resolve(response)
  },
  rejected: null,
}

/**
 * the order of the interceptors will be from the FIRST to the last
 */
export default [setSubmittingAsFalse, clearForm]
