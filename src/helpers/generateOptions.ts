import { IOptions } from '../types/Options'
import { isObject } from '../utils'

/**
 * recursive functions that overwrite the Options object
 *
 * @param originOptions
 * @param newOptions
 */
const assignNewOptions = (
  originOptions: IOptions,
  newOptions: IOptions
): IOptions => {
  const options = {}

  Object.keys(originOptions).forEach(key => {
    if (!newOptions.hasOwnProperty(key)) {
      options[key] = originOptions[key]
      return
    }

    if (isObject(newOptions[key])) {
      options[key] = assignNewOptions(originOptions[key], newOptions[key])
      return
    }

    options[key] = newOptions[key]
  })

  return options
}

/**
 * generate Options base on the defaultOptions Options and new options
 *
 * @param defaultOptions
 * @param overwriteOptions
 */
export default (
  defaultOptions: IOptions,
  overwriteOptions: IOptions
): IOptions => {
  return assignNewOptions(defaultOptions, overwriteOptions)
}
