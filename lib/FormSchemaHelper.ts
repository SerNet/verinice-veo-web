import {
  IVEOFormSchema,
  IVEOFormSchemaItem,
  IVEOFormSchemaTranslationCollection,
  IVEOFormSchemaTranslationCollectionItem
} from 'veo-formschema'
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

/**
 * FormSchemaEditorHelpers
 */

export function deleteElementCustomTranslation(
  elementFormSchema: IVEOFormSchemaItem,
  customTranslation: IVEOFormSchemaTranslationCollectionItem,
  callbackUpdateCustomTranslation: (updatedCustomTranslationValue: IVEOFormSchemaTranslationCollectionItem) => void
): void {
  // Remove the element and also all translation key from customTranslations
  let translationKeysToRemove = JSON.stringify(elementFormSchema).match(/#lang\/[\w-]+/g)
  if (translationKeysToRemove) {
    let localCustomTranslation: IVEOFormSchemaTranslationCollectionItem = JSON.parse(JSON.stringify(customTranslation))
    translationKeysToRemove = translationKeysToRemove.map(key => key.replace('#lang/', ''))
    translationKeysToRemove.forEach(key => {
      delete localCustomTranslation[key]
    })
    callbackUpdateCustomTranslation(localCustomTranslation)
  }
}
