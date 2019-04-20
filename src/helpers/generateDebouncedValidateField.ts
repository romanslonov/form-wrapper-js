import { Form } from '../core/Form'
import { debounce } from '../utils'

/**
 * generate a debounced versions of validate field method
 * base on form options
 *
 * @param form
 */
export default (form: Form): ((fieldKey: string) => void) => {
  return debounce(
    form.$validateField.bind(form),
    form.$options.validation.debouncedValidateFieldTime
  )
}
