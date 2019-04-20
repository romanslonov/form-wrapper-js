import { Form } from '../core/Form'
import { IInterceptorHandler } from '../types/Interceptors'

/**
 * validate the form before submission
 * only if the option of validation on submission set as true.
 */
export const validateForm: IInterceptorHandler = {
  fulfilled: (form: Form): Promise<any> => {
    if (form.$options.validation.onSubmission) {
      return form.$validate().then(() => {
        if (form.$errors.any()) {
          return Promise.reject({ message: 'Form is invalid.' })
        }

        return Promise.resolve(form)
      })
    }

    return Promise.resolve(form)
  },
  rejected: null,
}

/**
 * Set the $submitting as true (this is must to be the LAST interceptor before submitting)
 * but the FIRST here in the export array
 */
export const setSubmittingAsTrue: IInterceptorHandler = {
  fulfilled: (form: Form): Promise<any> => {
    form.$submitting = true

    return Promise.resolve(form)
  },
  rejected: null,
}

/**
 * the order of the interceptors will be from the LAST to the first
 */
export default [setSubmittingAsTrue, validateForm]
