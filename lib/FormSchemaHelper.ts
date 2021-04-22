import {
  IVeoFormSchema,
  IVeoFormSchemaItem,
  IVeoFormSchemaTranslationCollection,
  IVeoFormSchemaTranslationCollectionItem,
  IVeoObjectSchema
} from '~/types/VeoTypes'
import FormSchemaValidator from './FormSchemaValidator'
import { VeoSchemaValidatorValidationResult } from './ObjectSchemaValidator'

export function generateSchema(
  name: string,
  modelType: string,
  subType: string | null,
  translation: IVeoFormSchemaTranslationCollection = {}
): IVeoFormSchema {
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
  schema: IVeoFormSchema,
  objectSchema: undefined | IVeoObjectSchema
): VeoSchemaValidatorValidationResult {
  const validator = new FormSchemaValidator()
  return validator.validate(schema, objectSchema, schema.modelType)
}

/**
 * FormSchemaEditorHelpers
 */

export function deleteElementCustomTranslation(
  elementFormSchema: IVeoFormSchemaItem,
  customTranslation: IVeoFormSchemaTranslationCollectionItem,
  callbackUpdateCustomTranslation: (updatedCustomTranslationValue: IVeoFormSchemaTranslationCollectionItem) => void
): void {
  // Remove the element and also all translation key from customTranslations
  let translationKeysToRemove = JSON.stringify(elementFormSchema).match(/#lang\/[\w-]+/g)
  if (translationKeysToRemove) {
    let localCustomTranslation: IVeoFormSchemaTranslationCollectionItem = JSON.parse(JSON.stringify(customTranslation))
    translationKeysToRemove = translationKeysToRemove.map(key => key.replace('#lang/', ''))
    translationKeysToRemove.forEach(key => {
      delete localCustomTranslation[key]
    })
    callbackUpdateCustomTranslation(localCustomTranslation)
  }
}
