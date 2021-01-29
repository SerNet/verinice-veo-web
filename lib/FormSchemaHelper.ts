import { IVEOFormSchema, IVEOFormSchemaTranslationCollection } from 'veo-formschema'
import { VEOObjectSchemaRAW } from 'veo-objectschema-7'
import FormSchemaValidator from './FormSchemaValidator'
import { VeoSchemaValidatorValidationResult } from './ObjectSchemaValidator'

export const defaultFormSchemaTranslation: IVEOFormSchemaTranslationCollection = {
  de: {
    'text_deef9e2f-088a-46aa-8278-7b9df8e1472d': 'Text 1 Übersetzung',
    'text_c9e3a0c7-3c79-4f64-b0a4-ae318ebf3026': 'Text 2 Übersetzung',
    'layout_c82f7de6-ea10-4379-8b74-9e66535d2a3d': 'Layout Beschriftung 1 Übersetzung',
    'layout_6393dddd-5604-4554-b4e8-e9edf1034abd': 'Layout Beschriftung 2 Übersetzung',
    name: 'ObjesctSchema Property -name- Übersetzung',
    process_SensitiveData_comment: 'ObjesctSchema Property -process_SensitiveData_comment- Übersetzung'
  },
  en: {
    'text_deef9e2f-088a-46aa-8278-7b9df8e1472d': 'Text 1 translation',
    'text_c9e3a0c7-3c79-4f64-b0a4-ae318ebf3026': 'Text 2 translation',
    'layout_c82f7de6-ea10-4379-8b74-9e66535d2a3d': 'Layout caption 1 translation',
    'layout_6393dddd-5604-4554-b4e8-e9edf1034abd': 'Layout caption 2 translation',
    name: 'ObjesctSchema Property -name- translation',
    process_SensitiveData_comment: 'ObjesctSchema Property -process_SensitiveData_comment- translation'
  }
}

export function generateSchema(
  name: string,
  modelType: string,
  subType: string | null,
  translation: IVEOFormSchemaTranslationCollection = defaultFormSchemaTranslation
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
