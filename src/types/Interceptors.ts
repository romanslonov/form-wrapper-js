import { Form } from '../core/Form'
import { InterceptorManager } from '../core/InterceptorManager'

/**
 * an object that hold 2 function one for fulfill and one for reject
 */
export interface IInterceptorHandler {
  fulfilled: (response: any) => any
  rejected: (error: any) => any
}

/**
 * an object that hold only InterceptorManagers as value
 */
export interface IInterceptorManagersObject {
  beforeSubmission: InterceptorManager
  submissionComplete: InterceptorManager
  [key: string]: InterceptorManager
}

/**
 * The interface of an object with successful response from the
 * SubmitCallback function
 */
export interface ISuccessfulResponse {
  form: Form
  response: any
}

/**
 * The interface of an object with unsuccessful response from the
 * SubmitCallback function
 */
export interface IInvalidResponse {
  form: Form
  error: any
}
