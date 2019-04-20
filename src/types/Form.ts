import { Form } from '../core/Form'
import { IInterceptorManagersObject } from './Interceptors'
import { IOptions } from './Options'

/**
 * The defaults of the form,
 * that can be changeable and then will affect on all the new Form instances
 */
export interface IFormDefaults {
  options: IOptions
  interceptors: IInterceptorManagersObject
}

/**
 * Submit callback interface,
 * the function the should pass to submit method in Form class
 */
export type SubmitCallback = (form: Form) => Promise<any>
