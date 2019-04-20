import { Rule } from '../core/validation/Rule'
import { MessageFunction, PassesFunction } from './Errors'

/**
 * Raw Rule is an object that can be transfer eventually to a normal Rule Object
 */
export interface IRawRule {
  passes: PassesFunction
  message?: MessageFunction | string
}

/**
 * Holds all the rules.
 * each key is the field which hold an array of rules
 */
export interface IRulesStack {
  [fieldKey: string]: Rule[]
}
