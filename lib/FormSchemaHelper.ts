import { IVEOFormSchema } from 'veo-formschema'
import VeoSchemaValidator, { VeoSchemaValidatorValidationResult } from './VeoSchemaValidator'

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

export function validate(schema: IVEOFormSchema): VeoSchemaValidatorValidationResult {
  const validator = new VeoSchemaValidator('FORM_SCHEMA')
  return validator.validate(schema, schema.name || undefined)
}
