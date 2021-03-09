import { IVEOFormSchema } from 'veo-formschema'
import {  IVeoObjectSchema } from '~/types/VeoTypes'
import FormSchemaValidator from './FormSchemaValidator'
import { VeoSchemaValidatorValidationResult } from './ObjectSchemaValidator'

export function generateSchema(name: string, modelType: string, subType: string | null): IVEOFormSchema {
  return {
    name,
    modelType,
    subType,
    content: {
      type: 'Layout',
      options: {
        format: 'group',
        direction: 'vertical'
      },
      elements: []
    }
  }
}

export function validate(schema: IVEOFormSchema, objectSchema: undefined | IVeoObjectSchema): VeoSchemaValidatorValidationResult {
  const validator = new FormSchemaValidator()
  return validator.validate(schema, objectSchema, schema.modelType)
}
