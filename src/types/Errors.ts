import { Form } from '../core/Form'
import { IField } from './Field'

/**
 * Passes function is a prop in Rule Object
 */
export type PassesFunction = (
  field?: IField,
  form?: Form
) => Promise<any> | boolean

/**
 * Message function is a prop in the Rule Object
 */
export type MessageFunction = (field?: IField, form?: Form) => string

/**
 * Errors Stack must be a field key with an array of strings
 */
export interface IErrorsStack {
  [fieldKey: string]: string[]
}
