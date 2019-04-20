import { IFieldOptions } from '../types/Field'
import { isFieldOptions } from '../utils'
import generateDefaultLabel from './generateDefaultLabel'

export default (fieldKey: string, value: any | IFieldOptions): IFieldOptions => {
  return isFieldOptions(value)
    ? {
        extra: value.extra ? value.extra : {},
        label: value.label ? value.label : generateDefaultLabel(fieldKey),
        rules: value.rules ? value.rules : [],
        value: value.value,
      }
    : {
        extra: {},
        label: generateDefaultLabel(fieldKey),
        rules: [],
        value,
      }
}
