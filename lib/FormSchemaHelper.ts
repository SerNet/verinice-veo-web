import { IVEOFormSchema, IVEOFormSchemaItem, IVEOFormSchemaTranslationCollection } from 'veo-formschema'
import { VEOObjectSchemaRAW } from 'veo-objectschema-7'
import FormSchemaValidator from './FormSchemaValidator'
import { VeoSchemaValidatorValidationResult } from './ObjectSchemaValidator'

export function generateSchema(
  name: string,
  modelType: string,
  subType: string | null,
  translation: IVEOFormSchemaTranslationCollection = {}
): IVEOFormSchema {
  return {
    name,
    modelType,
    subType,
    translation,
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

export function validate(
  schema: IVEOFormSchema,
  objectSchema: undefined | VEOObjectSchemaRAW
): VeoSchemaValidatorValidationResult {
  const validator = new FormSchemaValidator()
  return validator.validate(schema, objectSchema, schema.modelType)
}
