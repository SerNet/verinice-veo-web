import {
  IVeoFormSchema,
  IVeoFormSchemaItem,
  IVeoFormSchemaTranslationCollection,
  IVeoFormSchemaTranslationCollectionItem,
  IVeoFromSchemaItemRule,
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
    modelType: modelType.toLowerCase(), // We manually transform everything to lower case here, as this property should ALWAYS refer to the technical id of the object schema
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

export const ruleEffectIcons = {
  SHOW: 'mdi-eye-outline',
  HIDE: 'mdi-eye-off-outline'
}

export function getRuleEffectIcons(ruleEffect: IVeoFromSchemaItemRule['effect']) {
  return ruleEffect ? ruleEffectIcons[ruleEffect] : undefined
}
